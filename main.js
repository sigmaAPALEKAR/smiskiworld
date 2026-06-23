import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createLighting, updateLighting } from './lighting.js';
import { createEnvironment } from './environment.js';
import { Smiski } from './smiski.js';
import { UIManager } from './ui.js';

console.log('🚀 Starting Smiski World...');

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0003);

// Renderer
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// CSS2D Renderer for labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('canvas-container').appendChild(labelRenderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 300);
camera.position.set(30, 25, 35);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI / 2.1;
controls.target.set(0, 1, 0);
controls.update();

// Lighting
const lights = createLighting(scene);

// Sky
const skyGeometry = new THREE.SphereGeometry(120, 32, 32);
const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `,
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// State
let smiskis = [];
let followingSmiski = null;
let isFreecam = true;
let houseModel = null;

// UI Manager (initialize with empty array, update later)
const ui = new UIManager(smiskis, (index) => followSmiski(index));

// Create a simple placeholder house in case the model doesn't load
function createPlaceholderHouse() {
    console.log('🏠 Creating placeholder house...');
    const house = new THREE.Group();
    
    // Main structure
    const wallGeometry = new THREE.BoxGeometry(10, 7, 8);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5e6d3,
        roughness: 0.5,
        metalness: 0.05
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 3.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(7, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.6
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    house.add(roof);
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(2, 3.5);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.75, 4.01);
    house.add(door);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        roughness: 0.2,
        metalness: 0.3
    });
    
    const w1 = new THREE.Mesh(windowGeometry, windowMaterial);
    w1.position.set(2.5, 5, 4.01);
    house.add(w1);
    
    const w2 = new THREE.Mesh(windowGeometry, windowMaterial);
    w2.position.set(-2.5, 5, 4.01);
    house.add(w2);
    
    house.position.set(0, 0, 0);
    return house;
}

// Add interior lights
function addInteriorLights() {
    const lights = [];
    
    const lightConfigs = [
        { pos: [0, 2, 3], intensity: 2, distance: 8 },
        { pos: [3, 2, -1], intensity: 1.5, distance: 6 },
        { pos: [-3, 2, -1], intensity: 1.5, distance: 6 },
        { pos: [0, 5, 0], intensity: 1, distance: 5 },
        { pos: [0, 3, 6], intensity: 1.5, distance: 5 },
    ];
    
    lightConfigs.forEach(config => {
        const light = new THREE.PointLight(0xffd4a8, config.intensity, config.distance);
        light.position.set(...config.pos);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        scene.add(light);
        lights.push(light);
    });
    
    // Path lights
    for (let i = 0; i < 6; i++) {
        const pathLight = new THREE.PointLight(0xffeedd, 0.5, 4);
        pathLight.position.set(-8 + i * 3, 0.3, -3 + Math.sin(i * 0.8) * 2);
        scene.add(pathLight);
        lights.push(pathLight);
    }
    
    return lights;
}

// Follow camera system
function followSmiski(index) {
    if (index === null || index === undefined) {
        followingSmiski = null;
        isFreecam = true;
        controls.target.set(0, 1, 0);
        document.getElementById('freecam-btn').classList.add('active');
        document.querySelectorAll('.smiski-btn').forEach(b => b.classList.remove('active'));
        return;
    }
    
    if (smiskis[index]) {
        followingSmiski = smiskis[index];
        isFreecam = false;
        
        document.getElementById('freecam-btn').classList.remove('active');
        document.querySelectorAll('.smiski-btn').forEach((b, i) => {
            b.classList.toggle('active', i === index);
        });
    }
}

function updateFollowCamera() {
    if (followingSmiski && !isFreecam) {
        const target = followingSmiski.mesh.position.clone();
        target.y += 3;
        
        const offset = new THREE.Vector3(
            Math.sin(Date.now() * 0.0003) * 6,
            6,
            Math.cos(Date.now() * 0.0003) * 6
        );
        
        const desiredPosition = target.clone().add(offset);
        camera.position.lerp(desiredPosition, 0.03);
        
        controls.target.lerp(
            followingSmiski.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), 
            0.05
        );
        controls.update();
    }
}

// Time display
function updateTimeDisplay() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    document.getElementById('time-display').textContent = `${displayHours}:${minutes}`;
    document.getElementById('ampm-display').textContent = ampm;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('date-display').textContent = 
        `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    
    let weatherEmoji, weatherText;
    if (hours >= 5 && hours < 8) {
        weatherEmoji = '🌅'; weatherText = 'Dawn';
    } else if (hours >= 8 && hours < 17) {
        weatherEmoji = '☀️'; weatherText = 'Sunny';
    } else if (hours >= 17 && hours < 19) {
        weatherEmoji = '🌅'; weatherText = 'Dusk';
    } else {
        weatherEmoji = '🌙'; weatherText = 'Night';
    }
    
    const weatherIcon = document.querySelector('.weather-icon');
    const weatherTextEl = document.querySelector('.weather-text');
    if (weatherIcon) weatherIcon.textContent = weatherEmoji;
    if (weatherTextEl) weatherTextEl.textContent = weatherText;
}

// Initialize the scene (called after house loads or with placeholder)
function initializeScene(houseMesh) {
    console.log('🏗️ Building scene...');
    
    // Add house
    houseMesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    houseMesh.position.set(0, 0, 0);
    scene.add(houseMesh);
    
    // Add interior lights
    addInteriorLights();
    
    // Build environment
    createEnvironment(scene);
    
    // Create Smiskis
    const smiskiConfigs = [
        { name: 'Luna', color: 0xFFB6C1, pos: new THREE.Vector3(-5, 0, -8) },
        { name: 'Mochi', color: 0x98FB98, pos: new THREE.Vector3(5, 0, -5) },
        { name: 'Pippin', color: 0xFFD700, pos: new THREE.Vector3(-8, 0, 5) },
        { name: 'Gizmo', color: 0xDDA0DD, pos: new THREE.Vector3(8, 0, 8) }
    ];

    smiskiConfigs.forEach(config => {
        const smiski = new Smiski(config.name, config.color, config.pos);
        smiskis.push(smiski);
        scene.add(smiski.mesh);
    });
    
    ui.setSmiskis(smiskis);
    
    // Freecam button
    document.getElementById('freecam-btn').addEventListener('click', () => {
        followSmiski(null);
    });
    
    // Smiski 3D click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        if (event.target.closest('#bottom-bar') || 
            event.target.closest('#smiski-panel') ||
            event.target.closest('#top-bar') ||
            event.target.closest('#loading-screen')) {
            return;
        }
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const smiskiMeshes = smiskis.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(smiskiMeshes, true);
        
        if (intersects.length > 0) {
            let hitObject = intersects[0].object;
            while (hitObject && !smiskiMeshes.includes(hitObject)) {
                hitObject = hitObject.parent;
            }
            
            if (hitObject) {
                const index = smiskis.findIndex(s => s.mesh === hitObject);
                if (index !== -1) {
                    followSmiski(index);
                    ui.showSmiskiPanel(index);
                }
            }
        }
    });
    
    // Hide loading screen
    console.log('✅ Scene built, hiding loading screen');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
    
    // Start animation
    const clock = new THREE.Clock();
    let lastTimeUpdate = 0;

    function animate() {
        requestAnimationFrame(animate);
        
        const deltaTime = Math.min(clock.getDelta(), 0.1);
        
        const now = Date.now();
        if (now - lastTimeUpdate > 1000) {
            updateTimeDisplay();
            ui.updateSmiskiButtons();
            lastTimeUpdate = now;
        }
        
        updateLighting(lights, scene, skyMaterial, renderer);
        updateFollowCamera();
        
        smiskis.forEach(smiski => smiski.update(deltaTime));
        
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    
    updateTimeDisplay();
    animate();
    
    console.log('🌟 Smiski World is ready!');
    console.log('👾 4 Smiskis living their lives');
    console.log('🎥 Click Smiski buttons or 3D models to follow them');
}

// Try to load the house model
console.log('🔍 Attempting to load house model from: models/house.glb');

const loader = new GLTFLoader();
const loadingBar = document.querySelector('.loading-bar');
const loadingText = document.querySelector('.loading-text');

// Set a timeout - if the model doesn't load in 8 seconds, use placeholder
let loadTimeout = setTimeout(() => {
    console.warn('⚠️ House model load timed out. Using placeholder house.');
    if (loadingText) loadingText.textContent = 'Using placeholder house...';
    if (loadingBar) loadingBar.style.width = '100%';
    const placeholderHouse = createPlaceholderHouse();
    initializeScene(placeholderHouse);
}, 8000);

loader.load(
    'models/house.glb',
    (gltf) => {
        clearTimeout(loadTimeout);
        console.log('✅ House model loaded successfully!');
        if (loadingBar) loadingBar.style.width = '100%';
        if (loadingText) loadingText.textContent = 'House loaded! Building scene...';
        
        const houseModel = gltf.scene;
        initializeScene(houseModel);
    },
    (progress) => {
        if (progress.total > 0) {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            if (loadingBar) loadingBar.style.width = percent + '%';
            console.log(`📦 Loading: ${percent}%`);
        }
    },
    (error) => {
        clearTimeout(loadTimeout);
        console.error('❌ Error loading house model:', error);
        console.warn('⚠️ Falling back to placeholder house');
        if (loadingText) {
            loadingText.textContent = 'Could not load house model. Using placeholder...';
            loadingText.style.color = '#ffaa00';
        }
        if (loadingBar) loadingBar.style.width = '100%';
        
        const placeholderHouse = createPlaceholderHouse();
        initializeScene(placeholderHouse);
    }
);

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

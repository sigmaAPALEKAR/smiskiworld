import * as THREE from 'three';

export function createLighting(scene) {
    const lights = {};
    
    // Stronger ambient light so interiors are never pitch black
    lights.ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(lights.ambient);
    
    // Hemisphere light for natural sky/ground ambient
    lights.hemisphere = new THREE.HemisphereLight(0xddeeff, 0x889966, 0.8);
    scene.add(lights.hemisphere);
    
    // Main sun directional light
    lights.sun = new THREE.DirectionalLight(0xfff8e7, 3.0);
    lights.sun.position.set(50, 60, 30);
    lights.sun.castShadow = true;
    lights.sun.shadow.mapSize.width = 4096;
    lights.sun.shadow.mapSize.height = 4096;
    lights.sun.shadow.camera.near = 0.5;
    lights.sun.shadow.camera.far = 200;
    lights.sun.shadow.camera.left = -70;
    lights.sun.shadow.camera.right = 70;
    lights.sun.shadow.camera.top = 70;
    lights.sun.shadow.camera.bottom = -70;
    lights.sun.shadow.bias = -0.00005;
    lights.sun.shadow.normalBias = 0.02;
    scene.add(lights.sun);
    
    // Moon light
    lights.moon = new THREE.DirectionalLight(0x8899cc, 0.3);
    lights.moon.position.set(-30, 20, -20);
    scene.add(lights.moon);
    
    // ===== INTERIOR LIGHTS - MUCH BRIGHTER =====
    lights.interiorLights = [];
    
    // Main room ceiling lights (very bright)
    const ceilingLight1 = new THREE.PointLight(0xfff5e8, 8, 15);
    ceilingLight1.position.set(0, 4, 0);
    ceilingLight1.castShadow = true;
    ceilingLight1.shadow.mapSize.width = 1024;
    ceilingLight1.shadow.mapSize.height = 1024;
    ceilingLight1.shadow.bias = -0.001;
    scene.add(ceilingLight1);
    lights.interiorLights.push(ceilingLight1);
    
    const ceilingLight2 = new THREE.PointLight(0xfff5e8, 6, 12);
    ceilingLight2.position.set(4, 4, 3);
    scene.add(ceilingLight2);
    lights.interiorLights.push(ceilingLight2);
    
    const ceilingLight3 = new THREE.PointLight(0xfff5e8, 6, 12);
    ceilingLight3.position.set(-4, 4, 3);
    scene.add(ceilingLight3);
    lights.interiorLights.push(ceilingLight3);
    
    // Kitchen/dining area
    const kitchenLight = new THREE.PointLight(0xfff0dd, 7, 10);
    kitchenLight.position.set(3, 3, -2);
    scene.add(kitchenLight);
    lights.interiorLights.push(kitchenLight);
    
    // Living room
    const livingLight1 = new THREE.PointLight(0xfff0dd, 6, 10);
    livingLight1.position.set(-3, 3, -3);
    scene.add(livingLight1);
    lights.interiorLights.push(livingLight1);
    
    // Upstairs hall
    const upstairsLight = new THREE.PointLight(0xfff5e8, 5, 8);
    upstairsLight.position.set(0, 7, 1);
    scene.add(upstairsLight);
    lights.interiorLights.push(upstairsLight);
    
    // Bedroom lights
    const bedroomLight1 = new THREE.PointLight(0xffeedd, 4, 8);
    bedroomLight1.position.set(4, 7, -2);
    scene.add(bedroomLight1);
    lights.interiorLights.push(bedroomLight1);
    
    const bedroomLight2 = new THREE.PointLight(0xffeedd, 4, 8);
    bedroomLight2.position.set(-4, 7, -2);
    scene.add(bedroomLight2);
    lights.interiorLights.push(bedroomLight2);
    
    // ===== EXTERIOR LIGHTS =====
    lights.exteriorLights = [];
    
    // Porch light (bright)
    const porchLight = new THREE.PointLight(0xffeedd, 5, 8);
    porchLight.position.set(0, 3, 6);
    porchLight.castShadow = true;
    porchLight.shadow.mapSize.width = 512;
    porchLight.shadow.mapSize.height = 512;
    scene.add(porchLight);
    lights.exteriorLights.push(porchLight);
    
    // Back door light
    const backLight = new THREE.PointLight(0xffeedd, 4, 6);
    backLight.position.set(0, 3, -5);
    scene.add(backLight);
    lights.exteriorLights.push(backLight);
    
    // Garage/side lights
    const sideLight1 = new THREE.PointLight(0xffeedd, 3, 6);
    sideLight1.position.set(6, 2.5, 0);
    scene.add(sideLight1);
    lights.exteriorLights.push(sideLight1);
    
    const sideLight2 = new THREE.PointLight(0xffeedd, 3, 6);
    sideLight2.position.set(-6, 2.5, 0);
    scene.add(sideLight2);
    lights.exteriorLights.push(sideLight2);
    
    // Garden path lights
    lights.pathLights = [];
    for (let i = 0; i < 8; i++) {
        const pathLight = new THREE.PointLight(0xffeedd, 3, 6);
        pathLight.position.set(-10 + i * 3, 0.5, -5 + Math.sin(i * 0.7) * 3);
        scene.add(pathLight);
        lights.pathLights.push(pathLight);
    }
    
    // Fill lights scattered around (helps illuminate everything)
    lights.fillLights = [];
    const fillPositions = [
        [10, 3, 10], [-10, 3, -10], [15, 3, -5], [-15, 3, 5],
        [5, 2, -15], [-5, 2, 15], [20, 3, 0], [-20, 3, 0],
        [0, 2, 15], [0, 2, -15]
    ];
    fillPositions.forEach(([x, y, z]) => {
        const fillLight = new THREE.PointLight(0xffffff, 0.5, 25);
        fillLight.position.set(x, y, z);
        scene.add(fillLight);
        lights.fillLights.push(fillLight);
    });
    
    return lights;
}

export function updateLighting(lights, scene, skyMaterial, renderer) {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    
    let sunIntensity, moonIntensity;
    let skyTopColor, skyBottomColor;
    let fogColor;
    let exposure;
    let ambientIntensity;
    let interiorIntensity;
    
    if (hour >= 6 && hour < 20) {
        // Daytime
        const dayProgress = (hour - 6) / 14;
        sunIntensity = 1 + Math.sin(dayProgress * Math.PI) * 2;
        moonIntensity = 0;
        ambientIntensity = 1.2;
        
        // Interior lights dimmer during day but still on
        interiorIntensity = 0.3 + (1 - Math.abs(dayProgress - 0.5) * 2) * 0.3;
        
        skyTopColor = new THREE.Color().setHSL(0.58, 0.8, 0.35 + dayProgress * 0.3);
        skyBottomColor = new THREE.Color().setHSL(0.58, 0.3, 0.65 + dayProgress * 0.2);
        fogColor = new THREE.Color().setHSL(0.58, 0.3, 0.55 + dayProgress * 0.3);
        exposure = 0.9 + dayProgress * 0.8;
        
        lights.sun.position.y = Math.sin(dayProgress * Math.PI) * 50;
    } else {
        // Nighttime - BRIGHTEN EVERYTHING
        let nightProgress;
        if (hour >= 20) {
            nightProgress = (hour - 20) / 8;
        } else {
            nightProgress = (hour + 4) / 8;
        }
        nightProgress = Math.min(1, Math.max(0, nightProgress));
        
        sunIntensity = 0.08;
        moonIntensity = 0.5;
        ambientIntensity = 0.6; // Still decent ambient at night
        interiorIntensity = 4.0; // INTERIOR LIGHTS FULL BLAST at night
        
        skyTopColor = new THREE.Color(0x0a0a2e);
        skyBottomColor = new THREE.Color(0x1a1a3e);
        fogColor = new THREE.Color(0x0a0a2e);
        exposure = 0.5; // Higher exposure at night
        
        lights.sun.position.y = 5;
        lights.moon.position.y = 15 + Math.sin(nightProgress * Math.PI) * 20;
    }
    
    // Apply intensities
    lights.sun.intensity = Math.max(0.08, sunIntensity);
    lights.moon.intensity = moonIntensity;
    lights.ambient.intensity = ambientIntensity;
    lights.hemisphere.intensity = hour >= 18 || hour < 6 ? 0.3 : 0.8;
    
    // Interior lights - ALWAYS BRIGHT
    lights.interiorLights.forEach(light => {
        light.intensity = interiorIntensity;
    });
    
    // Exterior lights brighter at night
    const exteriorIntensity = hour >= 18 || hour < 6 ? 4 : 0.5;
    lights.exteriorLights.forEach(light => {
        light.intensity = exteriorIntensity;
    });
    
    // Path lights
    const pathIntensity = hour >= 18 || hour < 6 ? 3 : 0.3;
    lights.pathLights.forEach(light => {
        light.intensity = pathIntensity;
    });
    
    // Fill lights - always on but brighter at night
    const fillIntensity = hour >= 18 || hour < 6 ? 0.6 : 0.2;
    lights.fillLights.forEach(light => {
        light.intensity = fillIntensity;
    });
    
    // Sky
    skyMaterial.uniforms.topColor.value = skyTopColor;
    skyMaterial.uniforms.bottomColor.value = skyBottomColor;
    
    // Scene
    scene.fog.color.copy(fogColor);
    scene.background.copy(skyTopColor);
    renderer.toneMappingExposure = exposure;
}

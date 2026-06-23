import * as THREE from 'three';

export function createLighting(scene) {
    const lights = {};
    
    // Ambient light (always present, even at night)
    lights.ambient = new THREE.AmbientLight(0x404066, 0.8);
    scene.add(lights.ambient);
    
    // Hemisphere light for natural sky/ground ambient
    lights.hemisphere = new THREE.HemisphereLight(0xddeeff, 0x889966, 0.6);
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
    
    // Moon light (visible at night)
    lights.moon = new THREE.DirectionalLight(0x8899cc, 0.3);
    lights.moon.position.set(-30, 20, -20);
    scene.add(lights.moon);
    
    // House exterior lights (always slightly on, brighter at night)
    lights.exteriorLight1 = new THREE.PointLight(0xffd4a8, 2, 10);
    lights.exteriorLight1.position.set(0, 4, 5);
    lights.exteriorLight1.castShadow = true;
    lights.exteriorLight1.shadow.mapSize.width = 1024;
    lights.exteriorLight1.shadow.mapSize.height = 1024;
    scene.add(lights.exteriorLight1);
    
    lights.exteriorLight2 = new THREE.PointLight(0xffd4a8, 1.5, 8);
    lights.exteriorLight2.position.set(5, 3, 0);
    scene.add(lights.exteriorLight2);
    
    lights.exteriorLight3 = new THREE.PointLight(0xffd4a8, 1.5, 8);
    lights.exteriorLight3.position.set(-5, 3, 0);
    scene.add(lights.exteriorLight3);
    
    // Garden path lights
    lights.pathLights = [];
    for (let i = 0; i < 8; i++) {
        const pathLight = new THREE.PointLight(0xffeedd, 0.5, 5);
        pathLight.position.set(-10 + i * 3, 0.3, -5 + Math.sin(i * 0.7) * 3);
        scene.add(pathLight);
        lights.pathLights.push(pathLight);
    }
    
    // Scattered ambient point lights for general illumination
    lights.fillLights = [];
    const fillPositions = [
        [15, 3, 15], [-15, 3, -15], [20, 3, -10], [-20, 3, 10],
        [10, 2, -20], [-10, 2, 20]
    ];
    fillPositions.forEach(([x, y, z]) => {
        const fillLight = new THREE.PointLight(0xffffff, 0.2, 20);
        fillLight.position.set(x, y, z);
        scene.add(fillLight);
        lights.fillLights.push(fillLight);
    });
    
    return lights;
}

export function updateLighting(lights, scene, skyMaterial, renderer) {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    
    let sunIntensity, moonIntensity, exteriorIntensity;
    let skyTopColor, skyBottomColor;
    let fogColor;
    let exposure;
    
    if (hour >= 6 && hour < 20) {
        // Daytime
        const dayProgress = (hour - 6) / 14;
        sunIntensity = 1 + Math.sin(dayProgress * Math.PI) * 2;
        moonIntensity = 0;
        exteriorIntensity = 0.3 + (1 - dayProgress) * 0.7;
        
        skyTopColor = new THREE.Color().setHSL(0.58, 0.8, 0.35 + dayProgress * 0.3);
        skyBottomColor = new THREE.Color().setHSL(0.58, 0.3, 0.65 + dayProgress * 0.2);
        fogColor = new THREE.Color().setHSL(0.58, 0.3, 0.55 + dayProgress * 0.3);
        exposure = 0.9 + dayProgress * 0.8;
        
        lights.sun.position.y = Math.sin(dayProgress * Math.PI) * 50;
    } else {
        // Nighttime
        let nightProgress;
        if (hour >= 20) {
            nightProgress = (hour - 20) / 4;
        } else {
            nightProgress = (hour + 4) / 4;
        }
        nightProgress = Math.min(1, Math.max(0, nightProgress));
        
        sunIntensity = 0.05;
        moonIntensity = 0.4 + nightProgress * 0.2;
        exteriorIntensity = 2.5 + nightProgress * 1;
        
        skyTopColor = new THREE.Color(0x0a0a2e);
        skyBottomColor = new THREE.Color(0x1a1a3e);
        fogColor = new THREE.Color(0x0a0a2e);
        exposure = 0.3 + nightProgress * 0.2;
        
        lights.sun.position.y = 5;
        lights.moon.position.y = 15 + Math.sin(nightProgress * Math.PI) * 20;
    }
    
    // Apply intensities
    lights.sun.intensity = Math.max(0.05, sunIntensity);
    lights.moon.intensity = moonIntensity;
    lights.exteriorLight1.intensity = exteriorIntensity;
    lights.exteriorLight2.intensity = exteriorIntensity * 0.7;
    lights.exteriorLight3.intensity = exteriorIntensity * 0.7;
    
    // Path lights brighter at night
    const pathLightIntensity = hour >= 18 || hour < 6 ? 1.5 : 0.1;
    lights.pathLights.forEach(light => {
        light.intensity = pathLightIntensity;
    });
    
    // Fill lights
    const fillIntensity = hour >= 18 || hour < 6 ? 0.3 : 0.05;
    lights.fillLights.forEach(light => {
        light.intensity = fillIntensity;
    });
    
    // Ambient
    lights.ambient.intensity = hour >= 18 || hour < 6 ? 0.3 : 0.6;
    lights.hemisphere.intensity = hour >= 18 || hour < 6 ? 0.1 : 0.5;
    
    // Sky
    skyMaterial.uniforms.topColor.value = skyTopColor;
    skyMaterial.uniforms.bottomColor.value = skyBottomColor;
    
    // Scene
    scene.fog.color.copy(fogColor);
    scene.background.copy(skyTopColor);
    renderer.toneMappingExposure = exposure;
}

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class Smiski {
    constructor(name, color, startPosition) {
        this.name = name;
        this.color = color;
        this.position = startPosition.clone();
        this.targetPosition = startPosition.clone();
        this.speed = 0.8 + Math.random() * 0.5;
        this.state = 'idle';
        this.stateTimer = 0;
        this.animationTime = Math.random() * Math.PI * 2;
        this.lastStateChange = 0;
        this.mood = 'Happy';
        this.energy = 75 + Math.random() * 25;
        
        // SCALE FACTOR - making Smiskis smaller (about 0.7 units tall)
        const scale = 0.35;
        
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.8 * scale, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.4,
            metalness: 0.05
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.8 * scale;
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.mesh.add(this.body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.4 * scale, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.35,
            metalness: 0.05
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.7 * scale;
        this.head.castShadow = true;
        this.head.receiveShadow = true;
        this.mesh.add(this.head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.09 * scale, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
        
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.14 * scale, 1.85 * scale, 0.35 * scale);
        this.mesh.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.14 * scale, 1.85 * scale, 0.35 * scale);
        this.mesh.add(this.rightEye);
        
        // Eye highlights
        const highlightGeometry = new THREE.SphereGeometry(0.04 * scale, 8, 8);
        const highlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.1,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });
        
        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(-0.12 * scale, 1.88 * scale, 0.42 * scale);
        this.mesh.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(0.16 * scale, 1.88 * scale, 0.42 * scale);
        this.mesh.add(rightHighlight);
        
        // Smile
        const smileShape = new THREE.Shape();
        smileShape.absarc(0, 0, 0.12 * scale, Math.PI * 0.2, Math.PI * 0.8, true);
        const smileGeometry = new THREE.ExtrudeGeometry(smileShape, {
            depth: 0.02 * scale,
            bevelEnabled: true,
            bevelThickness: 0.01 * scale,
            bevelSize: 0.01 * scale
        });
        const smileMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.3
        });
        this.smile = new THREE.Mesh(smileGeometry, smileMaterial);
        this.smile.position.set(0, 1.78 * scale, 0.3 * scale);
        this.smile.rotation.x = 0.1;
        this.mesh.add(this.smile);
        
        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.07 * scale, 0.5 * scale, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.4
        });
        
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.37 * scale, 1.2 * scale, 0);
        this.leftArm.rotation.z = 0.3;
        this.leftArm.castShadow = true;
        this.mesh.add(this.leftArm);
        
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.37 * scale, 1.2 * scale, 0);
        this.rightArm.rotation.z = -0.3;
        this.rightArm.castShadow = true;
        this.mesh.add(this.rightArm);
        
        // Label
        const labelDiv = document.createElement('div');
        labelDiv.textContent = name;
        labelDiv.style.color = 'white';
        labelDiv.style.fontSize = '10px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';
        labelDiv.style.background = 'rgba(0,0,0,0.5)';
        labelDiv.style.padding = '2px 6px';
        labelDiv.style.borderRadius = '8px';
        this.label = new CSS2DObject(labelDiv);
        this.label.position.y = 2.3 * scale;
        this.mesh.add(this.label);
        
        this.mesh.position.copy(startPosition);
        
        // Personality
        this.personality = {
            activityLevel: 0.3 + Math.random() * 0.7,
            socialLevel: Math.random(),
            homePreference: 0.2 + Math.random() * 0.6,
            curiosityLevel: Math.random()
        };
        
        this.schedule = this.generateSchedule();
        this.decideNewAction();
    }
    
    generateSchedule() {
        return {
            wakeUp: 6 + Math.floor(Math.random() * 2),
            breakfast: 8 + Math.floor(Math.random() * 2),
            morningActivity: 10,
            lunch: 12 + Math.floor(Math.random() * 2),
            afternoonActivity: 14,
            eveningActivity: 17,
            dinner: 19,
            bedtime: 22 + Math.floor(Math.random() * 2)
        };
    }
    
    getCurrentActivity() {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;
        
        if (hour < this.schedule.wakeUp || hour >= this.schedule.bedtime) {
            return 'sleeping';
        } else if (hour >= this.schedule.breakfast && hour < this.schedule.breakfast + 1) {
            return 'eating';
        } else if (hour >= this.schedule.lunch && hour < this.schedule.lunch + 1) {
            return 'eating';
        } else if (hour >= this.schedule.dinner && hour < this.schedule.dinner + 1) {
            return 'eating';
        } else if (hour >= this.schedule.morningActivity && hour < this.schedule.morningActivity + 2) {
            return this.personality.activityLevel > 0.6 ? 'exploring' : 'gardening';
        } else if (hour >= this.schedule.afternoonActivity && hour < this.schedule.afternoonActivity + 3) {
            return 'playing';
        } else {
            const rand = Math.random();
            if (rand < 0.3) return 'walking';
            if (rand < 0.6) return 'sitting';
            if (rand < 0.8) return 'exploring';
            return 'idle';
        }
    }
    
    decideNewAction() {
        this.state = this.getCurrentActivity();
        this.stateTimer = 5 + Math.random() * 15;
        this.lastStateChange = performance.now() / 1000;
        
        if (['playing', 'exploring', 'gardening'].includes(this.state)) {
            this.mood = ['Happy', 'Excited', 'Cheerful'][Math.floor(Math.random() * 3)];
            this.energy = Math.max(10, this.energy - 5);
        } else if (this.state === 'sleeping') {
            this.mood = 'Sleepy';
            this.energy = Math.min(100, this.energy + 15);
        } else {
            this.mood = ['Content', 'Calm', 'Thoughtful'][Math.floor(Math.random() * 3)];
        }
        
        if (this.state === 'walking' || this.state === 'exploring') {
            const angle = Math.random() * Math.PI * 2;
            const distance = 2 + Math.random() * 10;
            this.targetPosition.set(
                this.position.x + Math.cos(angle) * distance,
                0,
                this.position.z + Math.sin(angle) * distance
            );
        } else if (this.state === 'gardening') {
            this.targetPosition.set(
                -18 + (Math.random() - 0.5) * 14,
                0,
                2 + (Math.random() - 0.5) * 14
            );
        } else if (this.state === 'playing') {
            this.targetPosition.set(
                -10 + Math.random() * 20,
                0,
                -5 + Math.random() * 15
            );
        } else {
            this.targetPosition.set(
                -3 + (Math.random() - 0.5) * 8,
                0,
                -3 + (Math.random() - 0.5) * 8
            );
        }
        
        this.targetPosition.x = Math.max(-35, Math.min(35, this.targetPosition.x));
        this.targetPosition.z = Math.max(-35, Math.min(35, this.targetPosition.z));
    }
    
    update(deltaTime) {
        const now = performance.now() / 1000;
        
        if (now - this.lastStateChange > 60) {
            const newActivity = this.getCurrentActivity();
            if (newActivity !== this.state) {
                this.decideNewAction();
            }
        }
        
        this.stateTimer -= deltaTime;
        if (this.stateTimer <= 0) {
            this.decideNewAction();
        }
        
        if (this.position.distanceTo(this.targetPosition) > 0.2) {
            const direction = this.targetPosition.clone().sub(this.position).normalize();
            const moveSpeed = this.state === 'exploring' ? this.speed * 0.7 : this.speed;
            const distance = Math.min(moveSpeed * deltaTime, this.position.distanceTo(this.targetPosition));
            this.position.add(direction.clone().multiplyScalar(distance));
            
            if (distance > 0.01) {
                const targetRotation = Math.atan2(direction.x, direction.z);
                this.mesh.rotation.y += (targetRotation - this.mesh.rotation.y) * 0.1;
            }
            
            this.animationTime += deltaTime * 10;
            const bobAmount = Math.sin(this.animationTime) * 0.06;
            this.mesh.position.y = bobAmount;
            this.leftArm.rotation.x = Math.sin(this.animationTime) * 0.5;
            this.rightArm.rotation.x = -Math.sin(this.animationTime) * 0.5;
        } else {
            this.animationTime += deltaTime * 1.5;
            const breatheAmount = Math.sin(this.animationTime) * 0.015;
            this.mesh.position.y = breatheAmount;
            this.leftArm.rotation.x = Math.sin(this.animationTime * 0.5) * 0.08;
            this.rightArm.rotation.x = Math.sin(this.animationTime * 0.5 + Math.PI) * 0.08;
            
            if (Math.random() < 0.01) {
                this.mesh.rotation.y += (Math.random() - 0.5) * 0.5;
            }
        }
        
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
    }
}

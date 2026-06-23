import * as THREE from 'three';

export function createEnvironment(scene) {
    createGround(scene);
    createGrassPatches(scene);
    createTrees(scene);
    createFlowerPatches(scene);
    createRocks(scene);
    createPaths(scene);
    createGardenLights(scene);
    createBench(scene);
    createBirdBath(scene);
}

function createGround(scene) {
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const positions = groundGeometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = (Math.sin(x * 0.05) * Math.cos(y * 0.05) * 1.5) + 
                 (Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.5) +
                 (Math.random() * 0.1);
        positions.setZ(i, z);
    }
    groundGeometry.computeVertexNormals();
    
    // Create grass texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#4a7c3f';
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = 60 + Math.random() * 40;
        ctx.fillStyle = `rgb(${shade - 10}, ${shade + 20}, ${shade - 15})`;
        ctx.fillRect(x, y, 3, 3);
    }
    
    const grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(40, 40);
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: grassTexture,
        color: 0x5a8f3c,
        roughness: 0.9,
        metalness: 0.0,
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createGrassPatches(scene) {
    function createGrassBlade(height, width) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(-width/2, height);
        shape.lineTo(0, height * 1.1);
        shape.lineTo(width/2, height);
        shape.closePath();
        return new THREE.ShapeGeometry(shape);
    }
    
    for (let patch = 0; patch < 60; patch++) {
        const patchGroup = new THREE.Group();
        const patchX = (Math.random() - 0.5) * 80;
        const patchZ = (Math.random() - 0.5) * 80;
        const bladeCount = 20 + Math.floor(Math.random() * 30);
        
        for (let i = 0; i < bladeCount; i++) {
            const height = 0.3 + Math.random() * 0.8;
            const width = 0.05 + Math.random() * 0.1;
            const bladeGeometry = createGrassBlade(height, width);
            
            const greenHue = 0.2 + Math.random() * 0.2;
            const bladeMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(greenHue, 0.7, 0.2 + Math.random() * 0.3),
                side: THREE.DoubleSide,
                roughness: 0.8
            });
            
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            blade.rotation.y = Math.random() * Math.PI;
            blade.rotation.x = (Math.random() - 0.5) * 0.3;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            blade.castShadow = true;
            blade.receiveShadow = true;
            
            patchGroup.add(blade);
        }
        
        patchGroup.position.set(patchX, 0, patchZ);
        scene.add(patchGroup);
    }
}

function createTrees(scene) {
    function createTree(x, z, scale = 1) {
        const tree = new THREE.Group();
        
        const trunkHeight = 4 + Math.random() * 3;
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, trunkHeight * scale, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.08, 0.6, 0.2 + Math.random() * 0.2),
            roughness: 0.9,
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight * scale / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);
        
        const leafCount = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < leafCount; i++) {
            const leafSize = (0.8 + Math.random() * 1.5) * scale;
            const leafGeometry = new THREE.SphereGeometry(leafSize, 10, 8);
            const leafMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0.22 + Math.random() * 0.08, 0.7 + Math.random() * 0.1, 0.2 + Math.random() * 0.15),
                roughness: 0.7,
            });
            const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
            
            const angle = (i / leafCount) * Math.PI * 2 + Math.random() * 0.5;
            const radius = (1 + Math.random() * 2) * scale;
            const heightVar = trunkHeight * scale * 0.6 + Math.random() * trunkHeight * scale * 0.5;
            
            leaves.position.y = heightVar;
            leaves.position.x = Math.cos(angle) * radius;
            leaves.position.z = Math.sin(angle) * radius;
            leaves.scale.setScalar(0.8 + Math.random() * 0.4);
            leaves.castShadow = true;
            leaves.receiveShadow = true;
            tree.add(leaves);
        }
        
        tree.position.set(x, 0, z);
        return tree;
    }
    
    const treePositions = [
        [-25, -25], [25, -25], [-25, 25], [25, 25],
        [-30, 0], [30, 0], [0, -30], [0, 30],
        [-20, -30], [20, -30], [-30, -20], [30, -20],
        [-15, 20], [15, 20], [20, -15], [-20, -15],
        [-35, -15], [35, -15], [-35, 15], [35, 15],
        [-10, -35], [10, -35], [-35, -10], [35, -10]
    ];
    
    treePositions.forEach(([x, z]) => {
        const tree = createTree(x, z, 0.8 + Math.random() * 0.6);
        scene.add(tree);
    });
}

function createFlowerPatches(scene) {
    function createFlowers(x, z, count) {
        const flowerGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const flower = new THREE.Group();
            
            const stemHeight = 0.3 + Math.random() * 1;
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, stemHeight, 8);
            const stemMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0.25, 0.8, 0.3)
            });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = stemHeight / 2;
            stem.castShadow = true;
            flower.add(stem);
            
            const petalColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.5 + Math.random() * 0.3);
            const petalGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 6);
            const petalMaterial = new THREE.MeshStandardMaterial({ 
                color: petalColor,
                roughness: 0.4
            });
            const petals = new THREE.Mesh(petalGeometry, petalMaterial);
            petals.position.y = stemHeight;
            petals.castShadow = true;
            flower.add(petals);
            
            flower.position.set(
                (Math.random() - 0.5) * 4,
                0,
                (Math.random() - 0.5) * 4
            );
            flowerGroup.add(flower);
        }
        
        flowerGroup.position.set(x, 0, z);
        return flowerGroup;
    }
    
    const flowerPositions = [
        [-20, -20], [-20, -10], [-10, -20],
        [20, -20], [20, -10], [10, -20],
        [-20, 20], [-20, 10], [-10, 20],
        [20, 20], [20, 10], [10, 20],
        [-28, -8], [28, -8], [-8, -28], [8, -28],
        [-15, -30], [15, -30], [-30, -15], [30, -15]
    ];
    
    flowerPositions.forEach(([x, z]) => {
        const flowers = createFlowers(x, z, 15 + Math.floor(Math.random() * 20));
        scene.add(flowers);
    });
}

function createRocks(scene) {
    function createRockGroup(count, spread) {
        const rockGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const size = 0.2 + Math.random() * 0.8;
            const rockGeometry = new THREE.IcosahedronGeometry(size, 1);
            const positions = rockGeometry.attributes.position;
            for (let j = 0; j < positions.count; j++) {
                positions.setX(j, positions.getX(j) * (0.8 + Math.random() * 0.4));
                positions.setY(j, positions.getY(j) * (0.8 + Math.random() * 0.4));
                positions.setZ(j, positions.getZ(j) * (0.8 + Math.random() * 0.4));
            }
            rockGeometry.computeVertexNormals();
            
            const rockMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0.08, 0.05, 0.3 + Math.random() * 0.5),
                roughness: 0.7
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * spread,
                size * 0.3,
                (Math.random() - 0.5) * spread
            );
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            rock.castShadow = true;
            rock.receiveShadow = true;
            rockGroup.add(rock);
        }
        
        return rockGroup;
    }
    
    const rocks1 = createRockGroup(15, 10);
    rocks1.position.set(-25, 0, -15);
    scene.add(rocks1);
    
    const rocks2 = createRockGroup(10, 8);
    rocks2.position.set(20, 0, -25);
    scene.add(rocks2);
    
    const rocks3 = createRockGroup(12, 12);
    rocks3.position.set(25, 0, 20);
    scene.add(rocks3);
    
    const rocks4 = createRockGroup(8, 6);
    rocks4.position.set(-20, 0, 20);
    scene.add(rocks4);
}

function createPaths(scene) {
    function createGravelPath(startX, startZ, endX, endZ) {
        const path = new THREE.Group();
        const steps = 30;
        
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t + Math.sin(t * Math.PI * 2) * 1.5;
            
            const stoneGeometry = new THREE.CylinderGeometry(
                0.4 + Math.random() * 0.3,
                0.5 + Math.random() * 0.3,
                0.05 + Math.random() * 0.05,
                8
            );
            const stoneMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.05, 0.4 + Math.random() * 0.3),
                roughness: 0.7
            });
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            stone.position.set(x, 0.03, z);
            stone.rotation.x = (Math.random() - 0.5) * 0.2;
            stone.rotation.z = (Math.random() - 0.5) * 0.2;
            stone.receiveShadow = true;
            stone.castShadow = true;
            path.add(stone);
        }
        
        return path;
    }
    
    const path1 = createGravelPath(-10, 0, -10, -15);
    scene.add(path1);
    
    const path2 = createGravelPath(-10, 0, 15, 0);
    scene.add(path2);
    
    const path3 = createGravelPath(0, 0, 0, -20);
    scene.add(path3);
}

function createGardenLights(scene) {
    // Small lamp posts along paths
    for (let i = 0; i < 6; i++) {
        const lampGroup = new THREE.Group();
        
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.6 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1;
        post.castShadow = true;
        lampGroup.add(post);
        
        const bulbGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulbMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffeedd,
            roughness: 0.2,
            emissive: 0xffeedd,
            emissiveIntensity: 0.5
        });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.y = 2.1;
        lampGroup.add(bulb);
        
        lampGroup.position.set(-12 + i * 4, 0, -5 + Math.sin(i * 0.7) * 3);
        scene.add(lampGroup);
    }
}

function createBench(scene) {
    const benchGroup = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(3, 0.15, 0.8);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.6 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.8;
    seat.castShadow = true;
    seat.receiveShadow = true;
    benchGroup.add(seat);
    
    // Legs
    for (let x = -1.2; x <= 1.2; x += 2.4) {
        for (let z = -0.3; z <= 0.3; z += 0.6) {
            const legGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8);
            const leg = new THREE.Mesh(legGeometry, seatMaterial);
            leg.position.set(x, 0.4, z);
            leg.castShadow = true;
            benchGroup.add(leg);
        }
    }
    
    // Backrest
    const backGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 1.2, -0.35);
    back.castShadow = true;
    benchGroup.add(back);
    
    benchGroup.position.set(15, 0, 10);
    benchGroup.rotation.y = Math.PI / 4;
    scene.add(benchGroup);
}

function createBirdBath(scene) {
    const birdBathGroup = new THREE.Group();
    
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.75;
    base.castShadow = true;
    birdBathGroup.add(base);
    
    const bowlGeometry = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const bowl = new THREE.Mesh(bowlGeometry, baseMaterial);
    bowl.position.y = 1.5;
    bowl.castShadow = true;
    birdBathGroup.add(bowl);
    
    birdBathGroup.position.set(-18, 0, 15);
    scene.add(birdBathGroup);
}

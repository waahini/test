// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1a2a); // Dark night sky
scene.fog = new THREE.Fog(0x0a1a2a, 100, 500);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// Fighter Jet Model Creation
function createFighterJet() {
    const jet = new THREE.Group();

    // Fuselage (Pointed)
    const bodyGeom = new THREE.CylinderGeometry(0.1, 0.5, 4, 8);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    jet.add(body);

    // Cockpit
    const cockpitGeom = new THREE.SphereGeometry(0.3, 16, 16);
    cockpitGeom.scale(1, 1, 2);
    const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x00aaff, transparent: true, opacity: 0.7 });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(0, 0.3, 0.5);
    jet.add(cockpit);

    // Delta Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.5, -1.5);
    wingShape.lineTo(0, -1);
    wingShape.lineTo(-2.5, -1.5);
    wingShape.lineTo(0, 0);
    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.rotation.x = Math.PI / 2;
    wings.position.z = 0.5;
    jet.add(wings);

    // Vertical Fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.8, -0.8);
    finShape.lineTo(0, -0.6);
    const finGeom = new THREE.ShapeGeometry(finShape);
    const fin1 = new THREE.Mesh(finGeom, wingMat);
    fin1.rotation.y = Math.PI / 2;
    fin1.position.set(0.2, 0.1, -1);
    jet.add(fin1);
    
    const fin2 = fin1.clone();
    fin2.position.x = -0.2;
    jet.add(fin2);

    // Engine Exhaust (Glow)
    const engineGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    engineGeom.rotateX(Math.PI / 2);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -2;
    jet.add(engine);

    return jet;
}

const player = createFighterJet();
scene.add(player);

// Ocean
const oceanGeom = new THREE.PlaneGeometry(5000, 5000);
const oceanMat = new THREE.MeshPhongMaterial({ 
    color: 0x001122, 
    transparent: true, 
    opacity: 0.9,
    shininess: 80
});
const ocean = new THREE.Mesh(oceanGeom, oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -10;
scene.add(ocean);

// Islands & Enemies
const islands = new THREE.Group();
const enemies = [];
const enemyGeom = new THREE.SphereGeometry(2, 16, 16);
const enemyMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x550000 });

for (let i = 0; i < 50; i++) {
    const radius = 10 + Math.random() * 20;
    const islandGeom = new THREE.CylinderGeometry(radius, radius * 1.2, 10, 8);
    const islandMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const island = new THREE.Mesh(islandGeom, islandMat);
    island.position.set(
        (Math.random() - 0.5) * 2000,
        -10,
        (Math.random() - 0.5) * 2000
    );
    island.userData.radius = radius;
    islands.add(island);

    // Add an enemy drone above each island
    const enemy = new THREE.Mesh(enemyGeom, enemyMat);
    enemy.position.copy(island.position);
    enemy.position.y = 10 + Math.random() * 30;
    scene.add(enemy);
    enemies.push(enemy);
}
scene.add(islands);

// Controls
const keys = {};
let isStarted = false;
let isGameOver = false;
const speed = 0.8;
let distance = 0;
let score = 0;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (!isStarted && !isGameOver) {
        isStarted = true;
        document.getElementById('overlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('overlay').style.display = 'none';
        }, 500);
    }
    if (isGameOver && e.code === 'KeyR') {
        resetGame();
    }
    if (isStarted && !isGameOver && e.code === 'Space') {
        shoot();
    }
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

function resetGame() {
    location.reload(); // Simple reload for reset
}

// Shooting Mechanics
const bullets = [];
const bulletGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
bulletGeom.rotateX(Math.PI / 2);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

function shoot() {
    const bullet = new THREE.Mesh(bulletGeom, bulletMat);
    bullet.position.copy(player.position);
    bullet.quaternion.copy(player.quaternion);
    bullet.userData.velocity = new THREE.Vector3(0, 0, 3).applyQuaternion(player.quaternion);
    bullet.userData.life = 100;
    scene.add(bullet);
    bullets.push(bullet);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Trail Effect
const trailPoints = [];
const trailMax = 30;
const trailGeom = new THREE.BufferGeometry();
const trailMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
const trailLine = new THREE.Line(trailGeom, trailMat);
scene.add(trailLine);

function updateTrail() {
    trailPoints.push(player.position.clone());
    if (trailPoints.length > trailMax) trailPoints.shift();
    trailGeom.setFromPoints(trailPoints);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (isStarted && !isGameOver) {
        // Controls Handling
        const rollSpeed = 0.05;
        const pitchSpeed = 0.03;

        if (keys['ArrowLeft']) player.rotation.z += rollSpeed;
        if (keys['ArrowRight']) player.rotation.z -= rollSpeed;
        if (keys['ArrowUp']) player.rotation.x -= pitchSpeed;
        if (keys['ArrowDown']) player.rotation.x += pitchSpeed;

        // Natural leveling and turning
        player.rotation.z *= 0.95;
        player.rotation.y -= player.rotation.z * 0.05;

        // Forward Movement
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(player.quaternion);
        player.position.add(direction.multiplyScalar(speed));

        // Update Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.add(b.userData.velocity);
            b.userData.life--;

            // Collision with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (b.position.distanceTo(e.position) < 4) {
                    scene.remove(e);
                    enemies.splice(j, 1);
                    scene.remove(b);
                    bullets.splice(i, 1);
                    score += 100;
                    document.getElementById('score').innerText = score;
                    break;
                }
            }

            if (b.userData.life <= 0 && bullets[i] === b) {
                scene.remove(b);
                bullets.splice(i, 1);
            }
        }

        // Collision Detection (Environment)
        if (player.position.y < -9.5) isGameOver = true;

        islands.children.forEach(island => {
            const dx = island.position.x - player.position.x;
            const dz = island.position.z - player.position.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            if (horizontalDist < island.userData.radius && player.position.y < 0) {
                isGameOver = true;
            }
        });

        if (isGameOver) {
            document.getElementById('overlay').style.display = 'flex';
            document.getElementById('overlay').style.opacity = '1';
            document.getElementById('overlay').querySelector('h1').innerText = 'MISSION FAILED';
            document.getElementById('overlay').querySelector('p').innerText = 'Press R to Restart';
        }

        // Camera Follow
        const camOffset = new THREE.Vector3(0, 1.5, -6);
        camOffset.applyQuaternion(player.quaternion);
        const targetCamPos = player.position.clone().add(camOffset);
        camera.position.lerp(targetCamPos, 0.1);
        camera.lookAt(player.position.clone().add(direction.clone().multiplyScalar(10)));

        // Infinite World logic
        ocean.position.x = player.position.x;
        ocean.position.z = player.position.z;

        // Reposition enemies/islands
        enemies.forEach(e => {
            if (player.position.distanceTo(e.position) > 600) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 400 + Math.random() * 200;
                e.position.x = player.position.x + Math.cos(angle) * dist;
                e.position.z = player.position.z + Math.sin(angle) * dist;
                e.position.y = 10 + Math.random() * 50;
            }
        });

        // Update Stats
        distance += speed;
        document.getElementById('altitude').innerText = Math.max(0, Math.round(player.position.y + 10));
        document.getElementById('distance').innerText = Math.round(distance);

        updateTrail();
    }

    renderer.render(scene, camera);
}

animate();

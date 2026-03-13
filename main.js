// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a15); // Deep night sky
scene.fog = new THREE.Fog(0x050a15, 100, 600);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);

// Fighter Jet Model (Cooler Version)
function createFighterJet() {
    const jet = new THREE.Group();

    // Main Body
    const bodyGeom = new THREE.CylinderGeometry(0.1, 0.6, 5, 12);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    jet.add(body);

    // Nose Cone
    const noseGeom = new THREE.CylinderGeometry(0, 0.1, 1, 12);
    noseGeom.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeom, bodyMat);
    nose.position.z = 3;
    jet.add(nose);

    // Cockpit (Glass)
    const cockpitGeom = new THREE.SphereGeometry(0.35, 16, 16);
    cockpitGeom.scale(1, 0.8, 2.5);
    const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x3498db, transparent: true, opacity: 0.6, shininess: 200 });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(0, 0.4, 0.8);
    jet.add(cockpit);

    // Main Wings (Advanced Shape)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(3.5, -2);
    wingShape.lineTo(3.2, -2.5);
    wingShape.lineTo(0, -1.5);
    wingShape.lineTo(-3.2, -2.5);
    wingShape.lineTo(-3.5, -2);
    wingShape.lineTo(0, 0);
    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x34495e, side: THREE.DoubleSide });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.rotation.x = Math.PI / 2;
    wings.position.z = 0.5;
    jet.add(wings);

    // Missile Pods at wingtips
    const missileGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    missileGeom.rotateX(Math.PI / 2);
    const missileMat = new THREE.MeshPhongMaterial({ color: 0xbdc3c7 });
    
    const mLeft = new THREE.Mesh(missileGeom, missileMat);
    mLeft.position.set(3.4, 0, -1.8);
    jet.add(mLeft);

    const mRight = mLeft.clone();
    mRight.position.x = -3.4;
    jet.add(mRight);

    // Twin Vertical Fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1, -1);
    finShape.lineTo(0.2, -0.8);
    const finGeom = new THREE.ShapeGeometry(finShape);
    const fin1 = new THREE.Mesh(finGeom, wingMat);
    fin1.rotation.y = Math.PI / 2 + 0.2;
    fin1.position.set(0.6, 0.1, -1.5);
    jet.add(fin1);
    
    const fin2 = fin1.clone();
    fin2.rotation.y = Math.PI / 2 - 0.2;
    fin2.position.x = -0.6;
    jet.add(fin2);

    // Twin Engines
    const engineGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
    engineGeom.rotateX(Math.PI / 2);
    const engineMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    const engLeft = new THREE.Mesh(engineGeom, engineMat);
    engLeft.position.set(0.4, -0.1, -2.3);
    jet.add(engLeft);

    const engRight = engLeft.clone();
    engRight.position.x = -0.4;
    jet.add(engRight);

    // Booster Flames
    const flameGeom = new THREE.ConeGeometry(0.25, 1, 12);
    flameGeom.rotateX(-Math.PI / 2);
    flameGeom.translate(0, 0, -0.5);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    
    const flameLeft = new THREE.Mesh(flameGeom, flameMat);
    flameLeft.position.set(0.4, -0.1, -2.5);
    jet.add(flameLeft);
    jet.flameLeft = flameLeft;

    const flameRight = flameLeft.clone();
    flameRight.position.x = -0.4;
    jet.add(flameRight);
    jet.flameRight = flameRight;

    return jet;
}

const player = createFighterJet();
scene.add(player);

// Environment
const oceanGeom = new THREE.PlaneGeometry(10000, 10000);
const oceanMat = new THREE.MeshPhongMaterial({ color: 0x00050a, shininess: 100 });
const ocean = new THREE.Mesh(oceanGeom, oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -10;
scene.add(ocean);

const islands = new THREE.Group();
const enemies = [];
const enemyGeom = new THREE.IcosahedronGeometry(3, 1);
const enemyMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x880000, wireframe: true });

for (let i = 0; i < 60; i++) {
    const radius = 15 + Math.random() * 25;
    const islandGeom = new THREE.CylinderGeometry(radius, radius * 1.5, 15, 6);
    const islandMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const island = new THREE.Mesh(islandGeom, islandMat);
    island.position.set((Math.random() - 0.5) * 3000, -10, (Math.random() - 0.5) * 3000);
    island.userData.radius = radius;
    islands.add(island);

    const enemy = new THREE.Mesh(enemyGeom, enemyMat);
    enemy.position.copy(island.position);
    enemy.position.y = 20 + Math.random() * 40;
    scene.add(enemy);
    enemies.push(enemy);
}
scene.add(islands);

// Explosion Particles
const particles = [];
function createExplosion(pos) {
    const count = 15;
    const geom = new THREE.SphereGeometry(0.3, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    for(let i=0; i<count; i++) {
        const p = new THREE.Mesh(geom, mat);
        p.position.copy(pos);
        p.userData.velocity = new THREE.Vector3(
            (Math.random()-0.5)*2,
            (Math.random()-0.5)*2,
            (Math.random()-0.5)*2
        );
        p.userData.life = 30;
        scene.add(p);
        particles.push(p);
    }
}

// State & Controls
const keys = {};
let isStarted = false;
let isGameOver = false;
let baseSpeed = 1.0;
let speed = baseSpeed;
let distance = 0;
let score = 0;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (!isStarted && !isGameOver) {
        isStarted = true;
        document.getElementById('overlay').style.opacity = '0';
        setTimeout(() => document.getElementById('overlay').style.display = 'none', 500);
    }
    if (isGameOver && e.code === 'KeyR') location.reload();
    if (isStarted && !isGameOver && e.code === 'Space') shoot();
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Bullets
const bullets = [];
const bulletGeom = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
bulletGeom.rotateX(Math.PI / 2);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

function shoot() {
    const b = new THREE.Mesh(bulletGeom, bulletMat);
    b.position.copy(player.position);
    b.quaternion.copy(player.quaternion);
    b.userData.velocity = new THREE.Vector3(0, 0, 5).applyQuaternion(player.quaternion);
    b.userData.life = 100;
    scene.add(b);
    bullets.push(b);
}

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Trail
const trailPoints = [];
const trailMax = 20;
const trailGeom = new THREE.BufferGeometry();
const trailMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.2 });
const trailLine = new THREE.Line(trailGeom, trailMat);
scene.add(trailLine);

function animate() {
    requestAnimationFrame(animate);

    if (isStarted && !isGameOver) {
        // Booster Mechanic
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            speed = THREE.MathUtils.lerp(speed, baseSpeed * 2.5, 0.1);
            player.flameLeft.scale.set(1.5, 1.5, 2.5);
            player.flameRight.scale.set(1.5, 1.5, 2.5);
            player.flameLeft.material.color.setHex(0xffffff);
            player.flameRight.material.color.setHex(0xffffff);
        } else {
            speed = THREE.MathUtils.lerp(speed, baseSpeed, 0.1);
            player.flameLeft.scale.set(1, 1, 1);
            player.flameRight.scale.set(1, 1, 1);
            player.flameLeft.material.color.setHex(0x00ffff);
            player.flameRight.material.color.setHex(0x00ffff);
        }

        // Rotation
        const rollSpeed = 0.06;
        const pitchSpeed = 0.04;
        if (keys['ArrowLeft']) player.rotation.z += rollSpeed;
        if (keys['ArrowRight']) player.rotation.z -= rollSpeed;
        if (keys['ArrowUp']) player.rotation.x -= pitchSpeed;
        if (keys['ArrowDown']) player.rotation.x += pitchSpeed;

        player.rotation.z *= 0.94;
        player.rotation.y -= player.rotation.z * 0.06;

        // Movement
        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
        player.position.add(dir.multiplyScalar(speed));

        // Update Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.add(b.userData.velocity);
            b.userData.life--;
            
            enemies.forEach((e, j) => {
                if (b.position.distanceTo(e.position) < 5) {
                    createExplosion(e.position);
                    scene.remove(e);
                    enemies.splice(j, 1);
                    scene.remove(b);
                    bullets.splice(i, 1);
                    score += 150;
                    document.getElementById('score').innerText = score;
                }
            });
            if (b.userData.life <= 0 && bullets[i] === b) {
                scene.remove(b); bullets.splice(i, 1);
            }
        }

        // Particles
        for(let i=particles.length-1; i>=0; i--) {
            const p = particles[i];
            p.position.add(p.userData.velocity);
            p.userData.life--;
            p.scale.multiplyScalar(0.95);
            if(p.userData.life <= 0) {
                scene.remove(p); particles.splice(i, 1);
            }
        }

        // Collision & Infinite Logic
        if (player.position.y < -9.5) isGameOver = true;
        islands.children.forEach(isl => {
            if (player.position.distanceTo(isl.position) < isl.userData.radius && player.position.y < 5) isGameOver = true;
        });

        if (isGameOver) {
            document.getElementById('overlay').style.display = 'flex';
            document.getElementById('overlay').style.opacity = '1';
            document.getElementById('overlay').querySelector('h1').innerText = 'CRASHED';
            document.getElementById('overlay').querySelector('p').innerText = 'Press R to Restart Mission';
        }

        // Camera
        const camOff = new THREE.Vector3(0, 2, -10).applyQuaternion(player.quaternion);
        camera.position.lerp(player.position.clone().add(camOff), 0.1);
        camera.lookAt(player.position.clone().add(dir.multiplyScalar(20)));

        ocean.position.x = player.position.x;
        ocean.position.z = player.position.z;

        distance += speed;
        document.getElementById('altitude').innerText = Math.max(0, Math.round(player.position.y + 10));
        document.getElementById('distance').innerText = Math.round(distance);

        trailPoints.push(player.position.clone());
        if (trailPoints.length > trailMax) trailPoints.shift();
        trailGeom.setFromPoints(trailPoints);
    }
    renderer.render(scene, camera);
}
animate();

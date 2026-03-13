// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e); // Deep Twilight Blue
scene.fog = new THREE.Fog(0x1a1a2e, 100, 1000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // Increased ambient light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(50, 200, 100);
scene.add(dirLight);

// Stars
const starGeom = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<4000; i++) starPos.push((Math.random()-0.5)*3000, Math.random()*1500, (Math.random()-0.5)*3000);
starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2 })));

// Speed Lines (for Boost)
const speedLines = new THREE.Group();
const lineGeom = new THREE.BoxGeometry(0.02, 0.02, 5);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
for(let i=0; i<40; i++) {
    const line = new THREE.Mesh(lineGeom, lineMat);
    line.position.set((Math.random()-0.5)*30, (Math.random()-0.5)*20, -Math.random()*50);
    speedLines.add(line);
}
camera.add(speedLines); // Attach to camera
scene.add(camera);

// Fighter Jet (Enhanced Visibility)
function createFighterJet() {
    const jet = new THREE.Group();
    const mainMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50, shininess: 100 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan Glow

    // Fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.5, 6, 8), mainMat);
    body.rotateX(Math.PI / 2);
    jet.add(body);

    // Glowing Strips
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 4), glowMat);
    strip.position.set(0.4, 0.1, 0);
    jet.add(strip);
    const strip2 = strip.clone(); strip2.position.x = -0.4;
    jet.add(strip2);

    // Wings
    const wingGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array([ 0,0,1, 4.5,0,-2.5, 0,0,-1.5, -4.5,0,-2.5, 0,0,1 ]);
    wingGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const wings = new THREE.Mesh(wingGeom, new THREE.MeshPhongMaterial({ color: 0x1a2530, side: THREE.DoubleSide }));
    jet.add(wings);

    // Tails
    const tailGeom = new THREE.BoxGeometry(0.1, 1.2, 0.8);
    const tail1 = new THREE.Mesh(tailGeom, mainMat);
    tail1.position.set(0.6, 0.6, -1.8); tail1.rotation.y = 0.3;
    jet.add(tail1);
    const tail2 = tail1.clone(); tail2.position.x = -0.6; tail2.rotation.y = -0.3;
    jet.add(tail2);

    // Engine
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    eng.rotateX(Math.PI/2); eng.position.z = -2.8;
    jet.add(eng);
    jet.engine = eng;

    return jet;
}

const player = createFighterJet();
scene.add(player);

// Enemies (Tech Drones)
const enemies = [];
const droneMat = new THREE.MeshPhongMaterial({ color: 0xff0044, emissive: 0x330000 });
function createEnemy() {
    const drone = new THREE.Mesh(new THREE.OctahedronGeometry(2.5), droneMat);
    drone.position.set((Math.random()-0.5)*2500, 20 + Math.random()*100, (Math.random()-0.5)*2500);
    scene.add(drone);
    enemies.push(drone);
}
for(let i=0; i<60; i++) createEnemy();

// Explosion
const particles = [];
function createExplosion(pos) {
    for(let i=0; i<15; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        p.position.copy(pos);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*4, (Math.random()-0.5)*4, (Math.random()-0.5)*4), life: 25 };
        scene.add(p);
        particles.push(p);
    }
}

// State
const keys = {};
let isStarted = false, isGameOver = false, score = 0, distance = 0, speed = 1.2;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if(!isStarted && !isGameOver) { isStarted = true; document.getElementById('overlay').style.display = 'none'; }
    if(isGameOver && e.code === 'KeyR') location.reload();
    if(isStarted && !isGameOver && e.code === 'Space') shoot();
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Bullets
const bullets = [];
function shoot() {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    b.position.copy(player.position); b.quaternion.copy(player.quaternion);
    b.userData = { vel: new THREE.Vector3(0,0,8).applyQuaternion(player.quaternion), life: 70 };
    scene.add(b); bullets.push(b);
}

// Ocean (Bright Grid)
const ocean = new THREE.GridHelper(20000, 100, 0x00ffff, 0x333333);
ocean.position.y = -10;
scene.add(ocean);

function animate() {
    requestAnimationFrame(animate);
    if(isStarted && !isGameOver) {
        const boost = keys['ShiftLeft'] || keys['ShiftRight'];
        speed = THREE.MathUtils.lerp(speed, boost ? 4.0 : 1.2, 0.1);
        
        // Speed lines effect
        speedLines.children.forEach(l => {
            l.material.opacity = THREE.MathUtils.lerp(l.material.opacity, boost ? 0.8 : 0, 0.1);
            l.position.z += speed * 2;
            if(l.position.z > 0) l.position.z = -100;
        });

        player.engine.scale.set(1, 1, boost ? 4 : 1);
        player.engine.material.color.setHex(boost ? 0xffffff : 0x00ffff);

        if(keys['ArrowLeft']) player.rotation.z += 0.07;
        if(keys['ArrowRight']) player.rotation.z -= 0.07;
        if(keys['ArrowUp']) player.rotation.x -= 0.04;
        if(keys['ArrowDown']) player.rotation.x += 0.04;
        player.rotation.z *= 0.94;
        player.rotation.y -= player.rotation.z * 0.05;

        const dir = new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion);
        player.position.add(dir.multiplyScalar(speed));

        // Collision & Bullets
        for(let i=bullets.length-1; i>=0; i--) {
            const b = bullets[i]; b.position.add(b.userData.vel); b.userData.life--;
            enemies.forEach((e, j) => {
                if(b.position.distanceTo(e.position) < 8) {
                    createExplosion(e.position); scene.remove(e); enemies.splice(j, 1);
                    scene.remove(b); bullets.splice(i, 1);
                    score += 250; document.getElementById('score').innerText = score;
                    createEnemy();
                }
            });
            if(b.userData.life <= 0 && bullets[i] === b) { scene.remove(b); bullets.splice(i, 1); }
        }

        // Particles
        for(let i=particles.length-1; i>=0; i--) {
            const p = particles[i]; p.position.add(p.userData.vel); p.userData.life--;
            if(p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
        }

        if(player.position.y < -9.5) isGameOver = true;
        if(isGameOver) { document.getElementById('overlay').style.display = 'flex'; document.getElementById('overlay').querySelector('h1').innerText = 'MISSION FAILED'; }

        // Camera
        const camOff = new THREE.Vector3(0, 2, -14).applyQuaternion(player.quaternion);
        camera.position.lerp(player.position.clone().add(camOff), 0.1);
        camera.lookAt(player.position.clone().add(dir.multiplyScalar(25)));
        
        ocean.position.x = player.position.x; ocean.position.z = player.position.z;

        distance += speed;
        document.getElementById('altitude').innerText = Math.max(0, Math.round(player.position.y + 10));
        document.getElementById('distance').innerText = Math.round(distance);
    }
    renderer.render(scene, camera);
}
animate();

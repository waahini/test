// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050a); 
scene.fog = new THREE.Fog(0x02050a, 200, 800);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);

// Stars Background
const starGeom = new THREE.BufferGeometry();
const starPositions = [];
for(let i=0; i<3000; i++) {
    starPositions.push((Math.random()-0.5)*2000, Math.random()*1000, (Math.random()-0.5)*2000);
}
starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
const stars = new THREE.Points(starGeom, starMat);
scene.add(stars);

// Clouds
const clouds = new THREE.Group();
const cloudGeom = new THREE.SphereGeometry(10, 8, 8);
const cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
for(let i=0; i<40; i++) {
    const cloud = new THREE.Group();
    for(let j=0; j<5; j++) {
        const m = new THREE.Mesh(cloudGeom, cloudMat);
        m.position.set(Math.random()*20, Math.random()*10, Math.random()*20);
        m.scale.set(Math.random()*2+1, Math.random()*1+0.5, Math.random()*2+1);
        cloud.add(m);
    }
    cloud.position.set((Math.random()-0.5)*2000, 50 + Math.random()*100, (Math.random()-0.5)*2000);
    clouds.add(cloud);
}
scene.add(clouds);

// Fighter Jet (Stealth Twin-Tail Design)
function createFighterJet() {
    const jet = new THREE.Group();
    const mat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 150 });

    // Fuselage
    const bodyGeom = new THREE.CylinderGeometry(0.05, 0.5, 6, 6);
    bodyGeom.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeom, mat);
    jet.add(body);

    // Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(4, -2.5);
    wingShape.lineTo(0, -1.8);
    wingShape.lineTo(-4, -2.5);
    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wings = new THREE.Mesh(wingGeom, mat);
    wings.rotation.x = Math.PI / 2;
    wings.position.z = 1;
    jet.add(wings);

    // Twin Tails
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(1.2, -1.2);
    tailShape.lineTo(0, -1);
    const tailGeom = new THREE.ShapeGeometry(tailShape);
    
    const t1 = new THREE.Mesh(tailGeom, mat);
    t1.rotation.y = Math.PI/2 + 0.4;
    t1.position.set(0.5, 0.2, -1.5);
    jet.add(t1);

    const t2 = t1.clone();
    t2.rotation.y = Math.PI/2 - 0.4;
    t2.position.x = -0.5;
    jet.add(t2);

    // Engine Glow
    const engineGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    engineGeom.rotateX(Math.PI/2);
    const engMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const eng = new THREE.Mesh(engineGeom, engMat);
    eng.position.z = -2.8;
    jet.add(eng);
    jet.engine = eng;

    return jet;
}

const player = createFighterJet();
scene.add(player);

// Enemies (Drones)
const enemies = [];
const droneGeom = new THREE.OctahedronGeometry(3, 0);
const droneMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x330000 });

function createEnemy() {
    const drone = new THREE.Mesh(droneGeom, droneMat);
    drone.position.set((Math.random()-0.5)*2000, 20 + Math.random()*80, (Math.random()-0.5)*2000);
    scene.add(drone);
    enemies.push(drone);
}
for(let i=0; i<50; i++) createEnemy();

// Explosion
const particles = [];
function createExplosion(pos) {
    for(let i=0; i<10; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
        p.position.copy(pos);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*3, (Math.random()-0.5)*3), life: 20 };
        scene.add(p);
        particles.push(p);
    }
}

// Controls
const keys = {};
let isStarted = false, isGameOver = false;
let score = 0, distance = 0, speed = 1.0;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if(!isStarted && !isGameOver) {
        isStarted = true;
        document.getElementById('overlay').style.display = 'none';
    }
    if(isGameOver && e.code === 'KeyR') location.reload();
    if(isStarted && !isGameOver && e.code === 'Space') shoot();
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Bullets
const bullets = [];
function shoot() {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    b.position.copy(player.position);
    b.quaternion.copy(player.quaternion);
    b.userData = { vel: new THREE.Vector3(0,0,6).applyQuaternion(player.quaternion), life: 60 };
    scene.add(b);
    bullets.push(b);
}

// Ocean (Grid)
const ocean = new THREE.GridHelper(10000, 100, 0x004488, 0x001122);
ocean.position.y = -10;
scene.add(ocean);

function animate() {
    requestAnimationFrame(animate);
    if(isStarted && !isGameOver) {
        // Boost
        const boost = (keys['ShiftLeft'] || keys['ShiftRight']);
        speed = THREE.MathUtils.lerp(speed, boost ? 3.0 : 1.2, 0.1);
        player.engine.scale.set(1, 1, boost ? 3 : 1);
        player.engine.material.color.setHex(boost ? 0xffffff : 0x00ffff);

        // Rotation
        if(keys['ArrowLeft']) player.rotation.z += 0.06;
        if(keys['ArrowRight']) player.rotation.z -= 0.06;
        if(keys['ArrowUp']) player.rotation.x -= 0.04;
        if(keys['ArrowDown']) player.rotation.x += 0.04;
        player.rotation.z *= 0.94;
        player.rotation.y -= player.rotation.z * 0.06;

        const dir = new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion);
        player.position.add(dir.multiplyScalar(speed));

        // Bullets & Collision
        for(let i=bullets.length-1; i>=0; i--) {
            const b = bullets[i];
            b.position.add(b.userData.vel);
            b.userData.life--;
            enemies.forEach((e, j) => {
                if(b.position.distanceTo(e.position) < 6) {
                    createExplosion(e.position);
                    scene.remove(e); enemies.splice(j, 1);
                    scene.remove(b); bullets.splice(i, 1);
                    score += 200;
                    document.getElementById('score').innerText = score;
                    createEnemy(); // Respawn
                }
            });
            if(b.userData.life <= 0 && bullets[i] === b) { scene.remove(b); bullets.splice(i, 1); }
        }

        // Particles
        for(let i=particles.length-1; i>=0; i--) {
            const p = particles[i];
            p.position.add(p.userData.vel);
            p.userData.life--;
            if(p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
        }

        // Crash
        if(player.position.y < -9.5) isGameOver = true;

        if(isGameOver) {
            document.getElementById('overlay').style.display = 'flex';
            document.getElementById('overlay').querySelector('h1').innerText = 'MISSION FAILED';
        }

        // Camera & Background follow
        const camOff = new THREE.Vector3(0, 2, -12).applyQuaternion(player.quaternion);
        camera.position.lerp(player.position.clone().add(camOff), 0.1);
        camera.lookAt(player.position.clone().add(dir.multiplyScalar(20)));
        
        stars.position.copy(player.position);
        ocean.position.x = player.position.x;
        ocean.position.z = player.position.z;

        distance += speed;
        document.getElementById('altitude').innerText = Math.max(0, Math.round(player.position.y + 10));
        document.getElementById('distance').innerText = Math.round(distance);
    }
    renderer.render(scene, camera);
}
animate();

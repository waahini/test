// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2a4a); // Deep Atmosphere Blue
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0008); // Exponential fog for better depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // Enable shadows
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x4040ff, 0.4)); // Blue-tinted ambient
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(500, 1000, 500);
dirLight.castShadow = true;
scene.add(dirLight);

// Sun (Enhanced with Glow Layers)
const sunGroup = new THREE.Group();
const sunGeom = new THREE.SphereGeometry(40, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
const sunCore = new THREE.Mesh(sunGeom, sunMat);
sunGroup.add(sunCore);

for(let i=1; i<=3; i++) {
    const glowGeom = new THREE.SphereGeometry(40 + i*30, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.2 / i });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    sunGroup.add(glow);
}
sunGroup.position.set(800, 1200, 800);
scene.add(sunGroup);

// Ocean (Upgraded from GridHelper to Mesh)
const oceanGeom = new THREE.PlaneGeometry(20000, 20000);
const oceanMat = new THREE.MeshPhongMaterial({ 
    color: 0x004488, 
    shininess: 90, 
    specular: 0x00ffff,
    transparent: true,
    opacity: 0.9
});
const ocean = new THREE.Mesh(oceanGeom, oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -10;
scene.add(ocean);

// Stars and Nebula (Improved placement)
function createStars() {
    const starColors = [0xffffff, 0xaaaaff, 0xffffaa];
    starColors.forEach(color => {
        const starGeom = new THREE.BufferGeometry();
        const starPos = [];
        for(let i=0; i<1000; i++) {
            starPos.push(
                (Math.random()-0.5)*8000, 
                1500 + Math.random()*1500, 
                (Math.random()-0.5)*8000
            );
        }
        starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: color, size: 2, sizeAttenuation: true })));
    });
}
createStars();

// Clouds (More organic look)
const clouds = [];
function createCloud(pos) {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7,
        flatShading: true
    });
    const partsCount = 5 + Math.floor(Math.random() * 5);
    for(let i=0; i<partsCount; i++) {
        const part = new THREE.Mesh(new THREE.SphereGeometry(6 + Math.random()*10, 8, 8), cloudMat);
        part.position.set(Math.random()*25 - 12, Math.random()*8 - 4, Math.random()*25 - 12);
        part.scale.set(1.5, 0.8, 1);
        cloud.add(part);
    }
    cloud.position.copy(pos);
    scene.add(cloud);
    clouds.push(cloud);
}
for(let i=0; i<200; i++) {
    createCloud(new THREE.Vector3(
        (Math.random()-0.5)*8000, 
        50 + Math.random()*400, 
        (Math.random()-0.5)*8000
    ));
}

// Floating Islands
const islands = [];
function createIsland() {
    const island = new THREE.Group();
    const geom = new THREE.ConeGeometry(25 + Math.random()*40, 60, 4);
    const mat = new THREE.MeshPhongMaterial({ color: 0x6e5a4a });
    const cone = new THREE.Mesh(geom, mat);
    cone.rotation.x = Math.PI;
    island.add(cone);
    
    const top = new THREE.Mesh(new THREE.BoxGeometry(35 + Math.random()*25, 3, 35 + Math.random()*25), new THREE.MeshPhongMaterial({ color: 0x4d8a37 }));
    top.position.y = 0;
    island.add(top);

    island.position.set((Math.random()-0.5)*4500, -20 - Math.random()*50, (Math.random()-0.5)*4500);
    scene.add(island);
    islands.push(island);
}
for(let i=0; i<50; i++) createIsland();

// Enemies (Tech Drones)
const enemies = [];
const droneMat = new THREE.MeshPhongMaterial({ color: 0xff0044, emissive: 0x330000 });
function createEnemy() {
    const drone = new THREE.Mesh(new THREE.OctahedronGeometry(3), droneMat);
    drone.position.set((Math.random()-0.5)*4000, 30 + Math.random()*200, (Math.random()-0.5)*4000);
    scene.add(drone);
    enemies.push(drone);
}
for(let i=0; i<100; i++) createEnemy();

// Explosion
const particles = [];
function createExplosion(pos) {
    for(let i=0; i<20; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
        p.position.copy(pos);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*6), life: 30 };
        scene.add(p);
        particles.push(p);
    }
}

// State
const keys = {};
let isStarted = false, isGameOver = false, score = 0, distance = 0, speed = 1.2;

function startGame() {
    if (isGameOver) {
        location.reload();
        return;
    }
    if (!isStarted) {
        isStarted = true;
        document.getElementById('overlay').style.display = 'none';
    }
}
window.startGame = startGame;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    startGame();
    if(isStarted && !isGameOver && e.code === 'Space') shoot();
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Initial Camera Position
camera.position.set(0, 10, -30);
camera.lookAt(player.position);

// Bullets
const bullets = [];
function shoot() {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 5), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    b.position.copy(player.position); b.quaternion.copy(player.quaternion);
    b.userData = { vel: new THREE.Vector3(0,0,10).applyQuaternion(player.quaternion), life: 80 };
    scene.add(b); bullets.push(b);
}

// Ocean (More vibrant blue)
const ocean = new THREE.GridHelper(20000, 150, 0x00aaff, 0x0055ff);
ocean.position.y = -10;
scene.add(ocean);

function animate() {
    requestAnimationFrame(animate);
    if(isStarted && !isGameOver) {
        const boost = keys['ShiftLeft'] || keys['ShiftRight'];
        speed = THREE.MathUtils.lerp(speed, boost ? 5.5 : 1.5, 0.1);
        
        speedLines.children.forEach(l => {
            l.material.opacity = THREE.MathUtils.lerp(l.material.opacity, boost ? 0.6 : 0, 0.1);
            l.position.z += speed * 2;
            if(l.position.z > 0) l.position.z = -100;
        });

        player.engine.scale.set(1.5, 1.5, boost ? 6 : 1.5);
        player.engine.material.color.setHex(boost ? 0xffff00 : 0xff4400);

        if(keys['ArrowLeft']) player.rotation.z += 0.08;
        if(keys['ArrowRight']) player.rotation.z -= 0.08;
        if(keys['ArrowUp']) player.rotation.x -= 0.05;
        if(keys['ArrowDown']) player.rotation.x += 0.05;
        player.rotation.z *= 0.94;
        player.rotation.y -= player.rotation.z * 0.05;

        const dir = new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion);
        player.position.add(dir.multiplyScalar(speed));

        for(let i=bullets.length-1; i>=0; i--) {
            const b = bullets[i]; b.position.add(b.userData.vel); b.userData.life--;
            enemies.forEach((e, j) => {
                if(b.position.distanceTo(e.position) < 10) {
                    createExplosion(e.position); scene.remove(e); enemies.splice(j, 1);
                    scene.remove(b); bullets.splice(i, 1);
                    score += 250; document.getElementById('score').innerText = score;
                    createEnemy();
                }
            });
            if(b && b.userData.life <= 0) { scene.remove(b); bullets.splice(i, 1); }
        }

        for(let i=particles.length-1; i>=0; i--) {
            const p = particles[i]; p.position.add(p.userData.vel); p.userData.life--;
            if(p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
        }

        clouds.forEach(c => {
            c.position.x += 0.2;
            if(c.position.x > 2500) c.position.x = -2500;
        });

        let collided = false;
        islands.forEach(is => {
            if(player.position.distanceTo(is.position) < 35) collided = true;
        });

        if(player.position.y < -9.5 || collided) {
            isGameOver = true;
            document.getElementById('overlay').style.display = 'flex';
            document.getElementById('overlay').querySelector('h1').innerText = 'MISSION FAILED';
            document.getElementById('overlay-msg').innerText = 'Click or ANY KEY to Restart';
        }

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
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

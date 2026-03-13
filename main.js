// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 200, 3000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Lighting - MUCH BRIGHTER
scene.add(new THREE.AmbientLight(0xffffff, 0.7)); // Higher ambient light
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(200, 500, 200);
scene.add(dirLight);

// Sun (Visual Representative)
const sunGeom = new THREE.SphereGeometry(30, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.8 });
const sun = new THREE.Mesh(sunGeom, sunMat);
sun.position.set(500, 1000, 500);
scene.add(sun);

// Diverse Stars (Keep for high-altitude look)
function createStars() {
    const starColors = [0xffffff, 0xaaaaff, 0xffffaa, 0xffaaaa];
    starColors.forEach(color => {
        const starGeom = new THREE.BufferGeometry();
        const starPos = [];
        for(let i=0; i<500; i++) starPos.push((Math.random()-0.5)*4000, 500 + Math.random()*1500, (Math.random()-0.5)*4000);
        starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: color, size: Math.random() * 2 + 0.5 })));
    });
}
createStars();

// Nebula Effect (Lighter tones)
const nebulaGeom = new THREE.BufferGeometry();
const nebulaPos = [];
for(let i=0; i<100; i++) nebulaPos.push((Math.random()-0.5)*3000, 300 + (Math.random()-0.5)*500, (Math.random()-0.5)*3000);
nebulaGeom.setAttribute('position', new THREE.Float32BufferAttribute(nebulaPos, 3));
const nebula = new THREE.Points(nebulaGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 50, transparent: true, opacity: 0.1 }));
scene.add(nebula);

// Speed Lines (for Boost)
const speedLines = new THREE.Group();
const lineGeom = new THREE.BoxGeometry(0.02, 0.02, 8);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
for(let i=0; i<60; i++) {
    const line = new THREE.Mesh(lineGeom, lineMat);
    line.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*40, -Math.random()*100);
    speedLines.add(line);
}
camera.add(speedLines);
scene.add(camera);

// Fighter Jet (Fixed Symmetrical Wings)
function createFighterJet() {
    const jet = new THREE.Group();
    const mainMat = new THREE.MeshPhongMaterial({ color: 0xe0e0e0, shininess: 100 }); // Silver/Light Grey
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400 }); // Orange Thruster

    // Fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.5, 6, 8), mainMat);
    body.rotateX(Math.PI / 2);
    jet.add(body);

    // Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 1.5);
    wingShape.lineTo(4.5, -1.5);
    wingShape.lineTo(0, -0.5);
    wingShape.lineTo(-4.5, -1.5);
    wingShape.lineTo(0, 1.5);
    
    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wings = new THREE.Mesh(wingGeom, new THREE.MeshPhongMaterial({ color: 0xd0d0d0, side: THREE.DoubleSide }));
    wings.rotation.x = Math.PI / 2;
    jet.add(wings);

    // Tails
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(1.2, -1.2);
    tailShape.lineTo(0, -1);
    const tailGeom = new THREE.ShapeGeometry(tailShape);
    
    const t1 = new THREE.Mesh(tailGeom, mainMat);
    t1.rotation.y = Math.PI/2 + 0.3;
    t1.position.set(0.6, 0.1, -1.8);
    jet.add(t1);

    const t2 = t1.clone();
    t2.rotation.y = Math.PI/2 - 0.3;
    t2.position.x = -0.6;
    jet.add(t2);

    // Engine
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), glowMat);
    eng.rotateX(Math.PI/2); eng.position.z = -2.8;
    jet.add(eng);
    jet.engine = eng;

    return jet;
}

const player = createFighterJet();
scene.add(player);

// Clouds - MORE AND BRIGHTER
const clouds = [];
function createCloud(pos) {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for(let i=0; i<8; i++) {
        const part = new THREE.Mesh(new THREE.SphereGeometry(4 + Math.random()*6, 12, 12), cloudMat);
        part.position.set(Math.random()*15, Math.random()*5, Math.random()*15);
        cloud.add(part);
    }
    cloud.position.copy(pos);
    scene.add(cloud);
    clouds.push(cloud);
}
for(let i=0; i<150; i++) createCloud(new THREE.Vector3((Math.random()-0.5)*5000, 20 + Math.random()*300, (Math.random()-0.5)*5000));

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

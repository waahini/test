const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

const airplane = new THREE.Group();
const bodyGeometry = new THREE.BoxGeometry(1, 0.2, 0.5);
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
airplane.add(body);

const wingGeometry = new THREE.BoxGeometry(0.2, 0.1, 2);
const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(0, 0, -1);
airplane.add(leftWing);

const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
rightWing.position.set(0, 0, 1);
airplane.add(rightWing);

scene.add(airplane);

camera.position.z = 5;

const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

function animate() {
    requestAnimationFrame(animate);

    if (keys['ArrowUp']) {
        airplane.position.y += 0.05;
    }
    if (keys['ArrowDown']) {
        airplane.position.y -= 0.05;
    }
    if (keys['ArrowLeft']) {
        airplane.position.x -= 0.05;
    }
    if (keys['ArrowRight']) {
        airplane.position.x += 0.05;
    }

    renderer.render(scene, camera);
}

animate();

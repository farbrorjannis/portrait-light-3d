let scene, camera, renderer, head, light, controls;

const models = {
    standard: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj',
    male: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/leeperryman/head.obj',
    female: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj'
};

function init() {
    scene = new THREE.Scene();
    const container = document.getElementById('canvas-container');
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    loadModel('standard');

    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    window.addEventListener('resize', onResize);
    
    animate();
    setTimeout(onResize, 200); // Tvingar igång bilden efter laddning
}

function loadModel(type) {
    if (head) scene.remove(head);
    new THREE.OBJLoader().load(models[type], (obj) => {
        head = obj;
        head.scale.set(0.045, 0.045, 0.045);
        head.position.y = -1.5;
        head.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, flatShading: true });
            }
        });
        scene.add(head);
    });
}

function updateLight() {
    const a = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(a) * 7, h, Math.sin(a) * 7);
}

function onResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function setRembrandt() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 5;
    updateLight();
}

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    renderer.render(scene, camera);
}

init();

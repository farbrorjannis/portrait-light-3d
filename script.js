let scene, camera, renderer, head, light, controls;

// Länkar till modeller med tydliga plan
const models = {
    standard: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj',
    old: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/leeperryman/head.obj',
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
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 5, 5);
    scene.add(light);

    loadModel('standard');

    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    
    window.addEventListener('resize', onResize);
    animate();
}

function loadModel(type) {
    if (head) scene.remove(head);
    
    const loader = new THREE.OBJLoader();
    const url = models[type] || models.standard;

    loader.load(url, (obj) => {
        head = obj;
        head.scale.set(0.045, 0.045, 0.045);
        head.position.y = -1.5;

        head.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    flatShading: true, // Detta skapar Asaro-effekten
                    roughness: 0.8
                });
            }
        });
        scene.add(head);
    });
}

function updateLight() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 7, h, Math.sin(angle) * 7);
}

function setRembrandt() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 4;
    updateLight();
}

function onResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

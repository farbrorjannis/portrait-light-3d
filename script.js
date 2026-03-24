let scene, camera, renderer, light, controls;
let modelContainer = new THREE.Group(); // En dedikerad behållare för huvudena

const modelUrls = {
    standard: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj',
    male: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/leeperryman/head.obj',
    female: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/ninja/ninjaHead.obj'
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
    scene.add(modelContainer); // Lägg till behållaren i scenen

    // Ljusinställning
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Ladda startmodellen
    changeModel('standard');

    // Event listeners
    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    window.addEventListener('resize', onResize);
    
    animate();
}

function changeModel(type) {
    // 1. TÖM BEHÅLLAREN HELT (Detta gör de stora sajterna)
    while(modelContainer.children.length > 0){ 
        modelContainer.remove(modelContainer.children[0]); 
    }

    // 2. LADDA NY MODELL
    const loader = new OBJLoader();
    loader.load(modelUrls[type], (obj) => {
        // Justera skala och position unikt för varje modell
        if(type === 'male') { obj.scale.set(0.005, 0.005, 0.005); obj.position.y = -0.5; }
        else { obj.scale.set(0.05, 0.05, 0.05); obj.position.y = -1.5; }

        obj.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0xcccccc, 
                    flatShading: true // Viktigt för Asaro-looken
                });
            }
        });
        modelContainer.add(obj);
    });
}

function updateLight() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 8, h, Math.sin(angle) * 8);
}

function resetLighting() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 5;
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

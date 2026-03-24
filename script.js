let scene, camera, renderer, head, light, controls;

// Tre HELT olika länkar för att tvinga fram ett byte
const models = {
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
    
    // Belysning
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    loadModel('standard');

    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    window.addEventListener('resize', onResize);
    
    animate();
}

function loadModel(type) {
    // 1. RENSA SCENEN AGGRESSIVT
    scene.children.forEach(child => {
        if (child.type === "Group" || child.type === "Mesh") {
            scene.remove(child);
        }
    });

    // 2. LADDA NY MODELL MED TIDSSTÄMPEL (förhindrar cache-problem)
    const loader = new THREE.OBJLoader();
    const url = models[type] + "?v=" + Math.random(); 

    loader.load(url, (obj) => {
        head = obj;
        
        // Anpassa storlek/position unikt för varje knapp
        if (type === 'male') {
            head.scale.set(0.005, 0.005, 0.005);
            head.position.y = -0.5;
        } else if (type === 'female') {
            head.scale.set(0.05, 0.05, 0.05);
            head.position.y = -1.5;
        } else {
            head.scale.set(0.05, 0.05, 0.05);
            head.position.y = -1.8;
        }

        head.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0xcccccc, 
                    flatShading: true 
                });
            }
        });
        scene.add(head);
    });
}

function updateLight() {
    const a = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(a) * 8, h, Math.sin(a) * 8);
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

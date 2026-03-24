let scene, camera, renderer, head, light, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Kontroller för att flytta/rotera huvudet med musen
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 5, 5);
    scene.add(light);

    // LADDA RIKTIG MODELL
    const loader = new THREE.OBJLoader();
    // Vi använder Walt Head som är den bästa gratismodellen för ansiktsplan
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj', (obj) => {
        head = obj;
        updateScene(); // Sätt initial skala och rotation
        head.position.y = -1.5;
        
        head.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    flatShading: true, // Detta skapar Asaro-effekten
                    transparent: true,
                    opacity: 0.7
                });
            }
        });
        scene.add(head);
        document.getElementById('loading-overlay').style.display = 'none';
    });

    document.getElementById('lightAngle').addEventListener('input', updateScene);
    document.getElementById('lightHeight').addEventListener('input', updateScene);
    document.getElementById('opacity').addEventListener('input', updateScene);
    document.getElementById('modelScale').addEventListener('input', updateScene);
    window.addEventListener('resize', onResize);
    animate();
}

function updateScene() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 7, h, Math.sin(angle) * 7);

    if (head) {
        const s = document.getElementById('modelScale').value / 1000;
        head.scale.set(s, s, s);
        const opac = document.getElementById('opacity').value / 100;
        head.traverse((child) => { if (child.isMesh) child.material.opacity = opac; });
    }
}

function triggerUpload() { document.getElementById('file-input').click(); }
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        new THREE.TextureLoader().load(event.target.result, (tex) => { scene.background = tex; });
    };
    reader.readAsDataURL(e.target.files[0]);
};

function setRembrandt() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 5;
    updateScene();
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'asaro-study.png';
    link.href = renderer.domElement.toDataURL();
    link.click();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

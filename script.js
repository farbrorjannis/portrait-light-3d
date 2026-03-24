let scene, camera, renderer, head, light, ambientLight;

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 2. Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    // 3. Load Professional Asaro-style Head
    const loader = new THREE.OBJLoader();
    // Vi använder "WaltHead" som är en standardmodell med tydliga plan
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj', 
    (object) => {
        head = object;
        head.scale.set(0.04, 0.04, 0.04);
        head.position.y = -1.5;

        head.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    flatShading: true, // Gör planen tydliga för konstnärer
                    transparent: true,
                    opacity: 0.7
                });
            }
        });
        scene.add(head);
        document.getElementById('loading-overlay').style.display = 'none';
    }, 
    (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
    (error) => { console.error('Error loading model', error); }
    );

    // 4. Input Listeners
    document.getElementById('lightAngle').addEventListener('input', updateScene);
    document.getElementById('lightHeight').addEventListener('input', updateScene);
    document.getElementById('opacity').addEventListener('input', updateScene);
    document.getElementById('headRotation').addEventListener('input', updateScene);
    
    window.addEventListener('resize', onResize);
    animate();
}

function updateScene() {
    // Uppdatera ljus
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 7, h, Math.sin(angle) * 7);

    // Uppdatera huvud
    if (head) {
        const rot = document.getElementById('headRotation').value * (Math.PI / 180);
        head.rotation.y = rot;

        const opac = document.getElementById('opacity').value / 100;
        head.traverse((child) => {
            if (child.isMesh) child.material.opacity = opac;
        });
    }
}

function triggerUpload() { document.getElementById('file-input').click(); }

document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const loader = new THREE.TextureLoader();
        loader.load(event.target.result, (tex) => {
            scene.background = tex;
        });
    };
    reader.readAsDataURL(e.target.files[0]);
};

function setRembrandt() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 5;
    document.getElementById('headRotation').value = 30;
    updateScene();
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'portrait-valorskiss.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();

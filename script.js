let scene, camera, renderer, head, light, controls;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Gör det möjligt att rotera och zooma huvudet med musen/fingret
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Laddar en professionell huvudmodell med tydliga anatomiska plan
    const loader = new THREE.OBJLoader();
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj', (obj) => {
        head = obj;
        head.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    flatShading: true, // Detta tvingar fram "Asaro-looken"
                    transparent: true,
                    opacity: 0.7
                });
            }
        });
        scene.add(head);
        updateScene();
        document.getElementById('loading-overlay').style.display = 'none';
    });

    // Lyssnare för alla reglage
    ['lightAngle', 'lightHeight', 'opacity', 'modelScale'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateScene);
    });

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
        head.traverse(child => { if (child.isMesh) child.material.opacity = opac; });
    }
}

function triggerUpload() { document.getElementById('file-input').click(); }

document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        new THREE.TextureLoader().load(event.target.result, (tex) => {
            scene.background = tex;
        });
    };
    reader.readAsDataURL(e.target.files[0]);
};

function setRembrandt() {
    document.getElementById('lightAngle').value = 45;
    document.getElementById('lightHeight').value = 6;
    updateScene();
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'asaro-studie.png';
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

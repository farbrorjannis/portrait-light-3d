let scene, camera, renderer, head, light, controls;

function init() {
    scene = new THREE.Scene();
    const container = document.getElementById('canvas-container');
    
    // Kamera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Ljus
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Modell
    const loader = new THREE.OBJLoader();
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/obj/walt/WaltHead.obj', (obj) => {
        head = obj;
        head.scale.set(0.045, 0.045, 0.045);
        head.position.y = -1.5;
        head.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    flatShading: true,
                    transparent: true,
                    opacity: 0.8
                });
            }
        });
        scene.add(head);
        
        // KRITISK FIX: Tvingar fram rätt form direkt när modellen laddats
        onResize(); 
    });

    document.getElementById('lightAngle').addEventListener('input', updateScene);
    document.getElementById('lightHeight').addEventListener('input', updateScene);
    document.getElementById('opacity').addEventListener('input', updateScene);
    
    window.addEventListener('resize', onResize);
    animate();
    
    // Tvinga fram rätt storlek igen efter en kort fördröjning
    setTimeout(onResize, 100);
}

function updateScene() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 7, h, Math.sin(angle) * 7);
    if (head) {
        const opac = document.getElementById('opacity').value / 100;
        head.traverse(c => { if (c.isMesh) c.material.opacity = opac; });
    }
}

function onResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
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
    link.download = 'asaro-studie.png';
    link.href = renderer.domElement.toDataURL();
    link.click();
}

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    renderer.render(scene, camera);
}

init();

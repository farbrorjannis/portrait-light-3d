let scene, camera, renderer, head, light, bgMesh;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Belysning
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Skapa ett facetterat huvud (Asaro-stil) med geometri-manipulering
    const geo = new THREE.IcosahedronGeometry(1.5, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if (z > 0.8) { pos.setZ(i, z * 1.3); pos.setY(i, y * 1.1); } // Näsa/ansikte
        if (z < 0) pos.setZ(i, z * 0.5); // Platta till baksidan
    }
    
    const mat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, flatShading: true });
    head = new THREE.Mesh(geo, mat);
    scene.add(head);

    // Setup events
    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    
    window.addEventListener('resize', onResize);
    document.getElementById('loading-overlay').style.display = 'none';
    
    animate();
}

function updateLight() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 5, h, Math.sin(angle) * 5);
}

function triggerUpload() { document.getElementById('file-input').click(); }

document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const loader = new THREE.TextureLoader();
        loader.load(event.target.result, (tex) => {
            scene.background = tex;
            // Justera för att inte sträcka bilden
            const aspect = tex.image.width / tex.image.height;
            scene.background.matrixAutoUpdate = false;
        });
    };
    reader.readAsDataURL(e.target.files[0]);
};

function setRembrandt() {
    document.getElementById('lightAngle').value = 40;
    document.getElementById('lightHeight').value = 4;
    updateLight();
    head.rotation.y = 0.4;
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'portrait-study.png';
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
    renderer.render(scene, camera);
}

init();

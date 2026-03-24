let scene, camera, renderer, head, light;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    // SKAPAR ETT ANSIKTE MED PLAN (ASARO-STIL)
    const geometry = new THREE.ConeGeometry(1.2, 2.5, 6); // Basform för ett avlångt ansikte
    geometry.rotateX(Math.PI); // Vänd rätt
    
    // Vi manipulerar punkterna för att skapa näsa och kinder (Planaritet)
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        // Skjut fram "näsan" i mitten
        if (Math.abs(x) < 0.2 && y > 0) pos.setZ(i, z + 0.6);
        // Tryck in "ögonhålorna"
        if (Math.abs(x) > 0.4 && y > 0.5) pos.setZ(i, z - 0.3);
    }
    
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        flatShading: true, // Detta skapar de skarpa valörerna för målaren
        roughness: 0.8 
    });
    
    head = new THREE.Mesh(geometry, material);
    scene.add(head);

    document.getElementById('lightAngle').addEventListener('input', updateLight);
    document.getElementById('lightHeight').addEventListener('input', updateLight);
    window.addEventListener('resize', onResize);
    animate();
}

function updateLight() {
    const angle = document.getElementById('lightAngle').value * (Math.PI / 180);
    const h = document.getElementById('lightHeight').value;
    light.position.set(Math.cos(angle) * 7, h, Math.sin(angle) * 7);
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
    updateLight();
    head.rotation.y = 0.5;
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'portrait-valorer.png';
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

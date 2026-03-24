import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, head, directionalLight, controls;
let isWireframe = false;

init();

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft base light
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 3. Create a "Plane Head" (Asaro-style simplified)
    const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Low poly for planes
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        flatShading: true, // Crucial for watercolor painters to see planes!
        roughness: 0.8
    });
    head = new THREE.Mesh(geometry, material);
    head.receiveShadow = true;
    head.castShadow = true;
    scene.add(head);

    // 4. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 5. Events
    window.addEventListener('resize', onWindowResize);
    document.getElementById('lightPosX').addEventListener('input', updateLight);
    document.getElementById('lightPosY').addEventListener('input', updateLight);

    // Hide Loading
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1000);

    animate();
}

function updateLight() {
    const x = document.getElementById('lightPosX').value;
    const y = document.getElementById('lightPosY').value;
    directionalLight.position.set(x, y, 5);
}

window.setPreset = (type) => {
    if(type === 'rembrandt') {
        document.getElementById('lightPosX').value = 4;
        document.getElementById('lightPosY').value = 4;
        directionalLight.position.set(4, 4, 5);
        head.rotation.y = 0.5;
    }
};

window.toggleWireframe = () => {
    isWireframe = !isWireframe;
    head.material.wireframe = isWireframe;
    document.getElementById('wireframeBtn').innerText = isWireframe ? "Show Solid" : "Show Planes";
};

window.resetCamera = () => {
    camera.position.set(0, 0, 5);
    head.rotation.set(0, 0, 0);
    controls.reset();
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

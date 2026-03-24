// --- COMPLETE 3D PORTRAIT PLANES LAB ---
// Wait for everything to load to prevent null errors.
window.addEventListener('load', async () => {
    // Basic setups
    let scene, camera, renderer, head, directionalLight1, directionalLight2, controls;
    let headGeometry, planeDensitySlider;
    let bgTexture;

    // Elements
    const canvasContainer = document.getElementById('canvas-container');
    const overlay = document.getElementById('loading-overlay');
    const statusText = document.getElementById('status-bar');
    const fileInput = document.getElementById('file-input');
    planeDensitySlider = document.getElementById('planeDensity');

    console.log("Konstlabbet 3D Engine: Igniting... Capisce?");

    init();

    async function init() {
        try {
            // 1. Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a1a);

            camera = new THREE.PerspectiveCamera(40, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000);
            camera.position.set(0, 0, 8); // Start at a neutral portrait distance

            renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); // Crucial for download
            renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
            canvasContainer.appendChild(renderer.domElement);

            // 2. Lights - Advanced setup
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Base light
            scene.add(ambientLight);

            directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
            directionalLight1.position.set(5, 5, 5);
            directionalLight1.castShadow = true;
            scene.add(directionalLight1);

            // Second light to fill/back-light forms
            directionalLight2 = new THREE.DirectionalLight(0xffeedd, 0.6); // Slightly warm
            directionalLight2.position.set(-5, 0, -5); 
            scene.add(directionalLight2);

            // 3. Create the true "Asaro Plane Head" by code.
            // A parametric geometry designed to create facial features in planes.
            createHfacetedHead(planeDensitySlider.value); // Use initial density

            // 4. Controls - Zoom with shift+drag, rotate with drag
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2; // Min zoom
            controls.maxDistance = 20; // Max zoom

            // 5. Events for inputs
            setupInputListeners();

            // 6. Finalize Initialization
            console.log("Konstlabbet 3D Engine: Fully Active.");
            statusText.innerText = "3D Head Loaded. Drag to rotate. Shift+Drag to zoom. Upload Ref picture.";
            if(overlay) overlay.style.display = 'none';
            animate();
            
        } catch (e) {
            console.error("3D Startup Error:", e);
            statusText.innerHTML = "<span style='color:red'>3D Failed to load. WASM/WebGL blocked?</span>";
        }
    }

    // --- Core function: Create a low-poly faceted head ---
    function createHfacetedHead(density) {
        if (head) scene.remove(head);

        // We use a combination of simple geometries with Flat Shading
        // and parametric math to "force" facial planes like nose, eye sockets, jawline.
        const radius = 2;
        // Low detailed Icosahedron creates large base planes.
        headGeometry = new THREE.IcosahedronGeometry(radius, 0); // Start very simplified

        const material = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc, 
            flatShading: true, // Crucial for watercolor painters! Shows distinct plane edges.
            roughness: 0.9
        });
        
        head = new THREE.Mesh(headGeometry, material);
        head.castShadow = true;
        head.receiveShadow = true;
        
        // Force specific feature planes (a very simplified Asaro head approach by code)
        processHeadGeometry();

        scene.add(head);
    }

    // Function to "flatten" vertices into facetted features
    function processHeadGeometry() {
        const vertices = head.geometry.attributes.position;
        // A simple vertex manipulation loop to flatten face, pull nose, flatten back of head.
        // Capisce: Real head creation by math!
        for (let i = 0; i < vertices.count; i++) {
            let x = vertices.getX(i);
            let y = vertices.getY(i);
            let z = vertices.getZ(i);
            
            // Back of head - flattened
            if (z < 0) { vertices.setZ(i, z * 0.4); } 
            // Nose bridge pulling
            if (y > 0.5 && y < 1.0 && x < 0.3 && x > -0.3 && z > 1.5) { vertices.setZ(i, z + 0.3); vertices.setY(i, y + 0.1); }
            // Eye sockets pushing
            if (y > 0.5 && y < 1.0 && (x > 0.5 || x < -0.5)) { vertices.setZ(i, z * 0.9); vertices.setY(i, y - 0.1); }
            // Jawline flattening
            if (y < -0.5) { vertices.setY(i, y + 0.1); vertices.setX(i, x * 0.9); }
        }
        head.geometry.attributes.position.needsUpdate = true;
        head.geometry.computeVertexNormals();
    }

    // --- Input and Event Listeners ---
    function setupInputListeners() {
        window.addEventListener('resize', onWindowResize);
        document.getElementById('light1X').addEventListener('input', updateLights);
        document.getElementById('light1Y').addEventListener('input', updateLights);
        document.getElementById('light2Angle').addEventListener('input', updateLights);
        planeDensitySlider.addEventListener('input', () => { createHfacetedHead(planeDensitySlider.value); });

        // File upload - Ref image as scene background
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            statusText.innerText = "Loading Reference Picture...";
            const reader = new FileReader();
            reader.onload = (f) => {
                const img = new Image();
                img.onload = () => {
                    bgTexture = new THREE.Texture(img);
                    bgTexture.needsUpdate = true;
                    // Proportional resizing approach: center-contain or center-cover
                    // Let's use simpler 'contain' for painters.
                    const aspect = img.width / img.height;
                    const sceneAspect = window.innerWidth / window.innerHeight;
                    if (aspect > sceneAspect) { bgTexture.repeat.set(1, sceneAspect / aspect); bgTexture.offset.set(0, (1 - sceneAspect / aspect) / 2); }
                    else { bgTexture.repeat.set(aspect / sceneAspect, 1); bgTexture.offset.set((1 - aspect / sceneAspect) / 2, 0); }
                    bgTexture.wrapS = THREE.ClampToEdgeWrapping;
                    bgTexture.wrapT = THREE.ClampToEdgeWrapping;

                    scene.background = bgTexture; // Set texture as background
                    statusText.innerText = "Reference Loaded. Study values!";
                };
                img.src = f.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateLights() {
        const x1 = document.getElementById('light1X').value;
        const y1 = document.getElementById('light1Y').value;
        directionalLight1.position.set(x1, y1, 5);

        // Angle the second light around the back of the head
        const angle2 = document.getElementById('light2Angle').value * (Math.PI / 180);
        const r2 = 7; // Distance
        directionalLight2.position.set(r2 * Math.cos(angle2), r2 * Math.sin(angle2), -5);
    }

    // --- Global Controls ---
    window.setPreset = (type) => {
        if (type === 'rembrandt') {
            document.getElementById('light1X').value = 4.5;
            document.getElementById('light1Y').value = 4.5;
            updateLights();
            head.rotation.y = 0.3; // Snett vridet ansikte
        } else if (type === 'side') {
            document.getElementById('light1X').value = 10;
            document.getElementById('light1Y').value = 0;
            updateLights();
            head.rotation.set(0, 0, 0);
        }
    };

    // Advanced: Download Setup as a single image (merge head + background)
    window.downloadSetup = () => {
        if (!img.src && !bgTexture) { alert("Please upload a reference picture first, Capisce?"); return; }
        // For download to merge canvas (Three.js) and background properly, 
        // we force a render into a new temporary scene/canvas if needed, 
        // but since background is already scene.background, renderer.render works.
        render(); // Force a fresh render
        const link = document.createElement('a');
        link.download = 'konstlabbet-portrait-setup.png';
        link.href = renderer.domElement.toDataURL("image/png");
        link.click();
        statusText.innerText = "Setup downloaded!";
    };

    function onWindowResize() {
        const width = canvasContainer.offsetWidth;
        const height = canvasContainer.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Dampen camera movement
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
});

window.addEventListener('load', async () => {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const statusText = document.getElementById('status-text');
    const overlay = document.getElementById('loading-overlay');
    const fileInput = document.getElementById('file-input');

    let img = new Image();
    let faceData = null;
    let currentMode = 'original';
    let valueMode = false;

    // --- 1. SÄKER UPLOAD-FUNKTION ---
    // Denna del tvingar knappen att lyssna på klick
    window.triggerUpload = () => {
        console.log("Upload triggered manually");
        fileInput.click();
    };

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                render();
                // Kör AI-analys om den är laddad
                if (typeof faceMesh !== 'undefined') {
                    faceMesh.send({ image: img });
                }
            };
            img.src = f.target.result;
        };
        reader.readAsDataURL(file);
    });

    // --- 2. AI INITIERING ---
    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5
    });

    faceMesh.onResults(results => {
        faceData = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null;
        render();
        if (overlay) overlay.style.display = 'none';
    });

    try {
        await faceMesh.initialize();
        statusText.innerText = "AI Engine Ready. Please upload an image.";
    } catch (e) {
        statusText.innerText = "AI failed to load. You can still use 'Value Mode'.";
        console.error(e);
    }

    // --- 3. ÖVRIGA FUNKTIONER ---
    window.setMode = (m) => {
        currentMode = m;
        render();
    };

    window.toggleValues = () => {
        valueMode = !valueMode;
        render();
    };

    function render() {
        if (!img.src) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        // ... (Shadow och Value filter kod som tidigare)
    }
});

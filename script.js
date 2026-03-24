// Vänta tills hela sidan är laddad
window.addEventListener('load', async () => {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const statusText = document.getElementById('status-text') || { innerText: "" };
    const overlay = document.getElementById('loading-overlay');
    const fileInput = document.getElementById('file-input');

    let img = new Image();
    let faceData = null;
    let currentMode = 'original';
    let valueMode = false;

    // 1. Initiera FaceMesh med extra säkerhet
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

    // 2. Kontrollera att fil-inputen faktiskt finns innan vi sätter onchange
    if (fileInput) {
        fileInput.onchange = e => {
            const reader = new FileReader();
            reader.onload = f => {
                img.src = f.target.result;
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    if (overlay) overlay.style.display = 'flex';
                    faceMesh.send({ image: img });
                };
            };
            reader.readAsDataURL(e.target.files[0]);
        };
    }

    // 3. Globala funktioner för knapparna (måste ligga i fönstret)
    window.setMode = (m) => {
        currentMode = m;
        document.querySelectorAll('.mode-buttons button').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById('btn-' + m);
        if (activeBtn) activeBtn.classList.add('active');
        render();
    };

    window.toggleValues = () => {
        valueMode = !valueMode;
        const valBtn = document.getElementById('btn-val');
        if (valBtn) valBtn.innerText = valueMode ? "Values: ON" : "Values: OFF";
        render();
    };

    window.downloadImage = () => {
        const a = document.createElement('a');
        a.download = 'konstlabbet-skiss.png';
        a.href = canvas.toDataURL();
        a.click();
    };

    function render() {
        if (!img.src) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        if (faceData && currentMode !== 'original') {
            apply3DShadow(faceData);
        }
        if (valueMode) applyValueFilter();
    }

    function apply3DShadow(landmarks) {
        const nose = landmarks[1];
        ctx.globalCompositeOperation = 'multiply';
        let grad;
        const w = canvas.width;
        const h = canvas.height;

        if (currentMode === 'side') {
            grad = ctx.createLinearGradient(0, 0, w, 0);
            grad.addColorStop(0.2, 'white');
            grad.addColorStop(0.9, '#333');
        } else if (currentMode === 'rembrandt') {
            grad = ctx.createRadialGradient(nose.x * w - w * 0.15, nose.y * h - h * 0.15, 0, nose.x * w, nose.y * h, w * 1.3);
            grad.addColorStop(0, 'white');
            grad.addColorStop(0.85, '#444');
        } else if (currentMode === 'top') {
            grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'white');
            grad.addColorStop(0.7, '#222');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
    }

    function applyValueFilter() {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            let b = 0.21 * d[i] + 0.72 * d[i + 1] + 0.07 * d[i + 2];
            let v = b < 64 ? 40 : b < 128 ? 110 : b < 192 ? 190 : 255;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    console.log("Konstlabbet AI Engine: Fully Loaded and Ready.");
});

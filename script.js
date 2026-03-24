const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let originalImg = null;
let currentMode = 'original';
let isValueMode = false;
let faceData = null;

// Initiera MediaPipe
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5});
faceMesh.onResults(results => {
    faceData = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null;
    draw();
    document.getElementById('loading-overlay').style.display = 'none';
});

document.getElementById('fileInput').onchange = e => {
    const reader = new FileReader();
    reader.onload = event => {
        originalImg = new Image();
        originalImg.onload = () => {
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            faceMesh.send({image: originalImg});
        };
        originalImg.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

function updateLight(mode) {
    currentMode = mode;
    document.querySelectorAll('.button-group button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    draw();
}

function toggleValues() {
    isValueMode = !isValueMode;
    document.getElementById('val-toggle').innerText = isValueMode ? "Value Mode: ON" : "Value Mode: OFF";
    draw();
}

function draw() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    if (faceData && currentMode !== 'original') {
        apply3DLightEffect(faceData);
    }

    if (isValueMode) {
        applyPosterize();
    }
}

function apply3DLightEffect(landmarks) {
    const w = canvas.width;
    const h = canvas.height;
    
    // Vi använder nästippen som ankare för ljuset
    const nose = landmarks[1];
    let grad;

    ctx.globalCompositeOperation = 'multiply';
    
    if (currentMode === 'side') {
        grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, '#333');
    } else if (currentMode === 'rembrandt') {
        // Rembrandt skapar en vinkel som utgår från näsans position
        grad = ctx.createRadialGradient(nose.x*w - w*0.2, nose.y*h - h*0.2, 0, nose.x*w, nose.y*h, w*1.2);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.8, '#444');
    } else if (currentMode === 'top') {
        grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.7, '#222');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
}

function applyPosterize() {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        let brightness = 0.2126 * d[i] + 0.7152 * d[i+1] + 0.0722 * d[i+2];
        let v = brightness < 64 ? 40 : brightness < 128 ? 110 : brightness < 192 ? 190 : 255;
        d[i] = d[i+1] = d[i+2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'konstlabbet-portrait.png';
    link.href = canvas.toDataURL();
    link.click();
}

document.addEventListener('DOMContentLoaded', () => {
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status-text');
const overlay = document.getElementById('loading-overlay');
let img = new Image();
let currentResults = null;
let currentMode = 'original';
let valueMode = false;

// Initiera AI
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5});
faceMesh.onResults(results => {
    currentResults = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null;
    draw();
    overlay.style.display = 'none';
});

// Vid uppladdning
document.getElementById('file-input').onchange = e => {
    const reader = new FileReader();
    reader.onload = f => {
        img.src = f.target.result;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            statusText.innerText = "Analyzing Face Anatomy...";
            overlay.style.display = 'flex';
            faceMesh.send({image: img});
        };
    };
    reader.readAsDataURL(e.target.files[0]);
};

function setMode(m) {
    currentMode = m;
    document.querySelectorAll('.mode-buttons button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + m).classList.add('active');
    draw();
}

function toggleValues() {
    valueMode = !valueMode;
    document.getElementById('btn-val').innerText = valueMode ? "Values: ON" : "Values: OFF";
    draw();
}

function draw() {
    if (!img.src) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (currentResults && currentMode !== 'original') {
        apply3DShadow(currentResults);
    }

    if (valueMode) applyValueFilter();
}

function apply3DShadow(landmarks) {
    const w = canvas.width;
    const h = canvas.height;
    const nose = landmarks[1]; // Nästippen i 3D

    ctx.globalCompositeOperation = 'multiply';
    let grad;

    if (currentMode === 'side') {
        grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0.2, 'white');
        grad.addColorStop(0.8, '#444');
    } else if (currentMode === 'rembrandt') {
        // Skapar en vinkel som följer näsan snett uppifrån
        grad = ctx.createRadialGradient(nose.x*w - w*0.1, nose.y*h - h*0.2, 0, nose.x*w, nose.y*h, w*1.2);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.8, '#444');
    } else if (currentMode === 'top') {
        grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.6, '#333');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
}

function applyValueFilter() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        let brightness = 0.21 * d[i] + 0.72 * d[i+1] + 0.07 * d[i+2];
        let v = brightness < 64 ? 40 : brightness < 128 ? 110 : brightness < 192 ? 190 : 255;
        d[i] = d[i+1] = d[i+2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
}

function downloadImage() {
    const a = document.createElement('a');
    a.download = 'portrait-sketch.png';
    a.href = canvas.toDataURL();
    a.click();
}
  console.log("Nu är sidan redo och knapparna finns!");
});

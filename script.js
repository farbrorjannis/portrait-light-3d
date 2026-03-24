window.addEventListener('load', async () => {
    const statusText = document.getElementById('status-text');
    const overlay = document.getElementById('loading-overlay');
    
    // Logga framsteg
    console.log("Starting AI initialization...");

    try {
        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                statusText.innerText = `Fetching AI component: ${file}...`;
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5
        });

        // När motorn är faktiskt redo att ta emot data
        faceMesh.onResults(results => {
            // (Din befintliga onResults-logik här)
            if (overlay) overlay.style.display = 'none';
        });

        // Tvinga fram en första check för att se om biblioteket svarar
        await faceMesh.initialize();
        statusText.innerText = "AI Engine Ready. Please upload an image.";
        
        // Vi döljer overlayen först när en bild har laddats upp och analyserats 
        // för att undvika en tom vit skärm innan dess.
        
    } catch (error) {
        console.error("AI Startup failed:", error);
        statusText.innerHTML = "<span style='color:red'>Connection Blocked.</span><br>Check your security settings or VPN.";
    }
});

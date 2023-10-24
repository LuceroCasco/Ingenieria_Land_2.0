async function startQRScanner() {
    const videoElement = document.getElementById('qr-video');
    const qrResultElement = document.getElementById('qr-result');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoElement.srcObject = stream;

        const worker = new Worker('jsQR.js');
        worker.postMessage({ type: 'init' });

        worker.onmessage = (e) => {
            const result = e.data;
            if (result.type === 'decoded') {
                qrResultElement.textContent = `Resultado del escaneo: ${result.data}`;
            }
        };

        const onFrame = async () => {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                worker.postMessage({ type: 'decode', data: imageData }, [imageData.data.buffer]);
            }
            requestAnimationFrame(onFrame);
        };
        requestAnimationFrame(onFrame);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}

startQRScanner();
    document.getElementById("accept-button").addEventListener("click", function() {
        // Aquí puedes colocar el código que deseas ejecutar cuando se hace clic en el botón "Aceptar".
        // Por ejemplo, puedes redirigir al usuario a otra página o realizar alguna otra acción.
        alert("Código QR aceptado");
    });
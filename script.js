async function startQRScanner() {
    const videoElement = document.getElementById('qr-video');
    const qrResultElement = document.getElementById('qr-result');

    try {
        const hasCameraPermission = localStorage.getItem('cameraPermission') === 'granted';
        let stream;

        if (!hasCameraPermission) {
            stream = await requestCameraPermission();
        } else {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        }

        if (stream) {
            videoElement.srcObject = stream;

            const worker = new Worker('jsQR.js');
            worker.postMessage({ type: 'init' });

            worker.onmessage = (e) => {
                const result = e.data;
                if (result.type === 'decoded') {
                    qrResultElement.textContent = `Resultado del escaneo: ${result.data}`;

                    // Redirige al usuario al enlace del código QR (opcional)
                    window.location.href = result.data;
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

                    // Agrega registros para verificar si se capturan los datos de la imagen
                    console.log('Capturando datos de imagen:', imageData);

                    worker.postMessage({ type: 'decode', data: imageData }, [imageData.data.buffer]);
                }
                requestAnimationFrame(onFrame);
            };
            requestAnimationFrame(onFrame);
        }
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}

startQRScanner();


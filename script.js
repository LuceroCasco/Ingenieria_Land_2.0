<!-- Agregar un elemento de video para mostrar la vista de la cámara -->
    <video id="qr-video" width="420" height="240" autoplay></video>
    
    <!-- Agregar un elemento para mostrar el resultado del escaneo -->
    <p id="qr-result"></p>
    
    <!-- Incluir el script de la librería de jsQR para el decodificador QR -->
    <script src="https://cdn.jsdelivr.net/npm/jsqr@2.0.0/dist/jsQR.js"></script>
    
    <script>
        // Función para acceder a la cámara y leer códigos QR
        async function startQRScanner() {
            const videoElement = document.getElementById('qr-video');
            const qrResultElement = document.getElementById('qr-result');
            
            try {
                // Acceder a la cámara del dispositivo
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = stream;
                
                // Crear un bucle para capturar los fotogramas de video y buscar códigos QR
                const qrWorker = new Worker("jsQR.js");
                qrWorker.postMessage({ type: "init", data: {} });
                
                const onFrame = () => {
                    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        
                        qrWorker.postMessage({ type: "decode", data: imageData });
                    }
                    requestAnimationFrame(onFrame);
                };
                requestAnimationFrame(onFrame);
                
                qrWorker.onmessage = (e) => {
                    const result = e.data;
                    if (result.type === "decoded") {
                        qrResultElement.textContent = `Resultado del escaneo: ${result.data}`;
                    }
                };
            } catch (error) {
                console.error('Error al acceder a la cámara:', error);
            }
        }
        
        // Iniciar el escáner al cargar la página
        startQRScanner();
    </script>
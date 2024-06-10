document.addEventListener('DOMContentLoaded', () => {
    const imageButton = document.getElementById('imageButton');
    const videoButton = document.getElementById('videoButton');
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const detectedImage = document.getElementById('detectedImage');
    const resultsChart = document.getElementById('resultsChart').getContext('2d');

    let model;
    let chart;

    async function loadModel() {
        model = await cocoSsd.load();
        console.log('Model loaded');
    }

    async function detectImage(image) {
        const predictions = await model.detect(image);
        displayDetections(predictions, image);
        updateChart(predictions);
    }

    function displayDetections(predictions, image) {
        const ctx = detectedImage.getContext('2d');
        detectedImage.width = image.width;
        detectedImage.height = image.height;
        ctx.drawImage(image, 0, 0);

        predictions.forEach(prediction => {
            ctx.beginPath();
            ctx.rect(...prediction.bbox);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'red';
            ctx.stroke();
            ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
        });
    }

    function updateChart(predictions) {
        const labels = [];
        const data = [];

        predictions.forEach(prediction => {
            const className = prediction.class;
            const index = labels.indexOf(className);
            if (index === -1) {
                labels.push(className);
                data.push(1);
            } else {
                data[index]++;
            }
        });

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(resultsChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Detections',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    imageButton.addEventListener('click', () => {
        imageUpload.click();
    });

    videoButton.addEventListener('click', () => {
        videoUpload.click();
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.onload = () => detectImage(uploadedImage);
            };
            reader.readAsDataURL(file);
        }
    });

    videoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.onloadeddata = () => detectImage(video);
                document.body.appendChild(video);
            };
            reader.readAsDataURL(file);
        }
    });

    loadModel();
});

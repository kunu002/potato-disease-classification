// Get DOM elements
const testBtn = document.getElementById('test-btn');
const landingPage = document.getElementById('landing-page');
const testPage = document.getElementById('test-page');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const resultText = document.getElementById('result-text');
const percentageContainer = document.getElementById('percentage-container');

// Show test page on button click
testBtn.addEventListener('click', () => {
  landingPage.classList.add('hidden');
  testPage.classList.remove('hidden');
});

// Load image preview
function loadImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    previewImage.src = reader.result;
    // Call the prediction function
    predictFromImage(file);
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

// Make prediction from the uploaded image
function predictFromImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  fetch('/', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(prediction => {
    updatePredictionResult(prediction);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Update the prediction result
function updatePredictionResult(prediction) {
  const percentages = [
    { label: 'EARLY BLIGHT', value: prediction.prediction_probabilities.Early_blight, className: 'early-blight' },
    { label: 'LATE BLIGHT', value: prediction.prediction_probabilities.Late_blight, className: 'late-blight' },
    { label: 'HEALTHY', value: prediction.prediction_probabilities.Healthy, className: 'healthy' }
  ];

  const maxPercentage = Math.max(...Object.values(prediction.prediction_probabilities));
  const maxClass = Object.keys(prediction.prediction_probabilities).find(key => prediction.prediction_probabilities[key] === maxPercentage);

  resultText.textContent = `RESULT: ${maxClass.toUpperCase().replace('_', ' ')}`;
  percentageContainer.innerHTML = '';

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');

  const img = document.createElement('img');
  img.src = `data:image/png;base64,${prediction.image_data}`;
  imageContainer.appendChild(img);

  percentageContainer.appendChild(imageContainer);

  percentages.forEach(data => {
    const div = document.createElement('div');
    div.classList.add('percentage-bar');

    const label = document.createElement('span');
    label.textContent = data.label;
    div.appendChild(label);

    const bar = document.createElement('div');
    bar.classList.add('bar', data.className);
    bar.style.width = `${data.value * 100}%`;

    const percentage = document.createElement('span');
    percentage.textContent = `${data.value.toFixed(2)}`;
    bar.appendChild(percentage);

    div.appendChild(bar);
    percentageContainer.appendChild(div);
  });
}

// Event listener for image input
imageInput.addEventListener('change', loadImage);
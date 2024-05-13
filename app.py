from flask import Flask, jsonify, request, render_template
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import io
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = Flask(__name__)

# Load the pre-trained model
model = load_model('model_v1.h5')

def prediction(img):
    class_names = ['Early_blight', 'Healthy', 'Late_blight']
    img_height, img_width = 128, 128
    my_image = image.load_img(img, target_size=(img_height, img_width))
    my_image = image.img_to_array(my_image)
    my_image = np.expand_dims(my_image, 0)
    predictions = model.predict(my_image)[0]
    predictions_sum = sum(predictions)
    out = {
        'Early_blight': round(predictions[0] / predictions_sum * 100, 2),
        'Healthy': round(predictions[1] / predictions_sum * 100, 2),
        'Late_blight': round(predictions[2] / predictions_sum * 100, 2)
    }

    fig, ax = plt.subplots(figsize=(9, 6))
    ax.set_facecolor('#f0f0f0')
    ax.bar(class_names, out.values(), color=['#ff7f50', '#98fb98', '#add8e6'], edgecolor='#8b0000', linewidth=2)
    ax.set_xticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=0, fontweight='bold', fontsize=14, color='#333333')
    ax.set_yticks([])
    ax.set_title('Prediction Probabilities', fontweight='bold', fontsize=16, color='#333333', pad=20)

    for index, value in enumerate(out.values()):
        ax.text(index, value + 2, f"{value:.2f}%", ha='center', fontweight='bold', color='#333333')

    buf = BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', pad_inches=1.0)
    buf.seek(0)

    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    plt.close(fig)
    buf.close()

    return image_base64, out

@app.route('/', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        file = request.files['file']
        file_bytes = file.read()
        file_stream = io.BytesIO(file_bytes)

        image_base64, prediction_probabilities = prediction(file_stream)

        return jsonify({
            'image_data': image_base64,
            'prediction_probabilities': prediction_probabilities
        })
    else:
        return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
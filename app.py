from flask import Flask, render_template,send_from_directory
from flask_socketio import SocketIO
import base64
from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import json
from simple_facerec import SimpleFacerec
from flask_cors import CORS, cross_origin
import random
from datetime import datetime, timedelta
import numpy as np
import face_recognition
import time
import pytz

from tensorflow.keras.models import model_from_json  
from tensorflow.keras.preprocessing import image
import cv2

#app = Flask(__name__)
app = Flask(__name__, static_folder='frontend/build/static', template_folder='frontend/build')
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)
#socketio = SocketIO(cors)
socketio = SocketIO(app, cors_allowed_origins="*")
#socketio = SocketIO(app)


# Load the YOLO model
yolo_model = YOLO('yolov8n.pt')  # YOLOv8n is the smallest version, you can choose another model

#load emotional recognition model  
resnet_model = model_from_json(open('InceptResNet_IG_multi_v3.json', 'r', encoding='utf-8').read())

#load weights  
resnet_model.load_weights('InceptResNet_IG_multi_v3.weights.h5')


sfr = SimpleFacerec()
sfr.load_encoding_images("images/")
pain_data = [];
emotion_daily_data=[];
frame_sequence = [];
max_sequence_length = 3 

singapore_tz = pytz.timezone('Asia/Singapore')  

# Serve the index.html file from the templates folder
@app.route('/')
@cross_origin()
def index():
    return render_template('index.html')


@app.route('/pie_data')
@cross_origin()
def pie_data():
    if(len(emotion_daily_data)>6):
        emotion_daily_data.pop(0);
    
    emotion_daily_data.append(random.randint(1, 3)) 

    # for _ in range(10):
    #     value.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value2.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value3.append(random.randint(1, 10))  # Random numbers between 1 and 10
    
    labels = ['happy', 'sad', 'angry', 'panic', 'scare', 'normal']
    return json.dumps({'status': 'success', "labels": labels,  "data" : emotion_daily_data })


@app.route('/data')
@cross_origin()
def data():
    value = [];
    value2 = [];
    value3 = [];
    if(len(pain_data)>20):
        pain_data.pop(0);
    
    pain_data.append(random.randint(0, 3)) 

    # for _ in range(10):
    #     value.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value2.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value3.append(random.randint(1, 10))  # Random numbers between 1 and 10
    
    start_time = datetime.now()

    # Generate timestamps for the next 10 minutes with a 1-minute interval
    timestamps = [start_time + timedelta(minutes=i) for i in range(20)]
    timestamp_strings = [timestamp.isoformat() for timestamp in timestamps]



    return json.dumps({'status': 'success', "timestamps" : timestamp_strings, 'values': pain_data, "values2": value2, "values3" : value3 })


@app.route('/static/<path:path>')
@cross_origin()
def send_static(path):
    return send_from_directory(app.static_folder, path)

# Handle WebSocket connections
@socketio.on('video_frame')
@cross_origin()
def handle_video_frame(message):
    data = json.loads(message)
    image_data = data['image']
    client_timestamp = data['timestamp']

    # Get server-side timestamp (current time)
    server_timestamp = int(time.time() * 1000)  # Milliseconds

    # If the timestamp difference is more than 1 second, skip processing
    if server_timestamp - client_timestamp > 200:
        print("Skipping frame due to timestamp difference > 0.5 second")
        return ''
    
    # Save the Base64-encoded image to a file
    img_data = image_data.split(",")[1]  # Remove data URL prefix
    img_bytes = base64.b64decode(img_data)
    frame_image = Image.open(BytesIO(img_bytes))
    #print(f"Image size: {frame_image.size}")
    #frame_image_cv = np.asarray(frame_image)
    detections = []
    

    # start_time = time.time()
    # results = model.predict(frame_image)  # Run YOLO inference
    # elapsed_time = time.time() - start_time
    # print(f"model.predict( call took {elapsed_time:.2f} seconds")

    #start_time = time.time()
    
    frame_image_cv = np.asarray(frame_image)
    gray_img = cv2.cvtColor(frame_image_cv, cv2.COLOR_BGR2GRAY)    
    gray_img = np.stack((gray_img,) * 3, axis=-1)
    face_locations = face_recognition.face_locations(frame_image_cv)
    for (top, right, bottom, left) in face_locations:
        bbox = (left, top, right, bottom )
        y1, x2, y2, x1 = top, right, bottom, left
        roi_gray=gray_img[y1:y2, x1:x2] 
        roi_gray=cv2.resize(roi_gray,(75,75)) 
        img_pixels = image.img_to_array(roi_gray)   # Converts the image to a numpy array suitable for Keras model. 
        img_pixels /= 255  
        frame_sequence.append(img_pixels)
        print("frame_sequence:", len(frame_sequence),"max_sequence_length" , max_sequence_length )
        if len(frame_sequence) > max_sequence_length:
            frame_sequence.pop(0)
            sequence_input = np.expand_dims(np.array(frame_sequence), axis=0)
            predictions = resnet_model.predict(sequence_input)     
            emotion_predictions = predictions[0]   
            pain_predictions = predictions[1]  
            #print("emotion", emotion_predictions,"pain_predictions" ,pain_predictions)
            max_index_emotion = np.argmax(emotion_predictions[0])
            max_index_pain = np.argmax(pain_predictions[0])
            Emotion_percent = emotion_predictions[0][max_index_emotion] * 100
            Pain_percent = pain_predictions[0][max_index_pain] * 100
            emotions = ["Anger", "Fear", "Happy", "Neutral", "Sadness", "Surprise", "Disgust", "Contempt"]
            pain_label = ["No Pain", "Pain", "Very Pain"]
            current_time = datetime.now(singapore_tz)
            formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S')

            predicted_emotion = emotions[max_index_emotion]
            print(f'Emotion prediction:, {formatted_time} {predicted_emotion} {Emotion_percent:.2f}%')

            predicted_pain = pain_label[max_index_pain]
            print(f'Pain prediction:, {formatted_time} {predicted_pain} {Pain_percent:.2f}%')
            detections.append({
                'bbox': bbox,
                'predicted_emotion' : predicted_emotion,
                'predicted_pain' : predicted_pain,
                "Emotion_percent" : Emotion_percent,
                "Pain_percent" : Pain_percent,
                'confidence': 'NA',
                'class': 0  # Convert class index to integer
            })
            

        #pil_image = Image.fromarray(frame_image_cv)
        #cropped_image = pil_image.crop((left, top, right, bottom))
        #cropped_image=cv2.resize(cropped_image,(75,75)) 
        #img_pixels = image.img_to_array(cropped_image)   # Converts the image to a numpy array suitable for Keras model. 
        #img_pixels /= 255  

        
    
        #cropped_image.save('frame.jpeg')
        

    #elapsed_time = time.time() - start_time
    #print(f"face_recognition call took {elapsed_time:.2f} seconds")

    # Process YOLO results
    # for detection in results[0].boxes:
    #     bbox = detection.xyxy[0].tolist()  # Bounding box coordinates (x1, y1, x2, y2)
    #     conf = detection.conf.item()       # Confidence score
    #     cls = detection.cls.item()         # Class label
    #     detections.append({
    #         'bbox': bbox,
    #         'confidence': conf,
    #         'class': int(cls)  # Convert class index to integer
    #     })
    # Return the detections as a JSON response
    # return jsonify({'status': 'success', 'detections': detections})
    # with open("frame.jpeg", "wb") as f:
    #     f.write(base64.b64decode(img_data))
    socketio.emit('processed_frame', json.dumps({'status': 'success', 'detections': detections}))
    #socketio.send(jsonify({'status': 'success', 'detections': detections}))
    return ''

# Run the Flask server with WebSocket support
if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)

# import eventlet
# eventlet.monkey_patch()  # This must be called before other imports
from flask import Flask, render_template,send_from_directory, jsonify, request
from flask_socketio import SocketIO
import base64
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
import os
from database import EmotionRecord, ProfileRecord, Database, Session
from collections import defaultdict

db = Database()

# Get the value of an environment variable
mode = os.getenv('MODE', "CUSTOM")

from tensorflow.keras.models import model_from_json   # type: ignore
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import cv2


#app = Flask(__name__)
app = Flask(__name__, static_folder='frontend/build/static', template_folder='frontend/build')
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
MODEL_DIR = os.getenv('MODEL_DIR', 'models')
emotions = ["Anger", "Fear", "Happy", "Neutral", "Sadness", "Surprise", "Disgust", "Contempt"]

models_dict = {}
resnet_model = None
def load_models_from_directory():
    global models_dict
    # Loop over the files in the directory
    for filename in os.listdir(MODEL_DIR):
        file_path = os.path.join(MODEL_DIR, filename)
        
        # Check if the file is a .keras model
        if filename.endswith('.keras'):
            model_name = os.path.splitext(filename)[0]
            models_dict[model_name] = load_model(file_path)
            print(f"Loaded .keras model: {model_name}")

        # Check if the file is a .json model
        elif filename.endswith('.json'):
            model_name = os.path.splitext(filename)[0]
            with open(file_path, 'r') as json_file:
                json_model = json_file.read()
                model = model_from_json(json_model)
                # Load weights if available
                weight_file = os.path.join(MODEL_DIR, f'{model_name}.h5')
                if os.path.exists(weight_file):
                    model.load_weights(weight_file)
                models_dict[model_name] = model
                print(f"Loaded .json model: {model_name}")

# API to get the list of models
@app.route('/api/models', methods=['GET'])
def get_models():
    model_list = list(models_dict.keys())
    return jsonify(model_list)


    

# Load the YOLO model
#yolo_model = YOLO('yolov8n.pt')  # YOLOv8n is the smallest version, you can choose another model
yolo_model = "YOLO"
if(mode == "YOLO"):
    from ultralytics import YOLO
    yolo_model = YOLO('yolov8n-face.pt')  # YOLOv8n is the smallest version, you can choose another model



sfr = None
# model_json = 'InceptResNet_IG_multi_v3.json'
# model_h5 = 'InceptResNet_IG_multi_v3.weights.h5'
    
# if(mode == "CUSTOM"):
#     #load emotional recognition model  
#     resnet_model = model_from_json(open(model_json, 'r', encoding='utf-8').read())

#     # #load weights  
#     resnet_model.load_weights(model_h5)
#     # Load the model from the .keras file
#     #resnet_model = load_model('InceptResNet_IG_multi_v2.14.keras')



sfr = SimpleFacerec()
sfr.load_encoding_images("images/")
pain_data = defaultdict(list);
pain_timestamp = defaultdict(list);
emotion_bar_data = defaultdict(list);
emotion_daily_data=[];
frame_sequence = [];
max_sequence_length = 3 

singapore_tz = pytz.timezone('Asia/Singapore')  
last_insert_time = datetime.now(singapore_tz)

# Serve the index.html file from the templates folder
@app.route('/')
@cross_origin()
def index():
    return render_template('index.html')


@app.route('/bar_data/<string:uuid>')
@cross_origin()
def bar_data(uuid):
    return json.dumps({'status': 'success',  "data" : emotion_bar_data[uuid] })


@app.route('/attention')
@cross_origin()
def attention():
    count = db.countAttention()
    return json.dumps({'status': 'success',  "data" : count })


@app.route('/pie_data/<string:id>')
@cross_origin()
def pie_data(id):
    # if(len(emotion_daily_data)>6):
    #     emotion_daily_data.pop(0);
    
    # emotion_daily_data.append(random.randint(1, 3)) 
    result = db.findPieData(id)
    emotions = [row[0] for row in result]
    emotion_daily_data = [row[1] for row in result]
    # for _ in range(10):
    #     value.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value2.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value3.append(random.randint(1, 10))  # Random numbers between 1 and 10
    
    return json.dumps({'status': 'success', "labels": emotions,  "data" : emotion_daily_data })
    


@app.route('/data/<string:uuid>')
@cross_origin()
def data(uuid):
    # value = [];
    # value2 = [];
    # value3 = [];
    # if(len(pain_data)>20):
    #     pain_data.pop(0);
    
    # pain_data.append(random.randint(0, 3)) 

    # for _ in range(10):
    #     value.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value2.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value3.append(random.randint(1, 10))  # Random numbers between 1 and 10
    
    # start_time = datetime.now()

    # # Generate timestamps for the next 10 minutes with a 1-minute interval
    #timestamps = [start_time + timedelta(minutes=i) for i in range(20)]
    timestamp_strings = [timestamp.isoformat() for timestamp in pain_timestamp[uuid]]

    #print('timestamp_strings', timestamp_strings)

    #print('pain_data', pain_data)

    return json.dumps({'status': 'success', "timestamps" : timestamp_strings, 'values': pain_data[uuid] })


@app.route('/static/<path:path>')
@cross_origin()
def send_static(path):
    return send_from_directory(app.static_folder, path)

# Handle WebSocket connections
@socketio.on('video_frame')
@cross_origin()
def handle_video_frame(message):
    global last_insert_time
    global pain_data
    current_time = datetime.now(singapore_tz)

    data = json.loads(message)
    uuid = data['uuid']
    image_data = data['image']
    client_timestamp = data['timestamp']
    selected_model = data['selected_model']

    # Get server-side timestamp (current time)
    server_timestamp = int(time.time() * 1000)  # Milliseconds

    # If the timestamp difference is more than 1 second, skip processing
    if server_timestamp - client_timestamp > 2000:
        print("Skipping frame due to timestamp difference > 2 second")
        return ''
    
    # Save the Base64-encoded image to a file
    img_data = image_data.split(",")[1]  # Remove data URL prefix
    img_bytes = base64.b64decode(img_data)
    frame_image = Image.open(BytesIO(img_bytes))
    #print(f"Image size: {frame_image.size}")
    #frame_image_cv = np.asarray(frame_image)
    detections = []
    

    if(mode == "YOLO"):
        start_time = time.time()
        results = yolo_model.predict(frame_image)  # Run YOLO inference
        elapsed_time = time.time() - start_time
        print(f"model.predict( call took {elapsed_time:.2f} seconds")
        for detection in results[0].boxes:
            bbox = detection.xyxy[0].tolist()  # Bounding box coordinates (x1, y1, x2, y2)
            conf = detection.conf.item()       # Confidence score
            cls = detection.cls.item()         # Class label
            detections.append({
                'bbox': bbox,
                'confidence': conf,
                'class': int(cls)  # Convert class index to integer
            })
        # Return the detections as a JSON response
        # return jsonify({'status': 'success', 'detections': detections})
        # with open("frame.jpeg", "wb") as f:
        #     f.write(base64.b64decode(img_data))
    else:
        frame_image_cv = np.asarray(frame_image)
        gray_img = cv2.cvtColor(frame_image_cv, cv2.COLOR_BGR2GRAY)    
        gray_img = np.stack((gray_img,) * 3, axis=-1)
        start_time = time.time()
        
        #face_locations = face_recognition.face_locations(frame_image_cv)
        #print('face_recognition' , face_locations)

        face_locations, name = sfr.detect_known_faces(frame_image_cv)
        print('name' , name)

        elapsed_time = time.time() - start_time
        print(f"detect_known_faces .predict( call took {elapsed_time:.2f} seconds")
        for (top, right, bottom, left),pname in zip(face_locations, name):
            bbox = (left, top, right, bottom )
            y1, x2, y2, x1 = top, right, bottom, left
            roi_gray=gray_img[y1:y2, x1:x2] 
            roi_gray=cv2.resize(roi_gray,(75,75)) 
            img_pixels = image.img_to_array(roi_gray)   # Converts the image to a numpy array suitable for Keras model. 
            img_pixels /= 255  
            frame_sequence.append(img_pixels)
            #print("frame_sequence:", len(frame_sequence),"max_sequence_length" , max_sequence_length )
            if len(frame_sequence) > max_sequence_length:
                frame_sequence.pop(0)
                sequence_input = np.expand_dims(np.array(frame_sequence), axis=0)

                if(len(models_dict.keys())>0):
                    print('selected_model : ', selected_model)
                    if(selected_model=='default' or selected_model==''):
                        first_model_name = list(models_dict.keys())[0]
                        resnet_model = models_dict[first_model_name]
                        print(f"Resnet model: {first_model_name}")
                    else: 
                        if selected_model in models_dict.keys():
                            resnet_model = models_dict[selected_model]
                            print(f"Resnet model: {selected_model}")
                        else:
                            first_model_name = list(models_dict.keys())[0]
                            resnet_model = models_dict[first_model_name]
                            print(f"Resnet model: {first_model_name}")
                else:
                    print('No model found, please copy your model into models folder')
                    return ''

                predictions = resnet_model.predict(sequence_input)     
                emotion_predictions = predictions[0]   
                pain_predictions = predictions[1]  
                #print("emotion", emotion_predictions,"pain_predictions" ,pain_predictions)
                max_index_emotion = np.argmax(emotion_predictions[0])
                max_index_pain = np.argmax(pain_predictions[0])
                Emotion_percent = emotion_predictions[0][max_index_emotion] * 100
                Pain_percent = pain_predictions[0][max_index_pain] * 100
                #emotions = ["Anger", "Fear", "Happy", "Neutral", "Sadness", "Surprise", "Disgust", "Contempt"]
                pain_label = ["No Pain", "Pain", "Very Pain"]
                current_time = datetime.now(singapore_tz)
                formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S')

                predicted_emotion = emotions[max_index_emotion]
                print(f'Emotion prediction:, {formatted_time} {predicted_emotion} {Emotion_percent:.2f}%')

                predicted_pain = pain_label[max_index_pain]
                print(f'Pain prediction:, {formatted_time} {predicted_pain} {Pain_percent:.2f}%')
                #print('pname' , pname)
                detections.append({
                    'bbox': bbox,
                    'name' : pname,
                    'predicted_emotion' : predicted_emotion,
                    'predicted_pain' : predicted_pain,
                    "Emotion_percent" : Emotion_percent,
                    "Pain_percent" : Pain_percent,
                    'confidence': 'NA',
                    'class': 0  # Convert class index to integer
                })

                #sampling rate 2 sec
                if (current_time - last_insert_time).total_seconds() >= 2:
                    if(len(emotion_bar_data[uuid])>10):
                        emotion_bar_data[uuid].pop(0)
                    emotion_bar_data[uuid].append({
                        'predicted_emotion' : predicted_emotion,
                        'predicted_pain' : predicted_pain,
                        'timestamp' : client_timestamp
                    })
                    last_insert_time = current_time
                    if(len(pain_data[uuid])>20):
                        pain_data[uuid].pop(0);
                        pain_timestamp[uuid].pop(0)
                    pain_timestamp[uuid].append(current_time)
                    pain_data[uuid].append(int(max_index_pain)) 
                    emotion_record = EmotionRecord(emotion_detected=predicted_emotion,userid=pname,pain_level=int(max_index_pain)) # Insert emotion into the database
                    db.save(emotion_record)   
                    #pain_record = PainRecord(pain_level=predicted_pain,userid=pname) # Insert pain into the datebase
                    #db.save(pain_record)
                    db.commit()



            #pil_image = Image.fromarray(frame_image_cv)
            #cropped_image = pil_image.crop((left, top, right, bottom))
            #cropped_image=cv2.resize(cropped_image,(75,75)) 
            #img_pixels = image.img_to_array(cropped_image)   # Converts the image to a numpy array suitable for Keras model. 
            #img_pixels /= 255  

            
        
            #cropped_image.save('frame.jpeg')
            

        #elapsed_time = time.time() - start_time
        #print(f"face_recognition call took {elapsed_time:.2f} seconds")

        
    socketio.emit('processed_frame', json.dumps({'uuid': uuid,'status': 'success', 'detections': detections}))
    #socketio.send(jsonify({'status': 'success', 'detections': detections}))
    return ''


@app.route('/profiles', methods=['GET'])
@cross_origin()
def get_profiles():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    search = request.args.get('search', '', type=str)
    
    session = Session()
    
    try:
        query = session.query(ProfileRecord)
        if search:
            query = query.filter(ProfileRecord.name.ilike(f'%{search}%'))
        profiles = query.offset((page - 1) * per_page).limit(per_page).all()
        total = session.query(ProfileRecord).count()

        return jsonify({
            'profiles': [{'id': profile.id, 'name': profile.name, 'email': profile.email} for profile in profiles],
            'total': total,
            'pages': (total // per_page) + (1 if total % per_page > 0 else 0),
            'current_page': page
        })
    finally:
        session.close()

@app.route('/profiles', methods=['POST'])
@cross_origin()
def create_profile():
    data = request.get_json()
    session = Session()

    try:
        new_profile = ProfileRecord(name=data['name'], email=data['email'])
        session.add(new_profile)
        session.commit()
        return jsonify({'message': 'Profile created!'})
    finally:
        session.close()


@app.route('/profiles/<int:id>', methods=['PUT'])
@cross_origin()
def update_profile(id):
    data = request.get_json()
    session = Session()

    try:
        profile = session.query(ProfileRecord).filter(ProfileRecord.id == id).first()
        if not profile:
            return jsonify({'message': 'Profile not found'}), 404

        profile.name = data['name']
        profile.email = data['email']
        session.commit()
        return jsonify({'message': 'Profile updated!'})
    finally:
        session.close()

# Delete a profile
@app.route('/profiles/<int:id>', methods=['DELETE'])
@cross_origin()
def delete_profile(id):
    profile = ProfileRecord.query.get_or_404(id)
    session = Session()

    try:
        profile = session.query(ProfileRecord).filter(ProfileRecord.id == id).first()
        if not profile:
            return jsonify({'message': 'Profile not found'}), 404

        session.delete(profile)
        session.commit()
        return jsonify({'message': 'Profile deleted!'})
    finally:
        session.close()

# Run the Flask server with WebSocket support
if __name__ == "__main__":

    #Load models from models folder
    load_models_from_directory()

    #Development
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
    #Production
    # sio = socketio.server(async_mode="gevent_uwsgi", cors_allowed_origins='*', engineio_logger=True)
    # app = Flask(__name__)

    # # this generates the uwsgi-runnable application

    # my_wsgi = socketio.WSGIApp(sio)
    # app = socketio.Middleware(sio, my_wsgi)
    # http_server = WSGIServer(('', 8080), app)
    # http_server.serve_forever()

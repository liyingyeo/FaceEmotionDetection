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

#app = Flask(__name__)
app = Flask(__name__, static_folder='frontend/build/static', template_folder='frontend/build')
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)
#socketio = SocketIO(cors)
socketio = SocketIO(app, cors_allowed_origins="*")
#socketio = SocketIO(app)


# Load the YOLO model
model = YOLO('yolov8n.pt')  # YOLOv8n is the smallest version, you can choose another model
sfr = SimpleFacerec()
sfr.load_encoding_images("images/")
pain_data = [];

# Serve the index.html file from the templates folder
@app.route('/')
@cross_origin()
def index():
    return render_template('index.html')

@app.route('/data')
@cross_origin()
def data():
    value = [];
    value2 = [];
    value3 = [];
    if(len(pain_data)>10):
        pain_data.pop(0);
    
    pain_data.append(random.randint(1, 3)) 

    # for _ in range(10):
    #     value.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value2.append(random.randint(1, 10))  # Random numbers between 1 and 10
        #value3.append(random.randint(1, 10))  # Random numbers between 1 and 10
    
    start_time = datetime.now()

    # Generate timestamps for the next 10 minutes with a 1-minute interval
    timestamps = [start_time + timedelta(minutes=i) for i in range(10)]
    timestamp_strings = [timestamp.isoformat() for timestamp in timestamps]



    return json.dumps({'status': 'success', "timestamps" : timestamp_strings, 'values': pain_data, "values2": value2, "values3" : value3 })


@app.route('/static/<path:path>')
@cross_origin()
def send_static(path):
    return send_from_directory(app.static_folder, path)

# Handle WebSocket connections
@socketio.on('video_frame')
@cross_origin()
def handle_video_frame(data):
    print("Received frame from client")

    # Save the Base64-encoded image to a file
    img_data = data.split(",")[1]  # Remove data URL prefix
    img_bytes = base64.b64decode(img_data)
    frame_image = Image.open(BytesIO(img_bytes))
    #print(f"Image size: {frame_image.size}")
    results = model.predict(frame_image)  # Run YOLO inference
    # Process YOLO results
    detections = []
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
    socketio.emit('processed_frame', json.dumps({'status': 'success', 'detections': detections}))
    #socketio.send(jsonify({'status': 'success', 'detections': detections}))
    return ''

# Run the Flask server with WebSocket support
if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)

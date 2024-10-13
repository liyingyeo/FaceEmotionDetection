

Folder structure
- frontend - contains react project for web UI 
- images - contains named picture for registered person
.
├── README.md
├── __pycache__
├── app.py
├── frontend
├── images
├── node_modules
├── requirements.txt
├── simple_facerec.py
├── static
├── templates_old
└── yolov8n.pt


Developing Frontend
```
npm start
```

Publish Frontend
```
cd frontend

npm run build
```


Building the Docker Image
```
docker build --platform linux/amd64 -t quay.io/kahlai/emotion_detection:latest .
```
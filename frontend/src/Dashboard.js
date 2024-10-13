import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import Button from 'react-bootstrap/Button';
import io from 'socket.io-client';
import EmotionBar from './EmotionBar.js';
import PainGraph from './PainGraph.js';

export default function Dashboard() {
    // const Dashboard = () => {
    
    const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  //const buttonRef = useRef(null);
  const [startSend, setStartSend] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Click Me');
  const [isOnline, setOnline] = useState(false);
  const socket = io.connect('http://localhost:8080'); // Adjust to your Flask server's URL


  const handleClick = () => {
    if (startSend) {
      console.log("startSend" + startSend);
      setStartSend(false);
      setButtonText("Start");
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Clear previous detections
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStreaming(false);
    } else {
      console.log("startSend" + startSend);
      setStartSend(true);
      setButtonText("Stop");
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Clear previous detections
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStreaming(true);
    }

  };

  //var startSend = false;
  const classes = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light']; // Example YOLO classes
// Function to start video streaming
const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      //videoRef.current.play();
      setStreaming(true);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  function drawDetections(detections) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Clear previous detections
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current video frame
    //ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    detections.forEach(detection => {
      const bbox = detection.bbox; // [x1, y1, x2, y2]
      const confidence = detection.confidence;
      const classIndex = detection.class;

      // Draw bounding box
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
      ctx.stroke();

      // Draw label (class name + confidence)
      const label = `${classes[classIndex]} (${(confidence * 100).toFixed(2)}%)`;
      ctx.fillStyle = 'red';
      ctx.font = '14px Arial';
      ctx.fillText(label, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
    });
  }

  useLayoutEffect(() => {
    // Check that the ref is properly set
    if (canvasRef.current) {
      // Do whatever you need with it
      console.log(canvasRef.current);
    }
  }, []);

  useEffect(() => {


    startVideoStream();


    const sendVideoFrame = setInterval(() => {
      if (streaming) {
        if (startSend) {
          const canvas2 = canvasRef2.current;
          const ctx = canvas2.getContext('2d');

          // Set canvas size
          canvas2.width = 640;
          canvas2.height = 480;

          // Draw video frame on canvas
          ctx.drawImage(videoRef.current, 0, 0, canvas2.width, canvas2.height);

          // Convert canvas to Base64-encoded string
          const frameBase64 = canvas2.toDataURL('image/jpeg');

          // Send Base64-encoded frame over WebSocket
          socket.emit('video_frame', frameBase64);
        }
      }
    }, 100); // Send every 1 second (100 ms)

    socket.on('connect', () => {
      console.log("WebSocket connection established");
      setIsDisabled(false);
      setOnline(true);
      setButtonText("Start");
    });
    // Handle incoming bounding boxes from server
    socket.on('processed_frame', (data) => {
      //const detection = JSON.parse(data); // Parse the received JSON data
      const boxes = JSON.parse(data);  // Parse the received JSON data
      console.log(boxes);
      //setBoxes(boxes);
      drawDetections(boxes.detections);

      // const bbox = detection.bbox; // [x1, y1, x2, y2]
      // console.log(bbox);
      // const confidence = detection.confidence;
      // const classIndex = detection.class;

      //setBoxes(bbox);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log("Disconnected from server");
      setOnline(false);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Clear previous detections
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // setStreaming(false);
      // // Stop the video stream if desired
      // const stream = videoRef.current.srcObject;
      // if (stream) {
      //     const tracks = stream.getTracks();
      //     tracks.forEach(track => track.stop());
      //     videoRef.current.srcObject = null;
      // }
    });

    return () => {
      clearInterval(sendVideoFrame);
      //socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, [streaming, startSend]);

  // Function to draw detections on the canvas


  

//   // Function to start video streaming
//   const startVideoStream = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//       //videoRef.current.play();
//       setStreaming(true);
//     } catch (err) {
//       console.error("Error accessing camera: ", err);
//     }
//   };

//   function drawDetections(detections) {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     // Clear previous detections
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw the current video frame
//     //ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

//     detections.forEach(detection => {
//       const bbox = detection.bbox; // [x1, y1, x2, y2]
//       const confidence = detection.confidence;
//       const classIndex = detection.class;

//       // Draw bounding box
//       ctx.beginPath();
//       ctx.strokeStyle = 'red';
//       ctx.lineWidth = 2;
//       ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
//       ctx.stroke();

//       // Draw label (class name + confidence)
//       const label = `${classes[classIndex]} (${(confidence * 100).toFixed(2)}%)`;
//       ctx.fillStyle = 'red';
//       ctx.font = '14px Arial';
//       ctx.fillText(label, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
//     });
//   }

//   const sendVideoFrame = setInterval(() => {
//     if (streaming) {
//       if (startSend) {
//         const canvas2 = canvasRef2.current;
//         const ctx = canvas2.getContext('2d');

//         // Set canvas size
//         canvas2.width = 640;
//         canvas2.height = 480;

//         // Draw video frame on canvas
//         ctx.drawImage(videoRef.current, 0, 0, canvas2.width, canvas2.height);

//         // Convert canvas to Base64-encoded string
//         const frameBase64 = canvas2.toDataURL('image/jpeg');

//         // Send Base64-encoded frame over WebSocket
//         socket.emit('video_frame', frameBase64);
//       }
//     }
//   }, 100); // Send every 1 second (100 ms)


    return (
        <div style={{position: 'relative'}}>
            <div style={{position: 'absolute', top: 0, left : 0}}>
            <div >
            {isOnline
            ? <div style={{ backgroundColor: 'green', color: 'white', height: '40px', width: '150px', float: 'left', position: 'relative' }}>Online</div>
            : <div style={{ backgroundColor: 'red', color: 'white', height: '35px', width: '150px', float: 'left', position: 'relative' }}>Offline</div>
            }
            <div style={{ float: 'left', position: 'relative' }}>
            {isOnline
            ? <Button variant="primary" onClick={handleClick}>{buttonText}</Button>
            : <Button variant="primary" onClick={handleClick} disabled>{buttonText}</Button>

            }
            
            </div></div>
            <br/>
        </div>
            <div style={{ top: 40, left: '0', position: 'absolute', display: 'inline-block' , height : '480px', width: '640px' }}>
            <video ref={videoRef} width="640" height="480" autoPlay style={{ display: streaming ? 'block' : 'none' }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: 0, left: 0, height: '480px !important',width: '640px !important' }} />
             <canvas ref={canvasRef2} width="640" height="480" style={{ display: 'none' }} />         
            {boxes.map((box, index) => (
                    <div
                    key={index}
                    style={{
                        position: 'absolute',
                        border: '2px solid red',
                        left: box.x1,
                        top: box.y1,
                        width: box.x2 - box.x1,
                        height: box.y2 - box.y1,
                        color: 'red',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'none',
                        fontSize: '12px',
                    }}
                    >
                    {`${box.class} (${Math.round(box.confidence * 100)}%)`}
                    </div>
                ))}
            </div>
            <div style={{ top: 40, left: '0', position: 'relative', display: 'inline-block' , height : '150px', width: '330px', border: '0px solid red' }}>
                <div style={{ position: 'relative', display: 'inline-block' , height : '120px' }}>
                <EmotionBar/>
                </div>
                <div style={{  position: 'relative', display: 'inline-block' , height : '480px' }}>
                <PainGraph />
                </div>
            </div>
        </div>
    );
    // return {
    //     <div style={{position: 'relative'}}>
    //         <div style={{ top: 170, left: '0', position: 'absolute', display: 'inline-block' , height : '480px' }}>
    //         <video ref={videoRef} width="640" height="480" autoPlay style={{ display: streaming ? 'block' : 'none' }} />
    //         <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: 0, left: 0, height: '480px' }} />
    //         <canvas ref={canvasRef2} width="640" height="480" style={{ display: 'none' }} />
    //         {boxes.map((box, index) => (
    //             <div
    //             key={index}
    //             style={{
    //                 position: 'absolute',
    //                 border: '2px solid red',
    //                 left: box.x1,
    //                 top: box.y1,
    //                 width: box.x2 - box.x1,
    //                 height: box.y2 - box.y1,
    //                 color: 'red',
    //                 display: 'flex',
    //                 justifyContent: 'center',
    //                 alignItems: 'center',
    //                 pointerEvents: 'none',
    //                 fontSize: '12px',
    //             }}
    //             >
    //             {`${box.class} (${Math.round(box.confidence * 100)}%)`}
    //             </div>
    //         ))}
    //     </div>

    //     <div style={{ float: "right", position: 'relative', width: '50%'}}>
    //     <EmotionGraph />
    //     </div>
    //     </div>
    // };
}
//elements we'll need.
var output = document.querySelector("#output");
var video = document.querySelector("#inputVideo");
var faceBoxOverlay = document.querySelector("#faceBox");
var faceBoxOverlayContext = faceBoxOverlay.getContext('2d');
var image = document.querySelector('#theImage');
var videoCanvas = document.querySelector('#theVideoCanvas');
var videoCanvasContext = videoCanvas.getContext('2d');

//AWS creds
AWS.config.region = "us-east-1";

//init hue manager
var hm = new HueManager();

//emotions and their colors
var emotionsAndColors = [
     {emotions: ['DEFAULT'], rgb: {r: 255, g: 255, b: 255}}, //white
     {emotions: ['CALM'], rgb: {r: 0, g: 0, b: 255}}, //blue
     {emotions: ['HAPPY', 'SURPRISED'], rgb: {r: 51, g: 204, b: 51}}, //green
     {emotions: ['DISGUSTED', 'ANGRY', 'CONFUSED', 'SAD'], rgb: {r: 255, g: 0, b: 0}} //red
];

/**
 * Start Emotihue system
 */
var emotihue = async function(){
     //load the AI models
     await faceapi.loadTinyFaceDetectorModel('/models')
     await faceapi.loadFaceLandmarkTinyModel('/models')

     //start converting video to canvas and detecting faces on video play event
     video.addEventListener('play', detectFace);

     //create a throttled function to send stills to AWS...
     var throttled = _.throttle(getEmotionAndChangeLight, 1000, {leading: false, trailing: false});
     //and trigger the throttled function on image load
     image.addEventListener('load', throttled);

     //initialize webcam
     initWebcam();
}


/**
 * Init webcam
 */
var initWebcam = function(){
     if(navigator.mediaDevices.getUserMedia){
          navigator.mediaDevices.getUserMedia({video: true}).then(function(stream){
               video.srcObject = stream;
               console.log("Webcam started.");
          }).catch(function(err){
               console.log(`Unable to start webcam: ${err}`);
          });
     }
}

/**
 * Detect face in webcam video
 */
var detectFace = async function(){
     var options = new faceapi.TinyFaceDetectorOptions({inputSize: 256, scoreThreshold: 0.3});

     //detect face(s)
     var detections = await faceapi.detectSingleFace(video, options);
     if(typeof detections != "undefined"){
          //resize detected boxes to account for video size
          var detectionsForSize = faceapi.resizeResults(detections, {width: video.offsetWidth, height: video.offsetHeight});
          //resize canvas
          faceBoxOverlay.width = video.offsetWidth
          faceBoxOverlay.height = video.offsetHeight
          //draw face overlay
          faceapi.drawDetection(faceBoxOverlay, detectionsForSize, { withScore: true });
          //set output
          output.className = "face-detected";
          //and convert the video to canvas and image data
          convertVideoToCanvas();
     } else {
          //there's no face detected, so clear the overlay
          faceBoxOverlayContext.clearRect(0, 0, faceBoxOverlay.width, faceBoxOverlay.height);
          //set the output
          output.className = "no-face-detected";
          //and set the canvas/image to no face
          triggerNoFace();
     }

     //loop
     setTimeout(detectFace);
}

/**
 * Convert webcam video to canvas in realtime
 */
var convertVideoToCanvas = function(){
     //clear the canvas
     videoCanvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

     //draw current video frame on canvas
     videoCanvasContext.drawImage(video, 0, 0);

     //convert canvas to png
     var imageData = videoCanvas.toDataURL("image/png");

     //set image object to png
     image.src = imageData;

     //note that there's a face
     image.setAttribute('data-face-detected', true);
}

/**
 * Set up NO FACE DETECTED in output and canvas/image
 */
var triggerNoFace = function(){
     //if(image.getAttribute('data-face-detected') == "true"){
          videoCanvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
          image.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
          image.setAttribute('data-face-detected', false);
     //}
}

/**
 * Get emotion from an image and change the light.
 */
var getEmotionAndChangeLight = function(){
     var flow = [_createBinaryImage, _getEmotion, _parseEmotionResults, _changeColor];
     //we're only getting an emotion if there's a face currently detected, but we still need to change the color
     //when there's no face.
     if(image.getAttribute('data-face-detected') == "false"){
          console.log("No face detected.");
          flow = [async.apply(_parseEmotionResults, {Type: 'DEFAULT'}), _changeColor]
     }
     async.waterfall(flow);

}

/**
 * Create a binary image from base64
 */
var _createBinaryImage = function(callback){
     var base64Image = image.src.split("data:image/png;base64,")[1];
     var binaryImg = atob(base64Image);
     var length = binaryImg.length;
     var ab = new ArrayBuffer(length);
     var ua = new Uint8Array(ab);
     for (var i = 0; i < length; i++) {
       ua[i] = binaryImg.charCodeAt(i);
     }
     var blob = new Blob([ab], {
       type: "image/jpeg"
     });
     return(callback(false, ab));
}

/**
 * Send image to AWS Rekognition to detect emotion
 */
var _getEmotion = function(imageData, callback){
     //set up AWS parameters
     var params = {
          Image: {
               Bytes: imageData
          },
          Attributes: [
               'ALL',
          ]
     };

     //send image to AWS and do something with results
     var rekognition = new AWS.Rekognition();
     rekognition.detectFaces(params, function(err, data){
          if(err){
               console.log(`AWS Rekognition error: ${err}`);
               return(callback(err));
          }
          //assuming we have results, get the highest confidence emotion.
          if(data.FaceDetails.length > 0){
               var emotions = data.FaceDetails[0].Emotions;
               //sort emotions by confidence
               emotions.sort(function(a,b){
                    if(a.Confidence > b.Confidence){
                         return -1;
                    }
                    if(a.Confidence < b.Confidence){
                         return 1;
                    }
                    return 0;
               });
               //first emotion in array is what we want.
               return(callback(false, emotions[0]));
         }
    });
}

/**
 * Parse emotion results to get color, show feedback in output
 */
var _parseEmotionResults = function(emotion, callback){
     //because im lazy
     var detectedEmotion = emotion.Type;
     var detectedEmotionConfidence = emotion.Confidence;
     //show output
     console.log(`Face detected: ${detectedEmotion}`);
     $('#output .emotion').text(detectedEmotion);
     $('#output .confidence').text(detectedEmotionConfidence);
     //determine color
     var color = false;
     for(var i = 0; i < emotionsAndColors.length; i++){
          if(emotionsAndColors[i].emotions.indexOf(detectedEmotion) >= 0){
               color = emotionsAndColors[i].rgb;
          }
     }
     return(callback(false, color));
}

/**
 * Change color
 */
var _changeColor = function(color, callback){
     hm.setLightColor(23, color);
}

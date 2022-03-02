if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
    alert('This browser does not supports  getUserMedia API.');


}
navigator.mediaDevices.enumerateDevices().then(function (devices) {
    console.log(devices);
    for (var i = 0; i < devices.length; i++) {
        var device = devices[i];

        var option = document.createElement('option');
        if (device.kind === 'videoinput') {
            option.value = device.deviceId;
            option.text = device.label || 'camera ' + (i + 1);
            document.querySelector('select#videoSource').appendChild(option);
        }
        // if (device.kind === 'audioinput') {
        //     option.value = device.deviceId;
        //     option.text = device.label || 'audio ' + (i + 1);
        //     document.querySelector('select#audioSource').appendChild(option);
        // }
    };
});

/****/
// 'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor, isSupported } = Twilio.VideoProcessors;
const bootstrap = window.bootstrap;

const virtualBackgroundForm = document.querySelector('form#virtualBackground-Form');
const virtualBackgroundButton = document.querySelector('button#virtualBackground-Apply');
const videoInput = document.querySelector('video#video-input');
const removeProcessorButton = document.querySelector('button#remove-processor');
// const errorMessage = document.querySelector('div.modal-body');
// const errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const overlay = document.querySelector('div#overlay');
const stopvid = document.querySelector('button#stopvid');
const playvidBtn = document.querySelector('button#playvidBtn');

let canvas = window.canvas = document.querySelector('canvas');

stopvid.disabled = true;
virtualBackgroundButton.disabled = true;

// Same directory as the current js file
const assetsPath = '';

var videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;



const loadImage = (name) =>
    new Promise((resolve) => {
        const image = new Image();
        image.src = `backgrounds/${name}.jpg`;
        image.onload = () => resolve(image);
    });

let images = {};

Promise.all([
    // loadImage('back1'),
    // loadImage('back2'),
    // loadImage('back3'),
    // loadImage('back4'),
    loadImage('back5'),
]).then(([back5]) => {  //back1, back2, back3, back4,
    // images.back1 = back1;
    // images.back2 = back2;
    // images.back3 = back3;
    // images.back4 = back4;
    images.back5 = back5;
    return images;
});

let video = document.querySelector('video');

function playvid() {
    overlay.style.display = 'block';
    playvidBtn.disabled = true;
    stopvid.disabled = false;
    virtualBackgroundButton.disabled = false;
    btnrecord.disabled = false;
    videoTrack;
     
    

    Video.createLocalTracks({
        audio: {
            name: 'microphone',
            deviceId: document.querySelector('select#audioSource').value
        },
        video: {
            name: 'camera',
            deviceId: document.querySelector('select#videoSource').value
        }
    }).then(function (tracks) {
        
        tracks.forEach(function (track) {
            console.log(track);
            window.videoTrack = track;
            setVirtualBg();
           setTimeout(() => {
            track.attach(videoInput); 
           }, 500);

            if (track.name == 'camera') {

            }
        });
    });



}

const setProcessor = (processor, track) => {
    if (track.processor) {
        overlay.style.display = 'none';
        // removeProcessorButton.disabled = true;
        track.removeProcessor(track.processor);
    }
    if (processor) {
        // removeProcessorButton.disabled = false;
        track.addProcessor(processor);
    }
};

async function setVirtualBg() {
    const options = {};
    
    let backgroundImage = images['back5'];
    console.log(backgroundImage)

    let { maskBlurRadius, fitType } = options;
    if (!virtualBackgroundProcessor) {
        virtualBackgroundProcessor = new VirtualBackgroundProcessor({
            assetsPath,
            maskBlurRadius,
            backgroundImage,
            fitType,
        });
        await virtualBackgroundProcessor.loadModel();
        overlay.style.display = 'block';

    } else {
        virtualBackgroundProcessor.backgroundImage = backgroundImage;
        virtualBackgroundProcessor.fitType = fitType;
        virtualBackgroundProcessor.maskBlurRadius = maskBlurRadius;
    }

    setProcessor(virtualBackgroundProcessor, videoTrack);
    overlay.style.display = 'block';
}

virtualBackgroundButton.onclick = event => {
    event.preventDefault();
    console.log(event);
    virtualBackgroundButton.disabled = true;
    // setVirtualBg();
};
 
function removeBg() {
    overlay.style.display = 'none';
    // videoTrack.removeProcessor(videoTrack.processor);
    setProcessor(null, videoTrack);
}
stopvid.onclick = event => {
    playvidBtn.disabled = false;
    stream = videoInput.srcObject;
    // now get all tracks
    tracks = stream.getTracks();
    overlay.style.display = 'none';
    // now close each track by having forEach loop
    tracks.forEach(function (track) {
        // stopping every track
        track.stop();
    });
    // assign null to srcObject of video
    videoInput.srcObject = null;
    videoInput.src = '';
    document.getElementById("canvas").style.backgroundImage = `url(./backgrounds/back1.jpg)`;
};


/****** Recording ******/
let recorder;
const btnrecord = document.querySelector('button#btnrecord');
const btnrecordstop = document.querySelector('button#btnrecordstop');



btnrecord.disabled = true;
btnrecordstop.disabled = true;
btnrecord.onclick = async function () {

    btnrecord.disabled = true;
    btnrecordstop.disabled = false;

    let stream = videoInput.srcObject;

    // console.log(videoTrack);

    console.log(stream);

    recorder = RecordRTC(stream, {
        type: 'video'
    });
    recorder.startRecording();

}

btnrecordstop.onclick = function () {

    btnrecord.disabled = true;
    btnrecordstop.disabled = true;
    recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob);
    });
}


function setSelectBackground(event, value) {
    virtualBackgroundButton.disabled = false;
    // document.getElementById("backgroundImage").value = value;
    /****/
    var selectedImg = document.querySelector("img.selected");
    selectedImg.classList.remove("selected");
    event.classList.add("selected");

    document.getElementById("canvas").style.backgroundImage = `url(./backgrounds/${value}.jpg)`;


}

/****INVOKE FUNCTION****/

// playvid();

/***CANVAS IMAGE****/


var ctx = canvas.getContext('2d');

video.addEventListener('loadedmetadata', function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});


video.addEventListener('play', function () {
    var $this = this; //cache
    let width = video.videoWidth;
    let height = video.videoHeight;
    let scaleVal = 0.25;
    let size = 0.60;

    (function loop() {
        if (!$this.paused && !$this.ended) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage($this, width * scaleVal, height * scaleVal, width * size, height * size);
            setTimeout(loop, 1000 / 30); // drawing at 30fps
        }
    })();
}, 0);
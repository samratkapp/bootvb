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
// const overlay = document.querySelector('div#overlay');
const stopvid = document.querySelector('button#stopvid');
const playvidBtn = document.querySelector('button#playvidBtn');

let canvas = window.canvas = document.querySelector('canvas');

stopvid.disabled = true;
virtualBackgroundButton.disabled = true;

// Same directory as the current js file
const assetsPath = '';

var videoTrack;
let gaussianBlurProcessor;
// let virtualBackgroundProcessor;



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
    // overlay.style.display = 'block';
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
            setVirtualBg(track);
            //    setTimeout(() => {
            //     track.attach(videoInput); 
            //    }, 0);

            if (track.name == 'camera') {

            }
        });
    });



}

const setProcessor = (processor, track) => {
    if (track.processor) {
        // overlay.style.display = 'none';
        // removeProcessorButton.disabled = true;
        track.removeProcessor(track.processor);
    }
    if (processor && track) {
        // removeProcessorButton.disabled = false;
        track.addProcessor(processor);
    }
};

async function setVirtualBg(track) {
    const options = {};

    let backgroundImage = images['back5'];
    console.log(backgroundImage)

    let { maskBlurRadius, fitType } = options;

    let virtualBackgroundProcessor = new VirtualBackgroundProcessor({
        assetsPath,
        maskBlurRadius,
        backgroundImage,
        fitType,
    });
    await virtualBackgroundProcessor.loadModel();
    // overlay.style.display = 'block';

    setProcessor(virtualBackgroundProcessor, videoTrack);
    // overlay.style.display = 'block';
    track.attach(videoInput);
}

virtualBackgroundButton.onclick = event => {
    event.preventDefault();
    console.log(event);
    virtualBackgroundButton.disabled = true;
    // setVirtualBg();
};

function removeBg() {
    // overlay.style.display = 'none';
    // videoTrack.removeProcessor(videoTrack.processor);
    setProcessor(null, videoTrack);
}
stopvid.onclick = event => {
    // clearTimeout(stopLoop);
    // the cancellation uses the last requestId
    cancelAnimationFrame(myReq);
    playvidBtn.disabled = false;
    stream = videoInput.srcObject;
    // now get all tracks
    tracks = stream.getTracks();
    // overlay.style.display = 'none';
    // now close each track by having forEach loop
    tracks.forEach(function (track) {
        // stopping every track
        track.stop();
    });
    // assign null to srcObject of video
    videoInput.srcObject = null;
    videoInput.src = '';
    ctxDraw("./backgrounds/back1.jpg", 0, 0, canvas.width, canvas.height);
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

    let vstream = videoInput.srcObject;
    let canvasStream = canvas.captureStream(60);
    // console.log(videoTrack);

    var finalStream = new MediaStream();

    getTracks(vstream, 'audio').forEach(function (track) {
        canvasStream.addTrack(track);
    });
    // getTracks(canvasStream, 'video').forEach(function (track) {
    //     finalStream.addTrack(track);
    // });

    console.log(canvasStream);

    recorder = RecordRTC(canvasStream, {
        type: 'video'
    });
    recorder.startRecording();

}

btnrecordstop.onclick = function () {
    console.log(btnrecordstop);
    btnrecordstop.disabled = false;
    btnrecord.disabled = false;
    recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob);

    });
}

let bgImage = "back1";
function setSelectBackground(event, value) {
    virtualBackgroundButton.disabled = false;
    // document.getElementById("backgroundImage").value = value;
    /****/
    var selectedImg = document.querySelector("img.selected");
    selectedImg.classList.remove("selected");
    event.classList.add("selected");
    bgImage = value;
    // document.getElementById("canvas").style.backgroundImage = `url(./backgrounds/${value}.jpg)`;
    buildCanvas();
}

/****INVOKE FUNCTION****/

// playvid();

/***CANVAS IMAGE****/


var ctx = canvas.getContext('2d');

function ctxDraw(url = null, posX = 0, posY = 0, width = 100, height = 100) {
    let img = new Image();
    img.src = url;
    ctx.drawImage(img, posX, posY, width, height);
}

video.addEventListener('loadedmetadata', function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});

var stopLoop;
var myReq;
function buildCanvas() {
    var $this = this; //cache
    console.log('play');

    let width = video.videoWidth;
    let height = video.videoHeight;
    let scaleVal = 0.28;
    let size = 0.60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let posX = width * 0.28;
    let posY = height * 0.5;
    let vposX = width * scaleVal;
    let vposY = 15;
    if (canvas.width < canvas.height) {
        posX = width * 0.25;
        posY = height * 0.7;
        vposX = width * 0.32;
        vposY = height * 0.22;
    }
    function loop() {
        console.log('loop');

        if (!$this.paused && !$this.ended) {
            // ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctxDraw(`./backgrounds/${bgImage}.jpg`, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, vposX, vposY, width * 0.4, height * 0.60);

            ctxDraw("./backgrounds/mic/4.jpeg", posX, posY, 250, 250);
            // stopLoop = setTimeout(loop, 0); // drawing at 30fps
            myReq = window.requestAnimationFrame(loop);
        }
    }
    loop();

}

video.addEventListener('play', function () {
    buildCanvas();
}, 0);




// var videoStream = canvas.captureStream(30);
// var mediaRecorder = new MediaRecorder(videoStream);

// var chunks = [];
// mediaRecorder.ondataavailable = function (e) {
//     chunks.push(e.data);
// };

// mediaRecorder.onstop = function (e) {
//     var blob = new Blob(chunks, { 'type': 'video/mp4' });
//     chunks = [];
//     invokeSaveAsDialog(blob);
//     //   var videoURL = URL.createObjectURL(blob);
//     //   video.src = videoURL;
// };
// mediaRecorder.ondataavailable = function (e) {
//     chunks.push(e.data);
// };

// mediaRecorder.start();

// setTimeout(function () { mediaRecorder.stop(); }, 18000);
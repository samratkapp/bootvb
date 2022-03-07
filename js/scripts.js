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
const stopvid = document.querySelector('button#stopvid');
const playvidBtn = document.querySelector('button#playvidBtn');

let canvas = window.canvas = document.querySelector('canvas');

const divBgi = document.querySelector('div#divBgi');
divBgi.style.display = 'none';

stopvid.disabled = true;
virtualBackgroundButton.disabled = true;

const assetsPath = '';

var videoTrack;
let gaussianBlurProcessor;
let virtualBGProcessor;
let video = document.querySelector('video');

const loadImage = (name) =>
    new Promise((resolve) => {
        const image = new Image();
        image.src = `backgrounds/${name}.jpg`;
        image.onload = () => resolve(image);
    });

let images = {};

// Promise.all([
//     loadImage('back5'),
// ]).then(([back5]) => {
//     images.back5 = back5;
//     return images;
// });



async function loadVirtualBGProcessor() {
    const options = {};
    var back5 = await loadImage('back5');
    console.log('back5== ', back5);
    images.back5 = back5;
    let backgroundImage = back5;

    let { maskBlurRadius, fitType } = options;

    virtualBGProcessor = new VirtualBackgroundProcessor({
        assetsPath,
        maskBlurRadius,
        backgroundImage,
        fitType,
    });
    await virtualBGProcessor.loadModel();
}


function playvid() {
    divBgi.style.display = 'block';

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
            if (track.name == 'camera') {

            }
        });
        setProcessor(virtualBGProcessor, videoTrack);
        videoTrack.attach(videoInput);
    });



}

const setProcessor = (processor, track) => {
    if (track.processor) {
        track.removeProcessor(track.processor);
    }
    if (processor && track) {
        track.addProcessor(processor);
    }
};


virtualBackgroundButton.onclick = event => {
    event.preventDefault();
    console.log(event);
    virtualBackgroundButton.disabled = true;
};

function removeBg() {
    setProcessor(null, videoTrack);
}
stopvid.onclick = event => {
    divBgi.style.display = 'none';
    // clearTimeout(stopLoop);
    window.cancelAnimationFrame(myReq);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctxDraw("./backgrounds/back1.jpg", 0, 0, canvas.width, canvas.height);
    playvidBtn.disabled = false;
    stream = videoInput.srcObject;
    // now get all tracks
    tracks = (stream && stream.getTracks()) ? stream.getTracks() : null;
    // overlay.style.display = 'none';
    // now close each track by having forEach loop
    if (tracks) {
        tracks.forEach(function (track) {
            // stopping every track
            track.stop();
        });
    }

    // assign null to srcObject of video
    videoInput.srcObject = null;
    videoInput.src = '';

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


    getTracks(vstream, 'audio').forEach(function (track) {
        canvasStream.addTrack(track);
    });

    recorder = RecordRTC(canvasStream, {
        type: 'video',
    });
    recorder.startRecording();

}

btnrecordstop.onclick = function () {
    console.log(btnrecordstop);
    btnrecordstop.disabled = false;
    btnrecord.disabled = false;
    recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        const myFile = new File(
            [blob],
            "sample.mp4",
            { type: 'video/mp4' }
        );
        invokeSaveAsDialog(myFile);

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

    let size = 0.60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let posX = width * 0.28;
    let posY = height * 0.5;
    let vposX = width * 0.30;
    let vposY = 15;

    if (window.innerWidth < window.innerHeight) {
        posY = height * 0.60;
        vposY = height * 0.15;
        vposX = width * 0.34;
    }
    console.log(posY);
    function loop() {
        console.log('loop');

        if (!$this.paused && !$this.ended) {
            // ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctxDraw(`./backgrounds/${bgImage}.jpg`, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, vposX, vposY, width * 0.35, height * 0.62);

            ctxDraw("./backgrounds/mic/4.jpeg", posX, posY, 256, 250);
            // stopLoop = setTimeout(loop, 0); // drawing at 30fps
            myReq = window.requestAnimationFrame(loop);
        }
    }
    loop();

}

video.addEventListener('play', function () {
    buildCanvas();
}, 0);



/****INVOKE FUNCTION****/

// playvid();

loadVirtualBGProcessor();
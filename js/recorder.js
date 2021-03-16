//---------------------------------------------------RECORDER------------------------------------------------

const recordedAudio = document.querySelector('recordedAudio');
const actx = Tone.context;
const RECORDER_SOURCE = actx.createMediaStreamDestination()
const RECORDER = new MediaRecorder(RECORDER_SOURCE.stream)

var recordedAudioPlayer = new Tone.Player().toMaster()

function loadBuffer(buf){
    recordedAudioPlayer.load(buf)
}

var chunks = []

RECORDER.ondataavailable = evt => chunks.push(evt.data)
RECORDER.onstop = evt => {
    // console.log(RECORDER)
    let blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'})
    // console.log(blob.stream())
    src = URL.createObjectURL(blob)
    audioFile.src = src

    const audioContext = new AudioContext()
    const fileReader = new FileReader()

    // Set up file reader on loaded end event
    fileReader.onloadend = () => {

        const arrayBuffer = fileReader.result// as ArrayBuffer

        // Convert array buffer into audio buffer
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

        // Do something with audioBuffer
        console.log(audioBuffer.getChannelData(0))
        
        var myBuf = new Tone.Buffer()
        myBuf.fromArray(audioBuffer.getChannelData(0))

        loadBuffer(myBuf)

        })

    }

    //Load blob
    fileReader.readAsArrayBuffer(blob)
      
}


const audioContext = new AudioContext()
var s1 = audioContext.createBufferSource()
    

var x = new Tone.Buffer('../songs/stayFull.mp3',function(){
    console.log(s1)
    return

    // Convert array buffer into audio buffer
    console.log(x.getChannelData(0))
    s1.buffer = x.get()
    console.log(s1.buffer)
    console.log(s1)
    s1.loop = true
    s1.connect(audioContext.destination)
    s1.start(audioCtx.currentTime)
    console.log(s1.state)


})

// document.addEventListener('keydown',function(e){
//     if (e.key == '/'){
//         console.log('startin')
//         s1.playbackRate.value = 2
//         console.log(s1)
//         s1.detune.value = -1200
//         s1.start()
        
//     }
// })

// setInterval(function(){
//         if(s1.context){
//             console.log(s1.detune.value)
//             if(Math.floor(s1.context.currentTime)%10 == 0){
//                 s1.detune.value += 1200
//                 s1.playbackRate.value /= 2
//             }
//         }
//     },1000
// )
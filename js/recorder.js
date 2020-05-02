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

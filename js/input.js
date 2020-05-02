//---------------------------------------------------SONG PLAYER----------------------------------------

var track = "./../songs/gravity.mp3"
var songPlayer = new Tone.Player(track)
// console.log(songPlayer)

var filterLowerBound = new Tone.Filter()
filterLowerBound.type="highpass"
filterLowerBound.frequency.value = 0

var filterUpperBound = new Tone.Filter()
filterUpperBound.type="lowpass"
filterUpperBound.frequency.value = 10000

songPlayer.connect(filterLowerBound)
songPlayer.connect(filterUpperBound)

songPlayer.sync()                                   // !
songPlayer.start()

songPlayerGain = new Tone.Gain()

filterLowerBound.connect(songPlayerGain)
filterUpperBound.connect(songPlayerGain)

songPlayerALX = new Tone.Analyser("fft",16384)

songPlayerGain.connect(songPlayerALX)                            

songPlayerVolume = new Tone.Gain().toMaster()
songPlayerVolume.gain.value = 0.5
filterLowerBound.connect(songPlayerVolume)
filterUpperBound.connect(songPlayerVolume)

songPlayerVolume.connect(RECORDER_SOURCE)                                  // Record to audio file



let dur;
dur = dur = songPlayer.buffer.duration
document.getElementById('seekBar').max=dur
document.getElementById('seekBar').value=0
displaySeek(dur,'seekEnd')

function loadTrack(element,search=0){
    name = element.id
    title = element.innerHTML

    document.getElementById('loadedTrack').innerHTML = '<div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>'

    for(i=0;i<12;i++)
        KEYS[i][1]=0                // Reset key-finding

    if(search) trackName = document.getElementById('enterName')
    else trackName = name


    // console.log('loaded',trackName,title)
    songPlayer.load('../songs/'+trackName,function(){

        document.getElementById('loadedTrack').innerHTML = title
        // console.log(document.getElementById('loadedTrack'))
        dur = songPlayer.buffer.duration
        // console.log(dur)
        document.getElementById('seekBar').max=dur
        // console.log(document.getElementById('seekBar').max)
        document.getElementById('seekBar').value=0
        displaySeek(dur,'seekEnd')
    })
    Tone.Transport.stop()
}
// loadTrack('gravity.mp3')

function highFilterTrack(val){
    filterLowerBound.frequency.value=val
    document.getElementById('lowpass').innerHTML=' '+String(val)+' Hz'
}
function lowFilterTrack(val){
    filterUpperBound.frequency.value=val
    document.getElementById('highpass').innerHTML=' '+String(val)+' Hz'
}

function trackGain(val){
    songPlayerGain.gain.value=val
    // console.log(val)
    document.getElementById('gain').innerHTML=' '+String(val)+' dB'
}

function outputGain(val){
    songPlayerVolume.gain.value=val
    document.getElementById('volume').innerHTML=' '+String(val)+' dB'
}

function seekTime(val){
    Tone.Transport.seconds = val;
    displaySeek(val)
}

//---------------------------------------------------MIC----------------------------------------------

var MIC = new Tone.UserMedia()
var micALX = new Tone.Analyser("fft",16384)//.toMaster()
MIC.connect(filterLowerBound)
filterLowerBound.connect(filterUpperBound)
// MIC.connect(MICGain)
// micGain.connect(micALX)
var micGain = new Tone.Gain()
filterUpperBound.connect(micGain)
micGain.connect(micALX)

function trackGainMic(val){
    micGain.gain.value = val
    document.getElementById('micGain').innerHTML = val+'dB'
}

MIC.connect(micALX);

buf = new Tone.Buffer()
MIC.connect(buf)


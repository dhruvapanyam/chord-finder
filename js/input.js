//---------------------------------------------------SONG PLAYER----------------------------------------

var track = "./../songs/cmaj7.mp3"
var songPlayer = new Tone.Player(track)
// console.log(songPlayer)

var filterLowerBound = new Tone.Filter()
filterLowerBound.type="highpass"
filterLowerBound.frequency.value = 0

var filterUpperBound = new Tone.Filter()
filterUpperBound.type="lowpass"
filterUpperBound.frequency.value = 50000

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

// var songReverb = new Tone.Distortion().toMaster()
// songReverb.generate().then(function(){console.log('reverb');songPlayerVolume.connect(songReverb)})

// var feedbackDelay = new Tone.PingPongDelay({
//     "delayTime" : "0.4",
//     "feedback" : 0.6,
//     "wet" : 0.5
// }).toMaster();

// songPlayerVolume.connect(feedbackDelay)

// songPlayerGain.connect(songReverb)
// songReverb.connect(songPlayerALX)                            

songPlayerVolume.connect(RECORDER_SOURCE)                                  // Record to audio file



let dur;
dur = dur = songPlayer.buffer.duration
document.getElementById('seekBar').max=dur
document.getElementById('seekBar').value=0
displaySeek(dur,'seekEnd')

// Tone.Transport.loop = true
// Tone.Transport.loopStart = 2
// Tone.Transport.loopEnd = 10

function getURLofLocalFile(){
    document.getElementById('fileopen').addEventListener('change', function(e) {
      var target = e.currentTarget;
      var file = target.files[0];
      var reader = new FileReader();
      
      console.log(file);
       if (target.files && file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                console.log(e)
                blob_url = e.target.result

                loadTrack(element=null, loaded=true, title=file.name, blob=blob_url)
                return;


            }
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('fileopen').click()
}

function loadTrack(element,loaded=0, title=null, blob=null){
    let name;
    if(title==null){
        name = element.id
        title = element.innerHTML
    }

    document.getElementById('loadedTrack').innerHTML = '<div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>'

    for(i=0;i<12;i++)
        KEYS[i][1]=0                // Reset key-finding

    if(loaded) trackName = blob
    else trackName = '../songs/'+name


    // console.log('loaded',trackName,title)
    
    songPlayer.load(trackName,function(){

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
    filterLowerBound.frequency.value=val    // Default value = 0
    document.getElementById('lowpass').innerHTML=' '+String(val)+' Hz'
}
function lowFilterTrack(val){
    filterUpperBound.frequency.value=val    // Default value = 10000
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

function toggleMicMute(){
    MIC_MUTE = !MIC_MUTE

    var icon = document.getElementById('micMute')
    icon.innerHTML = MIC_MUTE ? 'volume_off' : 'volume_up'

    var btn = document.getElementById('micMuteBtn')
    let from = MIC_MUTE ? 'teal' : 'grey'
    let to = !MIC_MUTE ? 'teal' : 'grey'

    btn.classList.remove(from)
    btn.classList.add(to)

}

MIC.connect(micALX);

buf = new Tone.Buffer()
MIC.connect(buf)


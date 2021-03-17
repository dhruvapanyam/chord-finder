//---------------------------------------------------PIANO------------------------------------------------

var piano = new Tone.Sampler({
    60:'../songs/voiceNoteC4.wav'
},{
    release: 5,
    attack: 0.7,
    
})

var pianoGain = new Tone.Gain().toMaster()
piano.connect(pianoGain)
// pianoGain.gain.value = 0.4

pianoALX = new Tone.Analyser("fft",16384)
piano.connect(pianoALX)

//---------------------------------------------------METHODS----------------------------------------------

var pianoKeys = document.getElementsByClassName('piano')
for(var i=0;i<pianoKeys.length;i++){
    pianoKeys[i].innerHTML = "<h2>"+pianoKeys[i].id+"</h2>"
}

var pressed = {}
const userPiano = ['z','s','x','d','c','v','g','b','h','n','j','m',',','y','7','u','8','i','o','0','p','-','[','=',']','\\','1','q','w','3','e','4','r','5','t','l','.',';','/']
for(var i=0;i<userPiano.length;i++){
    pressed[userPiano[i]]=0
}
// console.log(pressed)

keys = document.getElementById('keyboard')

keys.addEventListener('mousedown',function(event){
    piano.triggerAttack(event.target.id)

})
keys.addEventListener('mouseup',function(event){
    piano.triggerRelease(event.target.id);
})
var map = {
    'z':'C3','s':'C#3','x':'D3','d':'D#3','c':'E3','v':'F3','g':'F#3','b':'G3','h':'G#3','n':'A3','j':'A#3','m':'B3',',':'C4',
                                '1':'D#3','q':'E3','w':'F3','3':'F#3','e':'G3','4':'G#3','r':'A3','5':'A#3','t':'B3',',':'C4',
    'y':'C4','7':'C#4','u':'D4','8':'D#4','i':'E4','o':'F4','0':'F#4','p':'G4','-':'G#4','[':'A4','=':'A#4',']':'B4','\\':'C5',
             'l':'C#4','.':'D4',';':'D#4','/':'E4',

};
// console.log(map)
document.onload = function(){
    // console.log('hi')
    for(let key in map){
        var but = document.getElementById(map[key])
        if(but)
            but.innerHTML += '<p>'+String(key)+'</p>'
    }
    
}

function toggleKeyboard(){
    if(keys.style.display=='none'){
        pianoGain.toMaster()
        keys.style.display='block'
        return 1
    }
    pianoGain.disconnect()
    document.getElementById('keyboard').style.display='none'
}

function playKey(id){
    x = document.getElementById(id)
    x.style.backgroundColor = 'rgba(85, 166, 237,0.3)'
}
function unplayKey(id){
    x = document.getElementById(id)
    x.style.backgroundColor = 'rgba(85, 166, 237,0)'
}

//-----------------------------------USER INPUT------------------------------------

document.addEventListener('keydown',function(event){
    // console.log(event.key)
    if(event.key in map){
        if(!pressed[event.key]){
            piano.triggerAttack(map[event.key])
            pressed[event.key]=1
            playKey(map[event.key])
            // document.getElementById(map[event.key]).style.backgroundColor="#aaa"
        }
    }
})

document.addEventListener('keyup',function(event){
    if(!(event.key in pressed)) return 0;
    pressed[event.key]=0
    piano.triggerRelease(map[event.key])
    unplayKey(map[event.key])
    // document.getElementById(map[event.key]).style.backgroundColor="#ccc"
})



var clip = new Tone.UserMedia()
// console.log('hello')
// console.log(clip)

const actx  = Tone.context;
const dest  = actx.createMediaStreamDestination();
const record = new MediaRecorder(dest.stream);
var chunks = []

clip.connect(dest)

record.ondataavailable = evt => {console.log('recording...');chunks.push(evt.data);}
record.onstop = evt => {

    let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
    // console.log(blob)
    clip_url = (URL.createObjectURL(blob))
    // console.log(clip_url)
    piano.add(60, clip_url)
  };


function toggle_clip(){
    if(record.state == 'recording'){
        stop_recording()
        return;
    }


    countdown = document.getElementById('clip_countdown')
    sub = document.getElementById('clip_countdown_subtitles')
    countdown.innerHTML = '3'
    sub.innerHTML = "(Let's go!)"
    countdown.style.display = 'block'
    sub.style.display = 'block'

    setTimeout(()=>{
        countdown.innerHTML = '2'
        sub.innerHTML = '(You got this!)'
        setTimeout(()=>{
            countdown.innerHTML = '1'
            sub.innerHTML = '(No pressure!)'
            setTimeout(()=>{
                countdown.innerHTML = 'GO!'
                sub.style.display = 'none'
                start_recording()
            },1000)
        },1000)
    },1000)

}


function start_recording(){
    clip.open()
    record.start()
    document.getElementById('clip_record_icon').innerHTML = 'stop'
    document.getElementById('clip_info').style.display = 'none'
}

function stop_recording(){
    record.stop()
    clip.close()
    document.getElementById('clip_record_icon').innerHTML = 'fiber_smart_record'
    document.getElementById('clip_info').style.display = 'block'
    document.getElementById('clip_countdown').style.display = 'none'

    chunks = []
}


function clipGain(val){
    pianoGain.gain.value = val
}

function clipAttack(val){
    piano.attack = Math.pow(10,val)
}

function clipSustain(val){
    piano.release = Math.pow(10,val)
}




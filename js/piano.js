//---------------------------------------------------PIANO------------------------------------------------


var piano = new Tone.Sampler({
    "C4":'../synth/C4v60.wav'
},{
    release: 5,
    attack: 0,
})


var pianoGain = new Tone.Gain().toMaster()
piano.connect(pianoGain)
pianoGain.gain.value = 0.4

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
for(let key in map){
    var but = document.getElementById(map[key])
    if(but)
        but.innerHTML += '<p>'+String(key)+'</p>'
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

//-----------------------------------USER INPUT------------------------------------

document.addEventListener('keydown',function(event){
    // console.log(event.key)
    if(event.key in map){
        if(!pressed[event.key]){
            piano.triggerAttack(map[event.key])
            pressed[event.key]=1
            document.getElementById(map[event.key]).style.backgroundColor="#aaa"
        }
    }
})

document.addEventListener('keyup',function(event){
    if(!(event.key in pressed)) return 0;
    pressed[event.key]=0
    piano.triggerRelease(map[event.key])
    document.getElementById(map[event.key]).style.backgroundColor="#ccc"
})
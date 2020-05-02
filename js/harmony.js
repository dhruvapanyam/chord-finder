const ACC = 100, AVG = 100
const notes = {
    24:'C1',26:'C#1',27:'D1',29:'D#1',31:'E1',32:'F1',34:'F#1',36:'G1',39:'G#1',41:'A1',43:'A#1',46:'B1',
    49:'C2',51:'C#2',55:'D2',58:'D#2',61:'E2',65:'F2',69:'F#2',73:'G2',77:'G#2',82:'A2',87:'A#2',92:'B2',
    97:'C3',103:'C#3',109:'D3',114:'D#3',122:'E3',130:'F3',137:'F#3',146:'G3',154:'G#3',163:'A3',173:'A#3',183:'B3',
    194:'C4',206:'C#4',218:'D4',231:'D#4',245:'E4',259:'F4',275:'F#4',291:'G4',309:'G#4',327:'A4',346:'A#4',367:'B4',
    389:'C5',412:'C#5',436:'D5',462:'D#5',490:'E5',519:'F5',550:'F#5',583:'G5',617:'G#5',654:'A5',693:'A#5',734:'B5'
}

// console.log(notes[179])


const scale = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const revScale = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}

const tension = {                   //equals amount of energy released if paired with BASE
    0:20,           //MAX
    1:13,
    2:5,
    3:16.5,
    4:18,
    5:16,
    6:1,
    7:19,
    8:15,
    9:17.5,
    10:8,
    11:8
}

// Okay, let's think it out
// 
// So if I want to create a progression, I can't just make random chords
// There needs to be a tension-home thing
// So, I list tension chords and what they go with
// Then I list home chords, and how homely?
// 
// For example, 
// I is most homely
// vi is also homely
// III is lots of tension (goes with vi)
// V is tension
// IV is sorta homely
// so on...
//
// And then, depending on the type of chord they want to make, I pick the level of tension?
// Light = not much -> 'I-IV-IV-I' (or just 'I-I-I-I' lol)
// Heavy = much more-> 'I-III-vi-V'
// 
// 
// Home notes are    I, III, IV, V
// Tension notes are VII, IV, II, VI
//
// I don't want to assign scores to them myself, but I kinda have to, no? idk
// 
// So, to start, let's say: you start off on a home/semi-home, then you go through tension, and you reach I

const chordTypes = {
    major:[0,4,7],
    minor:[0,3,7]
}

function chordInKey(root, type){
    return chordTypes[type].map(x=>(x+root)%12)
}

const roman = {
    'i':0,
    'ii':2,
    'iii':4,
    'iv':5,
    'v':7,
    'v#':8,
    'vi':9,
    'vii':11
}

function readChord(notation){
    base = notation.toLowerCase()
    if(!(base in roman))
        return null
    if(base!=notation)
        type = 'major'
    else
        type = 'minor'
        


    root = roman[base]
    chord = chordInKey(root, type)
    // console.log(notation)
    return [chord,type]
}

function readNotation(notation){
    chords = notation.split('-')
    prog = []
    for(i=0;chords[i];i++){
        chord = readChord(chords[i])
        if(chord==null) return null

        prog.push(chord)
    }
    // console.log(notation)
    // console.log(prog)
    return prog
}

const chordsWithNote = {
    0: ['I','IV','vi'],
    2: ['ii','V'],
    4: ['I','iii','III','vi'],
    5: ['ii','IV'],
    7: ['I','iii','V'],
    8: ['III','iv'],
    9: ['ii','IV','vi'],
    11: ['iii','III','V']
}

const notInScale = [1,3,6,10]

function findKeysWithNotes(notes){
    // Format = [0,1,5,3,..]
    keys = []
    for(var i=0;i<12;i++){
        flag = 1
        newNotes = new Set(notes.map(x=>(12+x-i)%12))
        for(note of notInScale){
            note = parseInt(note)
            if(newNotes.has(note))
            {
                flag = 0
                break
            }
        }
        if(flag)
            keys.push(i)
    }
    // console.log(keys)
    return keys
}


// So, basically, 'I' or 'vi' has to be there at least once

// Given a set of 4 notes from {0,2,4,5,7,9,11}, find progression 

function createChordsWithNotes(notes){
    
    raw = notes
    notes = raw.map(x=>revScale[x])
    // Format = [0,4,7,2,1,...] in C-scale
    if(notes.length%4 != 0) return null

    keys = findKeysWithNotes(notes)

    if(keys.length==0){
        console.log('No key found')
        return null
    }

    myKey = keys[Math.floor(Math.random()*keys.length)]
    console.log('Chosen key:',scale[myKey])

    notes = notes.map(x=>(12+x-myKey)%12)

    chunks = 0
    prog = ''
    
    while(chunks < Math.ceil(notes.length / 4)){
        temp = notes
        // console.log(temp.slice(4,4))
        group = temp.slice(4*chunks, 4*(chunks+1))
        // console.log(group)
        mandatory = {'I':[],'vi':[]}
        for(let i=0;i<4;i++){
            // console.log(group[i])
            for(j=0;j<chordsWithNote[group[i]].length;j++){
                crd = (chordsWithNote[group[i]][j])
                if(crd == 'I')
                    mandatory['I'].push(i)
                if(crd == 'vi')
                    mandatory['vi'].push(i)
            }
        }
        // console.log(mandatory)
        myArr = []
        for(c of mandatory['I'])
            myArr.push(['I',c])
    
        for(c of mandatory['vi'])
            myArr.push(['vi',c])
    
        // console.log(myArr)
        format = [null,-1]
        if(myArr.length) format = myArr[Math.floor(Math.random()*myArr.length)]
    
    
        for(let i=0;i<4;i++){
            if(i==format[1]){
                prog += format[0] + '-'
            }
            else{
                note = group[i]
                choose = chordsWithNote[note][Math.floor(Math.random()*chordsWithNote[note].length)]
                
                prog += choose + '-'
            }
        }
    
        // console.log(prog)
        chunks++;
    }
    prog = prog.substring(0,prog.length-1)
        


    // Need to select one out of the 8 options if possible
    // ('I' in any of the 4 positions, or 'vi')

    
    
    console.log(raw)
    console.log(prog)

    read = readNotation(prog)
    res = ''
    for(var c=0;c<read.length;c++){
        root = scale[(myKey+read[c][0][0])%12]
        type = read[c][1]

        res += root + type.substring(0,3) + '-'
    }
    res = res.substring(0,res.length-1)
    console.log(res)

    return [myKey,read]

}

// createChordsWithNotes(['A#','C','A#','C','G#','G#','A#','D#'])



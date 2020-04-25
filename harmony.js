const chords = {
    major:[0,4,7],
    minor:[0,3,7]
}

const progressions = new Set()

const scaleNotes = new Set()
for(let x of [0,2,4,5,7,8,9,11])
    scaleNotes.add(parseInt(x))

progressions.add(
    [[0,'M'],[7,'M'],[9,'m'],[5,'M']],
    [[0,'M'],[5,'M'],[9,'m'],[7,'M']],
    [[0,'M'],[9,'m'],[5,'M'],[7,'M']],
    [[5,'M'],[7,'M'],[0,'M'],[0,'M']],
    [[9,'m'],[5,'M'],[0,'M'],[7,'M']],
    [[7,'M'],[9,'m'],[5,'M'],[0,'M']],
    [[5,'M'],[0,'M'],[7,'M'],[9,'m']],

    [[2,'m'],[7,'M'],[0,'M'],[0,'M']],
    [[0,'M'],[5,'M'],[2,'m'],[7,'M']],
    [[0,'M'],[5,'M'],[0,'M'],[7,'M']],
    [[0,'M'],[4,'M'],[9,'m'],[5,'M']],
    [[9,'m'],[7,'M'],[5,'M'],[4,'M']],
    [[2,'m'],[9,'m'],[7,'M'],[0,'M']],
    [[2,'m'],[0,'M'],[7,'M'],[9,'m']],
    
)

function translateProgression(prog){
    chordList = []
    
    for(let [note,chord] of prog){
        // console.log([note,chord])
        if(chord=='M'){
            chordList.push(chords.major.map(function(num){
                return (num + note) % 12
            }))
        }
        else{
            chordList.push(chords.minor.map(function(num){
                return (num + note) % 12
            }))
        }
    }
    return chordList
}


function harmonize(notes){
    // chordList = translateProgression(prog)

    // chordList = chordList.map(function(arr){
    //     return arr.map(function(val){
    //         return (val + base) % 12
    //     })
    // })

    progs = createProgression(notes)
    console.log(progs)
    rand = progs[Math.floor(Math.random()*progs.length)]
    // console.log('Picked key of',scale[progs[rand][0]])
    chordList = rand[1]

    let harmony = []
    for(var i=0;i<notes.length;i++){
        let harm = chordList[i][Math.floor(Math.random()*chordList[i].length)]
        while(harm==notes[i])
            harm = chordList[i][Math.floor(Math.random()*chordList[i].length)]
        
            harmony.push(harm)
    }

    console.log(notes,harmony)

}

function chordInScale(chord,scale){
    // [0,5,8], 5

    let offset = scale // 5

    chord = chord.map(function(note){
        return (12+note-offset)%12
        // [4,8,11]
    })

    for(var note of chord)                  // 0 5 8
        if(scaleNotes.has(note)==false)     //
            return false
    return true
}

function noteChords(note,scale){
    // given a note and a scale, create possible chords in the scale involving the note 
    // suppose 0, 5
    console.log('sss')
    
    list = []
    
    for(var x of Array(12).keys()){             // x = 0,1,2,...,11
        if(scaleNotes.has((x+12-scale)%12)==false)  // 
            continue

        for(chord in chords){
            tempChord = chords[chord].map(n => {    // 0,4,7
                return (n+x)%12
            })
            if(tempChord.includes(note)==false)
                continue
                
            if(chordInScale(tempChord,scale)){
                list.push(tempChord)
                console.log(tempChord)
            }
        }
    }
    return list

}

function createProgression(notes){
    // for(var x of Array(12).keys()){
    //     if(scaleNotes.has(x))
    //         console.log(x)
    // }

    // console.log(notes)

    poss = []
    for(var x of Array(12).keys()){
        // console.log(x)
        flag=1
        for(var k of notes)
            if(scaleNotes.has((12 + k - x) % 12)==false){
                // console.log('doesnt work because ',k)
                flag=0
                break
            }
        if(flag)
            poss.push(x)
    }
    

    master = []
    console.log('Possible kys:',poss)
    for(var x of poss){
        console.log(scale[x])
        res = []

        for(note of notes){
            
                res.push(noteChords(note,x))
                console.log('noteChords(',note,x,') = ',res[res.length-1])
        }
        
        if(res.length<notes.length)   continue
        master.push([x,res])
        // console.log(res)
    }
    // master = master.filter(function(x){
    //     for(var i=0;i<x[1].length;i++)
    //         if(x[1][i].length==0)
    //             return false

    //     return true
    // })
    console.log(master)

    ans = master.map(function(keyArr){
        temp = []
        for(var i=0;i<keyArr[1].length;i++){
            rand = keyArr[1][i][(Math.floor(Math.random()*keyArr[1][i].length))].map(x=>scale[x])
            temp.push(rand)
        }
        return [keyArr[0],temp]
    })

    
    // console.log(notes)
    // console.log(master)
    
    return ans
}
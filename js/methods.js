//--------------------------------------------------------------------ALGORITHM METHODS-------------------------------------------

function findPeaks(arr){
    var temp = arr
    max=[]
    for(var i=0;i<ACC;i++){
        max[i]=0
    }
    for(var x=0;x<temp.length;x++){
        var j=-1;
        for(var i=0;i<ACC;i++){
            if(temp[x]>temp[max[i]]){
                j=i;
                break;
            }
        }
        if(j>=0){
            for(var k=ACC-1;k>j;k--){
                max[k] = max[k-1]
            }
            max[j]=x;
        }
    }
    return(max)
}

//----------------------------------------------------------------------------------------------------

function findCluster(fft,lowBuf,index,highBuf){
    let sum=0
    a=[]
    for(var i=index - Math.floor(lowBuf);i< index + highBuf;i++){
        sum += (fft[i])
        a[i]=fft[i]
    }
    // console.log(notes[index],a)
    

    return sum/(highBuf+lowBuf)
}

//--------------------------------------------------------------------------------------------------------

function createDistribution(fft){
    let freqs = notes;
    
    let agg = {}

    hertz = Object.keys(freqs)
    // console.log(hertz[0])
    for(var x=0;x<hertz.length;x++){
        hertz[x] = parseInt(hertz[x])
    }

    for(var i=0;i<hertz.length;i++){
        let val = hertz[i]

        let lowBuf = null,highBuf = null;
        if(lowBuf==null && i!=0)
            lowBuf = (val - hertz[i-1])/8
        if(highBuf==null && i!=hertz.length-1)
            highBuf = (hertz[i+1]-val)/8
        
        if(i==0)
            lowBuf=highBuf
        if(i==hertz.length-1)
            highBuf=lowBuf

        agg[freqs[val]]=(findCluster(fft,lowBuf,val,highBuf));
        
    }

    return agg
}

//--------------------------------------------------------------------------------------------------------

function findNote(res){
    
    score = scale.map(x=>[x,0])

    for(var i=0;i<12;i++){
        score[revScale[res[i][0].substring(0,res[i][0].length-1)]][1] += Math.abs(res[i][1])
    }

    score.filter(x=>x!=0)

    score.sort(function(a,b){return a[1]-b[1]})

    console.log(score)
        
}

//--------------------------------------------------------------------------------------------------------

function makeChord(details){
    // Format = ['C4':-25,'D#4',-40,...] inc order of weights

    if(details[0][1]<-60)
        return null


    let obj = {}
    for(det of details){
        if(det[0] in obj) continue
        obj[det[0]] = det[1]                  // Contains strength indexed by note
    }
    
    let BASE = parseInt(revScale[details[0][0]])

    nums = details.map(x => {
        raw = x[0]
        return (12+revScale[raw]-BASE)%12       // Convert it to the BASE
    })

    // ---------------------------------------generate scores-----------

    scores = []
    for(var i=0;i<details.length;i++){
        scores[i] = [
                nums[i],
                Math.floor( 
                    Math.pow(1 + parseInt(details[0][1])/parseInt(details[i][1]),6 ) 
                        * Math.pow(tension[nums[i]],0.5)
                    )
                ]
        // console.log(details[0][1]/details[i][1])
    }

    scores.sort(function(a,b){return b[1]-a[1]})

    //--------------------------------------------------------------------------
    //------------------------------------QUESTIONABLE ALGORITHM LOL------------
    
    result = []
    k=0
    for(var i=0;i<scores.length;i++){
        if(i<scores.length-1){
            if(scores[i][1]>scores[i+1][1]){
                result[k]=parseInt(scores[i][0])
                k++
            }
            else{
                if(Math.pow(tension[scores[i][1]],1.5)*obj[scale[scores[i][0]]] >  Math.pow(tension[scores[i+1][1]],1.5)*obj[scale[scores[i+1][0]]])
                    result[k]=scores[i][0]
                else
                    result[k]=scores[i+1][0]
                i++
                k++
            }
        }
        else{
            result[k]=scores[k]
            k++
        }
        if(k==6)
            break
    }

    // result = scores

    result.filter(function(x){
        return obj[scale[(12+x+BASE)%12]] / obj[scale[BASE]] > 4            // Filter only those notes that are not too soft
    })

    result = result.map(x => parseInt(x))

    //--------------------------------------------------------------

    let myChord = detectChord(result,BASE)
    
    if(myChord==null)
        return null

    // if(myChord.chordType=='tri'){
    //     // console.log(myChord.pitch,'+',BASE,'+',tone);
    //     three = (myChord.pitch + 3 + BASE ) % 12
    //     four = (myChord.pitch + 4 + BASE ) % 12

    //     // console.log(obj[scale[three]],obj[scale[four]])
    // }

    return {
        name:myChord.name,
        notes:myChord.notes,
        base:BASE, 
        sure:myChord.sure,
        chordType:myChord.chordType,
        pitch:myChord.pitch
    }   // 'Am7/D#',[0,3,7,10], 3 (base), sure, pitch 

}

//---------------------------------------------------------------------------------------------------------------------

function findPossibleKeys(chord){
    // console.log(chord)

    // if chord is 'fifth' or 'tri', check only 0,7,
    // console.log(chord[0]+':')
    // console.log(chord[2
    // console.log(chord[1])

    // FORMAT = ['Amin',[0,,3,7],BASE,sure, 'fifth',pitch]

    var pitch = chord.pitch
    var base = chord.base
    
    
    for(var i=0;i<chord.notes.length;i++)
        chord.notes[i] = (parseInt(chord.notes[i]) + pitch) % 12
    
    // if(chord[1]==[0,3,4,7]){

    // }

    chord.notes.push(base)

    
    
    // console.log(chord[1])

    res = []
    
    // if(JSON.stringify(chord[1])==JSON.stringify([0,3,4,7]))
    //     res.push(chord[2])

    for(var p=0;p<12;p++){
        flag=1
        for(var i=0;i<chord.notes.length;i++){
            if((chord.notes[i] + 12 - p) % 12 in majorScale){
                flag=0
                break
            }
        }
        if(flag)
            res.push(p)
    }

    // console.log(res)

    return [chord[0],chord[1],res]
}

//--------------------------------------------------------------------------------------------------------

function checkChordWithKeys(chord,keys){

    // if(chord.name=='Am7/E') console.log(chord[1])

    // if(chord.name=='F-C/E') console.log('FCEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',chord.notes)

    // FORMAT: chord = ['Am7',[0,3,7,10],9,false]


    for(var i=0;i<chord.notes.length;i++)
        chord.notes[i] = (chord.notes[i] + chord.base) % 12

    k=0
    
    num=0
    flag=0

    while(k<keys.length){
        let note = revScale[keys[k]]
        flag=0
        for(var i=0;i<chord.notes.length;i++){
            if((chord.notes[i] + 12 - note) % 12 in majorScale){
                // console.log(chord.name,'doesnt fit with',keys[k])
                // console.log(chord.notes,note)
                if(k==0)
                    flag=1
                num+=1
                break
            }
        }
        k++
    }
    if(flag && num>1) return 0

    if(num < Math.floor(keys.length/2))
        return 1
    
    return 0

}

function repeatApp(fft){
    dist = createDistribution(fft);                 // Format = ['C4':-172.223, 'D#':-Infinity]

    for(var note in dist){
        if(dist[note]==0)
            dist[note]=-Infinity
    }

    var nums = Object.keys(dist).map(x => [x,dist[x]])      // nums = [ ['C3',-34.3], [...], [...] ]

    averages.unshift(nums)  // shifts entries to the right, and puts nums in index [0]



//-----------------------to get average strength of each note---------------------------
    res = []
    for(var i=0;i<nums.length;i++){
        count=0
        res[i] = [nums[i][0],0] // ['C3',0]

        for(var j=0;j<AVG;j++,count++){
            if(averages[j].length==0){
                count--;
                continue
            }
            if(averages[j][i][1]==-Infinity || averages[j][i][1]==undefined || Number.isNaN(averages[j][i][1]))
                count--;
            else{
                // console.log(acera)
                res[i][1] += averages[j][i][1]
            }
        }
        res[i][1] = res[i][1]/count
    }

    res.sort(function(a,b){return b[1] - a[1];})    // Sorts res based on decreasing strengths of notes

    //------------------------------------------------------------------------------------

    if(output=='chord'){
        found=[]
        for(var i=0;i<10;i++)
            found[i]=[res[i][0].substring(0,res[i][0].length-1),Math.ceil(res[i][1])]   // [['C',-31],[...]] (first 10 elements)

        // console.log(res)
        // console.log(found)
        found = makeChord(found)
        // console.log(found)
        
        if(found==null) return 0;
        // console.log(found[0],found[1],found[3])
        // console.log(found)
        possible = findPossibleKeys(found)

        // if(JSON.stringify(found['notes'])==JSON.stringify([0,3,4,7])) console.log(possible)

        let numberOfChords = 0
        let works=1
        if(found.sure)      // IF CHORD IS FO' SURE
        {
            let u=1,v=1
            // if(COUNT>=1000){
            //     if(JSON.stringify(found[1])==JSON.stringify([0,3,4,7])){
            //         u = checkChordWithKeys([found[0],[0,3,7],found[2],found[3]])
            //         v = checkChordWithKeys([found[0],[0,4,7],found[2],found[3]])
            //         possible=[]
            //         if(u)
            //             possible.push(findPossibleKeys([found[0],[0,3,7],found[2],found[3]]))
            //         if(v)
            //     }
            // }
            for(var i=700-1;i>0;i--){
                chordRecord[i]=chordRecord[i-1]
            }
            chordRecord[0]=possible[2]
        }
            pitch = [0,0,0,0,0,0,0,0,0,0,0,0]
        
            

            for(var i=0;i<700;i++,numberOfChords++){
                if(chordRecord[i].length==0)
                    numberOfChords--
                for(var j=0;j<chordRecord[i].length;j++){
                    pitch[chordRecord[i][j]]+=1
                }
            }

            finalKeys = []
            for(var i=0;i<12;i++)
                if(pitch[i]>numberOfChords/2)
                    finalKeys.push(scale[i])
                
            // if(COUNT>10000) if(finalKeys.length==0) console.log("CANNOT DETECT SCALE")
            
            if(finalKeys.length)
            {    
                if(brownie[0]==revScale[finalKeys[0]] && !lockBrownie){
                    brownie[1]++
                    if(brownie[1]>10000)
                    {
                        // console.log('I"VE FOUND THE KEY',scale[brownie[0]])
                        document.getElementById('detectedScale').innerHTML = "CALCULATED KEY AS:<h1>"+scale[brownie[0]]+'</h1>'
                        // lockBrownie=1
                    }
                }    
                else{
                    if(lockBrownie==0){
                        brownie[0]=revScale[finalKeys[0]]
                        brownie[1]=0
                    }
                }
            }

            

            // console.log(chordRecord)
            // if(COUNT%50==0)console.log(finalKeys)
        
        if(found.sure==false){

            // Not sure of chord
            if(numberOfChords<400) return 0;

            works = checkChordWithKeys(found,finalKeys)

        }

        if(COUNT%lim==0){

            d = {}
            for(var i=0;i<lim;i++){
                if(past[i] in d)
                    d[past[i]]++
                else
                    d[past[i]]=1
            }
            
            let winner = null
            for(var key in d){
                if(winner==null || (d[key]>d[winner] && key.substring(0,3)!='NaN' && Number.isNaN(key)==false))
                    winner=key
            }
            // console.log(d)

            if(d[winner]>lim*2/5) document.getElementById('detectedNote').innerHTML = winner

            COUNT=0
            
            // document.getElementById('temp2').innerHTML = finalKeys
        }

        if(works)
            past[COUNT%lim] = found.name
    }

    else{
        found = findNote(res)
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------HTML METHODS-------------------------------------------------------------------



var cols = document.getElementsByClassName('column')
for(var i=0;i<cols.length;i++){
    cols[i].innerHTML = "<h2>"+cols[i].id+"</h2>"
}

var pressed = {}
const keyset = ['a','s','d','f','g','h','j','k','q','w','e','r','t','y','u','z','x','v','b','n','2','3','5','6','7']
for(var i=0;i<keyset.length;i++){
    pressed[keyset[i]]=0
}
// console.log(pressed)

keys = document.getElementById('keyboard')


keys.addEventListener('mousedown',function(event){
    synth.triggerAttack(event.target.id)
})
keys.addEventListener('mouseup',function(event){
    synth.triggerRelease(event.target.id);
})
var map = {
    'q':'C3','w':'D3','e':'E3','r':'F3','t':'G3','y':'A3','u':'B3',
    '2':'C#3','3':'D#3','5':'F#3','6':'G#3','7':'A#3',
    'a':'C4','s':'D4','d':'E4','f':'F4','g':'G4','h':'A4','j':'B4','k':'C5',
    'z':'C#4','x':'D#4','v':'F#4','b':'G#4','n':'A#4'};
console.log(map)
for(let key in map){
    var but = document.getElementById(map[key])
    if(but)
        but.innerHTML += '<p>'+String(key)+'</p>'
}

function toggleKeyboard(){
    if(keys.style.display=='none'){
        synthALX.toMaster()
        keys.style.display='block'
        return 1
    }
    //synth.disconnect()
    document.getElementById('keyboard').style.display='none'
}

document.addEventListener('keydown',function(event){
    if(event.key=='-'){
        console.log('I hear you')
        document.getElementById('detectedNote').innerHTML = '<br><br>' + document.getElementById('detectedNote').innerHTML
    }
    if(event.key=='='){
        console.log('I hear you')
        document.getElementById('detectedNote').innerHTML = ''
    }
    if(event.key==' ' || event.key=='.'){
        if(Tone.Transport.state=='started'){
            // updateInterval = 10000
            Tone.Transport.pause();
            synth.releaseAll();
            // recorder.stop()
        }
        else{
            Tone.Transport.start();
            chunks = []
            // recorder.start()
        }
    }
    if(event.key=='\\'){
        if(mic.state=="stopped"){
            mic.open()
            console.log(mic)
        }
        else
            mic.close()
    }

    if(event.key=='0'){
        var temp = synthALX.getValue()
        max=0
        min=0
        for(var x=0;x<temp.length;x++){
            if(temp[x]>temp[max]) max=x
            if(temp[x]<temp[min]) min=x
        }
        console.log('MAX:'+String(max)+':'+String(temp[max]))
        
    }
    
    if(!(event.key in pressed)) return 0;
    if(!pressed[event.key]){
        synth.triggerAttack(map[event.key])
        pressed[event.key]=1
        document.getElementById(map[event.key]).style.backgroundColor="#aaa"
        

    }
})
document.addEventListener('keyup',function(event){
    if(!(event.key in pressed)) return 0;
    pressed[event.key]=0
    synth.triggerRelease(map[event.key])
    document.getElementById(map[event.key]).style.backgroundColor="#ccc"
})


function displaySeek(val,id='seek'){
    mins = Math.floor(val/60);
    secs = (Math.floor(val)%60)

    if(String(secs).length==1) 
        newTime = String(mins) + ':0'+String(secs)
    else
        newTime = String(mins) + ':'+String(secs)

    seek = document.getElementById(id)

    if(seek.innerHTML!=newTime){
        seek.innerHTML = newTime
        if(id=='seek') seekBar.value = mins*60 + secs
    }
}
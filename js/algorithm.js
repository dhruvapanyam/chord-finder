// Global----------------------------------

// console.log('BBBBBBBBBBBBBBBBBBBbb')

var intervals = 1

KEYS = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0]]

inputDetails = {
    'mic':{
        input: 'mic',
        gain: micGain,
        alx: micALX, 
        trackGain: trackGainMic
        , DOM: 'trackGainMic'
    },
    'file':{
        input:'file',
        gain: songPlayerGain,
        alx: songPlayerALX, 
        trackGain: trackGain, 
        DOM: 'trackGain'
    }
}
currentAnalysis = inputDetails[INPUT_TYPE]
// songPlayer.start(0)

function changeInput(type){
    INPUT_TYPE = type

    var icon = document.getElementById(type+'Icon');
    var other = document.getElementById((type=='mic'?'file':'mic')+'Icon')
    if(icon.classList.contains('grey')){
        icon.classList.remove('grey')
    }
    other.classList.add('grey')
    

    if(currentAnalysis.input != type)
    {
        currentAnalysis = inputDetails[type]
        if(type=='mic'){
            d = new Date()
            TIME_STARTED = d.getTime()
            console.log('micIcon')
            Tone.Transport.start()
            Tone.Transport.pause()
            pauseSongPlayer()
            MIC.open()
        }
        else{
            //Tone.Transport.start()        
            MIC.close()
        }
    }
}



// Chords----------------------------------

let hist = []
histLength = 50
for(var i=0;i<histLength;i++){
    hist.push(null)
}

peakLimit = [
    {low:1,high:2},
    {low:1,high:2},
    {low:2,high:4},
    {low:2,high:4},
    {low:2,high:5}
]

// thresholdLimit = [-60,-55,-50,-50,-45]
thresholdLimit = [-70,-70,-70,-70,-70]

PREVCHORD = null

playAlong = false
function togglePlayAlong(val){
    // console.log(val)
    playAlong = val

    if (!playAlong)
        piano.releaseAll()
}


// Notes-----------------------------------

PREVNOTE = {note:null,octave:null}
NOTECOUNT = 0
currentNoteCount = 0
NOTES_RECORDING = []
TIME_STARTED = 0

// console.log(Brain)

//----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------MASTER----------------------------------------------------------------------------

setInterval(function(){updateMaster()}, updateInterval);

function updateMaster(){
    // console.log('hello?')
    if(Tone.Transport.state != 'started' && INPUT_TYPE=='file'){        // Change this to clearInterval(), etc. later
        return
    }

    if(MIC_MUTE && INPUT_TYPE=='mic'){
        return;
    }

    // console.log('HELLO')

    // neural_master()
    // return

    results = renderData()
    if(!results) return
    // print(results)
    if(OUTPUT_TYPE=='chord'){
        // console.log(chord)
        
        alxChord(results)
    }
    else{
        alxNote(results)
    }
}


// const downloadToFile = (content, filename, contentType) => {
//     const a = document.createElement('a');
//     const file = new Blob([content], {type: contentType});
    
//     a.href= URL.createObjectURL(file);
//     a.download = filename;
//     a.click();
  
//       URL.revokeObjectURL(a.href);
// };
  
// document.querySelector('#btn-save').addEventListener('click', () => {
//     // const textArea = document.querySelector('textarea');
//     ADD_DATA = (ADD_DATA + 1) % 3
//     document.getElementById('btn-save').innerHTML = btnTexts[ADD_DATA]
//     // downloadToFile(JSON.stringify(NEURAL_DATA), 'nn.txt', 'text/plain');
// });

function sum_arr(arr){
    s = 0
    for(i=0;i<arr.length;i++)
        s += arr[i]
    return s
}

CUR_CHORD = 0

btnTexts = ['REST MODE','ADD MODE','PREDICT MODE']
ADD_DATA = 0

// --------------------------------------------------------------------------------------------------------------------

function refactor(val){
    // return alx[i]
    // print(i)
    // print(alx[i],alx[i] / (1 + Math.pow(i,0.1)))
    
    // alx[i] = -Math.pow(Math.abs(alx[i],0.9))
    // print(Math.abs(alx[i]))
    return val
    let p = 3
    let x = Math.pow(Math.abs(val),p) / Math.pow(55,p-1)
    // print(x)
    // print(' ')
    // return alx[i]/100
    // print(alx[i],(Math.pow(Math.abs(i),0.15)))
    return -x
    return alx[i] * (Math.pow(Math.abs(i),0))    // reduce higher up the scale
}

// trying something out ------------------------

var CYCLE_LENGTH = 100
// var prevALX = [...Array(CYCLE_LENGTH).keys()].map(x=>makeArray(1,16384)[0])

// ---------------------------------------------

var cycleCounter = 0

function neural_master(){
    chart.render()
    if(currentAnalysis.input=='mic'){
        alx = micALX.getValue(); // Frequency graph
        // console.log('mic')
    }
    else
        alx = songPlayerALX.getValue();

    // for(let i=0;i<alx.length;i++){
    //     if(prevALX[cycleCounter][i] < alx[i]) alx[i] += prevALX[cycleCounter][i]
    // }

    let notes_only = Object.keys(notes).map(x=>alx[x])
    analyseOvertones(notes_only)
    for(note in notes){
        x = graphPoints[note]["x"]             // index of frequency
            
        // ref = refactor(x)
        ref = refactor(notes_only[noteIndex[note]])

        // if(ref<=-95) continue    // if too soft, don't care about it
        graphPoints[note]["y"] = Math.max(ref,-95)        // update value if loud enough

        if(ref > -70){         // If the frequency is a note,     
            graphPoints[note]["indexLabel"] = notes[note]                
        }
        else
            graphPoints[note]["indexLabel"] = ''
    }



    // for(let p=0; p < alx.length; p++){
    //     // if(parseInt(p)==graphPoints.length-1) continue      // need this to keep the graph stable (visually)
    //     if(graphPoints[p] == undefined) continue
    //     if(p in notes == false) continue
    //     x = graphPoints[p]["x"]             // index of frequency
            
    //     ref = refactor(x)
    //     prevALX[cycleCounter][p] = ref

    //     if(ref<=-95) continue    // if too soft, don't care about it
    //     graphPoints[p]["y"] = ref        // update value if loud enough

    //     if(ref > -70 && (x in notes || OUTPUT_TYPE=='note')){         // If the frequency is a note,     
    //         if(OUTPUT_TYPE=='chord') {
    //             graphPoints[p]["indexLabel"] = notes[x]     
    //         }
    //         else {
    //             closest = findClosestNote(x)
    //             if(closest==null) continue

    //             if(x in notes)
    //                 graphPoints[p]["indexLabel"] = notes[x]     
    //             else
    //                 graphPoints[p]["indexLabel"] = ''   
    //         }
            
    //     }
    //     else
    //         graphPoints[p]["indexLabel"] = ''
    // }
    
    // // note_strengths = Object.keys(notes).map(x => [notes[x],alx[x]])
    // note_strengths = Object.keys(notes).map((x,i) => refactor(x))
    // removeOvertones(note_strengths)
    
    // if(ADD_DATA == 1)
    //     addToTrainingData(note_strengths, CUR_CHORD)
    // else if(ADD_DATA == 2)
    //     predictChord(note_strengths)

    // cycleCounter = (cycleCounter+1) % CYCLE_LENGTH
}







function renderData(){
    intervals++;

    // if(DISPLAY_GRAPH) chart.render()
    chart.render()

    var tops = [[],[],[],[],[]] // Loudest notes found in the 5 octaves
    // console.log(currentAnalysis.input == 'mic')
    if(currentAnalysis.input=='mic'){
        alx = micALX.getValue(); // Frequency graph
        // console.log('mic')
    }
    else
        alx = songPlayerALX.getValue();

    // console.log('NEURAL:')
    // temp_data = alx.filter((x,i)=>{
    //     return i in notes
    // }).map(x=>Math.round(x))
    // console.log(temp_data)

    // NEURAL_DATA[Object.keys(NEURAL_DATA).length] = []
    // if(ADD_DATA == 1) addToTrainingData(temp_data, CUR_CHORD)
    // else if(ADD_DATA == 2) normalizePredict(temp_data)
    
    // alx = removeOvertones(alx)
    let flag=0
    for(var oct=0;oct<5;oct++){

        for(let p=octaveRegions[oct].start;p<octaveRegions[oct].end;p++){

            if(parseInt(p)==graphPoints.length-1) continue      // need this to keep the graph stable (visually)
            
            x = graphPoints[p]["x"]             // index of frequency
            if(alx[x]<=-95) continue    // if too soft, don't care about it
                
            graphPoints[p]["y"] = alx[x]        // update value if loud enough
            
            if(false && OUTPUT_TYPE=='note')
                check = -45
            else
                check = threshold[oct]  // To add it to the top frequencies, the strength must be greater than the dynamic threshold of the octave

            if(alx[x]>check && (x in notes || OUTPUT_TYPE=='note')){         // If the frequency is a note,     
                if(OUTPUT_TYPE=='chord') {
                    tops[oct].push([notes[x],alx[x]])   // Add it to the top-list
                    graphPoints[p]["indexLabel"] = notes[x]     
                }
                else {
                    closest = findClosestNote(x)
                    if(closest==null) continue

                    tops[oct].push([closest[1],alx[x]])
                    if(x in notes)
                        graphPoints[p]["indexLabel"] = notes[x]     
                    else
                        graphPoints[p]["indexLabel"] = ''   
                }
                
            }
            else
                graphPoints[p]["indexLabel"] = ''
        }

        // console.log(alx)

        //---------------------------DYNAMIC THRESHOLDS---------------------------------------------
                // change the threshold of an octave if there are too many peaks, or too few.

        

        if(tops[oct].length > peakLimit[oct].high && threshold[oct] < -25){     // If the number of peaks is greater than the limit specified, and the threshold is still below -25
            // print('!!!!!!!!!!!!!!!!')
            flag=1
            // document.getElementById('pass-indicator').style.backgroundColor = 'red'
            
            total = 0
            for(var i=0;i<tops[oct].length;i++)
                total+=tops[oct][i][1]
            
            avg = Math.floor(total/tops[oct].length)                    // Gets average strength of all peaks
            tops[oct] = tops[oct].filter(x=>{return x[1] > avg+4})      // Keeps only the peaks that have strength > (avg+8)-------8 can be changed--------meant for drums, etc.

            
            changeThreshold(oct,threshold[oct]+1);                      // INCREASE threshold by 1
            document.getElementById('limit'+String(o)).value=threshold[oct]+1
            // break
        }

        if(tops[oct].length < peakLimit[oct].low && threshold[oct] > thresholdLimit[oct]){// If the number of peaks is smaller than the limit specified, and the threshold is still above the lower limit
            // print('-----------------')
            flag=1
            // document.getElementById('pass-indicator').style.backgroundColor = 'red'
    
            changeThreshold(oct,threshold[oct]-1);                      // DECREASE threshold by 1
            document.getElementById('limit'+String(oct)).value=threshold[oct]-1
            // break
        }
    
        //--------------------------------------------------------------------------------------------------
    }
    if(flag) return null

    // document.getElementById('pass-indicator').style.backgroundColor = 'green'
    // 2 IDEAS : 
    // 1 - don't change thresholds, and find peaks. If there are too many peaks, filter out peaks of peaks, and only if the slope of the peak is steep enough (lol didn't work)
    // 2 - change thresholds and trust it to return the right peaks
       
        // -----------------------------------------GENERATE PEAKS--------------------------------------------------------

        results = tops.map(x=>{
            return decluster(x)             // Finds all the "significant" peaks in clustered frequencies of 'tops'
        })

        let temp = []
        // console.log(sum_arr(tops.map(x=>x.length)))

        for(var i=0;i<5;i++){
            if(results[i].length) {
                // document.getElementById('display'+String(i)).innerHTML = results[i].map(x=>x[0])          // Display peak notes
                for(let x of results[i]) temp.push(x[0])
            }
            else document.getElementById('display'+String(i)).innerHTML = '-'
        }
        // if(temp.length) print(temp)

        for(var i=0;i<5;i++){
            results[i] = results[i].sort((a,b)=>{b[1]-a[1]})        // Sort all the peaks of an octave by decreasing strengths
            // if(results[i].length) 
                // document.getElementById('display'+String(i)).innerHTML += Math.floor(results[i][0][1])
        }

        results = results.filter(x=>{return x.length>0})        // Consider only the octaves which have significant peaks
        // console.log(results)

        if(results.length==0) {
            // document.getElementById('pass-indicator').style.backgroundColor = 'red'
            return null
        }

        return results

}


//------------------------------------------------------------CHORD FINDER----------------------------------------------------------------------

function alxChord(results){
    // console.log('alxChord')
    AVERAGE_VOLUME = 0
    for(var i=0;i<4;i++){
        AVERAGE_VOLUME += threshold[i]
    }
    AVERAGE_VOLUME = Math.floor(AVERAGE_VOLUME/4)

    // document.getElementById('display0').innerHTML = AVERAGE_VOLUME


    //------------------------------------EDIT VOLUME IF TOO SOFT OR LOUD-------------------------------

    if(AVERAGE_VOLUME < -50 && currentAnalysis.gain.gain.value <= 5.5){
        currentAnalysis.trackGain(currentAnalysis.gain.gain.value + 0.01)
        document.getElementById(currentAnalysis.DOM).value = currentAnalysis.gain.gain.value
    }
    if(AVERAGE_VOLUME > -35 && currentAnalysis.gain.gain.value >0.2){
        currentAnalysis.trackGain(currentAnalysis.gain.gain.value - 0.01)
        document.getElementById(currentAnalysis.DOM).value = currentAnalysis.gain.gain.value
    }

    //--------------------------------------------------------------------------------------------------

    // ----------------------------------CHORD FINDING / SCORING SYSTEM-----------------------------------------------
    // console.log('chord')
    myArr = new Set()
    for(var i=0;i<results.length;i++){
        for(var j=0;j<results[i].length;j++){
            myArr.add(results[i][j])                        // Gets all peaks in a set
        }
    }

    newdisp = document.getElementById('detectedChord')

    // CHORDS = []     // List of chords found with these results

    var CHORDS = findAllChords(myArr)
    // console.log(CHORDS)

    CHORDS.sort((a,b)=>{
        return a.score - b.score
    })

    if(CHORDS.length==0) return


    
    hist.unshift(CHORDS[0])
    
    counts = {}
    
    for(var i=0;i<histLength;i++){ 
        
        if(hist[i]==null) break
        
        x = hist[i].name
        // console.log(x)
        if(x in counts){
            counts[x].num++
        }
        else{
            counts[x] = {
                num: 1,
                chord: hist[i]
            }
        }
    }
    // console.log(counts)

    m = null
    m2 = null
    for(c in counts){
        // console.log(c)
        if(m==null || counts[c].num>counts[m].num){
            m2 = m
            m = c
        }
            
    }
    // console.log(m)

    if(m==null) return

    if(m2 && counts[m2][0]<histLength/5) 
        m2=null

    // final = combine(m,m2)
    final = counts[m].chord

    root = final.root
    type = final.type
    bass = final.bass
    // console.log(type.split('/'))
    // console.log(final)
    
    if( (type=='5' || type=='') && PREVCHORD && root == PREVCHORD.root && (PREVCHORD.type[0]=='m' || PREVCHORD.type[0]=='7')){
        final = PREVCHORD
    }

    if(playAlong){
        NOTES1 = getNotes(PREVCHORD)
        // for(var n in NOTES.values())
        //     synth.triggerRelease(NOTES[i])

        
        NOTES2 = getNotes(final)

        union = new Set()
        for(var x of NOTES1) union.add(x)
        for(var x of NOTES2) union.add(x)

        // console.log(union)

        for(var x of union){
            if(NOTES1.has(x) && NOTES2.has(x)) continue

            // if(NOTES1.has(x))
            //     synth.triggerRelease(x)
            // else
            //     synth.triggerAttack(x)
        }
    }

    // If both sets have some same notes, don't do anything with them
    // If note in setA but not in set B, release
    // If note in setB but not in setA, attack

    // for(var i=0;NOTES[i];i++)
    //     synth.triggerAttack(NOTES[i])
    // attackNotes(final)

    possible = findKeys(final)
    for(x of possible)
        KEYS[x][1]++;


    // final = current chord
    // PREVCHORD = previous chord

    // if current "goes with" the previous one, add it to the group
    // if not, then process the last group
    //      -> find the count for each root
    //      -> find the winning chord of the root
    //      -> display total count with winning chord

    m = null
    m2=null
    for(i=0;i<12;i++){
        if(m==null || m[1]<KEYS[i][1]){
            // m2=m
            m = KEYS[i]
        }
        if((m2==null || m2[1]<KEYS[i][1]) && m!=KEYS[i])
            m2 = KEYS[i]
        
    }
    document.getElementById('mostLikelyKeys').innerHTML = scale[m[0]] +', ' + scale[m2[0]]
    
    if(PREVCHORD && final.name==PREVCHORD.name){
        // PREVCOUNT++;
        // newdisp.innerHTML += '+'
    }
    else{
        
        // PREVCOUNT=1
        PREVCHORD = final
        temp = KEYS
        // console.log(temp)
        // document.getElementById('display4').innerHTML = String()
        newdisp.innerHTML = PREVCHORD.name + ' '
        
    }
}

function findAllChords(myArr){
    var chords = []
    for(var n of myArr){    // Try making a chord with every peak note as the ROOT

        // ------------------------------------------Creating chord---------------------------------------------

        BASE = n                
        root = rawNote(BASE[0])

        chordP = new Set()      // Progressive notes found with this root

        weighted = []           

        for(var m of myArr){
            m_note = rawNote(m[0])

            temp = (12 + revScale[m_note]-revScale[root])%12        // Relative numbered note of m with respect to root

            weighted.push([temp, m[1]])     // Add note number, weight
            chordP.add(temp)                // Add note number
        }

        // console.log(Array(12).map(x=>null)[0]==null)
        
        // -----------------------------------------Scoring chord-----------------------------------------------    (LOWER THE SCORE, BETTER THE CHORD)

        scores = Array(12).map(x=>null)         // To combine repeated notes' strengths

        for(var i=0;i<weighted.length;i++){

            off = weighted[i][0]    // offset number
            vol = weighted[i][1]    // note strength

            if(scores[off]==null){
                scores[off] = [off, Math.abs(vol), 1]       // scores[i] = [i,-35,1]
            }
            else
            {
                scores[off][1]+=Math.abs(vol)           // add the strength
                scores[off][2]++;                       // increase count of number
            }
        }

        for(var i=0;i<12;i++){
            if(scores[i]==null) continue

            scores[i] = [i,(Math.floor((scores[i][1])/Math.pow(scores[i][2],2)))]           // Combined score for a note = (total strength) / (count)^2 ------------ = avg strength / count
        }

        if(scores.length == 0) continue

        BASE = BASE[0]
        octave = BASE[BASE.length-1]
        // console.log(BASE,octave)

        // IMPORTANT: Now, we can find all the chords possible using the notes found, and push them into CHORDS

        // (make the following into a function)
        bass = root
        if(results[0][0][1] > -37 && rawNote(results[0][0][0]) != rawNote(BASE)){           // If the lowest bass note is loud enough, and not the same as the root
            bass = rawNote(results[0][0][0])
        }

        const numNotes = {
            '':1,
            '5':2,
            'min':3,
            'maj':3,
            'm7':4,
            'mM7':4,
            '7':4,
            'maj7':4
        }
        myChords = []
        {
            if(chordP.has(0)){
                // should do anyway
                len = 1 // number of notes in chord
                sum0 = scores[0][1]
                sum = (sum0/(len*len)) * (octave * 50)
                myChords.push({type: '',score: sum})

                if(chordP.has(7)){
                    // found a fifth
                    len = 2
                    sum7 = sum0 + scores[7][1]
                    sum = (sum7/(len*len)) * (octave * 15)
                    myChords.push({type: '5',score: sum})

                    if(chordP.has(3)){
                        // found a minor triad
                        len = 3
                        sum3 = sum7 + scores[3][1]
                        sum = (sum3/(len*len)) * (octave * 5)
                        myChords.push({type: 'min',score: sum})

                        if(chordP.has(10)){
                            // found a m7 chord
                            len = 4
                            sum10 = sum3 + scores[10][1]
                            sum = (sum10/(len*len)) * (octave * 5)
                            myChords.push({type: 'm7',score: sum})
                        }

                        if(chordP.has(11)){
                            // found a mM7 chord
                            len = 4
                            sum11 = sum3 + scores[11][1]
                            sum = (sum11/(len*len)) * (octave * 7)
                            myChords.push({type: 'mM7',score: sum})
                        }
                    }

                    if(chordP.has(4)){
                        // found a major triad
                        len = 3
                        sum4 = sum7 + scores[4][1]
                        sum = (sum4/(len*len)) * (octave * 5)
                        myChords.push({type: 'maj',score: sum})

                        if(chordP.has(10)){
                            // found a 7 chord
                            len = 4
                            sum10 = sum4 + scores[10][1]
                            sum = (sum10/(len*len)) * (octave * 5)
                            myChords.push({type: '7',score: sum})
                        }

                        if(chordP.has(11)){
                            // found a maj7 chord
                            len = 4
                            sum11 = sum4 + scores[11][1]
                            sum = (sum11/(len*len)) * (octave * 10)
                            myChords.push({type: 'maj7',score: sum})
                        }
                    }
                }
            }
        }

        myChords = myChords.map(x => {
            // x.score /= Math.pow(numNotes[x.type],0.3)
            if(x.root == x.bass)
                name = root+x.type
            else
                name = root+x.type+'/'+bass
            return {
                root: root,
                type: x.type,
                bass: bass,
                score: x.score,
                name: name
            }
        })
        chords = chords.concat(myChords)

        
    }

    return chords
}

function findKeys(final){
    exp = new Set(chordExpansion[final.type].map(x=>{
        return (x+revScale[final.root]) % 12
    }))
    // console.log(exp)
    res = new Set()
    for(var k=0;k<12;k++){
        if(exp.has((k+1)%12) || exp.has((k+3)%12) || exp.has((k+6)%12) || exp.has((k+10)%12))
            continue
        res.add(k)
    }
    // console.log(res)
    return res
}

function getNotes(chord){
    
    if(chord==null)
        return new Set()
    root = chord.root

    type = chord.type
    base = chord.bass
    
    arr = new Set( chordExpansion[type].map(x=>{
        return scale[ ( x + revScale[root] ) % 12 ]+'3'
    }))
    
    arr.add(base+'2')

    // console.log(arr)

    return arr
}

function decluster(tops){
    //Format = [[C3,-43],...]
    // console.log('declustering')
    // console.log(tops)
    arr = tops.map(x=>{
        return [rawNote(x[0]),x[1]]
    })

    clusters = []
    i=0
    low=i;
    high=i;
    for(var i=0;i<tops.length;i++){
        if(i<tops.length-1 && revScale[arr[i+1][0]] == revScale[arr[i][0]] + 1){
            high++
            continue
        }

        clusters.push([low,high])
        high++
        low = high
    }

    // console.log(clusters)

    peaks = []

    for(cluster of clusters){
        low = cluster[0]
        high = cluster[1]
        orient = 'up'

        len = 0
        climb = 0
        let peak;

        for(var i=low;i<=high;i++,len++){
            if(orient=='up'){
                if(i==high){
                    peak = tops[i]
                    // peaks.push(peak)
                    break
                }
                if(arr[i+1][1] < arr[i][1]){
                    peak = tops[i]
                    // peaks.push(peak)
                    orient='down'
                }
                climb += Math.abs(arr[i+1][1] - arr[i][1])
                    
            }
            else{
                if(i<high && arr[i+1][1] > arr[i][1]){
                    // Finished a peak
                    // console.log('Found a peak')
                    // console.log(peak[0],Math.floor(climb),len)
                    if(climb/len > 7)
                        peaks.push(peak)
                    peak = null
                    len=0
                    climb=0
                    orient='up'
                }
                if(i<high)climb += Math.abs(arr[i+1][1] - arr[i][1])
            }
            
        }
        if(peak!=null)
            peaks.push(peak)
    }
    // console.log(peaks)
    return peaks
}

//-------------------------------------------------------------NOTE FINDER----------------------------------------------------------------------

function alxNote(results){
    notesSet = {}
    // console.log(results)
    results = results.map(x=>{
        return x.filter(a=>{
            return parseInt(a[0][a[0].length-1])>1
        })
    }).filter(x=>x.length)
    if(results.length==0) return

    lowestNote = rawNote(results[0][0][0])
    lowestOctave = results[0][0][0][results[0][0][0].length-1]

    for(var i=0;results[i];i++){
        for(var j=0;results[i][j];j++)
            if(results[i][j][0][results[i][j][0].length-1]!='1') {
                note = rawNote(results[i][j][0])
                if(note in notesSet)
                {
                    notesSet[note].count++;
                    notesSet[note].octaveStrength += (parseInt(results[i][j][0][results[i][j][0].length-1]));
                    notesSet[note].strength += results[i][j][1]
                    
                }
                else
                {
                    notesSet[note] = {
                        count: 1,
                        strength: results[i][j][1],
                        octaveStrength: (parseInt(results[i][j][0][results[i][j][0].length-1])),
                        octave: parseInt(results[i][j][0][results[i][j][0].length-1])
                    }
                }
            }
    }

    if(Object.keys(notesSet).length==0) return

    NOTE = {note:null,strength:0,octave:0}
    for(note in notesSet){
        // console.log(NOTE)
        compare = Math.abs((notesSet[note].strength * notesSet[note].octaveStrength) / Math.pow(notesSet[note].count,3))
        // if(NOTE)console.log(NOTE.strength > compare)
        if(NOTE.note==null || NOTE.strength > compare){
            NOTE.note= note
            NOTE.strength= compare
            NOTE.octave = notesSet[note].octave
        }
        // console.log(note,compare)
    }
    NOTE = {note:lowestNote,octave:lowestOctave}
    // console.log(NOTE)
    if(PREVNOTE.note!=NOTE.note || PREVNOTE.octave!=NOTE.octave){
        
        d = new Date()
        t = d.getTime() - TIME_STARTED
        if(NOTES_RECORDING.length) {
            NOTES_RECORDING[NOTES_RECORDING.length - 1].releaseTime = t
            NOTES_RECORDING[NOTES_RECORDING.length - 1].count = currentNoteCount
            if(NOTE.note==PREVNOTE.note) NOTES_RECORDING[NOTES_RECORDING.length - 1].octave = NOTE.octave
        }
        NOTES_RECORDING.push({note:NOTE.note,attackTime:t,octave:NOTE.octave})
        
        // document.getElementById('detectedChord').innerHTML += PREVNOTE.octave+' ('+String(currentNoteCount)+')'+'<br>'
        document.getElementById('detectedChord').innerHTML += NOTE.note
        
        currentNoteCount = 1
        PREVNOTE.note=NOTE.note
        PREVNOTE.octave = NOTE.octave
        // NOTECOUNT++
        // if(NOTECOUNT%8==0) {document.getElementById('detectedChord').innerHTML += '<br>';NOTECOUNT=0}
    }
    else
        currentNoteCount++;
    
    // if(intervals%90==0) document.getElementById('detectedChord').innerHTML = ''

    // console.log(intervals)
}

function playNotesRecorded(){
    
    // Format = [{note:'C',time:181727389191,octave:'4'}]
    // updateInterval tells us the number of milliseconds per count
    
    // offset = updateInterval*500 // 0.5*100 = 50

    if(NOTES_RECORDING.length){
        d = new Date()
        t = d.getTime()
        
        NOTES_RECORDING[NOTES_RECORDING.length - 1].releaseTime = t
        NOTES_RECORDING[NOTES_RECORDING.length - 1].count = currentNoteCount
    }

    NOTES_RECORDING = NOTES_RECORDING.filter(x=>x.count>10)
    res = createChordsWithNotes(NOTES_RECORDING.slice(0,4).map(x=>x.note))
    if(res==null)
        return
    root = res[0]
    crds = res[1].map(x=>x[0])

    console.log(crds)

    for(let i=0;i<crds.length;i++){
        for(j=0;j<crds[i].length;j++){
            // piano.triggerAttack(scale[(root + crds[i][j])%12]+'3', '+'+String(2*i))
            // piano.triggerRelease(scale[(root + crds[i][j])%12]+'3', '+'+String(2*(i+1)))
        }
    }
    
    // return
    // return

    for(i=0;NOTES_RECORDING[i];i++){
        if(NOTES_RECORDING[i].count <= 10) continue
        timeToStart = (NOTES_RECORDING[i].attackTime)/1000
        
        timeToStart = (Tone.Time(timeToStart).quantize('4n'))
        console.log(timeToStart)
        noteToPlay = NOTES_RECORDING[i].note + NOTES_RECORDING[i].octave
        // for(j=0;j<crds[i].length;j++){
        //     // piano.triggerAttackRelease(scale[(root + crds[i][j])%12]+'3', '+'+String(timeToStart))
        //     console.log(crds[i][j])
        //     // piano.triggerRelease(scale[(root + crds[i][j])%12]+'3', '+'+String(timeToStart)+'+4n')
        // }
        piano.triggerAttack(noteToPlay,'+'+String(timeToStart))
        timeToEnd = (NOTES_RECORDING[i].releaseTime)/1000
        piano.triggerRelease(noteToPlay,'+'+String(timeToEnd))
        
        
        // total+= NOTES_RECORDING[i].count
        
    }

    
    
}


function removeOvertones(notes_arr){
    // format: for each note, volume
    counts = notes_arr.map(x=>0)

    for(i=0;i<60;i++){
        if(notes_arr[i] < -80) continue
        let strength = notes_arr[i] + 100
        for(let j=0;j<overtones.length;j++){
            let note = overtones[j]
            if(i+note >= 60) break
            counts[i+note]++
            notes_arr[i+note] -= strength/Math.pow(j+2,1.5)
        }
    }

    print('G4:',counts[12*3 + 7])


}

function analyseOvertones(arr){
    res = []
    for(note in notes){
        let i = noteIndex[note]
        if(arr[i] > -50 && arr[i+12] > -50 && arr[i+19] > -60){
            res.push(notes[note])
        }
    }
    print(res)
}

const true_frequencies = {}

k=25
for(note in notes){
    while(k<1050 && Math.floor(k*16384/22020)<note)
    {
        k+=0.1
    }
    if(k>=1050) break
    true_frequencies[k] = note
}

// print(true_frequencies)



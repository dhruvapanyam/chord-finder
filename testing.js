function transformChord1(notes){
    res=[]
    // console.log(notes)
    for(var i=0;i<notes.length;i++)
        notes[i] = parseInt(notes[i])
        
    for(var i=0;i<notes.length;i++){
        temp = []
        for(var j=0;j<notes.length;j++){
            temp.push( (notes[(i+j)%notes.length] + 12 - notes[i]) % 12  )
        }
        res.push(temp)
        // if(res[max][1]<score) max=i
    }
    // ans = []
    // console.log(res)
    // temp=res[max][0]

    fifth = []
    for(var i=0;i<res.length;i++){
        for(var j=0;j<res[i].length;j++){
            if(res[i][j]==7)
                fifth.push([res[i],notes[i]])
        }
    }
    // console.log(fifth)
    
    if(fifth.length==0){
        tri = []
        for(var i=0;i<res.length;i++){
            for(var j=0;j<res[i].length;j++){
                if(res[i][j]==3 || res[i][j]==4)
                    tri.push([res[i],notes[i]])
            }
        }
        if(tri.length==0)
            return []
        else
            return [tri,'tri']//[tri[0],'third']
    }

    // console.log('found a fifth')
    third = []
    for(var i=0;i<fifth.length;i++){
        for(var j=0;j<fifth[i][0].length;j++){
            if(fifth[i][0][j]==3 || fifth[i][0][j]==4)
                third.push(fifth[i])
        }
    }

    // console.log(third)

    if(third.length==0)
        return [fifth,'fifth']//[fifth[0],'fifth']

    seventh = []
    for(var i=0;i<third.length;i++){
        for(var j=0;j<third[i][0].length;j++){
            if(third[i][0][j]==9 || third[i][0][j]==10 || third[i][0][j]==11)  
                seventh.push(third[i])
        }
    }

    if(seventh.length==0)
        return [third,'third']//[third[0],'major/minor']
    else
        return  [seventh,'seventh']//[seventh[0],'seventh']

    /*

    if(temp==[0,3,4,5])
        return [[0,5,9],notes[max]]
    for(var i=0;i<res[max][0].length;i++){
        
        if(i+1<temp.length && temp[i]==temp[i+1]-1){
            if(tension[temp[i]] > tension[temp[i+1]])                                                           // SOLVE MAJOR VS MINOR
                ans.push(temp[i])
            else
                ans.push(temp[i+1])
            i++
        }
        else{
            ans.push(temp[i])
        }
    }

    if(ans==[0,3,5]) console.log('I found ',notes)

    console.log(ans,max)
    if(ans==[0,4,7,10]) console.log('7!')
    return [temp,notes[max]]

    */
}

function detectChord(notes,base){
    // Format = [0,3,7,10], 9
    // if(JSON.stringify(notes)==JSON.stringify([0,3,7,10]))
        // console.log('!!!!!!!!!!!!!!!',notes,base)

    if(notes[0]!=0)
        return null
    
    result = transformChord1(notes)
    if(result==[])
        return null

    // else , format = [[[0,4,7,9],2],'major/minor']

    chordDesc = result[1]

    // For now, choosing the first valid chord
    if(result==undefined || result[0]==undefined)
        return null
    valid = result[0][0]
    let offset = valid[1];

    var pitch = (base+offset)%12

    var key = scale[pitch]

    let ptx=[]
//  console.log(result)

    let name;
    if(chordDesc=='tri'){
        three=0
        four=0
        for(var i=0;i<valid[0].length;i++){
            if(valid[0][i]==3)
                three=1
            if(valid[0][i]==4)
                four=1
        }
        if(three && four)
        {
            name = key + '-' + scale[(pitch+3)%12]
            // if(base!=pitch)
            //     name+='/'+scale[base]
            name += ' or ' + key + '-' + scale[(pitch+4)%12]
            // if(base!=pitch)
            //     name+='/'+scale[base]
            ptx = [0,3,4]
        }
        else if(three){
            name = name = key + '-' + scale[(pitch+3)%12]
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = [0,3]
        }
        else{
            name = key + '-' + scale[(pitch+4)%12]
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = [0,4]
        }
    }
    else if(chordDesc=='third'){
        three=0
        four=0
        for(var i=0;i<valid[0].length;i++){
            if(valid[0][i]==3)
                three=1
            if(valid[0][i]==4)
                four=1
        }
        if(three && four){
            name=key
            ptx = [0,3,4,7]
        }
        else if(four)
        {
            name = key + 'maj'
            ptx = [0,4,7]
        }
        else{
            name = name = key + 'min'
            ptx = [0,3,7]
        }
    }


    else if(chordDesc=='fifth'){
        five = 0
        for(var i=0;i<valid[0].length;i++){
            if(valid[0][i]==7)
                five=1
        }
        if(five)
        {
            name = key + '-' + scale[(pitch+7)%12]
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = [0,7]
        }
        else{
            name=null
        }
    }
    else if(chordDesc=='seventh'){
        six = 0
        dom7 = 0
        maj7 = 0
        major = true
        for(var i=0;i<valid[0].length;i++){
            if(valid[0][i]==9)
                six=1
            else if(valid[0][i]==10)
                dom7=1
            else if(valid[0][i]==11)
                maj7=1
            else if(valid[0][i]==3)
                major=false
        }
        if(six){
            name = key + (major? '6' : 'm6')
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = major ? [0,4,7,9] : [0,3,7,9]
        }
        else if(dom7){
            name = key + (major? '7' : 'm7')
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = major ? [0,4,7,10] : [0,3,7,10]
        }
        else if(maj7){
            name = key + (major? 'M7' : 'mM7')
            if(base!=pitch)
                name+='/'+scale[base]
            ptx = major ? [0,4,7,11] : [0,3,7,11]
        }
        else{
            name = null
        }
    }
    let sure = false;
    // console.log(valid[0])
    // console.log(ptx)
    if(JSON.stringify(ptx)==JSON.stringify(valid[0]))
            sure=true

    if(chordDesc=='third')
        sure=true
    if(chordDesc=='seventh')
        sure=true

    return {
        name:name,
        notes:ptx,
        sure:sure,
        chordType:chordDesc,
        pitch:pitch
    }

}

// console.log(transformChord([0,2,4,7]))
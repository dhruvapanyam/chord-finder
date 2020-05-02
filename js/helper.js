function findClosestNote(x){
    low=0
    high=0
    while(1){
        if((x-low) in notes)
            return [x-low,notes[x-low]]
        
        if((x+high) in notes)
            return [x+high,notes[x+low]]

        low--;
        high++;

        if(low<20 || high>740) break
    }
    return null
}

function rawNote(note){
    if(!note) return note
    return note.substring(0, note.length - 1)
}

function displaySeek(val,id='seek'){
    // console.log('Displaying at',val)
    seekBar = document.getElementById('seekBar')
    mins = Math.floor(val/60);
    secs = (Math.floor(val)%60)

    if(String(secs).length==1) 
        newTime = String(mins) + ':0'+String(secs)
    else
        newTime = String(mins) + ':'+String(secs)

    seek = document.getElementById(id)
    // console.log(seekBar)
    // console.log(newTime)

    if(seek.innerHTML!=newTime){
        seek.innerHTML = newTime
        if(id=='seek') 
            seekBar.value = mins*60 + secs
    }
    return 1
}
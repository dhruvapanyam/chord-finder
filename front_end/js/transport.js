Tone.Transport.scheduleRepeat(function(time){
    displaySeek(Tone.Transport.seconds)
    // console.log(Tone.Transport.seconds)
    // lockBrownie=0
    // COUNT+=1

    // var fft = songPlayerALX.getValue();
    // repeatApp(fft); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

},'0.005')

function toggleSongPlayer(){
    if(INPUT_TYPE == 'mic') return;
    if(Tone.Transport.state == 'started'){
        // console.log('Pausing song player...')
        pauseSongPlayer();
    }
    else{
        // console.log('Playing song player...')
        playSongPlayer();
    }
}

function pauseSongPlayer(){
    Tone.Transport.pause();
    document.getElementById('songPlayerPlayPauseIcon').innerHTML = 'play_arrow'    
}

function playSongPlayer(){
    Tone.Transport.start();
    document.getElementById('songPlayerPlayPauseIcon').innerHTML = 'pause'    
}

function stopSongPlayer(){
    seekTime(0)
    pauseSongPlayer();
}
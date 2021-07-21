# Chord Detector App

### Audio analysis and chord detection

This is an application that lets you analyze live audio through your device mic, or local audio files on your device. The audio player page displays a realtime frequency-domain graph annotated with the notes of the music scale.
An additional feature is the customized piano/harmonizer. You can sample a vocal track by recording at one pitch, and then use the piano to use this recording as the tone.


## How to use

### Installation

```npm install```

### Running the application

```npm start```

### Analysis mode

1. From the homepage, select "Analyse"
2. Switch between the "load" mode, and the "mic" mode by clicking on the large green/grey icons on the 2 bars.
3. To load an audio file, click the main icon. Alternatively, to use pre-loaded sample files, click on the dropdown below it.
4. To use live mic audio, ensure that the site has permission to access your microphone.
5. To tweak the analysis, you can add low-pass and high-pass filters to the audio, change gain, or edit the graph regions using the sliders at the bottom.

### Piano mode

1. Use the key bindings mentioned on the custom piano to play the respective key.
2. To sample your own voice/sound, you will be prompted to record once you click the button on the right.
3. Edit the sample playback options at the bottom.


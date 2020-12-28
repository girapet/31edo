## 31-EDO Keyboard
A musical keyboard with 31 keys per octave

Run it at https://girapet.github.io/31edo

See the [31 Tone Equal Temperament](https://31et.com/) website for details on this tuning

### Features
* Plays piano samples in 12-EDO (the standard western European scale) detuned with the Web Audio API to 31-EDO
* Tuned to A = 440
* Provides two 31-note octaves, scrollable in narrow windows/devices
* Responsive: no lag between playing a key and hearing a tone
* Keys highlight in blue when played/sustained

### Use
* Click the top button to load the piano samples before playing (may take some time on slower connections)
* Click/touch and hold down keys to play
* To sustain notes (emulating a damper pedal)
  * on keyboard devices, hold down the Shift key
  * on touch devices, hold down the Sustain button

### Limitations
* Will work only in later versions of Chrome, Firefox, Edge or Opera
* Play stops abuptly in Firefox ([AudioParam.linearRampToValueAtTime() does not work](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime#Browser_compatibility))

### Sources
* __Piano Samples__ - University of Iowa [Electronic Music Studios](http://theremin.music.uiowa.edu/MISpiano.html)
* __Bravura Font__ - Steinberg Media Technologies GmbH, [Standard Music Font Layout](https://www.smufl.org/)

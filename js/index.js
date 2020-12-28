let context;
let damper = false;

// arrays for the 12-EDO piano samples and their detunings in cents for 31-EDO

const sample = [];
const note = [
  { s:  0, d:   9.6774 }, { s:  0, d: 48.3871 },
  { s:  1, d: -12.9032 }, { s:  1, d: 25.8065 },
  { s:  2, d: -35.4839 }, { s:  2, d:  3.2258 }, { s:  2, d: 41.9355 },
  { s:  3, d: -19.3548 }, { s:  3, d: 19.3548 },
  { s:  4, d: -41.9355 }, { s:  4, d: -3.2258 }, { s:  4, d: 35.4839 },
  { s:  5, d: -25.8065 }, { s:  5, d: 12.9032 },
  { s:  6, d: -48.3871 }, { s:  6, d: -9.6774 }, { s:  6, d: 29.0323 },
  { s:  7, d: -32.2581 }, { s:  7, d:  6.4516 }, { s:  7, d: 45.1613 },
  { s:  8, d: -16.1290 }, { s:  8, d: 22.5806 },
  { s:  9, d: -38.7097 }, { s:  9, d:  0.0000 }, { s:  9, d: 38.7097 },
  { s: 10, d: -22.5806 }, { s: 10, d: 16.1290 },
  { s: 11, d: -45.1613 }, { s: 11, d: -6.4516 }, { s: 11, d: 32.2581 },
  { s: 12, d: -29.0323 }, { s: 12, d:  9.6774 }, { s: 12, d: 48.3871 },
  { s: 13, d: -12.9032 }, { s: 13, d: 25.8065 },
  { s: 14, d: -35.4839 }, { s: 14, d:  3.2258 }, { s: 14, d: 41.9355 },
  { s: 15, d: -19.3548 }, { s: 15, d: 19.3548 },
  { s: 16, d: -41.9355 }, { s: 16, d: -3.2258 }, { s: 16, d: 35.4839 },
  { s: 17, d: -25.8065 }, { s: 17, d: 12.9032 },
  { s: 18, d: -48.3871 }, { s: 18, d: -9.6774 }, { s: 18, d: 29.0323 },
  { s: 19, d: -32.2581 }, { s: 19, d:  6.4516 }, { s: 19, d: 45.1613 },
  { s: 20, d: -16.1290 }, { s: 20, d: 22.5806 },
  { s: 21, d: -38.7097 }, { s: 21, d:  0.0000 }, { s: 21, d: 38.7097 },
  { s: 22, d: -22.5806 }, { s: 22, d: 16.1290 },
  { s: 23, d: -45.1613 }, { s: 23, d: -6.4516 }, { s: 23, d: 32.2581 },
  { s: 24, d: -29.0323 }, { s: 24, d:  9.6774 }
];

// create audio context and load piano samples on user click

const $progress = document.querySelector('#progress');
let loadCount = 0;

const loadSample = (path) => {
  return new Promise((resolve) => {
    fetch(path)
      .then(response => response.arrayBuffer()
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer)
          .then(audioBuffer => {
            $progress.value = loadCount += 1;
            resolve(audioBuffer);
          })
        )
      );
    });
};

const $start = document.querySelector('#start');
const $loading = document.querySelector('#loading');

$start.addEventListener('click', () => {
  if (context) {
    return;
  }

  $start.style.display = 'none';
  $loading.style.display = 'inline';

  context = new AudioContext();
  const loaders = [];

  for (let n = 60; n <= 84; n +=1) {
    loaders.push(loadSample(`samples/Piano.mf.${n}.mp3`).then(audioBuffer => sample[n - 60] = audioBuffer));
  }

  Promise.all(loaders).then(() => {
    $loading.style.display = 'none';
    document.querySelector('#ready').style.display = 'inline';
  });
});

// play and stop playing piano samples by note number

const play = (n) => {
  if (!context) {
    return;
  }

  stop(n, true);

  const sourceNode = context.createBufferSource();
  sourceNode.buffer = sample[note[n].s];
  sourceNode.detune.value = note[n].d;

  const gainNode = context.createGain();
  sourceNode.connect(gainNode);
  sourceNode.addEventListener('ended', () => gainNode.disconnect(context));

  gainNode.connect(context.destination);
  sourceNode.start();

  note[n].playing = { sourceNode, gainNode };
  document.querySelector(`#note${n}`).classList.add('press');
};

const stop = (n, immediate) => {
  if (note[n].playing) {
    const stopping = note[n].playing;
    note[n].playing = null;
  
    if (immediate) {
      stopping.sourceNode.stop();
    }
    else {
      const stopTime = context.currentTime + 0.15;
      stopping.gainNode.gain.linearRampToValueAtTime(0, stopTime);
      stopping.sourceNode.stop(stopTime);
    }

    document.querySelector(`#note${n}`).classList.remove('press');
  }
}

// set keyboard and damper events once the interface is loaded

window.addEventListener('load', () => {

  // detect a touch interface

  const $damperTouch = document.querySelector(`#damper-touch`);
  const isTouch = getComputedStyle($damperTouch).display === 'inline-block';

  // keyboard events

  const keyPress = n => {
    return e => {
      e.stopPropagation();
      play(n);
    }
  };
  
  const keyRelease = n => {
    return e => {
      e.stopPropagation();
  
      if (!damper) {
        stop(n);
      }
    }
  };
  
  const keyPressEvent = isTouch ? 'touchstart' : 'mousedown';
  const keyCancelEvent = isTouch ? 'touchcancel' : 'mouseout';
  const keyReleaseEvent = isTouch ? 'touchend' : 'mouseup';
  
  for (let n = 0; n < note.length; n++) {
    const $note = document.querySelector(`#note${n}`);
    $note.addEventListener(keyPressEvent, keyPress(n));
    $note.addEventListener(keyCancelEvent, keyRelease(n));
    $note.addEventListener(keyReleaseEvent, keyRelease(n));
    $note.addEventListener('contextmenu', e => e.preventDefault());
  }

  // damper events

  const damperRelease = () => {
    damper = false;
    $damperTouch.classList.remove('press');
    
    for (let n = 0; n < note.length; n++) {
      stop(n);
    }
  };

  if (isTouch) {
    $damperTouch.addEventListener('touchstart', () => { 
      damper = true;
      $damperTouch.classList.add('press');
    });
    $damperTouch.addEventListener('touchcancel', damperRelease);
    $damperTouch.addEventListener('touchend', damperRelease);
  }
  else {
    document.addEventListener('keydown', e => {
      if (e.key === 'Shift' && !damper) {
        damper = true;
      }
    });

    document.addEventListener('keyup', e => {
      if (e.key === 'Shift' && damper) {
        damperRelease();
      }
    });
  }
});

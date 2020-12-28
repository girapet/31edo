let context;
let damper = false;
const sample = [];
const note = [];

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
  sourceNode.buffer = sample[n];

  const gainNode = context.createGain();
  sourceNode.connect(gainNode);
  sourceNode.addEventListener('ended', () => gainNode.disconnect(context));

  gainNode.connect(context.destination);
  sourceNode.start();

  note[n] = { sourceNode, gainNode };
  document.querySelector(`#note${n}`).classList.add('press');
};

const stop = (n, immediate) => {
  if (note[n]) {
    const stopping = note[n];
    note[n] = null;
  
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
  
  for (let n = 0; n <= 24; n++) {
    const $note = document.querySelector(`#note${n}`);
    $note.addEventListener(keyPressEvent, keyPress(n));
    $note.addEventListener(keyCancelEvent, keyRelease(n));
    $note.addEventListener(keyReleaseEvent, keyRelease(n));
    $note.addEventListener('contextmenu', e => e.preventDefault());
  }

  // damper events

  const damperRelease = () => {
    damper = false;
    
    for (let n = 0; n <= 24; n++) {
      stop(n);
    }
  };

  if (isTouch) {
    $damperTouch.addEventListener('touchstart', () => { damper = true; });
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

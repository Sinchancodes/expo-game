let leaderboard = JSON.parse(localStorage.getItem('scores')) || [];
const lights = Array.prototype.slice.call(document.querySelectorAll('.light-strip'));
const time = document.querySelector('.time');
const best = document.querySelector('.best span');
let bestTime = Number(localStorage.getItem('best')) || Infinity;
let started = false;
let lightsOutTime = 0;
let raf;
let timeout;
let username;
let spacework = true;


function formatTime(time) {
  time = Math.round(time);
  let outputTime = time / 1000;
  if (time < 10000) {
    outputTime = '0' + outputTime;
  }
  while (outputTime.length < 6) {
    outputTime += '0';
  }
  return outputTime;
}

if (bestTime != Infinity) {
  best.textContent = formatTime(bestTime);
}

function start() {
  for (const light of lights) {
    light.classList.remove('on');
  }

  time.textContent = '00.000';
  time.classList.remove('anim');

  lightsOutTime = 0;
  let lightsOn = 0;
  const lightsStart = performance.now();

  function frame(now) {
    const toLight = Math.floor((now - lightsStart) / 1000) + 1;

    if (toLight > lightsOn) {
      for (const light of lights.slice(0, toLight)) {
        light.classList.add('on');
      }
    }

    if (toLight < 5) {
      raf = requestAnimationFrame(frame);
    }
    else {
      const delay = Math.random() * 4000 + 1000;
      timeout = setTimeout(() => {
        for (const light of lights) {
          light.classList.remove('on');
        }
        lightsOutTime = performance.now();
      }, delay);
    }
  }

  raf = requestAnimationFrame(frame);
}

function appendToLeaderboard(time) {
  username = document.querySelector('.name-input').value;
  const score = {username, score: time}; // here check whether user of same name exists, if so, update score if it is lower than current score
  // if user with same name doesn't exist, then push score to leaderboard
  leaderboard.push(score);
  localStorage.setItem('scores', JSON.stringify(leaderboard));
  // sort and keep only top 15 values 


  renderLeaderboard();
}

function renderLeaderboard() {
  // change html code to use tables instead of divs in leaderboard section then add this portion. 
}

function end(timeStamp) {
  cancelAnimationFrame(raf);
  clearTimeout(timeout);

  if (!lightsOutTime) {
    time.textContent = "Jump start!";
    time.classList.add('anim');
    return;
  } 
  else {
    const thisTime = timeStamp - lightsOutTime;
    time.textContent = formatTime(thisTime);
    appendToLeaderboard(formatTime(thisTime));

    if (thisTime < bestTime) {
      bestTime = thisTime;
      best.textContent = time.textContent;
      localStorage.setItem('best', thisTime);          
    }

    time.classList.add('anim');
  }
}



function tap(event) {
  username = document.querySelector('.name-input').value;

  if (!username) {
    time.textContent = "Enter name!"
    time.classList.add('anim');
    return;
  }


  let timeStamp = performance.now();
  if (!started && event.target && event.target.closest && event.target.closest('a')) return;
  event.preventDefault();

  if (started) {
    started = false;
    end(timeStamp);
  }
  else {
    started = true;
    start();
  }
}

document.querySelector('.game-area').addEventListener('touchstart', event => {
    tap(event);
    spacework = true;
}, {passive: false});

document.querySelector('.game-area').addEventListener('mousedown', event => {
  if (event.button === 0) tap(event);
  spacework = true;
}, {passive: false});

addEventListener('keydown', event => {
   if (event.key == ' ' && spacework) tap(event);},{passive: false});

document.querySelector('.name-input').addEventListener('focus', () => {
  spacework = false;
});

document.querySelector('.name-input').addEventListener('blur', () => {
  spacework = true;
});


if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-item').forEach(item => {
    const video = item.querySelector('video');
    const overlay = item.querySelector('.play-overlay');

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    if (overlay) overlay.style.pointerEvents = 'none';

    const togglePlay = async () => {
      try {
        if (video.paused) {
          await video.play();
          item.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
        } else {
          video.pause();
          item.classList.remove('playing');
          if (overlay) overlay.style.opacity = 1;
        }
      } catch (err) {
        console.warn('Play failed, muting and retrying:', err);
        try {
          video.muted = true;
          await video.play();
          item.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
        } catch (err2) {
          console.error('Still failed to play:', err2);
        }
      }
    };

    item.addEventListener('click', (e) => {
      togglePlay();
    });

    video.addEventListener('play', () => {
      item.classList.add('playing');
      if (overlay) overlay.style.opacity = 0;
    });
    video.addEventListener('pause', () => {
      item.classList.remove('playing');
      if (overlay) overlay.style.opacity = 1;
    });

    video.addEventListener('play', () => {
      document.querySelectorAll('.video-item video').forEach(v => {
        if (v !== video && !v.paused) v.pause();
      });
    });
    item.addEventListener('touchstart', () => {

    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('.video-item video');

  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;

    const item = video.closest('.video-item');

    item.addEventListener('mouseenter', async () => {
      try {
        await video.play();
        item.classList.add('playing');
      } catch (err) {
        console.warn('Autoplay blocked:', err);
      }
    });

    item.addEventListener('mouseleave', () => {
      video.pause();
      item.classList.remove('playing');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const videoItems = document.querySelectorAll('.video-item');
  let soundAllowed = false;

  document.body.addEventListener('click', () => {
    soundAllowed = true;
  }, { once: true });

  videoItems.forEach(item => {
    const video = item.querySelector('video');

    item.addEventListener('mouseenter', async () => {
      try {
        if (soundAllowed) video.muted = false;
        else video.muted = true; 

        video.playsInline = true;
        await video.play();
        item.classList.add('playing');
      } catch (err) {
        console.warn('Autoplay blocked:', err);
      }
    });

    item.addEventListener('mouseleave', () => {
      video.pause();
      item.classList.remove('playing');
    });
  });
});

document.querySelectorAll('.flower-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

const heart = document.querySelector('.cursor-heart');

document.addEventListener('mousemove', e => {
    heart.style.top = `${e.clientY}px`;
    heart.style.left = `${e.clientX}px`;
});


document.querySelectorAll('video').forEach(video => {
    video.addEventListener('mouseenter', () => {
        video.muted = false;
        video.play();
    });
    video.addEventListener('mouseleave', () => {
        video.pause();
        video.muted = true;
    });
});


(() => {
  const heart = document.querySelector('.cursor-heart');
  if (!heart) return;

  let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let pos  = { x: mouse.x, y: mouse.y };
  const ease = 0.18;          

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    spawnTrail(e.clientX, e.clientY);
  });

  function animate() {
    pos.x += (mouse.x - pos.x) * ease;
    pos.y += (mouse.y - pos.y) * ease;

    heart.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  animate();

  const heartSVG = () => {
    const el = document.createElement('div');
    el.className = 'trail-heart';
    el.style.width  = '16px';
    el.style.height = '16px';
    el.style.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23ff66b2' d='M12 21s-8-6.4-8-10a4 4 0 018-2.9A4 4 0 0120 11c0 3.6-8 10-8 10z'/></svg>")`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = 'contain';
    return el;
  };

  let trailThrottle = 0;
  function spawnTrail(x, y) {
    trailThrottle++;
    if (trailThrottle % 2 !== 0) return;
    const t = heartSVG();
    t.style.left = `${x}px`;
    t.style.top  = `${y}px`;
    t.style.transform = `translate(-50%, -50%) rotate(${(Math.random()*40-20)}deg)`;
    t.style.opacity = 1;
    document.body.appendChild(t);
    // cleanup after animation ends
    setTimeout(() => t.remove(), 1000);
  }
})();

(() => {
  const magnets = document.querySelectorAll('.magnetic');
  magnets.forEach(el => {
    el.style.transform = 'translate3d(0,0,0)';
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const cx = rect.width/2;
      const cy = rect.height/2;
      const moveX = (relX - cx) / cx; 
      const moveY = (relY - cy) / cy;
      const strength = Math.min(18, Math.max(6, Math.min(rect.width, rect.height) / 12)); // adaptive
      el.style.transform = `translate3d(${moveX * strength}px, ${moveY * strength}px, 0) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate3d(0,0,0) scale(1)';
    });
  });
})();


const music = document.getElementById('bg-music');
const control = document.getElementById('music-control');
let isPlaying = false;

function fadeAudio(targetVolume, duration) {
    if (!music) return;
    const step = (targetVolume - music.volume) / (duration / 100);
    const fade = setInterval(() => {
        music.volume += step;
        if ((step > 0 && music.volume >= targetVolume) || (step < 0 && music.volume <= targetVolume)) {
            clearInterval(fade);
            music.volume = targetVolume;
        }
    }, 100);
}

if (control) {
  control.addEventListener('click', () => {
      if (!isPlaying) {
          music.play();
          fadeAudio(0.5, 2000); 
          control.innerHTML = '<i class="fas fa-pause"></i>';
          isPlaying = true;
      } else {
          fadeAudio(0, 1000);
          setTimeout(() => music.pause(), 1000);
          control.innerHTML = '<i class="fas fa-music"></i>';
          isPlaying = false;
      }
  });
} else {
}

if (music) music.volume = 0;


function detectTouchAndHideCursor() {
  const heart = document.querySelector('.cursor-heart');
  if (!heart) return;
  function enableTouch() {
    heart.style.display = 'none';
    document.removeEventListener('touchstart', enableTouch);
  }
  document.addEventListener('touchstart', enableTouch, { once: true });
}
detectTouchAndHideCursor();

function updateMusicBtnForViewport() {
  const btn = document.getElementById('music-control');
  if (!btn) return;
  const w = window.innerWidth;
  if (w <= 768) {
    btn.style.right = 'auto';
    btn.style.left  = '50%';
    btn.style.transform = 'translateX(-50%)';
  } else {
    btn.style.left = 'auto';
    btn.style.right = '';
    btn.style.transform = '';
  }
}
window.addEventListener('resize', updateMusicBtnForViewport);
updateMusicBtnForViewport();

const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}



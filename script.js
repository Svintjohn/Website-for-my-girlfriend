document.addEventListener('DOMContentLoaded', () => {


  (function ensureCursorHeart() {
    if (!document.querySelector('.cursor-heart')) {
      const el = document.createElement('div');
      el.className = 'cursor-heart';
      document.body.appendChild(el);
    }
  })();


  let soundAllowed = false;

  const grantSoundPermission = (ev) => {
    if (soundAllowed) return;
    soundAllowed = true;

    document.querySelectorAll('.video-item.playing video').forEach(v => {
      try { v.muted = false; v.volume = 0.85; } catch(e) {}
    });

    const bg = document.getElementById('bg-music');
    if (bg && bg.paused === false) {
      try { bg.muted = false; } catch(e) {}
    }

    document.removeEventListener('click', onFirstGesture);
    document.removeEventListener('touchstart', onFirstGesture);
    document.removeEventListener('keydown', onFirstKey);

    document.querySelectorAll('.enable-sound-hint').forEach(h => h.remove());
    const btn = document.getElementById('enable-sound-btn');
    if (btn) btn.remove();
  };

  const onFirstGesture = (e) => { grantSoundPermission(e); };
  const onFirstKey = (e) => { if (e.key === ' ' || e.key === 'Enter') grantSoundPermission(e); };

  document.addEventListener('click', onFirstGesture, { once: true });
  document.addEventListener('touchstart', onFirstGesture, { once: true });
  document.addEventListener('keydown', onFirstKey, { once: true });

  (function maybeShowEnableSoundButton() {
    if (document.getElementById('enable-sound-btn')) return;
    if ('ontouchstart' in window || window.innerWidth <= 820) {
      const btn = document.createElement('button');
      btn.id = 'enable-sound-btn';
      btn.setAttribute('aria-label', 'Enable sound for videos and music');
      btn.style.position = 'fixed';
      btn.style.bottom = '92px';
      btn.style.left = '50%';
      btn.style.transform = 'translateX(-50%)';
      btn.style.zIndex = 1400;
      btn.style.padding = '10px 14px';
      btn.style.fontSize = '14px';
      btn.style.borderRadius = '999px';
      btn.style.border = 'none';
      btn.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
      btn.style.background = 'linear-gradient(90deg,#ff6b9d,#ffb3ba)';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.textContent = 'Enable Sound ▶';
      btn.addEventListener('click', (e) => {
        grantSoundPermission(e);
        btn.remove();
      });
      document.body.appendChild(btn);
    }
  })();


  const allVideoElems = Array.from(document.querySelectorAll('.video-item video'));
  allVideoElems.forEach(v => {
    try {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.volume = 0.85;
      v.controls = false;
    } catch (e) {}
  });

  function pauseOtherVideos(activeVideo) {
    allVideoElems.forEach(v => {
      if (v !== activeVideo && !v.paused) {
        try { v.pause(); } catch(e) {}
        const parent = v.closest('.video-item');
        if (parent) parent.classList.remove('playing');
      }
    });
  }


  document.querySelectorAll('.video-item').forEach(item => {
    const video = item.querySelector('video');
    const overlay = item.querySelector('.play-overlay');

    if (!video) return;

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.volume = 0.85;

    function showEnableHint(itemRef) {
      clearEnableHint(itemRef);
      const hint = document.createElement('button');
      hint.className = 'enable-sound-hint';
      hint.type = 'button';
      hint.innerText = 'Enable sound';
      hint.title = 'Click to enable sound for videos';
      const rect = itemRef.getBoundingClientRect();
      hint.style.position = 'fixed';
      hint.style.left = `${rect.left + rect.width/2}px`;
      hint.style.top = `${Math.max(40, rect.top + 14)}px`;
      hint.style.transform = 'translateX(-50%)';
      hint.style.zIndex = 2500;
      document.body.appendChild(hint);

      hint.addEventListener('click', async (e) => {
        const v = itemRef.querySelector('video');
        if (!v) return;
        try {
          grantSoundPermission(e);
          v.muted = false;
          await v.play();
          itemRef.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
          clearEnableHint(itemRef);
        } catch (err) {
          try { v.muted = true; await v.play(); itemRef.classList.add('playing'); } catch(e) {}
        }
      });

      itemRef.__enableHint = hint;
      setTimeout(() => clearEnableHint(itemRef), 4500);
    }

    function clearEnableHint(itemRef) {
      if (itemRef && itemRef.__enableHint) {
        try { itemRef.__enableHint.remove(); } catch(e) {}
        itemRef.__enableHint = null;
      }
    }

    item.addEventListener('mouseenter', async (e) => {
      pauseOtherVideos(video);

      try {
        if (soundAllowed) {
          video.muted = false;
          await video.play();
          item.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
          clearEnableHint(item);
          return;
        }

        video.muted = false;
        await video.play();
        item.classList.add('playing');
        if (overlay) overlay.style.opacity = 0;
        grantSoundPermission(e);
        clearEnableHint(item);
      } catch (err) {
        try {
          video.muted = true;
          await video.play();
          item.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
        } catch (err2) {
        }
        showEnableHint(item);
      }
    });

    item.addEventListener('mouseleave', () => {
      if (!item.dataset.clicked || item.dataset.clicked === 'false') {
        try { video.pause(); } catch(e) {}
        item.classList.remove('playing');
        if (overlay) overlay.style.opacity = 1;
      }
    });

    item.addEventListener('click', async (e) => {
      item.dataset.clicked = item.dataset.clicked === 'true' ? 'false' : 'true';
      try {
        if (video.paused) {
          grantSoundPermission(e);
          video.muted = false;
          pauseOtherVideos(video);
          await video.play();
          item.classList.add('playing');
          if (overlay) overlay.style.opacity = 0;
          if (item.__enableHint) clearEnableHint(item);
        } else {
          video.pause();
          item.classList.remove('playing');
          if (overlay) overlay.style.opacity = 1;
        }
      } catch (err) {
        try { video.muted = true; await video.play(); item.classList.add('playing'); } catch(e) {}
      }
    });

    if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });

    video.addEventListener('play', () => {
      pauseOtherVideos(video);
      item.classList.add('playing');
      if (overlay) overlay.style.opacity = 0;
    });
    video.addEventListener('pause', () => {
      item.classList.remove('playing');
      if (overlay) overlay.style.opacity = 1;
      try { video.muted = true; } catch(e) {} 
    });
  });


  document.querySelectorAll('.flower-card').forEach(card => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  /* Cursor heart & trail */
  (function cursorAndTrail() {
    const heart = document.querySelector('.cursor-heart');
    if (!heart) return;

    let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
    let pos  = { x: mouse.x, y: mouse.y };
    const ease = 0.18;
    let trailThrottle = 0;

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      spawnTrail(e.clientX, e.clientY);
    });

    function animate() {
      pos.x += (mouse.x - pos.x) * ease;
      pos.y += (mouse.y - pos.y) * ease;
      heart.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(45deg)`;
      requestAnimationFrame(animate);
    }
    animate();

    function heartSVG() {
      const el = document.createElement('div');
      el.className = 'trail-heart';
      el.style.width  = '14px';
      el.style.height = '14px';
      el.style.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23ff66b2' d='M12 21s-8-6.4-8-10a4 4 0 018-2.9A4 4 0 0120 11c0 3.6-8 10-8 10z'/></svg>")`;
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundSize = 'contain';
      el.style.position = 'fixed';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 9998;
      return el;
    }

    function spawnTrail(x, y) {
      trailThrottle++;
      if (trailThrottle % 2 !== 0) return;
      const t = heartSVG();
      t.style.left = `${x}px`;
      t.style.top  = `${y}px`;
      t.style.transform = `translate(-50%,-50%) rotate(${(Math.random()*40-20)}deg)`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 1000);
    }

    function hideOnTouch() {
      heart.style.display = 'none';
      document.removeEventListener('touchstart', hideOnTouch);
    }
    document.addEventListener('touchstart', hideOnTouch, { once: true });
  })();

  /* Magnetic micro-interactions */
  (function magnetic() {
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
        const strength = Math.min(18, Math.max(6, Math.min(rect.width, rect.height) / 12));
        el.style.transform = `translate3d(${moveX * strength}px, ${moveY * strength}px, 0) scale(1.02)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = 'translate3d(0,0,0) scale(1)');
    });
  })();

  /*  Background music control */
  const music = document.getElementById('bg-music');
  const control = document.getElementById('music-control');
  let musicPlaying = false;
  if (music) music.volume = 0;

  function fadeAudio(targetVolume, duration = 600) {
    if (!music) return;
    const steps = Math.max(6, Math.floor(duration / 100));
    const step = (targetVolume - music.volume) / steps;
    let i = 0;
    const t = setInterval(() => {
      i++;
      music.volume = Math.min(1, Math.max(0, music.volume + step));
      if (i >= steps) { clearInterval(t); music.volume = targetVolume; }
    }, duration/steps);
  }

  if (control) {
    control.addEventListener('click', async (e) => {
      grantSoundPermission(e);

      if (!music) return;
      if (!musicPlaying) {
        try { await music.play(); } catch(e) {}
        fadeAudio(0.45, 700);
        control.setAttribute('aria-pressed', 'true');
        control.innerHTML = '<i class="fas fa-pause"></i>';
        musicPlaying = true;
      } else {
        fadeAudio(0, 500);
        setTimeout(() => music.pause(), 520);
        control.setAttribute('aria-pressed', 'false');
        control.innerHTML = '<i class="fas fa-music"></i>';
        musicPlaying = false;
      }
    });
  }


  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  const openNav = () => {
    if (!nav) return;
    nav.classList.add('active');
    if (hamburger) hamburger.classList.add('active');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      if (nav.classList.contains('active')) closeNav(); else openNav();
    });

    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => setTimeout(() => closeNav(), 220));
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 420 && nav.classList.contains('active')) {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) closeNav();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) closeNav();
    });
  }


  const cleanupEnableSoundBtn = () => {
    const b = document.getElementById('enable-sound-btn');
    if (b) b.remove();
  };
  ['click','touchstart','keydown'].forEach(ev => document.addEventListener(ev, () => {
    if (soundAllowed) cleanupEnableSoundBtn();
  }));

});

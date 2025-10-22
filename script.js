
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.video-item').forEach(item => {
      const video = item.querySelector('video');
      const overlay = item.querySelector('.play-overlay');

      // Improve mobile/iOS behavior
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');

      // Ensure overlay doesn't block pointer events (so clicks reach video/card)
      if (overlay) overlay.style.pointerEvents = 'none';

      // click or tap the card to toggle play/pause
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
          // If play() fails (autoplay policy), try muting and retrying (only on user gesture)
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

      // Clicking the whole item toggles playback
      item.addEventListener('click', (e) => {
        // if you want the overlay to receive clicks, remove overlay.pointerEvents = 'none' above.
        togglePlay();
      });

      // Also keep visual state in sync with actual playback
      video.addEventListener('play', () => {
        item.classList.add('playing');
        if (overlay) overlay.style.opacity = 0;
      });
      video.addEventListener('pause', () => {
        item.classList.remove('playing');
        if (overlay) overlay.style.opacity = 1;
      });

      // optional: pause other videos when one plays
      video.addEventListener('play', () => {
        document.querySelectorAll('.video-item video').forEach(v => {
          if (v !== video && !v.paused) v.pause();
        });
      });

      // mobile: allow tapping to start (some platforms require touchstart)
      item.addEventListener('touchstart', () => {
        // don't auto-play on touchstart — leave as toggle on click, but keep this
        // in case you want to do something special on touch.
      });
    });
    }); 

  document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('.video-item video');

    videos.forEach(video => {
      // make sure it can play inline and silently
      video.muted = true;
      video.playsInline = true;

      const item = video.closest('.video-item');

      // play video on hover
      item.addEventListener('mouseenter', async () => {
        try {
          await video.play();
          item.classList.add('playing');
        } catch (err) {
          console.warn('Autoplay blocked:', err);
        }
      });

      // pause when hover ends
      item.addEventListener('mouseleave', () => {
        video.pause();
        item.classList.remove('playing');
      });
    });
  });


  document.addEventListener('DOMContentLoaded', () => {
    const videoItems = document.querySelectorAll('.video-item');
    let soundAllowed = false;

    // Enable sound once user interacts
    document.body.addEventListener('click', () => {
      soundAllowed = true;
    }, { once: true });

    videoItems.forEach(item => {
      const video = item.querySelector('video');

      // Play video on hover
      item.addEventListener('mouseenter', async () => {
        try {
          if (soundAllowed) video.muted = false;
          else video.muted = true; // muted until user interacts

          video.playsInline = true;
          await video.play();
          item.classList.add('playing');
        } catch (err) {
          console.warn('Autoplay blocked:', err);
        }
      });

      // Pause video when hover ends
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

// Heart cursor follow
const heart = document.querySelector('.cursor-heart');

document.addEventListener('mousemove', e => {
    heart.style.top = `${e.clientY}px`;
    heart.style.left = `${e.clientX}px`;
});

// Hover videos to play with sound
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



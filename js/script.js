/**
 * ============================================================================
 * PORTFOLIO - DATA ENGINEER DASHBOARD & HANGING ID CARD ENGINE
 * Physics, 3D Tilt, Audio Synthesis, Trino Query Runner & Dashboard Dock
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ELEMENT REFERENCES ---
  const lanyardRig = document.getElementById('lanyardRig');
  const idCardWrapper = document.getElementById('idCardWrapper');
  const idCard = document.getElementById('idCard');
  const flipCardBtn = document.getElementById('flipCardBtn');
  const holoShimmer = document.getElementById('holoShimmer');
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const certModal = document.getElementById('certModal');
  const skillTabs = document.querySelectorAll('#skillTabs .tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const navItems = document.querySelectorAll('.nav-item');
  const dockLinks = document.querySelectorAll('.dock-link');

  // --- 2. SYNTHESIZED SOUND EFFECTS (WEB AUDIO API) ---
  let soundEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.12, volume = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio effect failed', e);
    }
  }

  // Futuristic SFX presets
  const sfx = {
    beep: () => playTone(880, 'sine', 0.08, 0.04),
    click: () => playTone(600, 'triangle', 0.05, 0.06),
    query: () => {
      playTone(400, 'sine', 0.05, 0.05);
      setTimeout(() => playTone(750, 'triangle', 0.08, 0.06), 60);
      setTimeout(() => playTone(1200, 'sine', 0.12, 0.05), 130);
    },
    flip: () => {
      playTone(440, 'triangle', 0.1, 0.08);
      setTimeout(() => playTone(660, 'sine', 0.15, 0.07), 80);
    },
    success: () => {
      playTone(523.25, 'sine', 0.1, 0.06);
      setTimeout(() => playTone(659.25, 'sine', 0.12, 0.06), 90);
      setTimeout(() => playTone(783.99, 'sine', 0.2, 0.08), 180);
    }
  };

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundToggle.classList.add('sound-on');
        soundIcon.className = 'fa-solid fa-volume-high';
        sfx.beep();
      } else {
        soundToggle.classList.remove('sound-on');
        soundIcon.className = 'fa-solid fa-volume-xmark';
      }
    });
  }

  // --- 3. LANYARD & ID CARD PHYSICAL SWAY & 3D TILT ---
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  // Window mouse move listener for realistic pendulum physics
  window.addEventListener('mousemove', (e) => {
    if (isDragging) return;

    // Normalised coordinate relative to viewport center (-1 to +1)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (e.clientX - centerX) / centerX;
    const deltaY = (e.clientY - centerY) / centerY;

    // Check if mouse is near hero
    if (window.scrollY < window.innerHeight) {
      // Calculate gentle physics swing
      const swingAngle = deltaX * 4.5;
      const tiltY = deltaX * 8;

      if (lanyardRig) {
        lanyardRig.style.transform = `rotateZ(${swingAngle}deg) rotateY(${tiltY * 0.4}deg)`;
      }

      // Holographic shimmer position update
      if (holoShimmer) {
        const mouseCardX = (e.clientX / window.innerWidth) * 100;
        const mouseCardY = (e.clientY / window.innerHeight) * 100;
        holoShimmer.style.backgroundPosition = `${mouseCardX}% ${mouseCardY}%`;
      }
    }
  });

  // Dragging the ID Card
  if (lanyardRig) {
    lanyardRig.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
      isDragging = true;
      startX = e.clientX;
      lanyardRig.style.animation = 'none';
      lanyardRig.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX;
      const diffX = currentX - startX;
      const maxDrag = 150;
      const clampedX = Math.max(-maxDrag, Math.min(maxDrag, diffX));
      const dragAngle = (clampedX / maxDrag) * 15;
      lanyardRig.style.transform = `translateX(${clampedX * 0.4}px) rotateZ(${dragAngle}deg)`;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      lanyardRig.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      lanyardRig.style.transform = 'translateX(0px) rotateZ(0deg)';
      sfx.beep();
      setTimeout(() => {
        lanyardRig.style.animation = 'gentleIdleSway 7s ease-in-out infinite alternate';
      }, 800);
    });

    // Touch support for mobile dragging
    lanyardRig.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        lanyardRig.style.animation = 'none';
        lanyardRig.style.transition = 'none';
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touchX = e.touches[0].clientX;
      const diffX = touchX - startX;
      const clampedX = Math.max(-100, Math.min(100, diffX));
      lanyardRig.style.transform = `translateX(${clampedX * 0.3}px) rotateZ(${(clampedX / 100) * 12}deg)`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      lanyardRig.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
      lanyardRig.style.transform = 'translateX(0px) rotateZ(0deg)';
      setTimeout(() => {
        lanyardRig.style.animation = 'gentleIdleSway 7s ease-in-out infinite alternate';
      }, 700);
    });
  }

  // --- 4. FLIP CARD FUNCTIONALITY ---
  window.flipCard = function() {
    if (idCard) {
      idCard.classList.toggle('flipped');
      sfx.flip();
    }
  };

  if (flipCardBtn) {
    flipCardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.flipCard();
    });
  }

  // --- 5. SMOOTH SCROLL HELPER ---
  window.scrollToSection = function(sectionId) {
    sfx.click();
    const target = document.getElementById(sectionId);
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- 6. SKILL CATEGORY FILTERING ---
  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.click();
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCategory = tab.getAttribute('data-category');

      skillCards.forEach(card => {
        const cardCategory = card.getAttribute('data-cat');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // --- 7. CERTIFICATE VERIFICATION MODAL ---
  window.openCertModal = function(title, issuer, id, validity, desc) {
    sfx.beep();
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalIssuer').textContent = issuer;
    document.getElementById('modalId').textContent = 'AUTH_ID: ' + id;
    document.getElementById('modalValidity').textContent = validity;
    document.getElementById('modalDesc').textContent = desc;

    if (certModal) {
      certModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCertModal = function() {
    sfx.click();
    if (certModal) {
      certModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Close modal on backdrop click or Escape key
  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {
        window.closeCertModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal && certModal.classList.contains('active')) {
      window.closeCertModal();
    }
  });

  // --- 8. INTERACTIVE SQL QUERY RUNNER ---
  window.executeMockQuery = function() {
    const runBtn = document.getElementById('runSqlBtn');
    const tableRow = document.querySelector('#sqlResultTable tbody tr');
    const queryStatusBar = document.querySelector('.query-status-bar');

    if (!runBtn) return;

    sfx.query();
    runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> EXECUTING...';
    runBtn.style.opacity = '0.7';

    setTimeout(() => {
      sfx.success();
      const executionTime = Math.floor(Math.random() * 8 + 8); // 8-16ms
      runBtn.innerHTML = '<i class="fa-solid fa-play"></i> RUN QUERY';
      runBtn.style.opacity = '1';

      if (queryStatusBar) {
        queryStatusBar.innerHTML = `
          <span class="q-stat"><i class="fa-solid fa-circle-check"></i> Query Status: OK (200)</span>
          <span class="q-stat">Execution time: ${executionTime}ms</span>
          <span class="q-stat">Rows returned: 1</span>
        `;
      }

      if (tableRow) {
        tableRow.style.backgroundColor = 'rgba(0, 240, 255, 0.25)';
        tableRow.style.transition = 'background-color 0.8s ease';
        setTimeout(() => {
          tableRow.style.backgroundColor = 'transparent';
        }, 600);
      }
    }, 400);
  };

  // --- 9. ACTIVE NAVIGATION DOCK & HEADER LINK SPY ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        // Update header links
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });

        // Update dashboard dock links
        dockLinks.forEach(dock => {
          dock.classList.remove('active');
          if (dock.getAttribute('href') === `#${id}`) {
            dock.classList.add('active');
          }
        });
      }
    });
  });

  // --- 10. CONTACT FORM SUBMISSION ---
  window.handleFormSubmit = function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccessMsg');

    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';
    submitBtn.disabled = true;

    setTimeout(() => {
      sfx.success();
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      if (successMsg) {
        successMsg.style.display = 'flex';
      }
      document.getElementById('contactForm').reset();

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        submitBtn.disabled = false;
      }, 3500);
    }, 1000);
  };

  // Add click sound to interactive buttons
  document.querySelectorAll('.btn, .pill-btn, .nav-item, .dock-link, .social-chip').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playTone(1200, 'sine', 0.03, 0.02);
    });
  });

});

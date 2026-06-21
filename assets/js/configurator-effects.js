window.AcerolaConfiguratorEffects = {
  initParticleEngine(root, state) {
    const canvas = root?.querySelector('.configurator-snow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    let width = 0;
    let height = 0;

    const resetParticle = (override = {}) => {
      const theme = state.theme;
      const p = {
        x: Math.random() * width,
        y: theme === 'campfire' ? height + 10 : -10,
        r: Math.random() * 1.6 + 0.6,
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.8 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        decay: Math.random() * 0.002 + 0.001,
        color: ''
      };

      if (theme === 'campfire') {
        p.vy = -(Math.random() * 1.4 + 0.6);
        p.vx = Math.random() * 0.8 - 0.4;
        p.r = Math.random() * 2.2 + 0.8;
        p.color = `rgba(255, ${Math.floor(Math.random() * 100 + 100)}, 0, ${p.alpha})`;
      } else if (theme === 'ice') {
        p.x = Math.random() * (width * 1.2) - (width * 0.2);
        p.vx = Math.random() * 1.5 + 0.5;
        p.vy = Math.random() * 0.6 + 0.2;
        p.color = `rgba(160, 230, 255, ${p.alpha})`;
      } else {
        p.color = `rgba(0, 242, 254, ${p.alpha})`;
      }

      return Object.assign(p, override);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles.length = 0;
      const count = window.innerWidth < 768 ? 30 : 65;
      for (let i = 0; i < count; i += 1) {
        particles.push(resetParticle({ y: Math.random() * height }));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const theme = state.theme;

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        let shouldReset = false;

        if (theme === 'campfire') {
          p.alpha -= p.decay;
          p.color = `rgba(255, ${Math.floor(Math.random() * 80 + 110)}, 0, ${Math.max(0, p.alpha)})`;
          shouldReset = p.y < -10 || p.alpha <= 0 || p.x < -10 || p.x > width + 10;
        } else if (theme === 'ice') {
          shouldReset = p.y > height + 10 || p.x > width + 10;
        } else {
          p.x += Math.sin(p.y * 0.015 + p.phase) * 0.2;
          shouldReset = p.y > height + 10 || p.x < -10 || p.x > width + 10;
        }

        if (shouldReset) {
          particles[index] = resetParticle();
          return;
        }

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
  },

  initStickyBarObserver() {
    const stickyBar = document.querySelector('[data-config-sticky-bar]');
    const resultCard = document.querySelector('.result-card');
    if (!stickyBar || !resultCard) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    observer.observe(resultCard);
  },

  initModalEvents() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };

    modal.querySelector('.config-modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('[data-modal-close-btn]')?.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });
  }
};

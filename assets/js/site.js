window.AcerolaLeads = (() => {
  const endpoint = '/api/telegram-lead';

  const page = () => ({
    title: document.title,
    url: window.location.href,
    path: window.location.pathname
  });

  const valuesFromForm = form => {
    const values = Object.fromEntries(new FormData(form).entries());
    const inputs = [...form.querySelectorAll('input')];
    const selects = [...form.querySelectorAll('select')];
    const textareas = [...form.querySelectorAll('textarea')];

    if (!values.name) {
      values.name = form.querySelector('input[name="name"]')?.value
        || inputs[0]?.value
        || '';
    }

    if (!values.contact) {
      values.contact = form.querySelector('input[name="contact"]')?.value
        || inputs[1]?.value
        || '';
    }

    if (!values.direction) {
      values.direction = selects[0]?.value || '';
    }

    if (!values.message) {
      values.message = textareas[0]?.value || '';
    }

    return values;
  };

  const send = async payload => {
    const body = {
      ...payload,
      page: payload.page || page(),
      submittedAt: new Date().toISOString()
    };

    if (window.location.protocol === 'file:') {
      console.info('Telegram lead payload is ready. Deploy to Vercel to send it through /api/telegram-lead.', body);
      return { ok: true, skipped: true };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Не удалось отправить заявку.');
    }

    return result;
  };

  return {
    endpoint,
    page,
    valuesFromForm,
    send
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-enabled');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  const bindLeadForms = () => {
    document.querySelectorAll('form.lead-form').forEach(form => {
      if (form.dataset.leadBound === 'true') return;
      form.dataset.leadBound = 'true';

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton?.textContent || '';
      const status = document.createElement('small');
      status.className = 'lead-form-status';
      status.setAttribute('aria-live', 'polite');
      form.appendChild(status);

      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = window.AcerolaLeads.valuesFromForm(form);
        status.textContent = 'Отправляем заявку...';
        status.classList.remove('is-error', 'is-success');
        submitButton?.setAttribute('disabled', 'disabled');
        if (submitButton) submitButton.textContent = 'Отправляем...';

        try {
          await window.AcerolaLeads.send({
            source: 'contact_form',
            form: formData
          });
          status.textContent = 'Заявка отправлена. Мы скоро свяжемся с вами.';
          status.classList.add('is-success');
          form.reset();
        } catch (error) {
          status.textContent = error.message || 'Не удалось отправить заявку. Попробуйте еще раз.';
          status.classList.add('is-error');
        } finally {
          submitButton?.removeAttribute('disabled');
          if (submitButton) submitButton.textContent = originalButtonText;
        }
      });
    });
  };

  bindLeadForms();

  if (typeof enhanceExpeditionDetailPage === 'function') enhanceExpeditionDetailPage();

  const headers = document.querySelectorAll('.site-header');
  const mobileCta = document.querySelector('.mobile-cta');
  const syncHeaderState = () => {
    headers.forEach(header => header.classList.toggle('is-scrolled', window.scrollY > 120));
    if (mobileCta) {
      mobileCta.classList.toggle('is-visible', window.scrollY > window.innerHeight * .7);
    }
  };
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });

  document.querySelectorAll('.menu-toggle').forEach(btn => {
    const header = btn.closest('.site-header');
    const nav = header?.querySelector('.main-nav');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const isOpen = nav?.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', Boolean(isOpen));
      btn.setAttribute('aria-expanded', String(Boolean(isOpen)));
    });

    nav?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  const revealTargets = [
    ...document.querySelectorAll('[data-reveal]'),
    ...document.querySelectorAll('.exp-card')
  ];
  document.querySelectorAll('.exp-card').forEach((card, index) => {
    card.classList.add('reveal-stagger');
    card.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-q').forEach(q => {
    const item = q.closest('.faq-item');
    q.setAttribute('aria-expanded', String(item?.classList.contains('is-open')));

    q.addEventListener('click', () => {
      item?.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(item?.classList.contains('is-open')));
    });
  });

  document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    const group = chip.dataset.group;
    document.querySelectorAll(`.chip[data-group="${group}"]`).forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');

    const active = {};
    document.querySelectorAll('.chip.is-active').forEach(c => {
      active[c.dataset.group] = c.dataset.value;
    });

    document.querySelectorAll('.exp-card').forEach(card => {
      const okType = !active.type || active.type === 'all' || card.dataset.type === active.type;
      const okPlace = !active.place || active.place === 'all' || card.dataset.place === active.place;
      card.classList.toggle('is-hidden', !(okType && okPlace));
    });
  }));

  const initExpeditionVariantSwitches = () => {
    document.querySelectorAll('[data-variant-switch]').forEach(switcher => {
      const card = switcher.closest('.editorial-dossier-row');
      if (!card) return;

      const options = [...switcher.querySelectorAll('[data-variant-option]')];
      const setField = (name, value) => {
        const el = card.querySelector(`[data-variant-field="${name}"]`);
        if (!el || !value) return;

        if (name === 'link') {
          el.setAttribute('href', value);
          return;
        }

        el.textContent = value;
      };

      const applyVariant = option => {
        options.forEach(btn => {
          const active = btn === option;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });

        setField('title', option.dataset.title);
        setField('desc', option.dataset.desc);
        setField('duration', option.dataset.duration);
        setField('group', option.dataset.group);
        setField('budget', option.dataset.budget);
        setField('link', option.dataset.link);

        const image = card.querySelector('.editorial-main-img');
        if (image && option.dataset.image && image.getAttribute('src') !== option.dataset.image) {
          image.classList.add('fade-out');
          window.setTimeout(() => {
            image.setAttribute('src', option.dataset.image);
            image.classList.remove('fade-out');
          }, 180);
        }
      };

      options.forEach(option => {
        option.setAttribute('aria-pressed', String(option.classList.contains('is-active')));
        option.addEventListener('click', () => applyVariant(option));
      });
    });
  };

  initExpeditionVariantSwitches();

  const regionData = {
    ural: ['Северный Урал', 'Снегоходные маршруты, перевалы, тайга и легендарные точки: Манарага, Народная, Перевал Дятлова, Маньпупунёр.', 'декабрь — март', '3–5/5'],
    arctic: ['Арктика', 'Диксон, тундра, северные посёлки, сложная логистика и ощущение края земли.', 'декабрь — апрель', '5/5'],
    custom: ['Индивидуально', 'Маршрут под вашу группу: даты, комфорт, транспорт, уровень сложности и команда.', 'круглый год', 'под задачу'],
    weekend: ['Выходные', 'Короткие зимние выезды на 2–3 дня: снегоходы, баня, база, красивые локации.', 'зима', '2–4/5']
  };

  document.querySelectorAll('.map-pin').forEach(pin => pin.addEventListener('click', () => {
    const d = regionData[pin.dataset.region];
    if (!d) return;

    const title = document.querySelector('#region-title');
    const text = document.querySelector('#region-text');
    const season = document.querySelector('#region-season');
    const difficulty = document.querySelector('#region-difficulty');

    if (title) title.textContent = d[0];
    if (text) text.textContent = d[1];
    if (season) season.textContent = d[2];
    if (difficulty) difficulty.textContent = d[3];
  }));

  document.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    });
  });

  if (!reduceMotion && !isCoarsePointer) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointermove', event => {
        btn.style.transition = 'none';
        const rect = btn.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .16;
        const y = (event.clientY - rect.top - rect.height / 2) * .22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });

      btn.addEventListener('pointerleave', () => {
        btn.style.transition = '';
        btn.style.transform = '';
      });
    });
  }

  const hero = document.querySelector('.hero-styled');
  if (hero && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const offset = Math.min(window.scrollY * .12, 70);
      hero.style.setProperty('--hero-shift', `${offset}px`);
      hero.style.backgroundPosition = `center calc(50% + ${offset * .18}px)`;
    }, { passive: true });
  }

  const canvases = document.querySelectorAll('.snow-canvas');
  canvases.forEach(canvas => {
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    const flakes = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = false;

    const resize = () => {
      const rect = (canvas.parentElement || canvas).getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = window.innerWidth < 700 ? 42 : window.innerWidth < 1100 ? 64 : 92;
      flakes.length = 0;
      for (let i = 0; i < count; i += 1) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.55 + .35,
          s: Math.random() * .34 + .12,
          drift: Math.random() * .28 + .06,
          phase: Math.random() * Math.PI * 2,
          alpha: Math.random() * .32 + .12
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      flakes.forEach(flake => {
        flake.y += flake.s;
        flake.x += Math.sin(flake.y * .012 + flake.phase) * flake.drift;

        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${flake.alpha})`;
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = window.requestAnimationFrame(draw);
    };

    const startSnow = () => {
      if (running) return;
      running = true;
      draw();
    };

    const stopSnow = () => {
      running = false;
      window.cancelAnimationFrame(rafId);
    };

    resize();
    startSnow();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopSnow();
      } else {
        resize();
        startSnow();
      }
    });
  });



  // --- COMPASS NEEDLE ACTIVE CURSOR TRACKING & WINTER EASTER EGG ---
  const planetStage = document.querySelector('.lab-planet-stage');
  const needleGroup = document.querySelector('.lab-beacon-needle-group');
  
  if (planetStage && needleGroup && !reduceMotion) {
    let targetAngle = 0;
    let currentAngle = 0;
    let isInside = false;
    let isMoving = false;

    // Winter Easter Egg State
    let isFrozen = false;
    let cooldownReady = true;
    let lerpCoeff = 0.12;

    const particleGroup = planetStage?.querySelector('.lab-compass-frost-particles');
    const shell = planetStage?.querySelector('.lab-beacon-shell');

    const triggerFrostBurst = () => {
      isFrozen = true;
      lerpCoeff = 0.012; // Slow response needle
      if (shell) shell.classList.add('is-frozen');

      // Generate frost burst particles in the SVG
      if (particleGroup) {
        const count = 35;
        const activeParticles = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3.8 + 1.8;
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          p.setAttribute('cx', '210');
          p.setAttribute('cy', '210');
          p.setAttribute('r', (Math.random() * 3 + 1.5).toFixed(1));
          p.setAttribute('fill', '#e0f7fa');
          p.setAttribute('opacity', (Math.random() * 0.7 + 0.3).toFixed(2));
          particleGroup.appendChild(p);

          activeParticles.push({
            element: p,
            x: 210,
            y: 210,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            opacity: 1,
            decay: Math.random() * 0.025 + 0.015
          });
        }

        // Animate particles loop
        const animateParticles = () => {
          let alive = false;
          activeParticles.forEach(p => {
            if (p.opacity <= 0) return;
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= p.decay;
            p.element.setAttribute('cx', p.x.toFixed(1));
            p.element.setAttribute('cy', p.y.toFixed(1));
            p.element.setAttribute('opacity', Math.max(0, p.opacity).toFixed(2));
            if (p.opacity > 0) alive = true;
          });

          if (alive) {
            requestAnimationFrame(animateParticles);
          } else {
            particleGroup.innerHTML = '';
          }
        };
        animateParticles();
      }

      // Melt back visual feedback over 3 seconds
      const meltStart = Date.now();
      const meltDuration = 3000;
      const meltInterval = setInterval(() => {
        const elapsed = Date.now() - meltStart;
        const t = Math.min(elapsed / meltDuration, 1);
        
        // Stiff needle gradually speeds up back to 0.12
        lerpCoeff = 0.012 + (0.12 - 0.012) * t;

        if (t >= 1) {
          clearInterval(meltInterval);
          if (shell) shell.classList.remove('is-frozen');
          isFrozen = false;
          
          // Complete recharge after another 3 seconds (recharge delay)
          setTimeout(() => {
            cooldownReady = true;
          }, 3000);
        }
      }, 50);
    };

    // Cache direction labels
    const labelN = planetStage.querySelector('.dir-n');
    const labelE = planetStage.querySelector('.dir-e');
    const labelS = planetStage.querySelector('.dir-s');
    const labelW = planetStage.querySelector('.dir-w');

    planetStage.addEventListener('pointermove', (e) => {
      const rect = planetStage.getBoundingClientRect();
      const compassX = rect.left + rect.width / 2;
      const compassY = rect.top + rect.height / 2;
      const dx = e.clientX - compassX;
      const dy = e.clientY - compassY;
      
      targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      isInside = true;
      isMoving = true;

      // 3D parallax tilt calculation
      const maxTilt = 12; // Maximum tilt degrees
      const tiltX = -(dy / rect.height) * maxTilt * 2;
      const tiltY = (dx / rect.width) * maxTilt * 2;
      if (shell && !reduceMotion) {
        shell.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg)`;
      }
    });

    planetStage.addEventListener('pointerenter', () => {
      isInside = true;
      isMoving = true;
    });

    planetStage.addEventListener('pointerleave', () => {
      isInside = false;
      targetAngle = 0;
      isMoving = true;
      if (shell && !reduceMotion) {
        shell.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }
    });

    const updateCompassNeedle = () => {
      if (isMoving) {
        let diff = (targetAngle - currentAngle) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        currentAngle += diff * lerpCoeff;
        needleGroup.style.transform = `rotate(${currentAngle}deg)`;

        // Update direction letter glows based on current angle
        let norm = (currentAngle % 360 + 360) % 360;
        if (labelN && labelE && labelS && labelW) {
          labelN.classList.toggle('is-active', (norm >= 335 || norm < 25));
          labelE.classList.toggle('is-active', (norm >= 65 && norm < 115));
          labelS.classList.toggle('is-active', (norm >= 155 && norm < 205));
          labelW.classList.toggle('is-active', (norm >= 245 && norm < 295));
        }

        // Check North (0 degrees) direction trigger
        let normalizedAngle = currentAngle % 360;
        if (normalizedAngle > 180) normalizedAngle -= 360;
        if (normalizedAngle < -180) normalizedAngle += 360;

        if (isInside && !isFrozen && cooldownReady && Math.abs(normalizedAngle) < 5) {
          cooldownReady = false;
          triggerFrostBurst();
        }

        if (Math.abs(diff) < 0.05) {
          currentAngle = targetAngle;
          needleGroup.style.transform = `rotate(${currentAngle}deg)`;
          
          // Re-normalize for end of movement
          let finalNorm = (currentAngle % 360 + 360) % 360;
          if (labelN && labelE && labelS && labelW) {
            labelN.classList.toggle('is-active', (finalNorm >= 335 || finalNorm < 25));
            labelE.classList.toggle('is-active', (finalNorm >= 65 && finalNorm < 115));
            labelS.classList.toggle('is-active', (finalNorm >= 155 && finalNorm < 205));
            labelW.classList.toggle('is-active', (finalNorm >= 245 && finalNorm < 295));
          }

          if (!isInside) {
            isMoving = false;
          }
        }
      }
      requestAnimationFrame(updateCompassNeedle);
    };

    updateCompassNeedle();
  }

});

// Global gallery helpers
window.swapEditorialPhoto = function(cardId, newSrc, thumbElement) {
  const mainImg = document.getElementById('main-img-' + cardId);
  if (!mainImg) return;
  
  mainImg.classList.add('fade-out');
  
  setTimeout(() => {
    mainImg.src = newSrc;
    mainImg.classList.remove('fade-out');
  }, 200);
  
  const container = thumbElement.closest('.editorial-thumbs');
  if (container) {
    container.querySelectorAll('.editorial-thumb').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
  }
};

window.openLightbox = function(src) {
  let lightbox = document.getElementById('lab-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lab-lightbox';
    lightbox.className = 'lab-lightbox-modal';
    lightbox.innerHTML = `
      <button class="lightbox-close" onclick="window.closeLightbox()">&times;</button>
      <img src="" class="lightbox-img" id="lightbox-img" alt="Увеличенное изображение">
      <div class="lightbox-caption" id="lightbox-caption">Сценарий экспедиции Acerola</div>
    `;
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        window.closeLightbox();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeLightbox();
      }
    });
  }
  
  const img = lightbox.querySelector('#lightbox-img');
  if (img) img.src = src;
  
  setTimeout(() => {
    lightbox.classList.add('is-active');
  }, 10);
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lab-lightbox');
  if (lightbox) {
    lightbox.classList.remove('is-active');
  }
};

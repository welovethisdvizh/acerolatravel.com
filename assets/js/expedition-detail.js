/* Expedition detail page enhancement */
const enhanceExpeditionDetailPage = () => {
  if (!document.body.classList.contains('exp-page')) return;

  document.body.classList.add('lab-detail');

  const pageKey = window.location.pathname.split('/').pop() || '';
  const details = window.ACEROLA_EXPEDITION_DETAILS || {};
  const heroTitle = document.querySelector('.exp-hero h1')?.textContent?.trim() || 'Экспедиция Acerola';
  const heroLead = document.querySelector('.exp-hero .lead')?.textContent?.trim() || 'Подробная программа уточняется командой Acerola Travel.';
  const data = details[pageKey] || {
    region: 'Россия',
    label: 'Экспедиция',
    labelTone: 'open',
    difficulty: 'по программе',
    dates: 'уточняются',
    duration: 'по программе',
    seats: 'камерная группа',
    price: 'по запросу',
    accent: 'EXPEDITION',
    image: '../assets/images/hero-snowmobile.png',
    routeLead: 'Маршрут экспедиции уточняется командой Acerola Travel.',
    routeMap: { label: 'Россия', pinX: 52, pinY: 48 },
    mapQuery: 'q=62.00,59.00&t=p&z=6',
    routeMapBg: '../assets/images/map-bg-custom.png',
    gallery: ['../assets/images/comfort-transport.png', '../assets/images/about-mountains.png'],
    lodgingImage: '../assets/images/comfort-lodging.png',
    foodImage: '../assets/images/comfort-food.png',
    transportImage: '../assets/images/comfort-transport.png'
  };

  const experienceCards = [
    {
      code: 'MODULE SEC-01 // SHELTER',
      num: '01',
      title: 'База и восстановление',
      text: 'Комфортабельные зимние базы, экспедиционные приюты или тёплые гостевые дома для полноценного сна, просушки экипировки и восстановления.',
      src: data.lodgingImage || '../assets/images/comfort-lodging.png',
      alt: 'База и восстановление на зимнем маршруте'
    },
    {
      code: 'MODULE SEC-02 // NUTRITION',
      num: '02',
      title: 'Питание и привалы',
      text: 'Сбалансированное горячее питание, сытные перекусы на маршрутных точках и качественные рационы для дальних переходов.',
      src: data.foodImage || '../assets/images/comfort-food.png',
      alt: 'Горячее питание на привале в зимней экспедиции'
    },
    {
      code: 'MODULE SEC-03 // GEAR & LOGISTICS',
      num: '03',
      title: 'Техника и сопровождение',
      text: 'Современные подготовленные снегоходы, надежная спутниковая связь, трекеры и опытная команда гидов-инструкторов.',
      src: data.transportImage || '../assets/images/comfort-transport.png',
      alt: 'Снегоходы и техника сопровозмаждения на северном маршруте'
    }
  ];

  const collectUniqueImages = (...groups) => {
    const seen = new Set(experienceCards.map(item => item.src));
    return groups.flat().filter(Boolean).filter(src => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  };

  const renderExperienceBlock = () => {
    const comfort = document.querySelector('#comfort');
    if (!comfort) return;

    const atmosphereImages = collectUniqueImages(
      data.atmosphereImages || [],
      data.gallery || [],
      [data.image]
    ).slice(0, 4);

    comfort.classList.add('expedition-experience-section');
    comfort.innerHTML = `
      <div class="container">
        <div class="page-title-row" data-reveal>
          <div>
            <span class="eyebrow">Операционные модули</span>
            <h2>Организация и среда маршрута</h2>
          </div>
          <p class="lead">Каждая экспедиция спроектирована как комплекс взаимосвязанных элементов: надежного проживания, техники, питания и опытной команды.</p>
        </div>

        <div class="expedition-experience-grid" data-reveal>
          ${experienceCards.map(item => `
            <article class="expedition-experience-card">
              <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">
              <div class="card-grid-lines"></div>
              <div class="card-meta">
                <span class="module-code">${item.code}</span>
                <span class="module-num">${item.num}</span>
              </div>
              <div class="card-text-content">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>
          `).join('')}
        </div>

        <div class="expedition-atmosphere-panel" data-reveal>
          <div class="expedition-atmosphere-copy">
            <span>Среда маршрута</span>
            <h3>${escapeHtml(data.region)}</h3>
            <p>${escapeHtml(data.routeLead)}</p>
          </div>
          <div class="expedition-atmosphere-grid">
            ${atmosphereImages.map((src, index) => `
              <figure class="${index === 0 ? 'is-large' : ''}">
                <img src="${src}" alt="${escapeHtml(heroTitle)}" loading="lazy">
              </figure>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  const inferTransport = (title, text, meta = {}) => {
    const source = `${title} ${text} ${Object.values(meta).join(' ')}`.toLowerCase();
    if (/созвон|заявк|концепц|планирован|организац/.test(source)) return 'planning';
    if (/вертол[её]т|перел[её]т|авиа/.test(source)) return 'flight';
    if (/трансфер|приезд|возвращ|вылет|екатеринбург|печора|дорог/.test(source)) return 'transfer';
    if (/снегоход|техник/.test(source)) return 'snowmobile';
    if (/пеш|восхожд|перевал|плато|гора|тропа/.test(source)) return 'trek';
    if (/база|приют|ноч[её]в|размещ/.test(source)) return 'base';
    return 'expedition';
  };

  const transportMeta = {
    planning: {
      label: 'Планирование',
      icon: '<path d="M5 5h14v14H5z"/><path d="M8 9h8M8 13h6"/>'
    },
    transfer: {
      label: 'Трансфер',
      icon: '<path d="M4 13V8l2-3h9l3 4v4"/><path d="M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M8 13h8"/>'
    },
    snowmobile: {
      label: 'Снегоходы',
      icon: '<path d="M4 15h12l4 3"/><path d="M7 12h6l3 3"/><path d="M10 9h3l2 3"/><path d="M4 18h9"/>'
    },
    trek: {
      label: 'Пеший участок',
      icon: '<path d="M12 3v5"/><path d="m9 21 3-8 3 8"/><path d="m8 12 4-4 4 4"/><circle cx="12" cy="5" r="2"/>'
    },
    base: {
      label: 'База',
      icon: '<path d="m3 13 9-8 9 8"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>'
    },
    flight: {
      label: 'Авиа',
      icon: '<path d="M3 11h18"/><path d="m12 3 4 8-4 8-4-8 4-8Z"/>'
    },
    expedition: {
      label: 'Маршрут',
      icon: '<path d="M4 18 9 6l5 10 3-6 3 8"/><path d="M3 18h18"/>'
    }
  };

  const transportIcon = key => {
    const item = transportMeta[key] || transportMeta.expedition;
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${item.icon}
      </svg>
    `;
  };

  const getMapLabelIcon = iconName => {
    if (iconName === 'flag') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
    }
    if (iconName === 'camp') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 21v-8M5 21v-8M12 3L2 13h20L12 3zM12 13v8" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
    }
    if (iconName === 'mountain') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 21 9-18 9 18H3z" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="m9 9 3 4 3-2" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
    }
    return '';
  };

  const extractRouteStops = routeSection => {
    const dots = [...routeSection.querySelectorAll('.route-dot')];
    return dots.map((dot, index) => {
      const title = dot.dataset.title || `Этап ${index + 1}`;
      const text = dot.dataset.text || 'Описание этапа уточняется командой Acerola Travel.';
      const transport = dot.dataset.transport || inferTransport(title, text);
      const altitude = dot.dataset.altitude || '';
      const distance = dot.dataset.distance || '';
      const character = dot.dataset.character || (transportMeta[transport] || transportMeta.expedition).label;
      const mapLabel = dot.dataset.mapLabel || '';
      const mapLabelPos = dot.dataset.mapLabelPos || 'bottom';
      const mapIcon = dot.dataset.mapIcon || '';

      return {
        order: index + 1,
        title,
        description: text,

        transport,
        altitude,
        distance,
        character,
        mapLabel,
        mapLabelPos,
        mapIcon,
        extra: {
          'Характер': character,
          'Порядок': `Waypoint ${String(index + 1).padStart(2, '0')}`
        }
      };
    });
  };

  const routeMissingValue = 'TODO verify route data';

  const normalizeRouteMetric = value => {
    const text = String(value ?? '').trim();
    if (!text || ['-', '—', '–'].includes(text) || text.toLowerCase() === 'undefined') {
      return routeMissingValue;
    }
    return text;
  };

  const getRouteStageImages = stops => {
    const images = collectUniqueImages(
      data.gallery || [],
      data.atmosphereImages || [],
      [data.image]
    );
    const fallback = data.image || '../assets/images/hero-snowmobile.png';
    const imagePool = images.length ? images : [fallback];

    const findImage = (...tokens) => {
      const lowerTokens = tokens.map(token => token.toLowerCase());
      for (const token of lowerTokens) {
        const match = imagePool.find(src => src.toLowerCase().includes(token));
        if (match) return match;
      }
      return null;
    };

    const asset = file => `../assets/images/${file}`;
    const stageImage = (stop, index) => {
      const title = String(stop.title || '').toLowerCase();
      const source = `${stop.title} ${stop.description} ${stop.character} ${stop.transport}`.toLowerCase();
      const has = (...words) => words.some(word => source.includes(word));

      if (pageKey === 'pripolyarny-ural.html') {
        if (title.includes('сабля') || title.includes('оклад')) return data.lodgingImage || asset('weekend_lodge.png');
        if (title.includes('печора') && index === stops.length - 1) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('печора')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('кедровый шор') && title.includes('аранец')) return findImage('pripolyarny_taiga') || asset('pripolyarny_taiga.png');
        if (title.includes('радиаль')) return findImage('hero-snowmobile') || asset('hero-snowmobile.png');
        if (title.includes('манараг')) return findImage('manaraga_winter') || asset('manaraga_winter.png');
        if (title.includes('долины') || title.includes('перевал')) return findImage('card-pripolyarny', 'pripolyarny_taiga') || asset('card-pripolyarny.png');
      }

      if (pageKey === 'dyatlov-pass.html') {
        if (title.includes('возвращение')) return findImage('card-dyatlov') || data.transportImage || asset('comfort-transport.png');
        if (title.includes('екатеринбург')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('вижай') || title.includes('ушма')) return findImage('dyatlov_forest') || asset('dyatlov_forest.png');
        if (title.includes('база') || title.includes('ильича') || title.includes('отортен')) return data.lodgingImage || asset('weekend_lodge.png');
        if (title.includes('мансий')) return findImage('dyatlov_tent') || asset('dyatlov_tent.png');
      }

      if (pageKey === 'manypupuner.html') {
        if (title.includes('финал')) return findImage('manypupuner_sunset') || asset('manypupuner_sunset.png');
        if (title.includes('прибытие')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('тайг')) return findImage('manypupuner_snowmobiles') || asset('manypupuner_snowmobiles.png');
        if (title.includes('дятлов')) return asset('dyatlov_pass_winter.png');
        if (title.includes('приют')) return data.lodgingImage || asset('comfort-lodging.png');
        if (title.includes('истукан') || title.includes('плато') || title.includes('маньпупун')) return findImage('manypupuner_pillars') || asset('manypupuner_pillars.png');
      }

      if (pageKey === 'weekend.html') {
        if (title.includes('карпинск')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('приют') || title.includes('серебрян')) return data.lodgingImage || asset('weekend_lodge.png');
        if (title.includes('конжак') || title.includes('подъем')) return findImage('card-weekend') || asset('card-weekend.jpeg');
      }

      if (pageKey === 'usvinskie-stolby.html') {
        if (title.includes('финал')) return findImage('usva-kp-overlook') || asset('usva-kp-overlook.jpg');
        if (title.includes('выезд')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('каменный город')) return findImage('usva-stone-city', 'usva-rocks') || asset('usva-stone-city.webp');
        if (title.includes('заброска')) return findImage('usva-pillars-river', 'usva-pillars-snow') || asset('usva-pillars-river.jpg');
        if (title.includes('чертов') || title.includes('палец')) return findImage('usva-rocks-kp') || asset('usva-rocks-kp.jpg');
      }

      if (pageKey === 'dikson.html') {
        if (title.includes('новый уренгой')) return data.transportImage || asset('comfort-transport.png');
        if (title.includes('тазовский')) return findImage('card-dikson') || asset('card-dikson.png');
        if (title.includes('антипаюта')) return findImage('arctic_aurora') || asset('arctic_aurora.png');
        if (title.includes('гыда')) return data.lodgingImage || asset('comfort-lodging.png');
        if (title.includes('мыс') || title.includes('сопочная')) return findImage('dikson_ice') || asset('dikson_ice.png');
        if (title.includes('остров') || title.includes('диксон')) return findImage('dikson_port') || asset('dikson_port.png');
      }

      if (has('база', 'приют', 'гостев', 'ночев', 'изба', 'размещение')) {
        return data.lodgingImage || findImage('lodge', 'lodging', 'base', 'weekend_lodge') || asset('comfort-lodging.png');
      }

      return null;
    };

    return stops.map((stop, index) => {
      const source = `${stop.title} ${stop.description} ${stop.character} ${stop.transport}`.toLowerCase();
      const has = (...words) => words.some(word => source.includes(word));
      const hasStandalone = (...words) => words.some(word => new RegExp(`(^|[^а-яёa-z])${word}([^а-яёa-z]|$)`, 'i').test(source));
      const matchedImage = stageImage(stop, index);
      if (matchedImage) return matchedImage;

      if (has('база', 'приют', 'гостев', 'ночев', 'изба', 'размещение') || hasStandalone('дом', 'дома', 'доме', 'домах')) {
        return data.lodgingImage || findImage('lodge', 'lodging', 'base', 'weekend_lodge') || '../assets/images/comfort-lodging.png';
      }

      if (has('культур', 'лагер', 'палат') || stop.title.toLowerCase().includes('мансийский') || stop.character.toLowerCase().includes('культур')) {
        return findImage('dyatlov_tent', 'tent', 'forest') || imagePool[index % imagePool.length];
      }

      if (has('гора', 'перевал', 'хребет', 'пик', 'скал', 'столб', 'камень', 'панорам', 'мыс', 'лед')) {
        return findImage('manaraga', 'dyatlov_pass', 'manypupuner_pillars', 'usva-rocks', 'usva-pillars', 'dikson_ice') || findImage('card') || imagePool[index % imagePool.length];
      }

      if (pageKey === 'dikson.html' && has('порт', 'поселок', 'остров', 'диксон')) {
        return findImage('dikson_port', 'dikson', 'card') || imagePool[index % imagePool.length];
      }

      if (has('снегоход', 'техника', 'зимник', 'тундр', 'трансфер', 'дорога', 'переход')) {
        return data.transportImage || findImage('snowmobile', 'transport', 'hero-snowmobile') || imagePool[index % imagePool.length];
      }

      return imagePool[index % imagePool.length];
    });
  };

  const renderPremiumPathDetail = stop => {
    const altitude = normalizeRouteMetric(stop.altitude);
    const distance = normalizeRouteMetric(stop.distance);
    const meta = transportMeta[stop.transport] || transportMeta.expedition;
    const activity = stop.character || meta.label;

    return `
      <span class="premium-path-detail-kicker">Этап ${String(stop.order).padStart(2, '0')}</span>
      <h3>${escapeHtml(stop.title)}</h3>
      <p>${escapeHtml(stop.description)}</p>
      <div class="premium-path-detail-grid">
        <div>
          <span>${transportIcon(stop.transport)}</span>
          <small>Тип этапа</small>
          <strong>${escapeHtml(activity)}</strong>
        </div>
        <div>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 20 9-16 9 16H3z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m9 11 3 3 3-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <small>Высота</small>
          <strong>${escapeHtml(altitude)}</strong>
        </div>
        <div>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17c4-7 7 2 11-5 2-3 3-4 5-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5 20h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          <small>Дистанция</small>
          <strong>${escapeHtml(distance)}</strong>
        </div>
        <div>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6l3.5 3.5m5.8 5.8 3.5 3.5m0-12.8-3.5 3.5m-5.8 5.8-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          <small>Активность</small>
          <strong>${escapeHtml(activity)}</strong>
        </div>
      </div>
      <div class="premium-path-detail-note">
        <span>${transportIcon(stop.transport)}</span>
        <p>${escapeHtml(activity)}. ${escapeHtml(data.routeMap?.label || data.region)}</p>
      </div>
    `;
  };

  const renderExpeditionRoute = () => {
    if (pageKey === 'custom.html') return;

    const routeSection = document.querySelector('#route');
    if (!routeSection) return;

    const legacyRouteLine = routeSection.querySelector('.route-line')?.textContent?.trim() || data.routeLead;
    const stops = extractRouteStops(routeSection);
    if (!stops.length) return;

    const totalDistance = normalizeRouteMetric(routeSection.dataset.totalDistance);
    const stageImages = getRouteStageImages(stops);
    const activeStop = stops[0];

    routeSection.classList.remove('dark', 'expedition-route-section');
    routeSection.classList.add('premium-path-section');
    routeSection.innerHTML = `
      <div class="container">
        <article class="premium-path-panel">
          <div class="premium-path-head">
            <div>
              <span class="premium-path-kicker">Маршрут экспедиции</span>
              <h2>Путь экспедиции</h2>
            </div>
            <p>${escapeHtml(data.routeLead)}</p>
          </div>

          <div class="premium-path-layout">
            <div class="premium-path-main">
              <div class="premium-path-cards-wrap" aria-label="Этапы маршрута">
                <div class="premium-path-cards">
                  <div class="premium-path-track" style="--stage-count:${stops.length}">
                    <svg class="premium-path-card-line" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M 18 66 C 148 42, 240 88, 368 64 S 602 36, 742 70 S 900 92, 982 52" />
                    </svg>
                  ${stops.map((stop, index) => {
                    const altitude = normalizeRouteMetric(stop.altitude);
                    const distance = normalizeRouteMetric(stop.distance);
                    const meta = transportMeta[stop.transport] || transportMeta.expedition;
                    const activity = stop.character || meta.label;
                    return `
                      <article class="premium-path-card ${index === 0 ? 'is-active' : ''}">
                        <button class="premium-path-card-trigger" type="button" data-route-index="${index}" aria-pressed="${index === 0 ? 'true' : 'false'}" aria-label="Этап ${stop.order}: ${escapeHtml(stop.title)}">
                          <span class="premium-path-card-num">${String(stop.order).padStart(2, '0')}</span>
                          <span class="premium-path-card-title">${escapeHtml(stop.title)}</span>
                          <span class="premium-path-card-image">
                            <img src="${escapeHtml(stageImages[index])}" alt="${escapeHtml(stop.title)}" loading="lazy">
                          </span>
                          <span class="premium-path-card-icon">${transportIcon(stop.transport)}</span>
                          <span class="premium-path-card-metrics">
                            <span><b>${escapeHtml(altitude)}</b><small>высота</small></span>
                            <span><b>${escapeHtml(distance)}</b><small>дистанция</small></span>
                            <span><b>${escapeHtml(activity)}</b><small>активность</small></span>
                          </span>
                        </button>
                      </article>
                    `;
                  }).join('')}
                  </div>
                </div>
              </div>
            </div>

            <aside class="premium-path-detail" aria-live="polite">
              ${renderPremiumPathDetail(activeStop)}
            </aside>
          </div>

          <div class="premium-path-summary">
            <div>
              <span>Регион</span>
              <strong>${escapeHtml(data.region)}</strong>
            </div>
            <div>
              <span>Сезон</span>
              <strong>${escapeHtml(data.dates)}</strong>
            </div>
            <div>
              <span>Длительность</span>
              <strong>${escapeHtml(data.duration)}</strong>
            </div>
            <div>
              <span>Формат</span>
              <strong>${escapeHtml(data.label)}</strong>
            </div>
            <div>
              <span>Протяженность</span>
              <strong>${escapeHtml(totalDistance)}</strong>
            </div>
            <div class="premium-path-summary-line">
              <span>Линия маршрута</span>
              <small>${escapeHtml(legacyRouteLine)}</small>
            </div>
          </div>
        </article>
      </div>
    `;

    const cardTriggers = [...routeSection.querySelectorAll('.premium-path-card-trigger')];
    const cards = [...routeSection.querySelectorAll('.premium-path-card')];
    const cardScroller = routeSection.querySelector('.premium-path-cards');
    const detail = routeSection.querySelector('.premium-path-detail');

    const activateStop = (index, shouldFocus = false) => {
      const boundedIndex = (index + stops.length) % stops.length;
      const stop = stops[boundedIndex];

      cards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === boundedIndex));
      cardTriggers.forEach((trigger, triggerIndex) => {
        const active = triggerIndex === boundedIndex;
        trigger.setAttribute('aria-pressed', String(active));
      });
      if (detail) detail.innerHTML = renderPremiumPathDetail(stop);
      const activeCard = cards[boundedIndex];
      if (cardScroller && activeCard) {
        const centeredLeft = activeCard.offsetLeft - ((cardScroller.clientWidth - activeCard.offsetWidth) / 2);
        cardScroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: shouldFocus ? 'auto' : 'smooth' });
      }
      if (shouldFocus) cardTriggers[boundedIndex]?.focus();
    };

    const bindRouteKeydown = (event, index) => {
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        activateStop(index + 1, true);
      }
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        activateStop(index - 1, true);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        activateStop(0, true);
      }
      if (event.key === 'End') {
        event.preventDefault();
        activateStop(stops.length - 1, true);
      }
    };

    cardTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => activateStop(index));
      trigger.addEventListener('keydown', event => bindRouteKeydown(event, index));
    });

    activateStop(0);
  };

  const header = document.querySelector('.site-header');
  header?.classList.add('lab-detail-header');

  const brand = header?.querySelector('.brand');
  brand?.classList.add('lab-detail-brand');

  const nav = header?.querySelector('.main-nav');
  if (nav) {
    nav.innerHTML = `
      <a href="../index.html#expeditions">Экспедиции</a>
      <a href="../index.html#about">О нас</a>
      <a href="../index.html#reviews">Отзывы</a>
      <a href="#contact">Контакты</a>
    `;
  }

  const actions = header?.querySelector('.header-actions');
  if (actions) {
    actions.innerHTML = `
      <a class="phone" href="tel:+79950880505">+7 (995) 088-05-05</a>
      <a class="btn btn-small btn-light" href="#contact">Подобрать маршрут</a>
      <button class="menu-toggle" aria-label="Открыть меню" type="button"><span></span><span></span><span></span></button>
    `;
  }

  const hero = document.querySelector('.exp-hero');
  if (hero) {
    hero.classList.add('dossier-hero');
    if (data.image) hero.style.backgroundImage = `url('${data.image}')`;

    const eyebrow = hero.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = data.region;

    if (!hero.querySelector('.dossier-hero-badges')) {
      const badges = document.createElement('div');
      badges.className = 'dossier-hero-badges';
      badges.innerHTML = `
        <span class="dossier-status dossier-status-${data.labelTone}">Экспедиция</span>
        <span class="dossier-status dossier-status-${data.labelTone}">${data.label}</span>
      `;
      hero.querySelector('.crumbs')?.after(badges);
    }

    const quickFacts = hero.querySelector('.quick-facts');
    if (quickFacts) {
      quickFacts.innerHTML = `
        <div><small>Даты</small><strong>${data.dates}</strong></div>
        <div><small>Длительность</small><strong>${data.duration}</strong></div>
        <div><small>Места</small><strong>${data.seats}</strong></div>
        <div><small>Цена / статус</small><strong>${data.price}</strong></div>
      `;
    }

  }

  document.querySelectorAll('main > section:not(.exp-hero), .overview-card, .bullet-grid, .included-grid, .comfort-grid, .guides').forEach(section => {
    if (!section.hasAttribute('data-reveal')) section.setAttribute('data-reveal', '');
  });

  renderExpeditionRoute();
  renderExperienceBlock();

  const overviewGrid = document.querySelector('#overview .overview-grid');
  const overviewCard = overviewGrid?.querySelector('.overview-card');
  if (overviewCard) {
    overviewCard.classList.add('dossier-overview-card');
    const overviewTitle = overviewCard.querySelector('h2');
    if (overviewTitle) overviewTitle.textContent = 'О маршруте';

    const dateRows = overviewCard.querySelectorAll('.date-row');
    if (dateRows[0]?.querySelector('b')) dateRows[0].querySelector('b').textContent = data.dates;
    if (dateRows[1]?.querySelector('b')) dateRows[1].querySelector('b').textContent = data.price;
  }

  if (overviewGrid && !overviewGrid.querySelector('.dossier-booking')) {
    const booking = document.createElement('aside');
    booking.className = 'dossier-booking';
    booking.setAttribute('data-reveal', '');
    booking.innerHTML = `
      <span class="dossier-card-kicker">Booking brief</span>
      <h3>${heroTitle}</h3>
      <dl>
        <div><dt>Даты</dt><dd>${data.dates}</dd></div>
        <div><dt>Длительность</dt><dd>${data.duration}</dd></div>
        <div><dt>Свободные места</dt><dd>${data.seats}</dd></div>
        <div><dt>Цена / статус</dt><dd>${data.price}</dd></div>
      </dl>
      <a class="btn btn-wood" href="#contact">Оставить заявку</a>
      <a class="btn btn-ghost" href="https://wa.me/79950880505">Задать вопрос</a>
      <p>Мы свяжемся и подберём удобный формат участия.</p>
    `;
    overviewGrid.append(booking);
  }
  const contact = document.querySelector('.contact-section');
  if (contact) {
    contact.classList.add('dossier-contact');
    const contactTitle = contact.querySelector('h2');
    const contactLead = contact.querySelector('.lead');
    const submit = contact.querySelector('button[type="submit"]');
    const select = contact.querySelector('select');
    const textarea = contact.querySelector('textarea');
    const disclaimer = contact.querySelector('small');

    if (contactTitle) contactTitle.textContent = 'Обсудить экспедицию';
    if (contactLead) contactLead.textContent = 'Оставьте ваши контакты и пожелания — мы свяжемся для детального обсуждения и проектирования индивидуального сценария под вашу группу.';
    if (submit) submit.textContent = 'Запросить маршрут';
    if (select) {
      select.value = heroTitle;
      select.setAttribute('aria-label', 'Интересующий сценарий');
      select.classList.add('dossier-direction-select');
    }
    if (textarea) textarea.setAttribute('placeholder', 'Предпочтительные даты, состав участников, пожелания к маршруту');
    if (disclaimer) disclaimer.textContent = 'Мы не отправляем массовые подборки. Менеджер уточнит детали и предложит подходящий сценарий.';
  }

  const footer = document.querySelector('.site-footer');
  footer?.classList.add('lab-detail-footer');
  const footerText = footer?.querySelector('.footer-grid p');
  if (footerText) {
    footerText.textContent = 'Премиальные экспедиции по России: редкие маршруты, камерные группы и точная организация.';
  }
};

(() => {
  const getLevels = () => window.ACEROLA_EXPEDITION_LEVELS || {};
  const getDetails = () => window.ACEROLA_EXPEDITION_DETAILS || {};
  const getCardLevels = () => window.ACEROLA_CARD_LEVELS || {};

  const getLevel = (key) => {
    const levels = getLevels();
    return levels[key] || levels.rhythm || null;
  };

  const createCardPill = (level) => {
    const pill = document.createElement('span');
    pill.className = `expedition-level-pill level-${level.tone}`;
    pill.setAttribute('aria-label', `Уровень экспедиции: ${level.level}`);
    pill.title = `${level.name}: ${level.slogan}`;

    const label = document.createElement('span');
    label.textContent = level.level;

    const name = document.createElement('strong');
    name.textContent = level.name;

    pill.append(label, name);
    return pill;
  };

  const createDetailBadge = (level) => {
    const badge = document.createElement('div');
    badge.className = `expedition-level-detail level-${level.tone}`;
    badge.title = level.anchor;

    const label = document.createElement('span');
    label.className = 'expedition-level-detail__label';
    label.textContent = `Уровень: ${level.level}`;

    const name = document.createElement('strong');
    name.textContent = level.name;

    const slogan = document.createElement('em');
    slogan.textContent = `«${level.slogan}»`;

    badge.append(label, name, slogan);
    return badge;
  };

  const enhanceHomeCards = () => {
    const cardLevels = getCardLevels();

    document.querySelectorAll('.editorial-dossier-row[id]').forEach((card) => {
      if (card.querySelector('.expedition-level-pill')) return;

      const level = getLevel(cardLevels[card.id]);
      const meta = card.querySelector('.editorial-meta-line');
      if (!level || !meta) return;

      const status = meta.querySelector('.dossier-status');
      const pill = createCardPill(level);

      if (status) status.after(pill);
      else meta.prepend(pill);
    });
  };

  const enhanceDetailPage = () => {
    if (!document.body.classList.contains('exp-page')) return;

    const pageKey = window.location.pathname.split('/').pop() || '';
    const data = getDetails()[pageKey] || {};
    const level = getLevel(data.levelKey);
    const hero = document.querySelector('.exp-hero .container');

    if (!level || !hero || hero.querySelector('.expedition-level-detail')) return;

    const badge = createDetailBadge(level);
    const anchor = hero.querySelector('.dossier-hero-badges') || hero.querySelector('.eyebrow') || hero.querySelector('.crumbs');

    if (anchor) anchor.after(badge);
    else hero.prepend(badge);
  };

  document.addEventListener('DOMContentLoaded', () => {
    enhanceHomeCards();
    enhanceDetailPage();
  });
})();

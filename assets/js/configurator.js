document.addEventListener('DOMContentLoaded', () => {
  const configurator = document.querySelector('[data-expedition-configurator]');
  if (configurator) {
    const root = configurator.closest('.expedition-configurator-section');
    const form = root?.querySelector('[data-config-form]');
    const summaryInput = root?.querySelector('[data-config-summary]');
    const resultCard = configurator.querySelector('.result-card');
    
    // Configurator state
    const state = {
      budget: Number(configurator.querySelector('[data-config-range="budget"]')?.value || 350000),
      duration: Number(configurator.querySelector('[data-config-range="duration"]')?.value || 7),
      group: Number(configurator.querySelector('[data-config-range="group"]')?.value || 6),
      comfort: 'Business',
      difficulty: 'Средняя',
      travelType: 'Друзья',
      interests: ['Снегоходы', 'Баня', 'Горы'],
      start: 'Екатеринбург',
      lodging_wishes: '',
      wishes: '',
      theme: 'aurora'
    };

    const popularStartCities = [
      'Екатеринбург',
      'Москва',
      'Санкт-Петербург',
      'Казань',
      'Новосибирск',
      'Тюмень',
      'Челябинск',
      'Уфа',
      'Пермь',
      'Нижний Новгород',
      'Самара',
      'Краснодар',
      'Красноярск',
      'Сочи',
      'Мурманск',
      'Архангельск',
      'Печора',
      'Салехард',
      'Новый Уренгой'
    ];

    const normalizeText = value => String(value || '').trim().toLocaleLowerCase('ru-RU');
    const findCitySuggestion = value => {
      const normalized = normalizeText(value);
      if (!normalized) return '';
      return popularStartCities.find(city => {
        const normalizedCity = normalizeText(city);
        return normalizedCity.startsWith(normalized) && normalizedCity !== normalized;
      }) || '';
    };

    let currentStep = 1;
    const totalSteps = 5;

    // Keep track of previously rendered values to run smooth count animations
    const prevPrices = {
      base: 150000,
      comfort: 0,
      options: 0,
      total: 150000,
      progress: 0
    };

    const plural = (value, one, few, many) => {
      const m10 = value % 10, m100 = value % 100;
      return (m10 === 1 && m100 !== 11) ? one : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? few : many;
    };
    const formatDays = value => `${value} ${plural(value, 'день', 'дня', 'дней')}`;
    const formatPeople = value => `${value} ${plural(value, 'человек', 'человека', 'человек')}`;
    const formatMoney = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
    const setText = (sel, val) => root?.querySelectorAll(sel).forEach(el => { el.textContent = val; });

    // Smooth pricing/progress counter animation using requestAnimationFrame
    const animatePrice = (el, startVal, endVal, prefix = '', suffix = '') => {
      if (!el) return;
      let startTime = null;
      const duration = 250; // ms
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentVal = Math.floor(progress * (endVal - startVal) + startVal);
        el.textContent = `${prefix}${new Intl.NumberFormat('ru-RU').format(currentVal)}${suffix}`;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = `${prefix}${new Intl.NumberFormat('ru-RU').format(endVal)}${suffix}`;
        }
      };
      window.requestAnimationFrame(step);
    };

    // Calculate actual cost details dynamically
    const calculateSmeta = () => {
      const rawBase = 120000 + (state.duration - 2) * 12000;
      const groupCoeff = state.group <= 2 ? 1.35 : state.group <= 3 ? 1.25 : state.group <= 5 ? 1.12 : state.group <= 8 ? 1.0 : 0.88;
      const comfortPrice = state.comfort === 'Комфорт' ? 35000 : state.comfort === 'Business' ? 70000 : state.comfort === 'Elite' ? 145000 : 0;
      const difficultyPrice = state.difficulty === 'Средняя' ? 15000 : state.difficulty === 'Высокая' ? 45000 : state.difficulty === 'Экстремальная' ? 75000 : 0;
      
      let optionsPrice = state.travelType === 'Private expedition' ? 50000 : 0;
      const interestCosts = { 'Вертолёт': 110000, 'Снегоходы': 35000, 'Баня': 10000, 'Северное сияние': 15000, 'Максимальный комфорт': 25000 };
      state.interests.forEach(interest => { optionsPrice += interestCosts[interest] || 5000; });

      const total = Math.floor(rawBase * groupCoeff + comfortPrice + difficultyPrice + optionsPrice);
      return {
        base: Math.floor(rawBase * groupCoeff),
        groupCoeff,
        comfort: comfortPrice + difficultyPrice,
        options: optionsPrice,
        total
      };
    };

    const getDirection = () => {
      if (state.start.includes('Новый Уренгой')) return 'Диксон — Арктика';
      if (state.start.includes('Печора')) return 'Приполярный Урал';
      if (state.duration <= 3 || state.travelType.includes('Weekend')) return 'Урал (Weekend)';
      if (['Высокая', 'Экстремальная'].includes(state.difficulty)) return 'Северный Урал';
      return 'Индивидуальный Урал / Коми';
    };

    const getScenario = () => {
      const arcticInterest = state.interests.includes('Северное сияние') || state.start.includes('Новый Уренгой');
      if (state.comfort === 'Elite' || state.travelType.includes('Private')) {
        return { title: 'Private winter expedition', description: 'Эксклюзивная экспедиция с индивидуальным графиком, повышенным комфортом размещения и вертолетной поддержкой.', image: '../assets/images/card-custom.png' };
      }
      if (state.duration <= 3 || state.travelType.includes('Weekend')) {
        return { title: 'Weekend North Escape', description: 'Компактный активный выезд на снегоходах с комфортной базой, баней и красивыми панорамами.', image: '../assets/images/card-weekend.jpeg' };
      }
      if (state.start.includes('Новый Уренгой') || arcticInterest) {
        return { title: 'Арктический экспресс', description: 'Погружение в арктическую тундру, северные поселки, полярные ночи и дикие заснеженные пространства.', image: '../assets/images/card-dikson.png' };
      }
      if (['Высокая', 'Экстремальная'].includes(state.difficulty) && state.duration >= 6) {
        return { title: 'Уральская зимняя Одиссея', description: 'Серьезный категорийный маршрут через перевалы, тайгу и горные хребты для подготовленных путешественников.', image: '../assets/images/card-pripolyarny.png' };
      }
      return { title: 'Уральский зимний вояж', description: 'Сбалансированная зимняя поездка с активным отдыхом на снегоходах, уютными ночевками и сибирской баней.', image: '../assets/images/card-manypupuner.png' };
    };



    const getProgress = () => {
      let progress = (currentStep - 1) * 20;
      if (currentStep === 1) {
        let sub = 0;
        if (state.budget) sub += 6;
        if (state.duration) sub += 7;
        if (state.start) sub += 7;
        progress += sub;
      } else if (currentStep === 2) {
        progress = 20;
        let sub = 0;
        if (state.group) sub += 6;
        if (state.travelType) sub += 7;
        if (state.difficulty) sub += 7;
        progress += sub;
      } else if (currentStep === 3) {
        progress = 40;
        let sub = 0;
        if (state.comfort) sub += 10;
        if (state.lodging_wishes) sub += 10;
        progress += sub;
      } else if (currentStep === 4) {
        progress = 60;
        let sub = 0;
        if (state.interests.length > 0) sub += 10;
        if (state.wishes) sub += 10;
        progress += sub;
      } else if (currentStep === 5) {
        progress = 80;
        let sub = 0;
        const nameVal = form.querySelector('input[name="name"]')?.value;
        const contactVal = form.querySelector('input[name="contact"]')?.value;
        if (nameVal) sub += 10;
        if (contactVal) sub += 10;
        progress += sub;
      }
      return Math.min(Math.round(progress), 100);
    };

    const getBadges = progress => {
      const badges = ['Комфорт настроен', 'Логистика собрана'];
      if (progress >= 30) badges.push('Маршрут готов');
      if (progress >= 70) badges.push('Премиум-уровень');
      if (state.comfort === 'Elite') badges.push('Elite Service');
      if (state.start.includes('Новый Уренгой') || state.interests.includes('Северное сияние')) badges.push('Полярный круг');
      if (state.duration <= 3 || state.travelType.includes('Weekend')) badges.push('Быстрый выезд');
      if (['Высокая', 'Экстремальная'].includes(state.difficulty)) badges.push('Высокая нагрузка');
      if (state.travelType.includes('Семья')) badges.push('Семейный темп');
      return badges;
    };

    const serialize = () => {
      const scenario = getScenario();
      const smeta = calculateSmeta();
      return `Атмосфера: ${state.theme.toUpperCase()}, ${scenario.title}: ${formatDays(state.duration)}, ${formatPeople(state.group)}, комфорт ${state.comfort}, сложность ${state.difficulty}, расчетная цена ${smeta.total} ₽ (бюджет поездки ${state.budget} ₽), старт ${state.start}, интересы: ${state.interests.join(', ') || 'нет'}${state.lodging_wishes ? `, жилье: ${state.lodging_wishes}` : ''}${state.wishes ? `, пожелания: ${state.wishes}` : ''}.`;
    };

    const updateSteps = () => {
      configurator.querySelectorAll('.wizard-step').forEach(step => {
        const stepNum = Number(step.dataset.step);
        step.classList.toggle('is-active', stepNum === currentStep);
      });
      configurator.querySelectorAll('.stepper-node').forEach(node => {
        const nodeNum = Number(node.dataset.stepperNode);
        node.classList.toggle('is-active', nodeNum <= currentStep);
      });
      const progressLine = configurator.querySelector('[data-stepper-progress]');
      if (progressLine) {
        progressLine.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
      }
    };

    const scrollToConfiguratorTop = () => {
      root?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const updateSliderTracks = () => {
      configurator.querySelectorAll('[data-config-range]').forEach(range => {
        const min = parseFloat(range.min) || 0;
        const max = parseFloat(range.max) || 100;
        const val = parseFloat(range.value) || 0;
        const percentage = ((val - min) / (max - min)) * 100;
        const activeColor = 'var(--config-accent)';
        const inactiveColor = 'rgba(6, 16, 26, 0.22)';
        range.style.background = `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%, ${inactiveColor} 100%)`;
      });
    };

    const generateClientPortrait = () => {
      const facts = [];

      // Step 1 facts (Budget, Duration, Group Size, Start City)
      if (currentStep >= 1) {
        facts.push(`Запланирована индивидуальная экспедиция длительностью <strong>${formatDays(state.duration)}</strong> для группы из <strong>${formatPeople(state.group)}</strong> с точкой старта в г. <strong>${state.start}</strong>.`);
        facts.push(`Заявлен комфортный финансовый ориентир в пределах <strong>${formatMoney(state.budget)}</strong> на человека.`);
      }

      // Step 2 facts (Format, Difficulty)
      if (currentStep >= 2) {
        facts.push(`Определен предпочтительный формат путешествия: <strong>${state.travelType}</strong> с уровнем сложности <strong>${state.difficulty}</strong>.`);
      }

      // Step 3 facts (Comfort Level, lodging wishes)
      if (currentStep >= 3) {
        let comfortDesc = `Выбран премиальный класс обслуживания и проживания <strong>${state.comfort}</strong>.`;
        if (state.lodging_wishes && state.lodging_wishes.trim()) {
          comfortDesc += ` Зафиксированы особые требования к размещению: <em>«${state.lodging_wishes.trim()}»</em>.`;
        }
        facts.push(comfortDesc);
      }

      // Step 4 facts (Interests, wishes)
      if (currentStep >= 4) {
        let interestsStr = state.interests.length ? state.interests.join(', ') : 'Снегоходные переходы';
        let interestsDesc = `Приоритетные активности программы: <strong>${interestsStr}</strong>.`;
        if (state.wishes && state.wishes.trim()) {
          interestsDesc += ` Особый сценарий экспедиции: <em>«${state.wishes.trim()}»</em>.`;
        }
        facts.push(interestsDesc);
      }

      // Step 5 conclusion
      const isElite = state.comfort === 'Elite' || state.travelType === 'Private expedition';
      const isBusiness = state.comfort === 'Business' || state.travelType === 'Корпоративный выезд';
      let clientTier = 'Партнер Бюро';
      let statusTitle = 'Active Explorer';
      let statusText = 'Сценарий передан в технический отдел для предварительного согласования трасс.';
      if (isElite) {
        clientTier = 'Элитарный статус (Tier 1)';
        statusTitle = 'Elite Private';
        statusText = 'Включено приоритетное обслуживание. Резерв техники и команды под ваши даты.';
      } else if (isBusiness) {
        clientTier = 'Премиальный статус (Tier 2)';
        statusTitle = 'Premium Business';
        statusText = 'Гиды и лидеры команды фиксируются под ваш проект, готовится эскиз.';
      }

      if (currentStep >= 5) {
        facts.push(`Установлен ранг гостя: <strong>${clientTier}</strong>. Статус сценария: <strong>«${statusTitle}»</strong>. ${statusText}`);
      }

      const factsHTML = facts.map((fact, idx) => {
        const isNewest = idx >= facts.length - 2; // facts added in the current step
        const animClass = isNewest ? 'portrait-fact-new' : '';
        return `<li class="portrait-fact ${animClass}">${fact}</li>`;
      }).join('');

      return `
        <div class="client-portrait-box">
          <div class="portrait-header">
            <svg class="portrait-mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg> 
            Экспедиционный аудит (Шаг ${currentStep} из 5)
          </div>
          <ul class="portrait-facts-list">
            ${factsHTML}
          </ul>
          ${currentStep === 5 ? `
            <div class="portrait-divider"></div>
            <div class="profile-details-grid">
              <div class="profile-row"><span>Класс обслуживания:</span><strong>${clientTier}</strong></div>
              <div class="profile-row"><span>Статус сметы:</span><strong>Персональный расчет</strong></div>
              <div class="profile-row total"><span>Приоритет:</span><span>Высокий (Tier ${isElite ? 1 : isBusiness ? 2 : 3})</span></div>
            </div>
          ` : ''}
        </div>
      `;
    };

    const render = () => {
      const scenario = getScenario();
      const progress = getProgress();
      const badges = getBadges(progress);
      const smeta = calculateSmeta();

      // Desired budget label update
      setText('[data-output="budget"]', `≈ ${new Intl.NumberFormat('ru-RU').format(state.budget)} ₽`);
      setText('[data-output="duration"]', 'дней');
      setText('[data-output="group"]', 'человек');

      // Metrics block update
      setText('[data-result="duration"]', formatDays(state.duration));
      setText('[data-result="group"]', formatPeople(state.group));
      setText('[data-result="title"]', scenario.title);
      setText('[data-result="description"]', scenario.description);
      setText('[data-result="comfort"]', state.comfort);
      setText('[data-result="difficulty"]', state.difficulty);
      setText('[data-result="direction"]', getDirection());
      setText('[data-result="interests"]', state.interests.length ? state.interests.join(', ') : 'Добавьте детали');

      // Animate progress percentage
      const progressEl = root?.querySelector('[data-result="progress"]');
      animatePrice(progressEl, prevPrices.progress, progress, '', '%');
      prevPrices.progress = progress;

      // Update background photo of result card dynamically based on scenario
      const heroImageEl = resultCard;
      if (heroImageEl) {
        heroImageEl.style.backgroundImage = `radial-gradient(circle at 82% 8%, rgba(111,208,197,.2), transparent 22rem), radial-gradient(circle at 10% 92%, rgba(213,170,107,.1), transparent 22rem), linear-gradient(145deg, rgba(8,21,34,.98), rgba(13,32,50,.92)), url('${scenario.image}')`;
        heroImageEl.style.backgroundSize = 'cover, cover, cover, cover';
        heroImageEl.style.backgroundPosition = 'center';
      }

      // Render Client Portrait & Conclusion
      const profileBox = root?.querySelector('[data-profile-box]');
      if (profileBox) {
        profileBox.innerHTML = generateClientPortrait();
      }

      // Sync desired budget metric label (fix bug: show actually chosen budget, not calculated sum)
      setText('[data-result="desiredBudget"]', formatMoney(state.budget));

      root?.querySelectorAll('[data-result="progressBar"]').forEach(progressBar => {
        progressBar.style.width = `${progress}%`;
      });

      const badgeCloud = root?.querySelector('[data-result="badges"]');
      if (badgeCloud) {
        badgeCloud.innerHTML = badges.map(label => `<span>${label}</span>`).join('');
      }

      if (summaryInput) summaryInput.value = serialize();
      
      // Update text in wishes preview box
      const wishesBoxEl = root?.querySelector('[data-result-wishes-box]');
      if (wishesBoxEl) {
        const textPreview = [state.lodging_wishes, state.wishes].filter(Boolean).join(' | ');
        root.querySelectorAll('[data-result="wishes"]').forEach(el => {
          el.textContent = textPreview || 'Нет';
        });
      }
      
      updateSliderTracks();

      resultCard?.classList.remove('scenario-updated');
      window.requestAnimationFrame(() => resultCard?.classList.add('scenario-updated'));
    };

    // Range & Text Input Sync logic
    configurator.querySelectorAll('[data-config-range]').forEach(range => {
      range.addEventListener('input', () => {
        const key = range.dataset.configRange;
        const val = Number(range.value);
        state[key] = val;

        // Sync text input value
        const inputEl = configurator.querySelector(`[data-config-input="${key}"]`);
        if (inputEl) {
          if (key === 'budget') {
            inputEl.value = new Intl.NumberFormat('ru-RU').format(val);
          } else {
            inputEl.value = val;
          }
        }
        render();
      });
    });

    configurator.querySelectorAll('[data-config-input]').forEach(inputEl => {
      const key = inputEl.dataset.configInput;
      
      // Initial value format
      if (key === 'budget') {
        inputEl.value = new Intl.NumberFormat('ru-RU').format(state[key]);
      } else {
        inputEl.value = state[key];
      }

      inputEl.addEventListener('input', () => {
        const rawVal = inputEl.value.replace(/\s/g, '');
        const val = parseInt(rawVal, 10);
        if (!isNaN(val)) {
          state[key] = val;
          const rangeEl = configurator.querySelector(`[data-config-range="${key}"]`);
          if (rangeEl) {
            rangeEl.value = val;
          }
          render();
        }
      });

      inputEl.addEventListener('blur', () => {
        const val = state[key];
        if (key === 'budget') {
          inputEl.value = new Intl.NumberFormat('ru-RU').format(val);
        } else {
          inputEl.value = val;
        }
      });
    });

    // Start city text input handling
    const startInput = configurator.querySelector('[data-config-text="start"]');
    const suggestionChips = configurator.querySelector('.suggestion-chips');
    let cityHint = null;
    if (suggestionChips) {
      suggestionChips.innerHTML = '';
      popularStartCities.forEach(city => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'suggestion-chip';
        button.textContent = city;
        suggestionChips.appendChild(button);
      });

      cityHint = document.createElement('span');
      cityHint.className = 'city-autocomplete-hint';
      cityHint.setAttribute('aria-live', 'polite');
      suggestionChips.insertAdjacentElement('afterend', cityHint);
    }

    if (startInput) {
      const datalist = document.createElement('datalist');
      datalist.id = 'start-city-options';
      popularStartCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
      });
      startInput.setAttribute('list', datalist.id);
      startInput.insertAdjacentElement('afterend', datalist);
    }

    const updateCityHint = () => {
      if (!startInput || !cityHint) return;
      const value = startInput.value.trim();
      const suggestion = findCitySuggestion(value);
      startInput.dataset.suggestedCity = suggestion;
      if (suggestion) {
        cityHint.textContent = `Подсказка: ${suggestion}. Нажмите Tab, Enter или →, чтобы подставить город.`;
      } else if (value.length >= 2 && !popularStartCities.some(city => normalizeText(city) === normalizeText(value))) {
        cityHint.textContent = 'Если вашего города нет в списке, допишите его вручную — мы все равно рассчитаем трансфер.';
      } else {
        cityHint.textContent = '';
      }
    };
    if (startInput) {
      startInput.addEventListener('input', () => {
        state.start = startInput.value || 'Екатеринбург';
        render();
      });
    }

    if (startInput) {
      startInput.addEventListener('input', updateCityHint);
      startInput.addEventListener('keydown', event => {
        const suggestion = startInput.dataset.suggestedCity;
        if (!suggestion) return;
        if (event.key === 'Tab' || event.key === 'Enter' || event.key === 'ArrowRight') {
          event.preventDefault();
          startInput.value = suggestion;
          state.start = suggestion;
          updateCityHint();
          render();
        }
      });
      updateCityHint();
    }

    // Suggestion chips
    configurator.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.textContent.trim();
        if (startInput) {
          startInput.value = val;
        }
        state.start = val;
        updateCityHint();
        render();
      });
    });

    // Lodging wishes text area handling
    const lodgingInput = configurator.querySelector('[data-config-text="lodging_wishes"]');
    if (lodgingInput) {
      lodgingInput.addEventListener('input', () => {
        state.lodging_wishes = lodgingInput.value;
        render();
      });
    }

    // Wishes text area handling
    const wishesInput = configurator.querySelector('[data-config-text="wishes"]');
    if (wishesInput) {
      wishesInput.addEventListener('input', () => {
        state.wishes = wishesInput.value;
        render();
      });
    }

    // Contacts input key listener to update progress meter dynamically
    form?.querySelectorAll('input[name="name"], input[name="contact"]').forEach(el => {
      el.addEventListener('input', render);
    });

    const phoneInput = form?.querySelector('input[name="contact"]');
    const cleanPhoneValue = value => String(value || '').replace(/[^\d+()\s-]/g, '');
    const phoneDigits = value => String(value || '').replace(/\D/g, '');
    if (phoneInput) {
      phoneInput.type = 'tel';
      phoneInput.inputMode = 'tel';
      phoneInput.autocomplete = 'tel';
      phoneInput.placeholder = '+7 (___) ___-__-__';
      phoneInput.setAttribute('aria-label', 'Телефон');
      phoneInput.removeAttribute('pattern');
      phoneInput.addEventListener('beforeinput', event => {
        if (event.data && event.data.length === 1 && /[^\d+()\s-]/.test(event.data)) {
          event.preventDefault();
        }
      });
      phoneInput.addEventListener('input', () => {
        const cleaned = cleanPhoneValue(phoneInput.value);
        if (phoneInput.value !== cleaned) {
          phoneInput.value = cleaned;
        }
        phoneInput.setCustomValidity('');
      });
      const phoneHint = phoneInput.closest('.input-control')?.querySelector('.transparent-hint');
      if (phoneHint) {
        phoneHint.textContent = 'Только номер телефона: цифры, +, скобки, пробелы и дефисы.';
      }
    }

    // Group button / Chip selectors
    configurator.querySelectorAll('[data-config-group]').forEach(group => {
      const key = group.dataset.configGroup;
      const isMulti = group.dataset.multi === 'true';
      group.querySelectorAll('button[data-value]').forEach(button => {
        button.addEventListener('click', () => {
          const value = button.dataset.value;
          if (isMulti) {
            button.classList.toggle('is-active');
            state[key] = [...group.querySelectorAll('button.is-active')].map(item => item.dataset.value);
          } else {
            group.querySelectorAll('button').forEach(item => item.classList.remove('is-active'));
            button.classList.add('is-active');
            state[key] = value;
          }
          render();
        });
      });
    });

    // Wizard navigation click handlers
    configurator.querySelectorAll('[data-wizard-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          currentStep += 1;
          updateSteps();
          render();
          scrollToConfiguratorTop();
        }
      });
    });

    configurator.querySelectorAll('[data-wizard-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep -= 1;
          updateSteps();
          render();
          scrollToConfiguratorTop();
        }
      });
    });

    // Theme Switcher implementation
    root?.querySelectorAll('[data-config-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-config-theme]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        
        const selectedTheme = btn.dataset.configTheme;
        state.theme = selectedTheme;
        
        // Remove old theme classes and add new one
        root.classList.remove('theme-aurora', 'theme-campfire', 'theme-ice');
        root.classList.add(`theme-${selectedTheme}`);
        
        render();
      });
    });

    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const request = Object.fromEntries(new FormData(form).entries());
      if (phoneInput) {
        const cleanedPhone = cleanPhoneValue(phoneInput.value).trim();
        const digits = phoneDigits(cleanedPhone);
        phoneInput.value = cleanedPhone;
        request.contact = cleanedPhone;
        if (digits.length < 10) {
          phoneInput.setCustomValidity('Введите номер телефона: минимум 10 цифр.');
          phoneInput.reportValidity();
          return;
        }
        phoneInput.setCustomValidity('');
      }

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton?.textContent || '';
      const scenario = getScenario();
      const smeta = calculateSmeta();
      submitButton?.setAttribute('disabled', 'disabled');
      if (submitButton) submitButton.textContent = 'Отправляем...';

      try {
        await window.AcerolaLeads?.send({
          source: 'configurator',
          form: request,
          config: {
            scenario: scenario.title,
            direction: getDirection(),
            duration: state.duration,
            durationLabel: formatDays(state.duration),
            group: state.group,
            groupLabel: formatPeople(state.group),
            budget: state.budget,
            budgetLabel: formatMoney(state.budget),
            estimatedTotal: smeta.total,
            estimatedTotalLabel: formatMoney(smeta.total),
            start: state.start,
            travelType: state.travelType,
            difficulty: state.difficulty,
            comfort: state.comfort,
            interests: state.interests,
            lodgingWishes: state.lodging_wishes,
            wishes: state.wishes,
            theme: state.theme,
            summary: serialize()
          }
        });
      } catch (error) {
        console.error('Acerola configurator lead failed', error);
        alert(error.message || 'Не удалось отправить заявку. Проверьте телефон и попробуйте еще раз.');
        submitButton?.removeAttribute('disabled');
        if (submitButton) submitButton.textContent = originalButtonText;
        return;
      }

      submitButton?.removeAttribute('disabled');
      if (submitButton) submitButton.textContent = originalButtonText;
      
      const modal = document.getElementById('success-modal');
      if (modal) {
        const leadMsg = `Спасибо за доверие, <strong>${request.name}</strong>! Мы получили параметры вашей индивидуальной экспедиции. Наш эксперт уже приступил к детальному аудиту маршрута и свяжется с вами по указанным контактам (<strong>${request.contact}</strong>) в течение 30 минут для презентации концепции.`;
        
        const messageEl = modal.querySelector('[data-modal-message]');
        if (messageEl) {
          const userName = String(request.name || '').trim() || 'гость';
          messageEl.innerHTML = `Спасибо, <strong>${userName}</strong>. Мы получили параметры поездки и подготовим персональный сценарий. Свяжемся по номеру <strong>${request.contact}</strong>, чтобы уточнить детали маршрута.`;
        }
        
        const summaryListEl = modal.querySelector('[data-modal-summary-list]');
        if (summaryListEl) {
          summaryListEl.innerHTML = `
            <li>Сроки: <strong>${formatDays(state.duration)}</strong></li>
            <li>Бюджет: <strong>${formatMoney(state.budget)}</strong></li>
            <li>Группа: <strong>${formatPeople(state.group)}</strong></li>
            <li>Старт: <strong>${state.start}</strong></li>
            <li>Формат: <strong>${state.travelType}</strong></li>
            <li>Комфорт: <strong>${state.comfort}</strong></li>
          `;
        }
        
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      }

      console.log('Acerola custom expedition request submitted', {
        request,
        ...state,
        scenario: getScenario().title,
        summary: serialize()
      });
    });

    // Initialize all
    updateSteps();
    render();
    window.AcerolaConfiguratorEffects?.initParticleEngine(root, state);
    window.AcerolaConfiguratorEffects?.initStickyBarObserver();
    window.AcerolaConfiguratorEffects?.initModalEvents();
  }
});

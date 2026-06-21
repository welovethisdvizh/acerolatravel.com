const TELEGRAM_API = 'https://api.telegram.org/bot';
const MAX_FIELD_LENGTH = 900;
const MAX_MESSAGE_LENGTH = 3900;

const sourceLabels = {
  contact_form: 'Форма заявки',
  configurator: 'Конфигуратор маршрута'
};

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const cleanText = value => String(value ?? '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const truncate = (value, limit = MAX_FIELD_LENGTH) => {
  const text = cleanText(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
};

const normalizePhoneDigits = value => String(value || '').replace(/\D/g, '');

const parseBody = async req => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const addLine = (lines, label, value) => {
  const text = truncate(value);
  if (!text) return;
  lines.push(`<b>${escapeHtml(label)}:</b> ${escapeHtml(text)}`);
};

const addSection = (lines, title) => {
  lines.push('');
  lines.push(`<b>${escapeHtml(title)}</b>`);
};

const formatLeadMessage = payload => {
  const form = payload.form || {};
  const config = payload.config || {};
  const page = payload.page || {};
  const source = sourceLabels[payload.source] || sourceLabels.contact_form;
  const submittedAt = payload.submittedAt
    ? new Date(payload.submittedAt)
    : new Date();

  const lines = [
    '<b>ACEROLA TRAVEL</b>',
    `<b>Новая заявка: ${escapeHtml(source)}</b>`
  ];

  addSection(lines, 'Клиент');
  addLine(lines, 'Имя', form.name);
  addLine(lines, 'Контакт', form.contact);
  addLine(lines, 'Направление', form.direction);
  addLine(lines, 'Комментарий', form.message);

  if (payload.source === 'configurator') {
    addSection(lines, 'Параметры конфигуратора');
    addLine(lines, 'Сценарий', config.scenario);
    addLine(lines, 'Старт', config.start);
    addLine(lines, 'Сроки', config.durationLabel);
    addLine(lines, 'Группа', config.groupLabel);
    addLine(lines, 'Бюджет клиента', config.budgetLabel);
    addLine(lines, 'Расчет сайта', config.estimatedTotalLabel);
    addLine(lines, 'Формат', config.travelType);
    addLine(lines, 'Сложность', config.difficulty);
    addLine(lines, 'Комфорт', config.comfort);
    addLine(lines, 'Интересы', Array.isArray(config.interests) ? config.interests.join(', ') : config.interests);
    addLine(lines, 'Пожелания к размещению', config.lodgingWishes);
    addLine(lines, 'Дополнительные пожелания', config.wishes);
    addLine(lines, 'Сводка', config.summary);
  }

  addSection(lines, 'Источник');
  addLine(lines, 'Страница', page.title);
  addLine(lines, 'URL', page.url);
  addLine(lines, 'Дата', submittedAt.toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }));

  const message = lines.join('\n');
  return message.length > MAX_MESSAGE_LENGTH
    ? `${message.slice(0, MAX_MESSAGE_LENGTH - 28)}\n\n<i>Сообщение сокращено.</i>`
    : message;
};

const validatePayload = payload => {
  const form = payload.form || {};
  const name = cleanText(form.name);
  const contact = cleanText(form.contact);
  const contactDigits = normalizePhoneDigits(contact);
  const looksLikeTelegram = /^@?[a-zA-Z0-9_]{4,32}$/.test(contact);

  if (!name) {
    return 'Укажите имя.';
  }

  if (!contact) {
    return 'Укажите телефон или Telegram.';
  }

  if (payload.source === 'configurator' && contactDigits.length < 10) {
    return 'В конфигураторе нужен телефон минимум из 10 цифр.';
  }

  if (payload.source !== 'configurator' && contactDigits.length < 7 && !looksLikeTelegram) {
    return 'Контакт должен быть телефоном или Telegram username.';
  }

  return '';
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    res.status(500).json({ ok: false, error: 'Telegram environment variables are not configured.' });
    return;
  }

  try {
    const payload = await parseBody(req);
    const validationError = validatePayload(payload);

    if (validationError) {
      res.status(400).json({ ok: false, error: validationError });
      return;
    }

    const telegramResponse = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadMessage(payload),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const telegramResult = await telegramResponse.json().catch(() => ({}));

    if (!telegramResponse.ok || !telegramResult.ok) {
      res.status(502).json({
        ok: false,
        error: telegramResult.description || 'Telegram API request failed.'
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Unexpected server error.' });
  }
};

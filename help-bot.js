/* Real conversational assistant for NovaBuild AI. Calls the server-side AI function. */
(() => {
  const config = window.NOVABUILD_CONFIG || {};
  const launcher = document.createElement('button');
  launcher.id = 'nb-help-launcher';
  launcher.type = 'button';
  launcher.innerHTML = '<span class="nb-launcher-spark">✦</span><span data-launcher-label>שוחח עם NovaBuild AI</span>';
  launcher.setAttribute('aria-controls', 'nb-help-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-label', 'פתיחת העוזר החכם');

  const panel = document.createElement('section');
  panel.id = 'nb-help-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'העוזר החכם של NovaBuild AI');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="nb-help-head">
      <div class="nb-help-avatar" aria-hidden="true">✦</div>
      <div class="nb-help-title">NovaBuild AI<span class="nb-help-subtitle"><span class="nb-online-dot"></span> העוזר העסקי שלך · מוכן לעזור</span></div>
      <button id="nb-help-new" type="button" aria-label="שיחה חדשה" title="שיחה חדשה">↻</button>
      <button id="nb-help-close" type="button" aria-label="סגירה">×</button>
    </header>
    <div id="nb-help-messages" aria-live="polite" aria-relevant="additions" aria-label="הודעות השיחה"></div>
    <div id="nb-help-quick">
      <button type="button" data-prompt="אני רוצה לבנות אתר לעסק שלי. עזור לי להתחיל.">בניית אתר</button>
      <button type="button" data-prompt="תסביר לי בפשטות מה אפשר לעשות ב-NovaBuild AI.">איך זה עובד?</button>
      <button type="button" data-prompt="עזור לי להביא יותר לקוחות לעסק.">שיווק ולקוחות</button>
    </div>
    <form class="nb-help-form" id="nb-help-form">
      <textarea id="nb-help-input" rows="1" maxlength="1600" autocomplete="off" placeholder="כתוב לי מה תרצה לעשות…" aria-label="ההודעה שלך"></textarea>
      <button id="nb-help-send" type="submit" aria-label="שליחת הודעה">➤</button>
    </form>
    <div class="nb-help-note">מבוסס AI · אל תשלח סיסמאות או פרטי תשלום.</div>`;
  document.body.append(launcher, panel);

  const messagesEl = panel.querySelector('#nb-help-messages');
  const input = panel.querySelector('#nb-help-input');
  const send = panel.querySelector('#nb-help-send');
  const quick = panel.querySelector('#nb-help-quick');
  let history = [];
  let busy = false;
  let greeted = false;
  let currentLanguage = window.NovaBuildI18n?.getLanguage?.() || 'he';

  function setLanguage(language) {
    currentLanguage = language === 'en' ? 'en' : 'he';
    const en = currentLanguage === 'en';
    launcher.querySelector('[data-launcher-label]').textContent = en ? 'Chat with NovaBuild AI' : 'שוחח עם NovaBuild AI';
    launcher.setAttribute('aria-label', en ? 'Open AI assistant' : 'פתיחת העוזר החכם');
    panel.querySelector('.nb-help-title').childNodes[0].textContent = 'NovaBuild AI';
    panel.querySelector('.nb-help-subtitle').innerHTML = '<span class="nb-online-dot"></span> ' + (en ? 'Your business assistant · Ready to help' : 'העוזר העסקי שלך · מוכן לעזור');
    panel.querySelector('#nb-help-new').title = en ? 'New chat' : 'שיחה חדשה';
    panel.querySelector('#nb-help-new').setAttribute('aria-label', en ? 'New chat' : 'שיחה חדשה');
    panel.querySelector('#nb-help-close').setAttribute('aria-label', en ? 'Close' : 'סגירה');
    input.placeholder = en ? 'Tell me what you want to do…' : 'כתוב לי מה תרצה לעשות…';
    input.setAttribute('aria-label', en ? 'Your message' : 'ההודעה שלך');
    send.setAttribute('aria-label', en ? 'Send message' : 'שליחת הודעה');
    panel.querySelector('.nb-help-note').textContent = en ? 'AI-powered · Never share passwords or payment details.' : 'מבוסס AI · אל תשלח סיסמאות או פרטי תשלום.';
    const prompts = en ? [
      ['Build a website', 'Help me understand how NovaBuild AI works.', 'Help me get more customers for my business.']
    ][0] : [
      'אני רוצה לבנות אתר לעסק שלי. עזור לי להתחיל.',
      'תסביר לי בפשטות מה אפשר לעשות ב-NovaBuild AI.',
      'עזור לי להביא יותר לקוחות לעסק.'
    ];
    quick.querySelectorAll('[data-prompt]').forEach((button, i) => {
      button.textContent = en ? ['Build a website', 'How does it work?', 'Marketing & leads'][i] : ['בניית אתר', 'איך זה עובד?', 'שיווק ולקוחות'][i];
      button.dataset.prompt = prompts[i];
    });
  }

  function addMessage(content, role = 'assistant', extraClass = '') {
    const bubble = document.createElement('div');
    bubble.className = 'nb-help-message ' + (role === 'user' ? 'user' : 'bot') + (extraClass ? ' ' + extraClass : '');
    bubble.textContent = content;
    messagesEl.append(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function welcome() {
    if (greeted) return;
    greeted = true;
    addMessage(currentLanguage === 'en'
      ? 'Hi! I’m your NovaBuild AI assistant. Tell me what you want to create or ask me anything about building your business online. I’ll guide you step by step.'
      : 'היי! 👋 אני העוזר החכם של NovaBuild. אפשר לדבר איתי בחופשיות — לשאול שאלות, לבנות אתר, לשפר את התוכן או להבין איך להביא לקוחות. אני אסביר הכול צעד־צעד ובשפה פשוטה. במה נתחיל?');
  }

  function open({ focus = true } = {}) {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    welcome();
    if (focus) input.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
  }
  function navigate(view) {
    document.querySelector('.nav-item[data-view="' + view + '"]')?.click();
  }

  function applyAction(data) {
    const action = data.action || 'NONE';
    if (action === 'OPEN_BUILDER' || action === 'BUILD_SITE' || action === 'EDIT_SITE') {
      navigate('builder');
    } else if (action === 'OPEN_MARKETING') navigate('growth');
    else if (action === 'OPEN_LEADBOT') navigate('leadbot');
    else if (action === 'OPEN_SECURITY') navigate('security');
    else if (action === 'OPEN_SEO') navigate('seo');
    else if (action === 'OPEN_AGENTS') navigate('agents');

    if (action === 'BUILD_SITE') {
      const brief = document.getElementById('siteBrief');
      const name = document.getElementById('siteName');
      const type = document.getElementById('siteType');
      const headline = document.getElementById('siteHeadline');
      const button = document.getElementById('siteButton');
      const accent = document.getElementById('siteAccent');
      if (brief && data.siteBrief) brief.value = data.siteBrief;
      if (name && data.businessName) name.value = data.businessName;
      if (type && data.siteType) type.value = data.siteType;
      if (headline && data.headline) headline.value = data.headline;
      if (button && data.buttonText) button.value = data.buttonText;
      if (accent && data.accent) accent.value = data.accent;
      if (brief?.value.trim()) {
        document.getElementById('makeBrief')?.click();
        document.getElementById('sitePreview')?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
    if (action === 'EDIT_SITE') {
      const fields = [
        ['siteName', data.businessName], ['siteBrief', data.siteBrief],
        ['siteHeadline', data.headline], ['siteButton', data.buttonText], ['siteAccent', data.accent]
      ];
      let changed = false;
      for (const [id, value] of fields) {
        const el = document.getElementById(id);
        if (el && value) { el.value = value; changed = true; }
      }
      if (changed) document.getElementById('makeBrief')?.click();
    }
  }

  async function sendMessage(raw) {
    const content = String(raw || '').trim();
    if (!content || busy) return;
    addMessage(content, 'user');
    history.push({role: 'user', content});
    input.value = '';
    input.style.height = 'auto';
    quick.hidden = true;
    busy = true;
    send.disabled = true;
    input.disabled = true;
    const typing = addMessage(currentLanguage === 'en' ? 'Thinking…' : 'חושב…', 'assistant', 'typing');
    let requestTimeout;
    try {
      if (!config.supabaseUrl || !config.supabaseAnonKey) throw new Error('CONFIG_MISSING');
      const controller = new AbortController();
      requestTimeout = setTimeout(() => controller.abort(), 25000);
      let businessProfile = null;
      try { businessProfile = await window.NovaBuildAuth?.getBusinessProfile?.(); } catch (_) {}
      const response = await fetch(config.supabaseUrl.replace(/\/$/, '') + '/functions/v1/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabaseAnonKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          language: currentLanguage,
          messages: history.slice(-10),
          currentView: document.querySelector('.view.active')?.id?.replace('view-', '') || 'overview',
          businessProfile: businessProfile ? JSON.stringify(businessProfile) : ''
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.code === 'AI_NOT_CONFIGURED') throw new Error('AI_NOT_CONFIGURED');
        throw new Error(data.error || 'REQUEST_FAILED');
      }
      typing.remove();
      addMessage(data.reply, 'assistant');
      history.push({role: 'assistant', content: data.reply});
      applyAction(data);
    } catch (error) {
      typing.remove();
      const message = error.name === 'AbortError'
        ? (currentLanguage === 'en' ? 'The AI reply took too long. Please try a shorter message or try again shortly.' : 'התגובה מתעכבת יותר מדי. נסה הודעה קצרה יותר או נסה שוב בעוד רגע.')
        : error.message === 'AI_NOT_CONFIGURED'
        ? (currentLanguage === 'en' ? 'The AI assistant is not connected yet. The site owner needs to add the server AI key in Supabase. No login is required for the chat.' : 'העוזר עדיין לא מחובר למנוע AI. צריך להגדיר את מפתח ה-AI בשרת Supabase. לא צריך להתחבר לחשבון כדי לשוחח.')
        : (error.message === 'CONFIG_MISSING'
          ? (currentLanguage === 'en' ? 'The assistant connection settings are missing. Please tell the site owner.' : 'חסרות הגדרות החיבור של העוזר. צריך לעדכן את בעל האתר.')
          : (currentLanguage === 'en' ? 'I couldn’t get a reply just now. Please try again in a moment.' : 'לא הצלחתי לקבל תשובה כרגע. נסה שוב בעוד רגע.'));
      addMessage(message, 'assistant', 'error');
      console.error('NovaBuild AI assistant error:', error);
    } finally {
      if (requestTimeout) clearTimeout(requestTimeout);
      busy = false;
      send.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  launcher.addEventListener('click', () => panel.hidden ? open() : close());
  panel.querySelector('#nb-help-close').addEventListener('click', close);
  panel.querySelector('#nb-help-new').addEventListener('click', () => {
    history = [];
    greeted = false;
    messagesEl.replaceChildren();
    quick.hidden = false;
    welcome();
    input.focus();
  });
  panel.querySelector('#nb-help-form').addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      panel.querySelector('#nb-help-form').requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  quick.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(); });
  window.addEventListener('novabuild:language', event => setLanguage(event.detail.language));

  window.NovaBuildAssistant = {
    open,
    close,
    ask: sendMessage,
    newChat: () => panel.querySelector('#nb-help-new').click()
  };
  setLanguage(currentLanguage);
  open({focus: false});
})();
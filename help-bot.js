/* Lightweight onboarding assistant. This is a guided prototype, not a live AI service. */
(() => {
  const launcher = document.createElement('button');
  launcher.id = 'nb-help-launcher';
  launcher.type = 'button';
  launcher.textContent = '✦ Help me get started';
  launcher.setAttribute('aria-controls', 'nb-help-panel');
  launcher.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('section');
  panel.id = 'nb-help-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'NovaBuild getting started assistant');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="nb-help-head">
      <div class="nb-help-avatar" aria-hidden="true">N</div>
      <div class="nb-help-title">NovaBuild Guide<span class="nb-help-subtitle">Getting started assistant</span></div>
      <button id="nb-help-close" type="button" aria-label="Close help">×</button>
    </header>
    <div id="nb-help-messages" aria-live="polite" aria-relevant="additions"></div>
    <div id="nb-help-quick">
      <button type="button" data-help="website">Build a website</button>
      <button type="button" data-help="marketing">Marketing help</button>
      <button type="button" data-help="seo">Google & SEO</button>
      <button type="button" data-help="account">Account & saving</button>
    </div>
    <form class="nb-help-form" id="nb-help-form">
      <input id="nb-help-input" maxlength="500" autocomplete="off" placeholder="Tell me what you want to do…" aria-label="Your message">
      <button id="nb-help-send" type="submit">Send</button>
    </form>
    <div class="nb-help-note">Guided demo · Don't share passwords, payment details, or private customer data.</div>
  `;
  document.body.append(launcher, panel);
  const messages = panel.querySelector('#nb-help-messages');
  const input = panel.querySelector('#nb-help-input');
  let greeted = false;

  function say(text, who = 'bot') {
    const bubble = document.createElement('div');
    bubble.className = 'nb-help-message ' + who;
    bubble.textContent = text;
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function open() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      say("Hi! I'm your NovaBuild getting-started guide. What are you hoping to create today? I can point you to the right tool and help you take the first step.");
      greeted = true;
    }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  function go(view) {
    const button = document.querySelector('.nav-item[data-view="' + view + '"]');
    if (button) button.click();
  }
  function answer(raw) {
    const text = raw.toLowerCase();
    if (/website|site|web page|landing|store|shop|אתר|חנות|דף נחיתה/.test(text)) {
      say("Great — let's start with your website. Open Website builder, describe your business and ideal customers, then generate a draft. The current builder creates a starter site; publishing it to a custom domain is a separate step.");
      return {label:'Open Website builder', action:() => go('builder')};
    }
    if (/marketing|instagram|facebook|ads|advertis|campaign|שיווק|פרסום|מודעות/.test(text)) {
      say("For marketing, start with Marketing studio to plan your message and content. Ads Autopilot is a prototype, so it does not launch campaigns or spend money automatically.");
      return {label:'Open Marketing studio', action:() => go('marketing')};
    }
    if (/google|seo|search|rank|גוגל|קידום/.test(text)) {
      say("For Google visibility, open Google & SEO. Start by checking your page titles, descriptions, mobile usability and useful content. This prototype provides guidance; it does not guarantee rankings or automatically submit your site.");
      return {label:'Open Google & SEO', action:() => go('seo')};
    }
    if (/account|sign in|login|save|password|חשבון|התחברות|שמירה/.test(text)) {
      say("Open AI Agents to find the workspace account panel. Use a test account first, and never share your password here. Saving plans requires authentication to be configured.");
      return {label:'Open AI Agents', action:() => go('agents')};
    }
    if (/agent|plan|task|team|סוכן|תוכנית|משימות/.test(text)) {
      say("Open AI Agents, describe the goal you want to work on, choose a priority and create a work plan. This prototype makes a plan but does not run background jobs or perform external actions.");
      return {label:'Open AI Agents', action:() => go('agents')};
    }
    say("I can guide you through the first steps. Are you trying to build a website, plan marketing, improve Google visibility, or manage your account? Choose one of the quick options below.");
    return null;
  }
  function respond(raw) {
    const value = raw.trim();
    if (!value) return;
    say(value, 'user');
    const result = answer(value);
    if (result) {
      const actionButton = document.createElement('button');
      actionButton.type = 'button';
      actionButton.textContent = result.label;
      actionButton.addEventListener('click', () => { result.action(); panel.hidden = true; launcher.setAttribute('aria-expanded','false'); });
      const wrapper = document.createElement('div');
      wrapper.className = 'nb-help-message bot';
      wrapper.append(actionButton);
      messages.append(wrapper);
      messages.scrollTop = messages.scrollHeight;
    }
  }
  launcher.addEventListener('click', () => panel.hidden ? open() : close());
  panel.querySelector('#nb-help-close').addEventListener('click', close);
  panel.querySelector('#nb-help-form').addEventListener('submit', event => {
    event.preventDefault();
    respond(input.value);
    input.value = '';
    input.focus();
  });
  panel.querySelectorAll('[data-help]').forEach(button => button.addEventListener('click', () => respond(button.textContent)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(); });
})();

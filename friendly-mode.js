/* Friendly guided setup: one plain-language prompt, optional advanced controls. */
(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  function init() {
    const form = $('#view-builder .builder-form');
    if (!form || $('#nb-quickstart')) return;
    const details = document.createElement('details');
    details.id = 'nb-advanced-settings';
    const summary = document.createElement('summary');
    summary.textContent = 'הגדרות נוספות (לא חובה)';
    details.append(summary);
    const keepOutside = new Set(['builder-actions','fine-print','output']);
    [...form.children].forEach(node => {
      if (keepOutside.has(node.className) || node.id === 'aiWebsiteStatus' || node.id === 'siteOutput') return;
      if (node.matches('label,input,select,textarea,.builder-step,.customize-details')) details.append(node);
    });
    const quick = document.createElement('section');
    quick.className = 'nb-quickstart';
    quick.id = 'nb-quickstart';
    quick.innerHTML = `
      <div class="nb-kicker" data-he="בוא נתחיל בקטן" data-en="LET'S KEEP IT SIMPLE">בוא נתחיל בקטן</div>
      <h2 data-he="ספר לי מה העסק שלך צריך — ואני אכין טיוטה ראשונה 🙂" data-en="Tell me what your business needs — I'll prepare a first draft 🙂">ספר לי מה העסק שלך צריך — ואני אכין טיוטה ראשונה 🙂</h2>
      <p data-he="לא צריך למלא טופס ארוך. כתוב במשפט או שניים מה העסק עושה, ואני אשתמש בזה כדי להכין אתר ראשוני. אפשר לשנות הכול אחר כך." data-en="No long form to fill in. In a sentence or two, tell me what your business does and I'll use it to prepare a starter website. You can change everything later.">לא צריך למלא טופס ארוך. כתוב במשפט או שניים מה העסק עושה, ואני אשתמש בזה כדי להכין אתר ראשוני. אפשר לשנות הכול אחר כך.</p>
      <textarea id="nb-business-idea" rows="3" maxlength="1800" placeholder="למשל: אני ספר ברמת גן ורוצה אתר שמציג את השירותים ומאפשר לקבוע תור..." data-placeholder-he="למשל: אני ספר ברמת גן ורוצה אתר שמציג את השירותים ומאפשר לקבוע תור..." data-placeholder-en="For example: I'm a barber in Ramat Gan and want a website showing my services and letting customers book..."></textarea>
      <div class="nb-examples">
        <button class="nb-example" type="button" data-example-he="אני בעל עסק מקומי ורוצה לקבל יותר פניות מלקוחות" data-example-en="I run a local business and want to get more customer inquiries">🏪 עסק מקומי</button>
        <button class="nb-example" type="button" data-example-he="אני רוצה חנות אינטרנטית למכירת מוצרים" data-example-en="I want an online store to sell products">🛍️ חנות אונליין</button>
        <button class="nb-example" type="button" data-example-he="אני נותן שירות ורוצה אתר תדמית מקצועי" data-example-en="I offer a service and want a professional business website">✨ אתר תדמית</button>
      </div>
      <div class="nb-start-row"><button class="primary nb-start" id="nb-build-first-draft" type="button" data-he="✨ תכין לי טיוטה" data-en="✨ Create my first draft">✨ תכין לי טיוטה</button><span class="nb-hint" data-he="בלי התחייבות — אפשר לערוך ולשפר בהמשך." data-en="No commitment — you can edit and improve it later.">בלי התחייבות — אפשר לערוך ולשפר בהמשך.</span></div>
    `;
    form.prepend(quick);
    form.insertBefore(details, form.querySelector('.builder-actions'));
    const tip = document.createElement('div');
    tip.className = 'nb-friendly-tip';
    tip.innerHTML = '<span aria-hidden="true">💡</span><div><strong>טיפ קטן ממני</strong><span>אל תנסה לכתוב מושלם. מספיק להסביר למי העסק עוזר ומה תרצה שהמבקרים יעשו.</span></div>';
    quick.append(tip);
    quick.querySelectorAll('[data-example-he]').forEach(btn => btn.addEventListener('click', () => {
      const he = btn.dataset.exampleHe, en = btn.dataset.exampleEn;
      $('#nb-business-idea').value = (window.NovaBuildI18n?.getLanguage() === 'en') ? en : he;
      $('#nb-business-idea').focus();
    }));
    $('#nb-build-first-draft').addEventListener('click', () => {
      const idea = $('#nb-business-idea').value.trim();
      if (!idea) {
        $('#nb-business-idea').focus();
        $('#nb-business-idea').placeholder = window.NovaBuildI18n?.getLanguage() === 'en' ? 'Start with just one sentence about your business…' : 'נתחיל ממשפט אחד על העסק שלך…';
        return;
      }
      const lower = idea.toLowerCase();
      const type = /חנות|מוצרים|למכור|e-?commerce|online store|sell products/.test(lower) ? 'Online store'
        : /תיק עבודות|מעצב|צלם|portfolio|photographer|designer/.test(lower) ? 'Portfolio'
        : /דף נחיתה|קמפיין|landing page/.test(lower) ? 'Landing page'
        : /אפליקציה|web app|application/.test(lower) ? 'Web application'
        : 'Business website';
      const name = idea.match(/(?:שם העסק|העסק נקרא|קוראים לעסק|my business is called|business name is)[: ]+([^,.!]+)/i);
      $('#siteName').value = name ? name[1].trim() : 'העסק שלי';
      $('#siteType').value = [...$('#siteType').options].some(o => o.value === type) ? type : [...$('#siteType').options].find(o=>o.textContent===type)?.value || type;
      $('#siteBrief').value = idea;
      $('#siteHeadline').value = '';
      $('#siteButton').value = '';
      if (window.NovaBuildI18n?.getLanguage() === 'en') {
        $('#siteName').value = name ? name[1].trim() : 'My business';
      }
      $('#makeBrief').click();
      const status = $('#previewStatus');
      if (status) status.textContent = window.NovaBuildI18n?.getLanguage() === 'en' ? 'Your first draft is ready to review' : 'הטיוטה הראשונה מוכנה לבדיקה';
      const preview = $('#sitePreview');
      if (preview) preview.scrollIntoView({behavior:'smooth',block:'center'});
    });
    const updateLanguage = () => {
      const en = window.NovaBuildI18n?.getLanguage() === 'en';
      quick.querySelectorAll('[data-he][data-en]').forEach(el => el.textContent = en ? el.dataset.en : el.dataset.he);
      const idea = $('#nb-business-idea');
      idea.placeholder = en ? idea.dataset.placeholderEn : idea.dataset.placeholderHe;
      quick.querySelectorAll('[data-example-he]').forEach(btn => btn.textContent = (en ? btn.dataset.exampleEn : btn.dataset.exampleHe).length > 42 ? (en ? btn.dataset.exampleEn : btn.dataset.exampleHe).slice(0,38)+'…' : (en ? btn.dataset.exampleEn : btn.dataset.exampleHe));
      tip.querySelector('strong').textContent = en ? 'A quick tip' : 'טיפ קטן ממני';
      tip.querySelector('span:last-child').textContent = en ? 'Don’t aim for perfect wording. Just say who you help and what you want visitors to do.' : 'אל תנסה לכתוב מושלם. מספיק להסביר למי העסק עוזר ומה תרצה שהמבקרים יעשו.';
      summary.textContent = en ? 'More settings (optional)' : 'הגדרות נוספות (לא חובה)';
    };
    window.addEventListener('novabuild:language', updateLanguage);
    updateLanguage();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

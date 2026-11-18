const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
function showView(name) {
  const target = document.getElementById('view-' + name);
  if (!target) return;
  $$('.view').forEach(view => view.classList.toggle('active', view === target));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === name));
  const activeButton = $('.nav-item[data-view="' + name + '"]');
  $('#crumb').textContent = activeButton ? activeButton.textContent.trim().replace(/\s+/g, ' ') : name;
  $('#sidebar').classList.remove('open');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
$$('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
$('#menuToggle').addEventListener('click', () => {
  const isOpen = $('#sidebar').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(isOpen));
  $('#menuToggle').setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#sidebar').classList.contains('open')) {
    $('#sidebar').classList.remove('open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    $('#menuToggle').setAttribute('aria-label', 'Open navigation');
    $('#menuToggle').focus();
  }
});

$('#quickPrompt').addEventListener('submit', event => {
  event.preventDefault();
  const prompt = $('#quickPromptText').value.trim();
  if (!prompt) {
    window.NovaBuildAssistant?.open();
    document.getElementById('nb-help-input')?.focus();
    return;
  }
  window.NovaBuildAssistant?.open();
  window.NovaBuildAssistant?.ask(prompt);
  $('#quickPromptText').value = '';
});

function renderOutput(id, heading, body) {
  const output = document.getElementById(id);
  output.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = heading;
  const paragraph = document.createElement('p');
  paragraph.textContent = body;
  output.append(title, paragraph);
  output.classList.remove('hidden');
}


const businessProfileFields = {
  business_name: 'profileBusinessName', industry: 'profileIndustry', description: 'profileDescription',
  services: 'profileServices', target_audience: 'profileAudience', service_area: 'profileArea',
  communication_style: 'profileTone', preferred_language: 'profileLanguage', website_url: 'profileWebsite',
  public_phone: 'profilePublicPhone', whatsapp_phone: 'profileWhatsapp'
};
function fillBusinessProfile(profile) {
  if (!profile) return;
  Object.entries(businessProfileFields).forEach(([key,id]) => {
    const field = document.getElementById(id);
    if (field && profile[key] !== undefined && document.activeElement !== field) field.value = profile[key] || '';
  });
  if (profile.business_name) ['growthBusiness','leadBusiness','marketingBusiness'].forEach(id => {
    const field = document.getElementById(id);
    if (field && !field.value.trim()) field.value = profile.business_name;
  });
  const phone = document.getElementById('leadPhone');
  if (phone && profile.whatsapp_phone && !phone.value.trim()) phone.value = profile.whatsapp_phone;
}
window.addEventListener('novabuild:business-profile', event => fillBusinessProfile(event.detail?.profile));
$('#businessProfileForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('#saveBusinessProfile'), status = $('#businessProfileStatus');
  const payload = {};
  Object.entries(businessProfileFields).forEach(([key,id]) => { payload[key] = $('#' + id)?.value.trim() || ''; });
  if (!window.NovaBuildAuth?.saveBusinessProfile) { status.textContent = 'שירות החשבון עדיין נטען. רענן את העמוד ונסה שוב.'; return; }
  button.disabled = true; status.textContent = 'שומר את פרופיל העסק…';
  try {
    const profile = await window.NovaBuildAuth.saveBusinessProfile(payload);
    fillBusinessProfile(profile);
    status.textContent = 'פרטי העסק נשמרו. הסוכנים ישתמשו בהם במשימות הבאות.';
  } catch (error) {
    status.textContent = error?.message || 'לא הצלחתי לשמור את פרטי העסק.';
  } finally { button.disabled = false; }
});

let generatedSiteHtml = '';
let generatedSiteDesign = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function buildStarterWebsite(name, type, brief, contactUrl, headline, buttonText, accent, sectionEdits, contactHeading, contactCopy) {
  const isHebrew = /[\u0590-\u05FF]/.test([name, brief, headline, contactHeading].join(' '));
  const safeName = escapeHtml(name);
  const safeBrief = escapeHtml(brief);
  const safeAccent = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#6d5dfc';
  const safeContact = /^https?:\/\//i.test(contactUrl) ? contactUrl : '#contact';
  const contactHref = escapeHtml(safeContact);
  const description = safeBrief.length > 210 ? safeBrief.slice(0, 207) + '…' : safeBrief;
  const copy = isHebrew ? {
    lang:'he', dir:'rtl', siteType:({'Online store':'חנות אונליין','Portfolio':'תיק עבודות','Landing page':'דף נחיתה','Web application':'אפליקציית Web'})[type] || 'אתר עסקי',
    headline:'אתר מקצועי שמקדם את העסק שלך', button:'דברו איתנו',
    labels:type==='Online store'?['המוצרים שלנו','למה לקנות אצלנו','יצירת קשר']:type==='Portfolio'?['עבודות נבחרות','מה אני מציע','יצירת קשר']:['השירותים שלנו','למה לבחור בנו','יצירת קשר'],
    cards:type==='Online store'?[['מוצרים שנבחרו בקפידה','מוצרים איכותיים שנבחרו כדי לתת לכם חוויית קנייה טובה.'],['שירות אישי','נשמח לעזור לכם למצוא בדיוק את מה שאתם צריכים.'],['קנייה בראש שקט','צרו קשר לקבלת פרטים והמלצה אישית.']]:type==='Portfolio'?[['חשיבה יצירתית','רעיונות ברורים ועיצוב שמתאים למטרות שלכם.'],['תשומת לב לפרטים','עבודה מדויקת משלב הרעיון ועד לתוצאה הסופית.'],['עובדים ביחד','הצרכים והמטרות שלכם מובילים כל החלטה.']]:[['שירות אישי','פתרונות שמותאמים לצרכים ולמטרות שלכם.'],['איכות לפני הכול','עבודה מקצועית, תקשורת ברורה ותשומת לב לפרטים.'],['מתחילים בקלות','ספרו לנו מה אתם צריכים ונעזור לכם להתקדם.']],
    intro:'פתרונות מקצועיים, יחס אישי ותהליך ברור מהצעד הראשון.',
    contactEyebrow:'הצעד הבא מתחיל כאן', contactHeading:'בואו נדבר', contactText:'יש לכם שאלה או רעיון? נשמח לשמוע מכם.',
    talk:'דברו איתנו', contact:'יצירת קשר', rights:'כל הזכויות שמורות'
  } : {
    lang:'en', dir:'ltr', siteType:type,
    headline:'A better website for your next big step', button:'Let’s talk',
    labels:type==='Online store'?['Featured products','Why shop with us','Get in touch']:type==='Portfolio'?['Selected work','What I do','Contact']:['Our services','Why choose us','Get in touch'],
    cards:type==='Online store'?[['Thoughtfully selected','Quality products chosen to make your experience better.'],['Personal service','Friendly help to find what works best for you.'],['Shop with confidence','Contact us for details and tailored recommendations.']]:type==='Portfolio'?[['Creative direction','Clear ideas and thoughtful design shaped around your goals.'],['Craft & detail','A careful process from first concept to final delivery.'],['Made together','Your goals guide every decision along the way.']]:[['Personal service','Solutions shaped around your goals, needs, and customers.'],['Quality first','A thoughtful approach, clear communication, and attention to detail.'],['Simple next steps','Get in touch to discuss what you need and how to get started.']],
    intro:'Professional service, thoughtful details, and a clear path forward.',
    contactEyebrow:'YOUR NEXT STEP', contactHeading:'Let’s make it happen', contactText:'Have a question or an idea? We’d love to hear from you.',
    talk:'Let’s talk', contact:'Contact', rights:'All rights reserved'
  };
  const safeHeadline = escapeHtml(headline || copy.headline);
  const safeButton = escapeHtml(buttonText || copy.button);
  const safeContactHeading = escapeHtml(contactHeading || copy.contactHeading);
  const safeContactCopy = escapeHtml(contactCopy || copy.contactText);
  const editedCards = copy.cards.map((card,index)=>({
    title:(sectionEdits[index]&&sectionEdits[index].title.trim())||card[0],
    text:(sectionEdits[index]&&sectionEdits[index].text.trim())||card[1]
  }));
  const cardMarkup = editedCards.map((card,index)=>'<article class="card"><span class="number">0'+(index+1)+'</span><h3>'+escapeHtml(card.title)+'</h3><p>'+escapeHtml(card.text)+'</p></article>').join('');
  const pageTitle = escapeHtml(name) + (isHebrew ? ' | האתר הרשמי' : ' | Official website');
  return '<!doctype html>\n<html lang="'+copy.lang+'" dir="'+copy.dir+'">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="description" content="'+escapeHtml(description)+'">\n<meta name="theme-color" content="'+safeAccent+'">\n<title>'+pageTitle+'</title>\n<style>\n:root{color-scheme:light;--ink:#172033;--muted:#667085;--accent:'+safeAccent+';--paper:#f7f8fc;--line:#e6e9f2}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;font-family:Arial,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper);line-height:1.75}a{color:inherit}.nav{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px max(6vw,22px);background:#ffffffed;border-bottom:1px solid var(--line);position:relative}.brand{font-weight:850;font-size:20px;letter-spacing:-.6px;text-decoration:none}.nav .nav-link{text-decoration:none;color:var(--muted);font-size:14px;font-weight:650}.nav .cta,.hero .cta{background:var(--accent);color:#fff;padding:12px 20px;border-radius:999px;box-shadow:0 8px 22px color-mix(in srgb,var(--accent),transparent 78%)}.cta{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;font-weight:750;transition:transform .18s,box-shadow .18s}.cta:hover{transform:translateY(-2px);box-shadow:0 12px 28px #17203322}.hero{padding:clamp(68px,10vw,116px) max(8vw,24px) 96px;background:radial-gradient(ellipse at 85% 8%,color-mix(in srgb,var(--accent),white 82%) 0,transparent 36%),linear-gradient(135deg,#fff,#f2f4fc);text-align:center}.hero .eyebrow{display:inline-flex;padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent),white 91%);color:var(--accent);font-size:12px;font-weight:800}.hero h1{font-size:clamp(36px,6.5vw,72px);letter-spacing:-1.8px;line-height:1.12;max-width:960px;margin:22px auto 18px}.hero p{max-width:700px;margin:0 auto 30px;color:var(--muted);font-size:clamp(16px,2vw,19px);overflow-wrap:anywhere}.section{padding:76px max(8vw,24px)}.section h2{text-align:center;font-size:clamp(28px,4vw,42px);letter-spacing:-1px;margin:0 0 12px}.intro{text-align:center;max-width:650px;margin:0 auto 38px;color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:1120px;margin:auto}.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:0 12px 34px #18244b08;transition:transform .18s,border-color .18s}.card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--accent),white 45%)}.number{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:14px;background:color-mix(in srgb,var(--accent),white 90%);color:var(--accent);font-weight:850}.card h3{margin:18px 0 8px;font-size:19px}.card p{color:var(--muted);margin:0}.contact{background:#171d32;color:#fff;text-align:center;padding:74px 24px}.contact .eyebrow{color:#c9c2ff;font-size:12px;font-weight:800;letter-spacing:1px}.contact h2{font-size:clamp(28px,4vw,42px);margin:12px 0}.contact p{color:#c2c8d8;margin:0 auto 24px;max-width:620px}.contact .cta{background:#fff;color:#242341;padding:13px 22px}.footer{text-align:center;padding:24px;color:#858ca0;font-size:12px}@media(max-width:700px){.nav{min-height:65px;padding:12px 20px}.nav .nav-link{display:none}.hero{padding-top:72px;padding-bottom:72px}.hero h1{letter-spacing:-.8px}.hero p{font-size:16px}.cards{grid-template-columns:1fr}.section{padding:58px 22px}.card{padding:23px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}\n</style>\n</head>\n<body>\n<header class="nav"><a class="brand" href="#top">'+safeName+'</a><a class="nav-link" href="#services">'+copy.labels[0]+'</a><a class="cta" href="'+contactHref+'">'+copy.talk+'</a></header>\n<main id="top"><section class="hero"><div class="eyebrow">'+copy.siteType+'</div><h1>'+safeHeadline+'</h1><p>'+safeBrief+'</p><a class="cta" href="'+contactHref+'">'+safeButton+' ↗</a></section>\n<section class="section" id="services"><h2>'+copy.labels[0]+'</h2><p class="intro">'+copy.intro+'</p><div class="cards">'+cardMarkup+'</div></section>\n<section class="contact" id="contact"><div class="eyebrow">'+copy.contactEyebrow+'</div><h2>'+safeContactHeading+'</h2><p>'+safeContactCopy+'</p><a class="cta" href="'+contactHref+'">'+copy.contact+' '+safeName+'</a></section></main>\n<footer class="footer">© '+new Date().getFullYear()+' '+safeName+' · '+copy.rights+'</footer>\n</body>\n</html>';
}

function buildPremiumBusinessWebsite(name, type, brief, contactUrl, headline, buttonText, accent, sectionEdits, contactHeading, contactCopy, ai = null) {
  const isHebrew = /[\u0590-\u05FF]/.test([name, brief, headline, contactHeading].join(' '));
  const lang = isHebrew ? 'he' : 'en';
  const dir = isHebrew ? 'rtl' : 'ltr';
  const t = (he,en) => isHebrew ? he : en;
  const esc = escapeHtml;
  const text = (value, fallback) => String(value || fallback || '').trim();
  const palettes = {
    midnight: {paper:'#f4f3ef',surface:'#fff',ink:'#142533',muted:'#687782',accent:'#b9925c',dark:'#102332',soft:'#e8e3d9'},
    atelier: {paper:'#f2eee7',surface:'#fffdfa',ink:'#272622',muted:'#77736c',accent:'#98744f',dark:'#25241f',soft:'#e8dfd2'},
    blueprint: {paper:'#f3f7fb',surface:'#fff',ink:'#142a42',muted:'#64778a',accent:'#2b689b',dark:'#102a45',soft:'#e3edf5'},
    forest: {paper:'#f1f3ed',surface:'#fff',ink:'#203127',muted:'#6c786f',accent:'#637d68',dark:'#1d3127',soft:'#e1e9de'},
    graphite: {paper:'#f2f2f1',surface:'#fff',ink:'#202326',muted:'#71777b',accent:'#697f8d',dark:'#20282d',soft:'#e5e8e8'}
  };
  const palette = palettes[ai?.palette] || palettes.atelier;
  const designStyle = ['luxury','editorial','minimal','corporate','architectural'].includes(ai?.designStyle) ? ai.designStyle : 'editorial';
  const layout = ['split','centered','editorial'].includes(ai?.layout) ? ai.layout : 'split';
  const safeName = esc(text(name,t('העסק שלך','Your Business')));
  const safeType = esc(text(type,t('עסק מקצועי','Professional business')));
  const safeHeadline = esc(text(ai?.headline,headline || t('פתרונות מקצועיים שמקדמים את העסק שלך','Professional solutions that move your business forward')));
  const safeSubheadline = esc(text(ai?.subheadline,brief));
  const safeEyebrow = esc(text(ai?.eyebrow,t('פתרונות עסקיים בהתאמה אישית','Business solutions, thoughtfully tailored')));
  const safeButton = esc(text(ai?.buttonText,buttonText || t('קובעים שיחת היכרות','Book an introduction')));
  const safeContactHeading = esc(text(ai?.contactHeading,contactHeading || t('בואו נדבר על הצעד הבא','Let’s discuss your next step')));
  const safeContactCopy = esc(text(ai?.contactText,contactCopy || brief));
  const contact = /^https?:\/\//i.test(contactUrl || '') ? contactUrl : '#contact';
  const contactHref = esc(contact);
  const services = Array.isArray(ai?.sections) && ai.sections.length >= 3 ? ai.sections.slice(0,3) : [];
  const cards = services.length ? services : [0,1,2].map(i => ({
    title: sectionEdits?.[i]?.title || [t('תכנון מדויק','Clear strategy'),t('ביצוע מקצועי','Professional delivery'),t('ליווי אישי','Personal guidance')][i],
    text: sectionEdits?.[i]?.text || brief
  }));
  const benefits = Array.isArray(ai?.benefits) && ai.benefits.length >= 3 ? ai.benefits.slice(0,3) : cards;
  const steps = Array.isArray(ai?.processSteps) && ai.processSteps.length >= 3 ? ai.processSteps.slice(0,3) : [
    {title:t('מגדירים מטרה','Define the goal'),text:t('מחדדים את הצורך ואת התוצאה הרצויה.','Clarify the need and desired outcome.')},
    {title:t('בונים פתרון','Build the solution'),text:t('מתכננים ומבצעים תהליך מסודר.','Plan and deliver a clear process.')},
    {title:t('מתקדמים יחד','Move forward'),text:t('בודקים, משפרים וממשיכים לשלב הבא.','Review, improve and move to the next stage.')}
  ];
  const cardsHtml = cards.map((item,i)=>'<article class="service-card"><span class="index">0'+(i+1)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.text)+'</p></article>').join('');
  const benefitsHtml = benefits.map(item=>'<article class="benefit"><span class="benefit-line"></span><div><h3>'+esc(item.title)+'</h3><p>'+esc(item.text)+'</p></div></article>').join('');
  const stepsHtml = steps.map((item,i)=>'<article class="process-step"><span>0'+(i+1)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.text)+'</p></article>').join('');
  const description = safeSubheadline.length > 180 ? safeSubheadline.slice(0,177)+'…' : safeSubheadline;
  const title = safeName + (isHebrew ? ' | האתר הרשמי' : ' | Official website');
  const servicesTitle = esc(text(ai?.servicesTitle,t('השירותים שלנו','Our services')));
  const benefitsTitle = esc(text(ai?.benefitsTitle,t('למה לעבוד איתנו','Why work with us')));
  const processTitle = esc(text(ai?.processTitle,t('תהליך ברור. תוצאה מדויקת.','A clear process. A considered result.')));
  const aboutTitle = esc(text(ai?.aboutTitle,t('גישה מקצועית, יחס אישי','Professional standards. Personal service.')));
  const aboutText = esc(text(ai?.aboutText,brief));
  const visualLabel = esc(text(ai?.visualLabel,t('תכנון · איכות · תוצאה','Strategy · Quality · Results')));
  const visualNote = esc(text(ai?.visualNote,t('ממוקדים במה שחשוב לעסק שלך','Focused on what matters to your business')));
  return '<!doctype html>\n<html lang="'+lang+'" dir="'+dir+'">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+description+'"><meta name="theme-color" content="'+palette.dark+'"><title>'+title+'</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Heebo:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n<style>\n:root{--paper:'+palette.paper+';--surface:'+palette.surface+';--ink:'+palette.ink+';--muted:'+palette.muted+';--accent:'+palette.accent+';--dark:'+palette.dark+';--soft:'+palette.soft+';--line:color-mix(in srgb,var(--ink),transparent 88%);--radius:'+(designStyle==='luxury'||designStyle==='architectural'?'3px':designStyle==='minimal'?'8px':'18px')+'}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:85px}body{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans','Heebo',Arial,sans-serif;line-height:1.7}a{color:inherit}.site-nav{height:82px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 max(5vw,22px);background:color-mix(in srgb,var(--paper),white 55%);border-bottom:1px solid var(--line)}.brand{font:800 18px Manrope,'Heebo',sans-serif;letter-spacing:-.5px;text-decoration:none;max-width:38%;overflow-wrap:anywhere}.nav-links{display:flex;gap:30px;align-items:center}.nav-links a{font-size:12px;text-decoration:none;color:var(--muted);font-weight:650}.nav-links a:hover{color:var(--ink)}.cta{display:inline-flex;justify-content:center;align-items:center;min-height:48px;padding:0 22px;background:var(--accent);color:#fff;border-radius:999px;text-decoration:none;font-size:12px;font-weight:750;box-shadow:0 9px 24px color-mix(in srgb,var(--accent),transparent 78%);transition:transform .18s,box-shadow .18s}.cta:hover{transform:translateY(-2px);box-shadow:0 14px 28px color-mix(in srgb,var(--accent),transparent 72%)}.hero{position:relative;isolation:isolate;overflow:hidden;min-height:620px;display:grid;align-items:center;grid-template-columns:minmax(0,1fr) minmax(300px,.86fr);gap:5vw;padding:90px max(8vw,28px);background:radial-gradient(ellipse at 82% 22%,color-mix(in srgb,var(--accent),transparent 84%),transparent 35%),linear-gradient(120deg,color-mix(in srgb,var(--paper),white 40%),var(--paper))}.hero.centered{display:flex;min-height:600px;justify-content:center;text-align:center}.hero.centered .hero-copy{max-width:880px}.hero.centered .hero-copy p{margin-inline:auto}.hero.centered .hero-actions{justify-content:center}.hero.editorial{grid-template-columns:1.15fr .7fr}.hero-copy{position:relative;z-index:2;max-width:760px}.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:10px;letter-spacing:2px;font-weight:800;color:var(--accent);text-transform:uppercase}.eyebrow:before{content:'';width:24px;height:1px;background:var(--accent)}.hero h1{max-width:790px;margin:24px 0 19px;font:800 clamp(42px,6vw,78px)/1.08 Manrope,'Heebo',sans-serif;letter-spacing:-2.8px}.hero p{max-width:650px;color:var(--muted);font-size:clamp(16px,1.7vw,19px);line-height:1.9;margin:0 0 30px}.hero-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.text-link{display:inline-flex;padding:12px 4px;text-decoration:none;color:var(--ink);font-size:12px;font-weight:700}.hero-visual{min-height:390px;position:relative;display:grid;place-items:center}.visual-frame{position:relative;width:min(100%,440px);min-height:330px;border-radius:var(--radius);background:linear-gradient(145deg,color-mix(in srgb,var(--dark),white 9%),var(--dark));padding:30px;color:#fff;box-shadow:0 28px 70px #10203026;overflow:hidden}.visual-frame:before{content:'';position:absolute;width:300px;height:300px;border:1px solid color-mix(in srgb,var(--accent),transparent 55%);border-radius:50%;right:-80px;top:-100px;box-shadow:0 0 0 28px color-mix(in srgb,var(--accent),transparent 91%),0 0 0 58px color-mix(in srgb,var(--accent),transparent 95%)}.visual-kicker{position:relative;font-size:9px;letter-spacing:2px;color:color-mix(in srgb,var(--accent),white 18%);font-weight:800}.visual-title{position:relative;font:700 clamp(27px,3vw,42px)/1.2 Manrope,'Heebo',sans-serif;max-width:330px;margin:70px 0 15px;letter-spacing:-1.2px}.visual-rule{position:relative;width:75%;height:1px;background:#ffffff35;margin:24px 0}.visual-note{position:relative;color:#ffffffb8;font-size:12px}.visual-corner{position:absolute;bottom:25px;inset-inline-end:30px;font-size:9px;letter-spacing:1.8px;color:#ffffff8a}.hero.centered .hero-visual{display:none}.section{padding:100px max(8vw,28px)}.section-heading{max-width:780px;margin:0 auto 46px;text-align:center}.section-heading .eyebrow{justify-content:center}.section-heading .eyebrow:after{content:'';width:24px;height:1px;background:var(--accent)}.section-heading h2{font:750 clamp(30px,4vw,48px)/1.15 Manrope,'Heebo',sans-serif;letter-spacing:-1.6px;margin:17px 0 12px}.section-heading p{margin:0;color:var(--muted);font-size:15px}.service-grid{max-width:1160px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.service-card{position:relative;padding:30px 28px 34px;min-height:235px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);transition:transform .2s,border-color .2s,box-shadow .2s}.service-card:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--accent),transparent 50%);box-shadow:0 18px 38px #15263a0b}.index{display:inline-block;color:var(--accent);font:800 11px Manrope,sans-serif;letter-spacing:1px;margin-bottom:32px}.service-card h3,.benefit h3,.process-step h3{font:750 19px Manrope,'Heebo',sans-serif;letter-spacing:-.4px;margin:0 0 11px}.service-card p,.benefit p,.process-step p{font-size:13px;color:var(--muted);line-height:1.85;margin:0}.approach{background:var(--surface)}.benefit-grid{max-width:1040px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}.benefit{display:flex;gap:15px;align-items:flex-start}.benefit-line{width:2px;height:58px;flex:0 0 2px;background:var(--accent);margin-top:4px}.benefit h3{font-size:16px}.process-grid{max-width:1120px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}.process-step{padding:26px 28px;border-top:1px solid var(--line);border-inline-start:1px solid var(--line)}.process-step>span{display:block;color:var(--accent);font:800 12px Manrope,sans-serif;letter-spacing:1.5px;margin-bottom:27px}.process-step h3{font-size:18px}.about-strip{display:grid;grid-template-columns:.65fr 1fr;gap:7vw;align-items:center;max-width:1120px;margin:auto;padding:36px 0}.about-strip h2{font:750 clamp(27px,3.5vw,42px)/1.2 Manrope,'Heebo',sans-serif;letter-spacing:-1.3px;margin:16px 0}.about-strip p{color:var(--muted);font-size:15px;line-height:1.95;margin:0}.contact-section{padding:78px max(8vw,28px);background:var(--dark);color:#fff}.contact-inner{max-width:1120px;margin:auto;display:flex;gap:35px;align-items:center;justify-content:space-between}.contact-inner .eyebrow{color:color-mix(in srgb,var(--accent),white 20%)}.contact-inner h2{font:750 clamp(31px,4vw,50px)/1.15 Manrope,'Heebo',sans-serif;letter-spacing:-1.3px;margin:15px 0 9px}.contact-inner p{max-width:640px;color:#ffffffb8;font-size:14px;margin:0}.cta-light{background:#fff;color:var(--dark);box-shadow:none;white-space:nowrap}.footer{padding:25px max(5vw,22px);display:flex;gap:18px;justify-content:space-between;color:var(--muted);font-size:11px} [data-style="luxury"] .service-card,[data-style="luxury"] .visual-frame,[data-style="architectural"] .service-card{border-radius:3px}[data-style="architectural"] .service-card{box-shadow:none}[data-style="minimal"] .hero{min-height:570px}[data-style="corporate"] .service-card{box-shadow:0 12px 30px #15263a08}@media(max-width:850px){.hero,.hero.editorial{grid-template-columns:1fr;padding-top:74px;padding-bottom:70px;gap:35px;min-height:auto}.hero-visual{min-height:300px}.visual-frame{min-height:260px}.visual-title{margin-top:42px}.service-grid,.benefit-grid,.process-grid{grid-template-columns:1fr}.service-card{min-height:0}.index{margin-bottom:17px}.benefit-grid{gap:22px}.process-grid{gap:12px}.process-step{border-inline-start:0;padding:20px 0}.process-step>span{margin-bottom:10px}.about-strip{grid-template-columns:1fr;gap:18px}.contact-inner{align-items:flex-start;flex-direction:column}.site-nav{height:70px}.nav-links{display:none}}@media(max-width:600px){.site-nav{padding-inline:18px}.site-nav>.cta{min-height:42px;padding-inline:15px}.brand{max-width:55%;font-size:15px}.hero{padding:62px 22px 55px}.hero h1{font-size:clamp(37px,11vw,54px);letter-spacing:-1.6px}.hero p{font-size:15px}.hero-visual{min-height:245px}.visual-frame{min-height:230px;padding:22px}.visual-title{margin-top:36px;font-size:28px}.section{padding:70px 22px}.section-heading{margin-bottom:30px}.section-heading h2{font-size:32px}.service-card{padding:23px}.contact-section{padding:60px 22px}.footer{padding:20px 22px;flex-direction:column;gap:6px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}\n</style></head>\n<body data-style="'+designStyle+'"><header class="site-nav"><a class="brand" href="#top">'+safeName+'</a><nav class="nav-links" aria-label="Main navigation"><a href="#services">'+t('השירותים','Services')+'</a><a href="#approach">'+t('הגישה שלנו','Our approach')+'</a><a href="#contact">'+t('יצירת קשר','Contact')+'</a></nav><a class="cta" href="'+contactHref+'">'+safeButton+'</a></header>\n<main id="top"><section class="hero '+layout+'"><div class="hero-copy"><span class="eyebrow">'+safeEyebrow+'</span><h1>'+safeHeadline+'</h1><p>'+safeSubheadline+'</p><div class="hero-actions"><a class="cta" href="'+contactHref+'">'+safeButton+'</a><a class="text-link" href="#services">'+t('לגלות את השירותים','Explore services')+' ↓</a></div></div><div class="hero-visual" aria-hidden="true"><div class="visual-frame"><span class="visual-kicker">'+safeType+'</span><div class="visual-title">'+safeName+'</div><div class="visual-rule"></div><div class="visual-note">'+visualNote+'</div><div class="visual-corner">'+visualLabel+'</div></div></div></section>\n<section class="section" id="services"><div class="section-heading"><span class="eyebrow">'+t('השירותים שלנו','OUR SERVICES')+'</span><h2>'+servicesTitle+'</h2><p>'+safeSubheadline+'</p></div><div class="service-grid">'+cardsHtml+'</div></section>\n<section class="section approach" id="approach"><div class="section-heading"><span class="eyebrow">'+t('היתרונות שלנו','THE DIFFERENCE')+'</span><h2>'+benefitsTitle+'</h2></div><div class="benefit-grid">'+benefitsHtml+'</div></section>\n<section class="section" id="process"><div class="section-heading"><span class="eyebrow">'+t('איך עובדים יחד','HOW WE WORK')+'</span><h2>'+processTitle+'</h2></div><div class="process-grid">'+stepsHtml+'</div></section>\n<section class="section"><div class="about-strip"><div><span class="eyebrow">'+t('על העסק','ABOUT THE BUSINESS')+'</span><h2>'+aboutTitle+'</h2></div><p>'+aboutText+'</p></div></section>\n<section class="contact-section" id="contact"><div class="contact-inner"><div><span class="eyebrow">'+t('מתחילים בשיחה','START WITH A CONVERSATION')+'</span><h2>'+safeContactHeading+'</h2><p>'+safeContactCopy+'</p></div><a class="cta cta-light" href="'+contactHref+'">'+safeButton+'</a></div></section></main>\n<footer class="footer"><strong>'+safeName+'</strong><span>© '+new Date().getFullYear()+' · '+t('כל הזכויות שמורות','All rights reserved')+'</span></footer></body></html>';
}

function generateWebsite(silent = false) {
  const name = $('#siteName').value.trim() || 'Your Business';
  const type = $('#siteType').value;
  const brief = $('#siteBrief').value.trim();
  const contact = $('#siteContact').value.trim();
  if (!brief) {
    $('#siteBrief').focus();
    $('#siteBrief').placeholder = 'Describe your offer and ideal customer first.';
    return;
  }
  const sectionEdits = [1, 2, 3].map(index => ({ title: $('#service' + index + 'Title').value, text: $('#service' + index + 'Text').value }));
  generatedSiteHtml = buildPremiumBusinessWebsite(name, type, brief, contact, $('#siteHeadline').value.trim(), $('#siteButton').value.trim(), $('#siteAccent').value, sectionEdits, $('#contactHeadline').value.trim(), $('#contactText').value.trim(), generatedSiteDesign);
  $('#sitePreview').srcdoc = generatedSiteHtml;
  $('#previewStatus').textContent = (/[֐-׿]/.test(brief) ? 'התצוגה המקדימה מוכנה · ' : 'Preview generated · ') + type;
  $('#downloadSite').disabled = false;
  const output = $('#siteOutput');
  output.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = name + (/[֐-׿]/.test(brief) ? ' — האתר נוצר' : ' — website created');
  const list = document.createElement('ul');
  [
    (/[֐-׿]/.test(brief) ? 'נוצר אתר ראשוני שמתאים גם לנייד.' : 'A responsive starter website has been generated.'),
    (/[֐-׿]/.test(brief) ? 'התצוגה המקדימה מופיעה לצד הטופס.' : 'The live preview is shown beside this form.'),
    (/[֐-׿]/.test(brief) ? 'אפשר להוריד את קובץ האתר ולפרסם אותו בהמשך.' : 'Download the HTML file to save it or upload it to a hosting provider.'),
    (/[֐-׿]/.test(brief) ? 'אפשר לערוך את התוכן והצבעים בהגדרות הנוספות.' : 'Customize the content and colors in the optional settings.')
  ].forEach(line => { const item = document.createElement('li'); item.textContent = line; list.append(item); });
  const note = document.createElement('p');
  note.className = 'fine-print';
  note.textContent = generatedSiteDesign ? 'נוצרה טיוטת אתר עסקית מותאמת באמצעות AI. בדוק את התוכן והעיצוב לפני פרסום.' : (/[֐-׿]/.test(brief) ? 'זו טיוטה בסיסית. האתר עדיין לא פורסם באינטרנט.' : 'This is a starter draft. The website has not been published online.');
  output.append(title, list, note);
  output.classList.remove('hidden');
  if (!silent) output.scrollIntoView({behavior:'smooth',block:'nearest'});
}

const liveEditIds = ['siteName','siteType','siteBrief','siteContact','siteHeadline','siteButton','siteAccent','service1Title','service1Text','service2Title','service2Text','service3Title','service3Text','contactHeadline','contactText'];
liveEditIds.forEach(id => { const field = $('#' + id); field.addEventListener('input', () => { if (generatedSiteHtml && $('#siteBrief').value.trim()) generateWebsite(true); }); field.addEventListener('change', () => { if (generatedSiteHtml && $('#siteBrief').value.trim()) generateWebsite(); }); });


$('#makeAIWebsite').addEventListener('click', async () => {
  const status = $('#aiWebsiteStatus');
  const button = $('#makeAIWebsite');
  const brief = $('#siteBrief').value.trim();
  if (!brief) { status.textContent = 'Describe your business first.'; $('#siteBrief').focus(); return; }
  button.disabled = true;
  status.textContent = 'Creating your website copy with AI…';
  try {
    const website = await generateWebsiteCopyWithAI({
      businessName: $('#siteName').value.trim() || 'Your Business',
      siteType: $('#siteType').value,
      brief,
      contactUrl: $('#siteContact').value.trim()
    });
    generatedSiteDesign = website;
    $('#siteHeadline').value = website.headline || '';
    $('#siteButton').value = website.buttonText || 'Contact us';
    $('#service1Title').value = website.sections?.[0]?.title || '';
    $('#service1Text').value = website.sections?.[0]?.text || '';
    $('#service2Title').value = website.sections?.[1]?.title || '';
    $('#service2Text').value = website.sections?.[1]?.text || '';
    $('#service3Title').value = website.sections?.[2]?.title || '';
    $('#service3Text').value = website.sections?.[2]?.text || '';
    $('#contactHeadline').value = website.contactHeading || '';
    $('#contactText').value = website.contactText || '';
    generateWebsite(true);
    status.textContent = 'AI-generated copy added to your website. Review and edit it before publishing.';
  } catch (error) {
    status.textContent = error?.message || 'AI generation failed. Please try again.';
  } finally { button.disabled = false; }
});

$('#makeBrief').addEventListener('click', generateWebsite);
$('#saveWebsiteProject').addEventListener('click', async () => {
  const button = $('#saveWebsiteProject');
  const status = $('#saveWebsiteStatus');
  if (!generatedSiteHtml) {
    status.textContent = 'Generate a website draft before saving.';
    return;
  }
  if (!window.NovaBuildAuth?.isConfigured?.()) {
    status.textContent = 'Account service is not configured yet.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Saving website to your account…';
  try {
    const result = await window.NovaBuildAuth.saveWebsiteProject({
      name: $('#siteName').value.trim() || 'Untitled website',
      siteType: $('#siteType').value,
      brief: $('#siteBrief').value.trim(),
      contactUrl: $('#siteContact').value.trim(),
      settings: {
        headline: $('#siteHeadline').value.trim(),
        buttonText: $('#siteButton').value.trim(),
        accent: $('#siteAccent').value,
        sections: [1, 2, 3].map(index => ({
          title: $('#service' + index + 'Title').value.trim(),
          text: $('#service' + index + 'Text').value.trim()
        })),
        contactHeading: $('#contactHeadline').value.trim(),
        contactText: $('#contactText').value.trim()
      },
      html: generatedSiteHtml
    });
    status.textContent = 'Website saved to your account (ID: ' + result.id + ').';
  } catch (error) {
    status.textContent = error?.message || 'Could not save the website.';
  } finally {
    button.disabled = false;
  }
});

$('#downloadSite').addEventListener('click', () => {
  if (!generatedSiteHtml) return;
  const blob = new Blob([generatedSiteHtml], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const baseName = ($('#siteName').value.trim() || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'my-website';
  anchor.href = url;
  anchor.download = baseName + '.html';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});
$('#clearSite').addEventListener('click', () => {
  $('#siteName').value = '';
  $('#siteType').selectedIndex = 0;
  $('#siteBrief').value = '';
  $('#siteContact').value = '';
  $('#siteHeadline').value = '';
  $('#siteButton').value = '';
  $('#siteAccent').value = '#6d5dfc';
  ['service1Title','service1Text','service2Title','service2Text','service3Title','service3Text','contactHeadline','contactText'].forEach(id => { $('#' + id).value = ''; });
  generatedSiteHtml = '';
  generatedSiteDesign = null;
  $('#sitePreview').srcdoc = window.NovaBuildI18n?.getLanguage() === 'en' ? '<html lang="en" dir="ltr"><body style="font-family:Arial,system-ui;padding:32px;color:#526079;background:#f7f8fc"><h2>Your website will appear here</h2><p>Describe your business and create a first draft.</p></body></html>' : '<html lang="he" dir="rtl"><body style="font-family:Arial,system-ui;padding:32px;color:#526079;background:#f7f8fc;text-align:right"><h2>האתר שלך יופיע כאן</h2><p>ספר לי על העסק ולחץ על „תכין לי טיוטה”.</p></body></html>';
  $('#previewStatus').textContent = window.NovaBuildI18n?.getLanguage() === 'en' ? 'Your website will appear here' : 'האתר שלך יופיע כאן';
  $('#downloadSite').disabled = true;
  $('#siteOutput').classList.add('hidden');
});

async function generateWebsiteCopyWithAI(payload) {
  if (!window.NovaBuildAuth?.generateWebsiteWithAI) {
    throw new Error('שירות החשבון עדיין נטען. רענן את העמוד ונסה שוב.');
  }
  return window.NovaBuildAuth.generateWebsiteWithAI(payload);
}

async function callBusinessAgent(mode, payload) {
  if (!window.NovaBuildAuth?.runBusinessAgent) {
    throw new Error('שירות החשבון עדיין נטען. רענן את העמוד ונסה שוב.');
  }
  const data = await window.NovaBuildAuth.runBusinessAgent(mode, payload);
  if (!data.result || typeof data.result !== 'string') {
    throw new Error(data.error || 'ה-AI החזיר תשובה ריקה או לא תקינה. נסה שוב.');
  }
  return data.result;
}
function showAgentResult(id, heading, result) {
  const output = document.getElementById(id);
  output.replaceChildren();
  const title = document.createElement('h3'); title.textContent = heading;
  const body = document.createElement('div'); body.style.whiteSpace = 'pre-wrap'; body.textContent = result;
  output.append(title, body); output.classList.remove('hidden');
}
$('#makeMarketing').addEventListener('click', async () => {
  const business = $('#marketingBusiness').value.trim();
  const goal = $('#marketingGoal').value;
  const channel = $('#marketingChannel').value;
  const button = $('#makeMarketing');
  button.disabled = true;
  button.textContent = 'מכין תוכנית…';
  try {
    const result = await callBusinessAgent('marketing', {
      business: business || 'עסק קטן',
      goal,
      platforms: [channel],
      brief: 'צור הצעת שיווק התחלתית לעסק. אם חסרים פרטים, ציין מה צריך לברר ואל תמציא נתונים.'
    });
    showAgentResult('marketingOutput', 'תוכנית שיווק שנוצרה בעזרת AI', result);
  } catch (error) {
    renderOutput('marketingOutput', 'לא הצלחנו ליצור תוכנית', error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Draft campaign';
  }
});
$('#runGrowthAI').addEventListener('click', async () => {
  const button = $('#runGrowthAI'), status = $('#growthStatus');
  const business = $('#growthBusiness').value.trim(), audience = $('#growthAudience').value.trim(), offer = $('#growthOffer').value.trim();
  if (!business || !offer) { status.textContent = 'מלא לפחות את שם העסק ואת ההצעה שלו.'; return; }
  const platforms = $$('.growth-platform:checked').map(el => el.value);
  button.disabled = true; status.textContent = 'סוכן השיווק מנתח את העסק ובונה תוכנית…';
  try {
    const result = await callBusinessAgent('marketing', { business, audience, goal: $('#growthGoal').value, budget: $('#growthBudget').value, offer, platforms });
    showAgentResult('growthOutput', 'תוכנית השיווק שלך', result); status.textContent = 'התוכנית מוכנה. עדיין לא פורסמו מודעות ולא בוצעה הוצאה.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
$('#runLeadAI').addEventListener('click', async () => {
  const button = $('#runLeadAI'), status = $('#leadBotStatus');
  const message = $('#leadMessage').value.trim(), business = $('#leadBusiness').value.trim();
  if (!message || !business) { status.textContent = 'מלא את פרטי העסק ואת הודעת הלקוח.'; return; }
  button.disabled = true;
  status.textContent = 'סוכן הלידים מנתח את הפנייה וכותב תשובה…';
  try {
    const result = await callBusinessAgent('lead', {
      business,
      message,
      context: $('#leadContext').value.trim(),
      intent: $('#leadIntent').value,
      channel: $('#leadChannel')?.value || 'WhatsApp'
    });
    showAgentResult('leadBotOutput', 'ניתוח הליד ותשובה מוצעת', result);
    const actions = document.createElement('div');
    actions.className = 'builder-actions';
    const copy = document.createElement('button');
    copy.className = 'secondary';
    copy.type = 'button';
    copy.textContent = 'העתק תשובה';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(result); copy.textContent = 'הועתק'; }
      catch { status.textContent = 'העתקה אוטומטית לא זמינה בדפדפן הזה.'; }
    });
    actions.append(copy);

    const phoneField = $('#leadPhone');
    const phone = phoneField ? phoneField.value.trim() : '';
    if (phone) {
      const whatsapp = document.createElement('button');
      whatsapp.className = 'primary';
      whatsapp.type = 'button';
      whatsapp.textContent = 'פתח WhatsApp עם תשובה מוכנה';
      whatsapp.addEventListener('click', () => {
        let digits = phone.replace(/\D/g, '');
        if (digits.startsWith('0')) digits = '972' + digits.slice(1);
        if (!/^[1-9]\d{7,14}$/.test(digits)) {
          status.textContent = 'מספר הטלפון אינו תקין. הזן מספר עם קידומת מדינה או מספר ישראלי שמתחיל ב־0.';
          return;
        }
        const url = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(result);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
      actions.append(whatsapp);
    }
    $('#leadBotOutput').append(actions);
    status.textContent = phone
      ? 'התשובה מוכנה. אפשר להעתיק או לפתוח שיחת WhatsApp; ההודעה לא נשלחת עד שתלחץ Send ב-WhatsApp.'
      : 'התשובה מוכנה לבדיקה. היא לא נשלחה ללקוח. אפשר להוסיף מספר כדי לפתוח WhatsApp עם הטיוטה.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
$('#runSecurityAI').addEventListener('click', async () => {
  const button = $('#runSecurityAI'), status = $('#securityStatus');
  const details = $('#securityDetails').value.trim();
  if (!details) { status.textContent = 'הוסף כתובת אתר או תיאור של המערכת.'; return; }
  button.disabled = true; status.textContent = 'מכין הערכת סיכונים ורשימת בדיקות…';
  try {
    const result = await callBusinessAgent('security', { target: $('#securityTarget').value, details, concerns: $('#securityConcerns').value.trim() });
    showAgentResult('securityOutput', 'הערכת אבטחה ותוכנית פעולה', result);
    status.textContent = 'ההערכה מוכנה. לא בוצעה סריקה חיה של האתר.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});

$('#planAds').addEventListener('click', () => {
  const budget = Number($('#adBudget').value);
  if (!Number.isFinite(budget) || budget < 0) { $('#adBudget').focus(); return; }
  const channels = $$('.check-list input:checked').map(input => input.parentElement.textContent.trim());
  const goal = $('#adGoal').value;
  const output = $('#adsOutput');
  output.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = 'Illustrative campaign plan';
  const list = document.createElement('ul');
  [
    'Goal: ' + goal,
    'Monthly spending ceiling: $' + budget.toLocaleString('en-US'),
    'Selected channels: ' + (channels.length ? channels.join(', ') : 'Select at least one channel before using this plan.'),
    'Start with a small test and define a conversion event before optimizing.',
    'Review lead quality and cost per qualified lead, not clicks alone.',
    'Require explicit approval before launching campaigns or changing budgets.'
  ].forEach(line => { const li = document.createElement('li'); li.textContent = line; list.append(li); });
  const note = document.createElement('p');
  note.className = 'fine-print';
  note.textContent = 'Planning example only. No ad account is connected and no money is spent.';
  output.append(title, list, note);
  output.classList.remove('hidden');
});

$('#addProduct').addEventListener('click', () => {
  $('#productForm').classList.toggle('hidden');
  if (!$('#productForm').classList.contains('hidden')) $('#productName').focus();
});
$('#productForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#productName').value.trim();
  const price = Number($('#productPrice').value);
  if (!name || !Number.isFinite(price) || price < 0) return;
  const row = document.createElement('tr');
  const nameCell = document.createElement('td'); nameCell.textContent = name;
  const priceCell = document.createElement('td'); priceCell.textContent = '$' + price.toFixed(2);
  const statusCell = document.createElement('td');
  const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = 'Draft';
  statusCell.append(tag); row.append(nameCell, priceCell, statusCell); $('#productRows').append(row);
  event.target.reset(); event.target.classList.add('hidden');
});

$('#addLead').addEventListener('click', () => {
  $('#leadForm').classList.toggle('hidden');
  if (!$('#leadForm').classList.contains('hidden')) $('#leadName').focus();
});
$('#leadForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#leadName').value.trim(), source = $('#leadSource').value.trim();
  if (!name || !source) return;
  const row = document.createElement('tr');
  const nameCell = document.createElement('td'); nameCell.textContent = name;
  const sourceCell = document.createElement('td'); sourceCell.textContent = source;
  const stageCell = document.createElement('td');
  const tag = document.createElement('span'); tag.className = 'tag green-tag'; tag.textContent = 'New';
  stageCell.append(tag); row.append(nameCell, sourceCell, stageCell); $('#leadRows').append(row);
  event.target.reset(); event.target.classList.add('hidden');
});

const seoChecks = $$('#seoChecklist input[type="checkbox"]');
function updateSeoProgress() {
  const complete = seoChecks.filter(input => input.checked).length;
  $('#seoCount').textContent = complete + ' of ' + seoChecks.length + ' complete';
  $('#seoProgress').style.width = (complete / seoChecks.length * 100) + '%';
}
seoChecks.forEach(input => input.addEventListener('change', updateSeoProgress));
updateSeoProgress();
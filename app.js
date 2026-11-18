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
  showView('builder');
  if (!prompt) {
    $('#nb-business-idea')?.focus();
    $('#siteBrief').focus();
    return;
  }
  const ideaBox = $('#nb-business-idea');
  if (ideaBox) ideaBox.value = prompt;
  $('#siteBrief').value = prompt;
  $('#siteName').value = 'העסק שלי';
  $('#makeBrief').click();
  const status = $('#previewStatus');
  if (status) status.textContent = 'הטיוטה הראשונה מוכנה לבדיקה';
  $('#sitePreview')?.scrollIntoView({behavior:'smooth',block:'center'});
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

let generatedSiteHtml = '';

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
  generatedSiteHtml = buildStarterWebsite(name, type, brief, contact, $('#siteHeadline').value.trim(), $('#siteButton').value.trim(), $('#siteAccent').value, sectionEdits, $('#contactHeadline').value.trim(), $('#contactText').value.trim());
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
  note.textContent = /[֐-׿]/.test(brief) ? 'זו טיוטה ראשונית מתבנית. האתר עדיין לא פורסם באינטרנט.' : 'This is a starter template. The website has not been published online.';
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
  if (!window.NovaBuildAuth?.isConfigured?.()) { status.textContent = 'Account service is not configured yet.'; return; }
  button.disabled = true;
  status.textContent = 'Creating your website copy with AI…';
  try {
    const website = await window.NovaBuildAuth.generateWebsiteWithAI({
      businessName: $('#siteName').value.trim() || 'Your Business',
      siteType: $('#siteType').value,
      brief,
      contactUrl: $('#siteContact').value.trim()
    });
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
  $('#sitePreview').srcdoc = '<html><body style="font-family:system-ui;padding:32px;color:#526079;background:#f7f8fc"><h2>Your preview is waiting</h2><p>Fill in the form and choose Generate website.</p></body></html>';
  $('#previewStatus').textContent = 'Your website will appear here';
  $('#downloadSite').disabled = true;
  $('#siteOutput').classList.add('hidden');
});

$('#makeMarketing').addEventListener('click', () => {
  const business = $('#marketingBusiness').value.trim() || 'your business';
  const goal = $('#marketingGoal').value;
  const channel = $('#marketingChannel').value;
  const copy = 'Meet ' + business + ' — made for people who value quality and care. ✨\n\nLooking for a better way to ' + goal.toLowerCase() + '? We are here to help. Get in touch to learn more.\n\nTell us what you need in the comments or send us a message.\n\n#SmallBusiness #DiscoverLocal #' + business.replace(/[^a-z0-9]/gi, '') + '\n\nChannel: ' + channel + '. Review and customize all claims, offer details, and hashtags before publishing.';
  renderOutput('marketingOutput', 'Campaign draft', copy);
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
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
$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

$('#quickPrompt').addEventListener('submit', event => {
  event.preventDefault();
  const prompt = $('#quickPromptText').value.trim();
  showView('builder');
  $('#siteBrief').value = prompt;
  $('#siteBrief').focus();
  if (prompt) $('#siteName').value = '';
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

$('#makeBrief').addEventListener('click', () => {
  const name = $('#siteName').value.trim() || 'Your business';
  const type = $('#siteType').value;
  const brief = $('#siteBrief').value.trim();
  if (!brief) { $('#siteBrief').focus(); $('#siteBrief').placeholder = 'Add a short description first so your project brief is useful.'; return; }
  const output = $('#siteOutput');
  output.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = name + ' — project brief';
  const details = [
    'Project type: ' + type,
    'Primary goal: Turn visitors into relevant inquiries or customers.',
    'Suggested pages: Home, About, Services or Products, FAQ, Contact, Privacy Policy.',
    'Design direction: Mobile-first layout, clear calls to action, accessible contrast, fast-loading content.',
    'Search readiness: Unique page titles, descriptive headings, useful copy, sitemap, and Search Console setup.',
    'Your idea: ' + brief,
    'Next step: connect an AI generation service and a preview/deployment pipeline.'
  ];
  const list = document.createElement('ul');
  details.forEach(detail => { const li = document.createElement('li'); li.textContent = detail; list.append(li); });
  const note = document.createElement('p');
  note.className = 'fine-print';
  note.textContent = 'Demo output only. This does not generate or publish a working website yet.';
  output.append(title, list, note);
  output.classList.remove('hidden');
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
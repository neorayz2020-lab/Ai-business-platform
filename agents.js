/* NovaBuild agent planner — local prototype, not a connected AI model. */
(() => {
  const goalInput = document.getElementById('agentGoal');
  const runButton = document.getElementById('runAgentPlan');
  const results = document.getElementById('agentResults');
  if (!goalInput || !runButton || !results) return;

  const agents = {
    coordinator: {name: 'Coordinator', description: 'Breaks the goal into a sequenced plan and checks dependencies.'},
    website: {name: 'Website builder', description: 'Plans page structure, responsive layout, accessible content, and a reviewable preview.'},
    marketing: {name: 'Marketing strategist', description: 'Drafts audience-focused content and a channel-specific campaign for human review.'},
    seo: {name: 'SEO specialist', description: 'Checks page titles, metadata, useful content, mobile usability, sitemap, and Search Console setup.'},
    ads: {name: 'Ads & analytics', description: 'Defines conversion tracking and a small test plan; requires approval before any spend.'},
    store: {name: 'Store & CRM specialist', description: 'Organizes product information, inquiry capture, and a follow-up workflow.'},
    publishing: {name: 'Publishing guide', description: 'Creates a release checklist for hosting or app-store submission; does not submit anything.'}
  };

  function makeTask(agentKey, title, detail, risk = 'Draft only') {
    return {agent: agents[agentKey].name, title, detail, risk};
  }

  function planGoal(rawGoal, priority, policy) {
    const goal = rawGoal.toLowerCase();
    const tasks = [];
    const add = (key, title, detail, risk) => tasks.push(makeTask(key, title, detail, risk));
    add('coordinator', 'Clarify the outcome and success measure', 'Turn the request into a measurable deliverable and list missing information before implementation.');
    if (/website|site|landing|web app|webapp|build|בנה|אתר|דף נחיתה|אפליקציה/.test(goal)) {
      add('website', 'Create the website blueprint', 'Define target audience, page map, primary call to action, mobile layout, accessibility checks, and preview acceptance criteria.');
      add('publishing', 'Prepare a safe preview and launch checklist', 'Identify domain, hosting, metadata, privacy page, and a human review step before going live.', 'Approval required for launch');
    }
    if (/market|social|instagram|facebook|tiktok|content|post|marketing|שיווק|פרסום|פוסט|אינסטגרם|פייסבוק/.test(goal)) {
      add('marketing', 'Draft a channel-specific content plan', 'Prepare content themes, a sample post, audience, call to action, and a review checklist. No post is published.');
    }
    if (/google|seo|search|rank|visibility|קידום|גוגל|חשיפה/.test(goal)) {
      add('seo', 'Run a search-readiness checklist', 'Review page titles, descriptions, headings, content quality, mobile performance, sitemap, and Search Console verification.');
    }
    if (/ads|advert|campaign|budget|paid|ממומן|קמפיין|תקציב/.test(goal)) {
      add('ads', 'Design a controlled advertising test', 'Define conversion event, target audience, draft creative, and reporting metrics. Any account connection, launch, or budget change needs explicit approval.', 'Approval required before spend');
    }
    if (/store|shop|product|ecommerce|e-commerce|חנות|מוצר|מכירות/.test(goal)) {
      add('store', 'Prepare the store and customer flow', 'List product fields, pricing checks, contact path, order confirmation needs, and customer-support workflow.');
    }
    if (/lead|customer|crm|inquiry|clients|לקוחות|לידים/.test(goal)) {
      add('store', 'Design a lead intake and follow-up workflow', 'Specify lead source, consent, owner, next action, and retention rules; use test data until secure storage exists.');
    }
    if (/app store|app-store|google play|ios app|android app|אפליקציה|אפסטור|גוגל פליי/.test(goal)) {
      add('publishing', 'Prepare app-store readiness steps', 'List build, privacy disclosures, store listing, testing, signing, and review requirements. No submission is made.');
    }
    if (tasks.length === 1) {
      add('website', 'Produce a first implementation outline', 'Create a small, reviewable first version, then validate it before expanding scope.');
      add('seo', 'Check quality and launch readiness', 'Review usability, accessibility, content clarity, and the next measurable milestone.');
    }
    if (priority === 'speed') tasks.splice(1, 0, makeTask('coordinator', 'Choose the smallest useful first release', 'Prioritize one core outcome and defer nonessential integrations.'));
    if (priority === 'quality') tasks.push(makeTask('coordinator', 'Run a quality review', 'Check accessibility, mobile behavior, accuracy, privacy, and failure cases before release.'));
    if (priority === 'budget') tasks.push(makeTask('coordinator', 'Keep the first version low-cost', 'Prefer local prototypes and free tiers; verify limits and avoid paid API usage until approved.'));
    return {
      title: 'Proposed execution plan',
      summary: 'The coordinator created ' + tasks.length + ' proposed tasks for this goal. This plan is rule-based and runs locally; it is not generated by a connected AI model.',
      tasks,
      policy: policy === 'drafts' ? 'Drafts only: external actions are prohibited.' : 'Approval-first: any future external action must pause for explicit user confirmation.',
      priority: ({balanced:'Balanced',speed:'Fast launch',quality:'Quality first',budget:'Budget first'})[priority] || 'Balanced'
    };
  }

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderPlan(plan) {
    results.replaceChildren();
    const summary = node('section', 'agent-summary');
    summary.append(node('h2', '', plan.title), node('p', '', plan.summary));
    const meta = node('div', 'agent-task-meta');
    meta.append(node('span', 'tag', 'Priority: ' + plan.priority), node('span', 'tag', plan.tasks.length + ' tasks'));
    summary.append(meta);
    results.append(summary);
    const list = node('div', 'agent-task-list');
    plan.tasks.forEach((task, index) => {
      const card = node('article', 'agent-task');
      card.append(node('div', 'agent-task-number', String(index + 1)));
      const content = node('div', 'agent-task-content');
      content.append(node('strong', '', task.title), node('p', '', task.detail));
      const taskMeta = node('div', 'agent-task-meta');
      taskMeta.append(node('span', 'tag', task.agent), node('span', 'tag', task.risk));
      content.append(taskMeta);
      card.append(content);
      list.append(card);
    });
    results.append(list);
    if (window.NovaBuildAuth?.setLatestPlan) window.NovaBuildAuth.setLatestPlan(plan);
    results.append(node('div', 'agent-safety', 'Safety policy: ' + plan.policy + ' This prototype has no access to your accounts, files, or external services. Nothing has been published, sent, or charged.'));
    results.classList.remove('hidden');
    results.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  }

  runButton.addEventListener('click', () => {
    const goal = goalInput.value.trim();
    if (!goal) {
      goalInput.setCustomValidity('Please describe one goal for the agent team.');
      goalInput.reportValidity();
      goalInput.addEventListener('input', () => goalInput.setCustomValidity(''), {once: true});
      return;
    }
    if (goal.length > 1200) return;
    runButton.disabled = true;
    runButton.textContent = 'Planning…';
    try {
      renderPlan(planGoal(goal, document.getElementById('agentPriority').value, document.getElementById('agentAutonomy').value));
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'Create a work plan';
    }
  });
})();

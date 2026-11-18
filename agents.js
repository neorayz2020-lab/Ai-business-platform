/* NovaBuild AI Operations Coordinator — authenticated, server-generated plans. */
(() => {
  const goalInput = document.getElementById('agentGoal');
  const runButton = document.getElementById('runAgentPlan');
  const results = document.getElementById('agentResults');
  const executeButton = document.getElementById('prepareAgentOutputs');
  const executionStatus = document.getElementById('agentExecutionStatus');
  const deliverablesBox = document.getElementById('agentDeliverables');
  let latestPlan = null;
  if (!goalInput || !runButton || !results) return;

  const statusLine = document.createElement('p');
  statusLine.className = 'auth-message';
  statusLine.setAttribute('role','status');
  statusLine.setAttribute('aria-live','polite');
  results.before(statusLine);

  function node(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = String(value);
    return el;
  }

  function renderPlan(plan) {
    results.replaceChildren();
    const summary = node('section','agent-summary');
    summary.append(node('h2','',plan.title || 'תוכנית העבודה של צוות ה-AI'));
    summary.append(node('p','',plan.summary || 'מנהל ה-AI חילק את המטרה למשימות מקצועיות.'));
    const meta = node('div','agent-task-meta');
    meta.append(node('span','tag','עדיפות: ' + plan.priorityLabel));
    meta.append(node('span','tag',plan.tasks.length + ' משימות'));
    meta.append(node('span','tag',plan.policyLabel));
    summary.append(meta);
    results.append(summary);

    const list = node('div','agent-task-list');
    plan.tasks.forEach((task,index) => {
      const card = node('article','agent-task');
      card.append(node('div','agent-task-number',String(index+1).padStart(2,'0')));
      const content = node('div','agent-task-content');
      content.append(node('strong','',task.title));
      content.append(node('p','',task.detail));
      if (task.deliverable) content.append(node('p','', 'תוצר צפוי: ' + task.deliverable));
      const tags = node('div','agent-task-meta');
      tags.append(node('span','tag',task.agent));
      tags.append(node('span','tag',task.priority === 'high' ? 'עדיפות גבוהה' : task.priority === 'low' ? 'עדיפות נמוכה' : 'עדיפות רגילה'));
      if (task.approvalRequired) tags.append(node('span','tag','נדרש אישור לפני ביצוע'));
      content.append(tags);
      card.append(content);
      list.append(card);
    });
    results.append(list);

    if (plan.nextDecision) {
      const next = node('div','agent-next-decision','ההחלטה הבאה: ' + plan.nextDecision);
      results.append(next);
    }
    const safety = node('div','agent-safety','מנהל ה-AI הכין תוכנית והקצה אחריות. הוא עדיין לא פרסם, לא שלח הודעות, לא חיבר חשבונות ולא הוציא תקציב. פעולות חיצוניות ידרשו חיבור והרשאה מפורשים.');
    results.append(safety);
    results.classList.remove('hidden');
    results.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }

  function renderDeliverables(items) {
    deliverablesBox.replaceChildren();
    items.forEach((item,index) => {
      const card = node('article','agent-deliverable');
      const header = node('div','agent-deliverable-header');
      header.append(node('span','tag',item.agent));
      header.append(node('span','agent-deliverable-number','תוצר ' + String(index+1).padStart(2,'0')));
      card.append(header);
      card.append(node('h3','',item.title || 'תוצר הסוכן'));
      card.append(node('div','agent-deliverable-output',item.output || 'לא התקבל תוצר.'));
      if (item.nextStep) card.append(node('p','agent-deliverable-next','הצעד הבא: ' + item.nextStep));
      if (item.approvalRequired) card.append(node('p','agent-deliverable-approval','נדרש אישור לפני פעולה חיצונית.'));
      deliverablesBox.append(card);
    });
    deliverablesBox.classList.remove('hidden');
  }

  if (executeButton) executeButton.addEventListener('click', async () => {
    if (!latestPlan || !Array.isArray(latestPlan.tasks)) return;
    executeButton.disabled = true;
    executeButton.textContent = 'הסוכנים מכינים תוצרים…';
    executionStatus.textContent = 'מנהל ה־AI שולח לכל מומחה את המשימה שלו ומרכז את הטיוטות.';
    deliverablesBox.classList.add('hidden');
    try {
      if (!window.NovaBuildAuth?.runBusinessAgent) throw new Error('צריך להתחבר לחשבון החינמי כדי להפעיל את הסוכנים.');
      const response = await window.NovaBuildAuth.runBusinessAgent('execute-plan', {
        goal: goalInput.value.trim(),
        tasks: latestPlan.tasks
      });
      if (!Array.isArray(response?.deliverables) || response.deliverables.length !== latestPlan.tasks.length) {
        throw new Error('לא התקבל תוצר לכל משימה. אפשר לנסות שוב.');
      }
      latestPlan = {
        ...latestPlan,
        deliverables: response.deliverables,
        tasks: latestPlan.tasks.map((task,index) => ({
          ...task,
          output: response.deliverables[index]?.output || '',
          nextStep: response.deliverables[index]?.nextStep || '',
          approvalRequired: Boolean(task.approvalRequired || response.deliverables[index]?.approvalRequired)
        }))
      };
      renderDeliverables(response.deliverables);
      window.NovaBuildAuth.setLatestPlan?.(latestPlan);
      executionStatus.textContent = 'התוצרים מוכנים לבדיקה. אפשר לשמור את התוכנית והתוצרים בחשבון.';
    } catch (error) {
      executionStatus.textContent = error?.message || 'לא הצלחנו להכין את התוצרים. נסה שוב.';
    } finally {
      executeButton.disabled = !latestPlan;
      executeButton.textContent = 'הכן תוצרים לכל המשימות';
    }
  });

  runButton.addEventListener('click', async () => {
    const goal = goalInput.value.trim();
    const priority = document.getElementById('agentPriority')?.value || 'balanced';
    const executionPolicy = document.getElementById('agentAutonomy')?.value || 'approval';
    const businessContext = document.getElementById('agentBusinessContext')?.value.trim() || '';
    if (!goal) {
      goalInput.setCustomValidity('תאר מטרה אחת שהצוות צריך לקדם.');
      goalInput.reportValidity();
      goalInput.addEventListener('input',() => goalInput.setCustomValidity(''),{once:true});
      return;
    }
    if (goal.length > 1200) return;
    runButton.disabled = true;
    runButton.textContent = 'מנהל ה-AI מנתח ומחלק משימות…';
    statusLine.textContent = 'מנהל ה-AI בונה תוכנית ומעביר משימות לסוכנים המתאימים.';
    results.classList.add('hidden');
    try {
      if (!window.NovaBuildAuth?.runBusinessAgent) throw new Error('שירות החשבון עדיין לא מוכן. רענן את העמוד ונסה שוב.');
      const response = await window.NovaBuildAuth.runBusinessAgent('orchestrator',{goal,priority,executionPolicy,businessContext});
      const source = response?.plan;
      if (!source || !Array.isArray(source.tasks) || !source.tasks.length) throw new Error('מנהל ה-AI לא החזיר תוכנית תקינה. נסה לנסח את המטרה אחרת.');
      const priorityLabels = {balanced:'מאוזנת',speed:'מהירה',quality:'איכות לפני מהירות',budget:'חסכונית'};
      const normalized = {
        title: source.title || 'תוכנית העבודה של צוות ה-AI',
        summary: source.summary || '',
        nextDecision: source.nextDecision || '',
        priorityLabel: priorityLabels[priority] || 'מאוזנת',
        policyLabel: executionPolicy === 'drafts' ? 'טיוטות בלבד' : 'אישור לפני פעולה חיצונית',
        policy: executionPolicy,
        tasks: source.tasks.map(task => ({
          agent: task.agent || 'Coordinator',
          title: task.title || 'משימה חדשה',
          detail: task.detail || '',
          deliverable: task.deliverable || '',
          priority: task.priority || 'medium',
          approvalRequired: Boolean(task.approvalRequired),
          risk: task.approvalRequired ? 'Approval required' : 'Draft only'
        }))
      };
      latestPlan = normalized;
      renderPlan(normalized);
      if (executeButton) executeButton.disabled = false;
      executionStatus.textContent = 'התוכנית מוכנה. עכשיו אפשר לבקש מהסוכנים להכין תוצרים לכל המשימות.';
      deliverablesBox.replaceChildren();
      deliverablesBox.classList.add('hidden');
      window.NovaBuildAuth.setLatestPlan?.(normalized);
      statusLine.textContent = 'התוכנית מוכנה. אפשר להכין תוצרים או לשמור אותה בחשבון שלך.';
    } catch (error) {
      latestPlan = null;
      if (executeButton) executeButton.disabled = true;
      executionStatus.textContent = 'צור תוכנית חדשה כדי להכין תוצרים.';
      statusLine.textContent = error?.message || 'לא הצלחנו להפעיל את מנהל ה-AI. נסה שוב.';
      const message = node('div','agent-error',statusLine.textContent);
      results.replaceChildren(message);
      results.classList.remove('hidden');
      if (/חשבון חינמי|להתחבר|התחבר/.test(statusLine.textContent)) {
        const email = document.getElementById('accountEmail');
        email?.focus();
      }
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'צור תוכנית עבודה עם AI';
    }
  });
})();

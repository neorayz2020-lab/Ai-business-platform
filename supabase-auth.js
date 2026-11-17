/* Supabase browser auth. Only the publishable/anon key belongs here; never put service_role keys in the browser. */
(() => {
  const config = window.NOVABUILD_CONFIG || {};
  const panel = document.getElementById('accountPanel');
  if (!panel) return;
  const status = document.getElementById('accountStatus');
  const message = document.getElementById('accountMessage');
  const email = document.getElementById('accountEmail');
  const password = document.getElementById('accountPassword');
  const signIn = document.getElementById('signInButton');
  const signUp = document.getElementById('signUpButton');
  const signOut = document.getElementById('signOutButton');
  const savePlanButton = document.getElementById('saveAgentPlan');
  const savePlanStatus = document.getElementById('saveAgentPlanStatus');
  let client = null, currentUser = null, latestPlan = null;
  function setMessage(text, isError = false) { message.textContent = text; message.dataset.kind = isError ? 'error' : 'info'; }
  function setStatus(text) { status.textContent = text; }
  function setBusy(busy) { [signIn, signUp, signOut].forEach(button => { if (button) button.disabled = busy; }); }
  function refreshControls() {
    const configured = Boolean(client);
    document.getElementById('authConfigWarning').classList.toggle('hidden', configured);
    document.getElementById('authForms').classList.toggle('hidden', !configured || Boolean(currentUser));
    signOut.classList.toggle('hidden', !configured || !currentUser);
    setStatus(!configured ? 'Not connected' : currentUser ? 'Signed in: ' + currentUser.email : 'Not signed in');
    if (savePlanButton) savePlanButton.disabled = !currentUser || !latestPlan;
  }
  async function loadSession() {
    if (!client) { refreshControls(); return; }
    const { data, error } = await client.auth.getSession();
    if (error) setMessage(error.message, true);
    currentUser = data?.session?.user || null;
    refreshControls();
  }
  async function authenticate(mode) {
    if (!client) return;
    const emailValue = email.value.trim(), passwordValue = password.value;
    if (!emailValue || passwordValue.length < 8) { setMessage('Enter your email and a password of at least 8 characters.', true); return; }
    setBusy(true);
    try {
      const result = mode === 'signup'
        ? await client.auth.signUp({email: emailValue, password: passwordValue})
        : await client.auth.signInWithPassword({email: emailValue, password: passwordValue});
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) setMessage('Account request received. Check your email to confirm the account, then sign in.');
      else { currentUser = result.data.user || result.data.session?.user || null; setMessage(mode === 'signup' ? 'Account created.' : 'Signed in successfully.'); }
      password.value = '';
      await loadSession();
    } catch (error) { setMessage(error?.message || 'Authentication failed. Check your project settings.', true); }
    finally { setBusy(false); }
  }
  async function saveLatestPlan() {
    if (!client || !currentUser || !latestPlan) return;
    savePlanButton.disabled = true; savePlanStatus.textContent = 'Saving…';
    try {
      const { data: run, error: runError } = await client.from('agent_runs').insert({
        user_id: currentUser.id, goal: document.getElementById('agentGoal').value.trim(),
        priority: document.getElementById('agentPriority').value,
        execution_policy: document.getElementById('agentAutonomy').value,
        plan: latestPlan, status: 'planned'
      }).select('id').single();
      if (runError) throw runError;
      const rows = latestPlan.tasks.map((task, index) => ({
        run_id: run.id, user_id: currentUser.id, position: index + 1,
        agent_name: task.agent, title: task.title, detail: task.detail,
        risk_label: task.risk, status: 'proposed'
      }));
      const { error: taskError } = await client.from('agent_tasks').insert(rows);
      if (taskError) { await client.from('agent_runs').delete().eq('id', run.id); throw taskError; }
      savePlanStatus.textContent = 'Plan saved to your account.';
    } catch (error) { savePlanStatus.textContent = 'Could not save plan: ' + (error?.message || 'unknown error'); }
    finally { savePlanButton.disabled = false; }
  }
  signIn.addEventListener('click', () => authenticate('signin'));
  signUp.addEventListener('click', () => authenticate('signup'));
  signOut.addEventListener('click', async () => {
    if (!client) return;
    signOut.disabled = true;
    const { error } = await client.auth.signOut();
    signOut.disabled = false;
    if (error) setMessage(error.message, true);
    else { currentUser = null; setMessage('Signed out.'); refreshControls(); }
  });
  if (savePlanButton) savePlanButton.addEventListener('click', saveLatestPlan);
  window.NovaBuildAuth = {
    setLatestPlan(plan) {
      latestPlan = plan;
      if (savePlanButton) savePlanButton.disabled = !currentUser || !latestPlan;
      if (savePlanStatus) savePlanStatus.textContent = currentUser ? 'You can save this plan to your account.' : 'Sign in to save plans to your account.';
    },
    isConfigured: () => Boolean(client)
  };
  if (window.supabase?.createClient && config.supabaseUrl && config.supabaseAnonKey &&
      /^https:\/\/[^/]+\.supabase\.co$/.test(config.supabaseUrl) &&
      !/YOUR_SUPABASE|PASTE_|REPLACE_ME/i.test(config.supabaseAnonKey)) {
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}
    });
    client.auth.onAuthStateChange((_event, session) => { currentUser = session?.user || null; refreshControls(); });
  } else setMessage('Supabase is not configured yet. Follow SUPABASE_SETUP.md to create the project and set the public URL/key.');
  loadSession();
})();

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
  const forgotPassword = document.getElementById('forgotPasswordButton');
  const planName = document.getElementById('accountPlanName');
  const recoveryForm = document.getElementById('passwordRecoveryForm');
  const newPassword = document.getElementById('newAccountPassword');
  const saveNewPassword = document.getElementById('saveNewPasswordButton');
  const savePlanButton = document.getElementById('saveAgentPlan');
  const savePlanStatus = document.getElementById('saveAgentPlanStatus');
  let client = null, currentUser = null, latestPlan = null, businessProfile = null, activeSubscription = null, passwordRecoveryMode = false;
  function setMessage(text, isError = false) { message.textContent = text; message.dataset.kind = isError ? 'error' : 'info'; }
  function setStatus(text) { status.textContent = text; }
  function setBusy(busy) { [signIn, signUp, signOut].forEach(button => { if (button) button.disabled = busy; }); }
  function refreshControls() {
    const configured = Boolean(client);
    document.getElementById('authConfigWarning').classList.toggle('hidden', configured);
    document.getElementById('authForms').classList.toggle('hidden', !configured || Boolean(currentUser) || passwordRecoveryMode);
    if (recoveryForm) recoveryForm.classList.toggle('hidden', !configured || !passwordRecoveryMode);
    signOut.classList.toggle('hidden', !configured || !currentUser || passwordRecoveryMode);
    setStatus(!configured ? 'לא מחובר' : currentUser ? 'מחובר: ' + currentUser.email : 'לא מחובר');
    if (planName) planName.textContent = activeSubscription ? (activeSubscription.plan_key === 'business_ai' ? 'Business AI' : 'Pro') : 'Free · חינם';
    if (savePlanButton) savePlanButton.disabled = !currentUser || !latestPlan;
  }
  async function loadBusinessProfile() {
    if (!client || !currentUser) { businessProfile = null; return null; }
    const { data, error } = await client.from('business_profiles').select('*').eq('user_id', currentUser.id).maybeSingle();
    if (error) throw new Error(error.message || 'Could not load the business profile.');
    businessProfile = data || null;
    window.dispatchEvent(new CustomEvent('novabuild:business-profile', {detail:{profile:businessProfile}}));
    return businessProfile;
  }
  async function loadSubscription() {
    activeSubscription = null;
    if (!client || !currentUser) {
      window.dispatchEvent(new CustomEvent('novabuild:subscription', {detail:{subscription:null,plan:'free'}}));
      refreshControls();
      return null;
    }
    const { data, error } = await client.from('billing_subscriptions')
      .select('plan_key,status,current_period_end')
      .eq('user_id', currentUser.id)
      .eq('status','active')
      .order('current_period_end',{ascending:false})
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message || 'Could not load subscription.');
    if (data && (!data.current_period_end || new Date(data.current_period_end).getTime() > Date.now())) activeSubscription = data;
    const plan = activeSubscription?.plan_key === 'business_ai' ? 'business_ai' : activeSubscription ? 'pro' : 'free';
    window.dispatchEvent(new CustomEvent('novabuild:subscription', {detail:{subscription:activeSubscription,plan}}));
    refreshControls();
    return activeSubscription;
  }
  async function loadSession() {
    if (!client) { refreshControls(); return; }
    const { data, error } = await client.auth.getSession();
    if (error) setMessage(error.message, true);
    currentUser = data?.session?.user || null;
    if (currentUser) {
      try { await Promise.all([loadBusinessProfile(), loadSubscription()]); }
      catch (profileError) { setMessage('התחברת, אך לא הצלחתי לטעון את נתוני החשבון: ' + (profileError.message || ''), true); }
    } else { businessProfile = null; activeSubscription = null; }
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
        agent_name: task.agent, title: task.title,
        detail: String(task.detail || '') + (task.output ? '\n\nתוצר AI:\n' + String(task.output) + (task.nextStep ? '\nהצעד הבא: ' + String(task.nextStep) : '') : '').slice(0,4000),
        risk_label: task.risk, status: 'proposed'
      }));
      const { error: taskError } = await client.from('agent_tasks').insert(rows);
      if (taskError) { await client.from('agent_runs').delete().eq('id', run.id); throw taskError; }
      savePlanStatus.textContent = 'Plan saved to your account.';
    } catch (error) { savePlanStatus.textContent = 'Could not save plan: ' + (error?.message || 'unknown error'); }
    finally { savePlanButton.disabled = false; }
  }
  if (saveNewPassword) saveNewPassword.addEventListener('click', async () => {
    if (!client || !currentUser) { setMessage('פתח את קישור איפוס הסיסמה מהמייל כדי להמשיך.', true); return; }
    const value = newPassword.value;
    if (value.length < 8) { setMessage('הסיסמה החדשה חייבת להכיל לפחות 8 תווים.', true); newPassword.focus(); return; }
    saveNewPassword.disabled = true;
    try {
      const { error } = await client.auth.updateUser({ password: value });
      if (error) throw error;
      newPassword.value = '';
      passwordRecoveryMode = false;
      refreshControls();
      setMessage('הסיסמה עודכנה בהצלחה. אפשר להמשיך להשתמש בחשבון.');
    } catch (error) { setMessage(error?.message || 'לא הצלחנו לעדכן את הסיסמה.', true); }
    finally { saveNewPassword.disabled = false; }
  });
  if (forgotPassword) forgotPassword.addEventListener('click', async () => {
    if (!client) return;
    const emailValue = email.value.trim();
    if (!emailValue) { setMessage('הזן כתובת מייל כדי לשלוח קישור לאיפוס סיסמה.', true); email.focus(); return; }
    forgotPassword.disabled = true;
    try {
      const { error } = await client.auth.resetPasswordForEmail(emailValue, { redirectTo: window.location.origin });
      if (error) throw error;
      setMessage('שלחנו קישור לאיפוס סיסמה לכתובת המייל שהזנת. בדוק גם את תיקיית הספאם.');
    } catch (error) { setMessage(error?.message || 'לא הצלחנו לשלוח קישור לאיפוס סיסמה.', true); }
    finally { forgotPassword.disabled = false; }
  });
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
    isConfigured: () => Boolean(client),
    getCurrentUser: () => currentUser,
    getSubscription: () => activeSubscription,
    getPlan: () => activeSubscription?.plan_key || 'free',
    isPro: () => Boolean(activeSubscription && activeSubscription.status === 'active' && (!activeSubscription.current_period_end || new Date(activeSubscription.current_period_end).getTime() > Date.now())),
    async refreshSubscription() { return loadSubscription(); },
    async getBusinessProfile() {
      if (!currentUser) return null;
      return businessProfile || await loadBusinessProfile();
    },
    async saveBusinessProfile(payload) {
      if (!client || !currentUser) throw new Error('כדי לשמור פרטי עסק צריך להתחבר לחשבון.');
      const fields = ['business_name','industry','description','services','target_audience','service_area','communication_style','preferred_language','website_url','public_phone','whatsapp_phone'];
      const record = { user_id: currentUser.id };
      fields.forEach(key => {
        const value = payload && payload[key] !== undefined ? payload[key] : '';
        record[key] = String(value).trim().slice(0, key === 'description' || key === 'services' ? 1800 : key === 'target_audience' ? 500 : key === 'service_area' ? 240 : 500);
      });
      const { data, error } = await client.from('business_profiles').upsert(record, {onConflict:'user_id'}).select('*').single();
      if (error) throw new Error(error.message || 'לא הצלחתי לשמור את פרטי העסק.');
      businessProfile = data;
      window.dispatchEvent(new CustomEvent('novabuild:business-profile', {detail:{profile:businessProfile}}));
      return businessProfile;
    },
    async saveWebsiteProject(payload) {
      if (!client) throw new Error('Account service is not configured.');
      if (!currentUser) throw new Error('Sign in to save this website to your account.');
      const record = {
        user_id: currentUser.id,
        name: String(payload.name || 'Untitled website').trim().slice(0, 120) || 'Untitled website',
        site_type: String(payload.siteType || 'Business website').slice(0, 60),
        brief: String(payload.brief || '').slice(0, 1800),
        contact_url: String(payload.contactUrl || '').slice(0, 500),
        settings: payload.settings || {},
        html: String(payload.html || '').slice(0, 500000)
      };
      if (!record.brief || !record.html) throw new Error('Generate a website draft before saving.');
      const { data, error } = await client.from('website_projects').insert(record).select('id').single();
      if (error) throw new Error(error.message || 'Could not save the website.');
      return data;
    },
    async runBusinessAgent(mode, payload) {
      if (!client) throw new Error('שירות החשבון אינו מוגדר.');
      if (!currentUser) throw new Error('כדי להשתמש בסוכני AI צריך ליצור חשבון חינמי או להתחבר. לחץ על „חשבון / התחברות” למעלה.');
      const profile = businessProfile || await loadBusinessProfile();
      const { data, error } = await client.functions.invoke('business-agent', { body: { mode, businessProfile: profile ? JSON.stringify(profile) : '', ...payload } });
      if (error) {
        let message = error.message || 'בקשת הסוכן נכשלה.';
        try {
          const response = error.context;
          if (response && typeof response.json === 'function') {
            const body = await response.json();
            if (typeof body?.error === 'string' && body.error.trim()) message = body.error;
          }
        } catch (_) {}
        throw new Error(message);
      }
      if (!data) throw new Error('הסוכן לא החזיר תשובה תקינה.');
      return data;
    },
    async generateWebsiteWithAI(payload) {
      if (!client) throw new Error('Account service is not configured.');
      if (!currentUser) throw new Error('כדי ליצור אתר באמצעות AI צריך ליצור חשבון חינמי או להתחבר. לחץ על „חשבון / התחברות” למעלה.');
      const profile = businessProfile || await loadBusinessProfile();
      const { data, error } = await client.functions.invoke('generate-website', { body: { ...payload, businessContext: profile ? JSON.stringify(profile) : '' } });
      if (error) {
        // Supabase wraps non-2xx Edge Function responses; surface the server's
        // actionable JSON error (for example, a missing Gemini secret) when available.
        let message = error.message || 'AI request failed.';
        try {
          const response = error.context;
          if (response && typeof response.json === 'function') {
            const body = await response.json();
            if (typeof body?.error === 'string' && body.error.trim()) message = body.error;
          }
        } catch (_) {
          // Keep the original Supabase error if the response body isn't JSON/readable.
        }
        throw new Error(message);
      }
      if (!data || !data.website) throw new Error(data?.error || 'The AI service returned an invalid response.');
      return data.website;
    }
  };
  if (window.supabase?.createClient && config.supabaseUrl && config.supabaseAnonKey &&
      /^https:\/\/[^/]+\.supabase\.co$/.test(config.supabaseUrl) &&
      !/YOUR_SUPABASE|PASTE_|REPLACE_ME/i.test(config.supabaseAnonKey)) {
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}
    });
    client.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      if (event === 'PASSWORD_RECOVERY') passwordRecoveryMode = true;
      if (event === 'PASSWORD_UPDATED') passwordRecoveryMode = false;
      if (!currentUser) { businessProfile = null; activeSubscription = null; }
      else Promise.all([loadBusinessProfile(), loadSubscription()]).catch(error => setMessage(error.message || 'Could not load account data.', true));
      refreshControls();
    });
  } else setMessage('Supabase is not configured yet. Follow SUPABASE_SETUP.md to create the project and set the public URL/key.');
  loadSession();
})();

/* Guided site manager. Local rules only; no live LLM or external actions. */
(() => {
  const launcher = document.createElement('button');
  launcher.id = 'nb-help-launcher'; launcher.type = 'button';
  launcher.textContent = '✦ עזרה ושינוי האתר';
  launcher.setAttribute('aria-controls', 'nb-help-panel'); launcher.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('section');
  panel.id = 'nb-help-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'עוזר NovaBuild לניהול האתר'); panel.hidden = true;
  panel.innerHTML = `
    <header class="nb-help-head"><div class="nb-help-avatar" aria-hidden="true">N</div><div class="nb-help-title">העוזר של NovaBuild<span class="nb-help-subtitle">עזרה בהתחלה ובשינוי האתר</span></div><button id="nb-help-close" type="button" aria-label="סגירה">×</button></header>
    <div id="nb-help-messages" aria-live="polite" aria-relevant="additions"></div>
    <div id="nb-help-quick">
      <button type="button" data-help="website">בניית אתר</button>
      <button type="button" data-help="edit">שינוי האתר שלי</button>
      <button type="button" data-help="marketing">שיווק ופרסום</button>
      <button type="button" data-help="seo">גוגל וקידום</button>
      <button type="button" data-help="account">חשבון ושמירה</button>
    </div>
    <form class="nb-help-form" id="nb-help-form"><input id="nb-help-input" maxlength="500" autocomplete="off" placeholder="כתוב מה תרצה לבנות או לשנות…" aria-label="ההודעה שלך"><button id="nb-help-send" type="submit">שליחה</button></form>
    <div class="nb-help-note">עוזר מקומי ראשוני · לא משתף סיסמאות או פרטי תשלום.</div>`;
  document.body.append(launcher, panel);
  const messages = panel.querySelector('#nb-help-messages'), input = panel.querySelector('#nb-help-input');
  let greeted = false;
  function say(text, who='bot') { const bubble=document.createElement('div'); bubble.className='nb-help-message '+who; bubble.textContent=text; messages.append(bubble); messages.scrollTop=messages.scrollHeight; }
  function open(){panel.hidden=false;launcher.setAttribute('aria-expanded','true');if(!greeted){say('שלום! אני העוזר של NovaBuild. אני יכול להדריך אותך בבניית האתר וגם לעזור לשנות את הטיוטה: כותרת, צבעים, שם העסק ותיאור. מה תרצה לעשות?');greeted=true;}input.focus();}
  function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();}
  function go(view){document.querySelector('.nav-item[data-view="'+view+'"]')?.click();}
  function button(label, action){const wrap=document.createElement('div');wrap.className='nb-help-message bot';const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);wrap.append(b);messages.append(wrap);messages.scrollTop=messages.scrollHeight;}
  function changeSite(raw){
    const t=raw.trim();
    const builder=document.querySelector('#view-builder');
    const brief=document.querySelector('#siteBrief');
    const generated=document.querySelector('#downloadSite');
    const set=(id,value)=>{const el=document.getElementById(id);if(el&&value){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));return true;}return false;};
    let changed=[];
    const colorMatch=t.match(/(?:צבע(?:ים)?(?: האתר)?(?: ל| שיהיה )?|צבע ל|color(?: to)?\s*)(סגול|כחול|ירוק|אדום|שחור|לבן|טורקיז|ורוד|purple|blue|green|red|black|white|teal|pink|#[0-9a-f]{6})/i);
    if(colorMatch){const colors={'סגול':'#6d5dfc','purple':'#6d5dfc','כחול':'#2563eb','blue':'#2563eb','ירוק':'#276749','green':'#276749','אדום':'#c0392b','red':'#c0392b','שחור':'#172033','black':'#172033','לבן':'#ffffff','white':'#ffffff','טורקיז':'#087f8c','teal':'#087f8c','ורוד':'#b83280','pink':'#b83280'};set('siteAccent',colorMatch[1].startsWith('#')?colorMatch[1]:colors[colorMatch[1].toLowerCase()]||colors[colorMatch[1]]);changed.push('הצבע');}
    const headline=t.match(/(?:כותרת(?: ראשית)?(?: ל| שתהיה| היא)?|headline(?: to)?)[\s:״"']+(.+)/i);
    if(headline){set('siteHeadline',headline[1].replace(/[״"']+$/,''));changed.push('הכותרת');}
    const name=t.match(/(?:שם העסק(?: ל| שיהיה)?|שם האתר(?: ל| שיהיה)?|business name(?: to)?)[\s:״"']+(.+)/i);
    if(name){set('siteName',name[1].replace(/[״"']+$/,''));changed.push('שם העסק');}
    const desc=t.match(/(?:תיאור(?: האתר)?(?: ל| שיהיה)?|תוכן האתר(?: ל| שיהיה)?|description(?: to)?)[\s:״"']+(.+)/i);
    if(desc){set('siteBrief',desc[1].replace(/[״"']+$/,''));changed.push('תיאור האתר');}
    const cta=t.match(/(?:כפתור(?: ראשי)?(?: ל| שיהיה)?|טקסט הכפתור(?: ל)?|button text(?: to)?)[\s:״"']+(.+)/i);
    if(cta){set('siteButton',cta[1].replace(/[״"']+$/,''));changed.push('הכפתור');}
    if(changed.length){
      go('builder');
      if(generated && !generated.disabled){
        document.querySelector('#makeBrief')?.click();
        say('סידרתי את '+changed.join(', ')+', ובניתי מחדש את הטיוטה כדי שתראה את השינוי. 😊 בדוק את התצוגה המקדימה; אפשר להמשיך לבקש ממני שינויים.');
      } else {
        say('מילאתי את השינויים בשבילך. עוד רגע ניצור את הטיוטה הראשונה — אפשר גם לבקש ממני לכתוב את תיאור העסק.');
        button('יצירת טיוטה עכשיו',()=>{document.querySelector('#makeBrief')?.click();go('builder');});
      }
      return true;
    }
    if(/שנה|לשנות|עדכן|עדכון|צבע|כותרת|שם העסק|תיאור האתר|button|change|edit|update/i.test(t)){
      go('builder');
      say('אני יכול לעדכן ישירות בטיוטה צבע, כותרת, שם עסק, תיאור וטקסט כפתור. כתוב למשל: „שנה צבע לכחול” או „כותרת: שירות מקצועי ואמין”.');
      return true;
    }
    return false;
  }
  function answer(raw){
    const t=raw.toLowerCase();
    if(changeSite(raw)) return;
    if(/website|site|אתר|חנות|דף נחיתה|בנה|לבנות/.test(t)){
      const wantsBuild = /אני רוצה|תבנה|בנה לי|תיצור|צור לי|תכין|בנה אתר|build me|create me|i want a website|make me a site|website for|site for|online store/i.test(raw);
      const idea = document.querySelector('#nb-business-idea');
      if(wantsBuild && idea && raw.length > 12){
        idea.value = raw;
        const brief = document.querySelector('#siteBrief');
        if(brief) brief.value = raw;
        const name = document.querySelector('#siteName');
        if(name && !name.value.trim()) name.value = 'העסק שלי';
        go('builder');
        document.querySelector('#nb-build-first-draft')?.click();
        say('סבבה, לקחתי את מה שכתבת והכנתי טיוטה ראשונה בלי שתצטרך למלא טופס ארוך. 🙌 היא מבוססת כרגע על תבנית התחלתית, לא על חיבור AI מלא. תסתכל בתצוגה ותגיד לי מה לשנות.');
        return;
      }
      say('בשמחה! 🙂 כתוב לי במשפט אחד איזה עסק יש לך ומה היית רוצה שהאתר יעשה — למשל לקבל פניות, להציג שירותים או למכור מוצרים. אני אכין לך טיוטה ראשונה. לא צריך למלא טופס ארוך.');
      button('פתיחת בונה האתרים',()=>go('builder'));return;
    }
    if(/marketing|instagram|facebook|ads|advertis|campaign|שיווק|פרסום|מודעות/.test(t)){say('לשיווק פתח את מרכז השיווק כדי להכין טיוטת תוכן. כלי הפרסום עדיין לא מחובר לחשבונות ולא מפרסם או מוציא כסף אוטומטית.');button('פתיחת מרכז השיווק',()=>go('marketing'));return;}
    if(/google|seo|search|rank|גוגל|קידום/.test(t)){say('בגוגל וקידום אפשר לעבור על כותרות, תיאורים, התאמה לנייד ו-Google Search Console. הכלי מדריך אותך, אך עדיין לא שולח את האתר אוטומטית לגוגל.');button('פתיחת גוגל וקידום',()=>go('seo'));return;}
    if(/account|sign in|login|save|password|חשבון|התחברות|שמירה/.test(t)){say('פתח את אזור סוכני AI כדי לבדוק את הגדרות החשבון. שמירה דורשת שההתחברות תהיה מוגדרת. אל תכתוב כאן סיסמה.');button('פתיחת החשבון',()=>go('agents'));return;}
    say('אני כאן כדי לעזור בבנייה ובניהול האתר. אפשר לבחור נושא או לכתוב שינוי ספציפי כמו „שנה צבע לכחול” או „כותרת: העסק שלך, בדרך הנכונה”.');
  }
  function respond(raw){const value=raw.trim();if(!value)return;say(value,'user');answer(value);}
  launcher.addEventListener('click',()=>panel.hidden?open():close());
  panel.querySelector('#nb-help-close').addEventListener('click',close);
  panel.querySelector('#nb-help-form').addEventListener('submit',e=>{e.preventDefault();respond(input.value);input.value='';input.focus();});
  panel.querySelectorAll('[data-help]').forEach(b=>b.addEventListener('click',()=>respond(b.dataset.help==='edit'?'אני רוצה לשנות את האתר שלי':b.textContent)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
  window.addEventListener('novabuild:language',e=>{if(e.detail.language==='en'){launcher.textContent='✦ Site help & edits';panel.querySelector('.nb-help-title').firstChild.textContent='NovaBuild assistant';panel.querySelector('.nb-help-subtitle').textContent='Getting started and site editing';input.placeholder='Tell me what to build or change…';panel.querySelector('#nb-help-send').textContent='Send';panel.querySelector('.nb-help-note').textContent='Guided prototype · Do not share passwords or payment details.';panel.querySelectorAll('[data-help]').forEach((b,i)=>b.textContent=['Build a website','Edit my website','Marketing & ads','Google & SEO','Account & saving'][i]);}else{launcher.textContent='✦ עזרה ושינוי האתר';panel.querySelector('.nb-help-title').firstChild.textContent='העוזר של NovaBuild';panel.querySelector('.nb-help-subtitle').textContent='עזרה בהתחלה ובשינוי האתר';input.placeholder='כתוב מה תרצה לבנות או לשנות…';panel.querySelector('#nb-help-send').textContent='שליחה';panel.querySelector('.nb-help-note').textContent='עוזר מקומי ראשוני · לא משתף סיסמאות או פרטי תשלום.';panel.querySelectorAll('[data-help]').forEach((b,i)=>b.textContent=['בניית אתר','שינוי האתר שלי','שיווק ופרסום','גוגל וקידום','חשבון ושמירה'][i]);}});
})();
(() => {
  const pairs = [
    ["AI WORKSPACE","סביבת עבודה חכמה"],["WORKSPACE","סביבת עבודה"],["Overview","סקירה כללית"],["AI Agents","סוכני AI"],["Website builder","בונה אתרים"],["Marketing studio","מרכז השיווק"],["Ads Autopilot","ניהול פרסום אוטומטי"],["Online store","חנות מקוונת"],["Leads & CRM","לקוחות ולידים"],["Google & SEO","גוגל וקידום"],["App publishing","פרסום אפליקציות"],["Need a hand?","צריכים עזרה?"],["Your AI business guide","המדריך העסקי שלך"],["Prototype mode","מצב אבטיפוס"],["Skip to main content","דילוג לתוכן הראשי"],
    ["YOUR BUSINESS, ONE WORKSPACE","כל העסק במקום אחד"],["Build something","בואו נבנה משהו"],["remarkable.","יוצא דופן."],["A business workspace prototype for website drafts, marketing planning, SEO guidance, and launch checklists.","סביבת עבודה ראשונית לבניית אתרים, תכנון שיווק, קידום בגוגל ורשימות הכנה להשקה."],["Create a website","יצירת אתר"],["YOUR AI BUSINESS PARTNER","שותף ה-AI העסקי שלך"],["What do you want to","מה תרצה"],["build today?","לבנות היום?"],["Describe your idea. Get a starting point, then refine it with AI.","תאר את הרעיון שלך, קבל בסיס ראשוני ושפר אותו בעזרת AI."],["Start building","התחל לבנות"],["AI website copy requires sign-in and a configured server-side key. Other planning tools are prototypes.","יצירת תוכן באמצעות AI דורשת התחברות והגדרת מפתח שרת. כלים אחרים עדיין בשלבי אבטיפוס."],["Your business toolkit","ארגז הכלים העסקי שלך"],["Everything you need, connected in one place.","כל הכלים החשובים לעסק, במקום אחד."],["Website builder","בונה אתרים"],["Turn your idea into a responsive website.","הפוך את הרעיון שלך לאתר מותאם לנייד."],["Start creating","התחל ליצור"],["Marketing studio","מרכז השיווק"],["Draft social posts, campaigns, and content.","צור טיוטות לפוסטים ולקמפיינים."],["Create content","יצירת תוכן"],["Plan campaigns and review optimization ideas.","תכנן קמפיינים ורעיונות לשיפור."],["Explore ads","לכלי הפרסום"],["Follow a practical search-readiness checklist.","רשימת בדיקה לקידום במנועי חיפוש."],["Improve SEO","שיפור הקידום"],["Plan products, pricing, and your storefront.","תכנן מוצרים, מחירים וחנות."],["Manage store","ניהול החנות"],["Keep track of inquiries and next steps.","עקוב אחר פניות והמשך טיפול."],["View leads","צפייה בלידים"],["Early prototype","אבטיפוס ראשוני"],["NovaBuild AI is an early-access workspace. Website drafts and planning tools are available; live ad-account integrations, native app-store publishing, and some account features still require setup.","NovaBuild AI נמצאת בשלב ראשוני. יצירת טיוטות ותכנון זמינים; חיבור חשבונות פרסום, פרסום לחנויות אפליקציות וחלק מתכונות החשבון עדיין דורשים הגדרה."],
    ["CREATE YOUR FIRST VERSION","בנה את הגרסה הראשונה"],["Describe your business, generate a website draft, preview it, and download the file. Use the AI button for model-generated copy or the starter template.","ספר על העסק, צור טיוטת אתר, צפה בתצוגה מקדימה והורד את הקובץ."],["Tell us about your business","ספר לנו על העסק שלך"],["A few details help shape the first draft.","כמה פרטים יעזרו ליצור טיוטה מתאימה."],["Business or project name","שם העסק או הפרויקט"],["What kind of site do you need?","איזה סוג אתר צריך?"],["Describe your website","תאר את האתר שלך"],["Contact link (optional)","קישור ליצירת קשר (לא חובה)"],["Main headline","כותרת ראשית"],["Main button text","טקסט הכפתור הראשי"],["Website accent color","צבע הדגשה באתר"],["Customize page sections","התאמה אישית של אזורי האתר"],["Contact section heading","כותרת אזור יצירת קשר"],["Contact section text","טקסט אזור יצירת קשר"],["Generate with AI","יצירה באמצעות AI"],["Use starter template","שימוש בתבנית בסיסית"],["Clear","ניקוי"],["Live preview","תצוגה מקדימה"],["Your website will appear here","האתר שלך יופיע כאן"],["Save to account","שמירה לחשבון"],["Download HTML","הורדת HTML"],["Marketing studio","מרכז השיווק"],["Create a first draft for your next campaign.","צור טיוטה ראשונה לקמפיין הבא."],["Business type","סוג העסק"],["Campaign goal","מטרת הקמפיין"],["Channel","ערוץ פרסום"],["Get more leads","קבלת יותר פניות"],["Increase sales","הגדלת מכירות"],["Grow brand awareness","הגברת מודעות למותג"],["Promote a new product","קידום מוצר חדש"],["Draft campaign","יצירת טיוטת קמפיין"],["Drafts are generated from built-in demo templates; no external AI service is connected.","הטיוטות נוצרות מתבניות הדגמה; אין חיבור לשירות AI חיצוני."],
    ["Campaign control center","מרכז ניהול הקמפיינים"],["No ad accounts connected","לא מחוברים חשבונות פרסום"],["This prototype cannot publish ads, spend money, change bids, or access campaign performance.","האבטיפוס אינו מפרסם מודעות, מוציא כסף או ניגש לביצועי קמפיינים."],["Campaign planner","מתכנן קמפיינים"],["Primary goal","מטרה עיקרית"],["Monthly budget (USD)","תקציב חודשי (דולר)"],["Channels to consider","ערוצים לשקול"],["Create sample plan","יצירת תוכנית לדוגמה"],["A starter space for your product catalog.","מקום התחלתי לקטלוג המוצרים שלך."],["Product catalog","קטלוג מוצרים"],["Sample products — not saved to a database.","מוצרי דוגמה — אינם נשמרים במסד נתונים."],["Add product","הוספת מוצר"],["Product name","שם המוצר"],["Price","מחיר"],["Status","סטטוס"],["A simple demo pipeline for tracking potential customers.","תצוגת הדגמה למעקב אחר לקוחות פוטנציאליים."],["Lead pipeline","צינור לידים"],["Sample data stored only in this open page.","נתוני דוגמה נשמרים רק בעמוד הפתוח."],["Add lead","הוספת ליד"],["Lead or company name","שם הלקוח או החברה"],["Source (e.g. Instagram)","מקור (למשל אינסטגרם)"],["New","חדש"],["Follow-up","נדרש מעקב"],["Work through these steps before launching your website.","בצע את השלבים לפני השקת האתר."],["Choose a clear domain name","בחר שם דומיין ברור"],["Write a unique title and meta description for each page","כתוב כותרת ותיאור ייחודיים לכל עמוד"],["Check mobile layout and page speed","בדוק התאמה לנייד ומהירות טעינה"],["Add useful, original content and descriptive headings","הוסף תוכן מקורי וכותרות ברורות"],["Create and submit a sitemap in Google Search Console","צור ושלח מפת אתר ב-Google Search Console"],["Verify ownership in Google Search Console","אמת בעלות ב-Google Search Console"],["Set up analytics and conversion tracking","הגדר אנליטיקה ומעקב המרות"],["Official Google tools","כלים רשמיים של Google"],["SEO is not instant","קידום בגוגל לוקח זמן"],["Plan the steps to submit your app to official stores.","תכנן את השלבים להגשת האפליקציה לחנויות הרשמיות."],["Apple App Store","חנות האפליקציות של Apple"],["Google Play","Google Play"],["Publishing is not automatic yet","הפרסום עדיין אינו אוטומטי"],["YOUR AI OPERATIONS TEAM","צוות התפעול שלך מבוסס AI"],["AI Agent Command Center","מרכז השליטה בסוכני AI"],["Give the team a goal. The coordinator will break it into specialist tasks and show a safe execution plan.","הגדר מטרה והמתאם יחלק אותה למשימות ויציג תוכנית ביצוע בטוחה."],["Prototype agent mode","מצב סוכנים ראשוני"],["Workspace account","חשבון סביבת העבודה"],["Sign in to save your agent plans securely to your own account.","התחבר כדי לשמור תוכניות בחשבון שלך."],["Backend setup required","נדרשת הגדרת מערכת"],["Authentication is not active until Supabase is configured. Follow the setup guide in the repository.","ההתחברות לא פעילה עד להגדרת Supabase."],["Email","דואר אלקטרוני"],["Password (at least 8 characters)","סיסמה (לפחות 8 תווים)"],["Sign in","התחברות"],["Create account","יצירת חשבון"],["Sign out","התנתקות"],["What should your AI team work on?","במה תרצה שצוות ה-AI יטפל?"],["Priority","עדיפות"],["Balanced","מאוזן"],["Fast launch","השקה מהירה"],["Quality first","איכות לפני הכול"],["Budget first","חיסכון בתקציב"],["Execution policy","מדיניות ביצוע"],["Ask before external actions","לבקש אישור לפני פעולות חיצוניות"],["Drafts only — no external actions","טיוטות בלבד — ללא פעולות חיצוניות"],["Create a work plan","יצירת תוכנית עבודה"],["Save plan to account","שמירת התוכנית בחשבון"],["Meet your specialist agents","הכירו את הסוכנים המקצועיים"],["Coordinator","מתאם"],["Website builder","בונה אתרים"],["Marketing strategist","אסטרטג שיווק"],["SEO specialist","מומחה קידום"],["Ads & analytics","פרסום ואנליטיקה"],["Planner","תכנון"],["Design","עיצוב"],["Growth","צמיחה"],["Search","חיפוש"],["Guarded","בפיקוח"],["Built to grow with your business","נבנה לצמוח יחד עם העסק שלך"],["English","English"],["Send","שליחה"],["Your message","ההודעה שלך"],["Violet","סגול"],["Ocean teal","טורקיז"],["Terracotta","טרקוטה"],["Forest green","ירוק יער"],["Classic blue","כחול"],["Rose","ורוד"]
  ];
  const originals = new WeakMap();
  let language = 'he';
  const ordered = pairs.sort((a,b)=>b[0].length-a[0].length);
  const escaped = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function translateString(value) {
    let out = value;
    for (const [en, he] of ordered) out = out.replace(new RegExp(escaped(en), 'gi'), he);
    return out;
  }
  function walk(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      node.nodeValue = language === 'he' ? translateString(originals.get(node)) : originals.get(node);
    }
    if (root.querySelectorAll) root.querySelectorAll('input,textarea,button,[aria-label],[title]').forEach(el => {
      ['placeholder','aria-label','title'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const key = attr + ':' + attr + ':' + el.getAttribute(attr);
        if (!el.dataset['orig' + attr]) el.dataset['orig' + attr] = el.getAttribute(attr);
        el.setAttribute(attr, language === 'he' ? translateString(el.dataset['orig' + attr]) : el.dataset['orig' + attr]);
      });
    });
  }
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'he';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-he', language === 'he');
    walk(document.body);
    const toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.textContent = language === 'he' ? 'English' : 'עברית';
      toggle.setAttribute('aria-label', language === 'he' ? 'Switch to English' : 'החלף לעברית');
    }
    window.dispatchEvent(new CustomEvent('novabuild:language', {detail:{language}}));
  }
  window.NovaBuildI18n = {setLanguage, getLanguage:()=>language, translateString};
  document.addEventListener('DOMContentLoaded', () => setLanguage('he'));
  const observer = new MutationObserver(records => {
    if (records.some(record => record.addedNodes.length)) walk(document.body);
  });
  observer.observe(document.body, {childList:true,subtree:true});
  document.getElementById('languageToggle')?.addEventListener('click', () => setLanguage(language === 'he' ? 'en' : 'he'));
  setLanguage('he');
})();
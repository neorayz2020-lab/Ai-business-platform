/* NovaBuild AI Creative Studio: authenticated server-side image generation + local text composition. */
(() => {
  const form = document.getElementById('creativeForm');
  if (!form) return;
  const modeInput = document.getElementById('creativeMode');
  const postFields = document.getElementById('creativePostFields');
  const status = document.getElementById('creativeStatus');
  const generateButton = document.getElementById('generateCreative');
  const downloadButton = document.getElementById('downloadCreative');
  const canvas = document.getElementById('creativeCanvas');
  const ctx = canvas.getContext('2d');
  const empty = document.getElementById('creativeEmpty');
  let sourceImage = null;
  let lastMime = 'image/png';

  const value = id => document.getElementById(id)?.value?.trim() || '';
  const setStatus = message => { status.textContent = message; };
  const setMode = mode => {
    modeInput.value = mode;
    document.querySelectorAll('[data-creative-mode]').forEach(button => {
      const active = button.dataset.creativeMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    postFields.hidden = mode === 'logo';
    document.getElementById('creativeFormat').disabled = mode === 'logo';
    if (mode === 'logo') setStatus('תיאור קצר של העסק יעזור ל-AI ליצור סמל מותג ייחודי.');
    else setStatus('כתוב כותרת אמיתית וקצרה שתופיע על גבי הפוסט.');
    if (sourceImage) renderComposition();
  };
  document.querySelectorAll('[data-creative-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.creativeMode)));

  function roundedRect(context, x, y, w, h, r) {
    context.beginPath(); context.moveTo(x+r,y); context.arcTo(x+w,y,x+w,y+h,r); context.arcTo(x+w,y+h,x,y+h,r); context.arcTo(x,y+h,x,y,r); context.arcTo(x,y,x+w,y,r); context.closePath();
  }
  function coverImage(image, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sw = width / scale, sh = height / scale;
    const sx = (image.naturalWidth - sw) / 2, sy = (image.naturalHeight - sh) / 2;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
  }
  function wrapText(text, maxWidth, font) {
    ctx.font = font;
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? line + ' ' + word : word;
      if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawText(text, x, y, maxWidth, font, lineHeight, color, align='right') {
    if (!text) return y;
    const lines = wrapText(text, maxWidth, font);
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.direction = /[\u0590-\u05ff]/.test(text) ? 'rtl' : 'ltr';
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight, maxWidth));
    return y + lines.length * lineHeight;
  }
  function renderComposition() {
    if (!sourceImage) return;
    const mode = modeInput.value;
    const format = mode === 'logo' ? '1:1' : value('creativeFormat') || '4:5';
    const dims = format === '1:1' ? [1080,1080] : format === '9:16' ? [1080,1920] : format === '16:9' ? [1920,1080] : [1080,1350];
    canvas.width = dims[0]; canvas.height = dims[1];
    coverImage(sourceImage, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    const palette = value('creativePalette');
    const gradient = ctx.createLinearGradient(0, h * (mode === 'logo' ? .35 : .25), 0, h);
    gradient.addColorStop(0, 'rgba(7,10,22,0.03)');
    gradient.addColorStop(.35, 'rgba(7,10,22,0.30)');
    gradient.addColorStop(1, 'rgba(7,10,22,0.92)');
    ctx.fillStyle = gradient; ctx.fillRect(0,0,w,h);
    ctx.direction = 'rtl'; ctx.textAlign = 'right';
    if (mode === 'logo') {
      const title = value('creativeBusiness');
      const nameFont = '800 ' + Math.round(w*.075) + 'px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#0009'; ctx.shadowBlur = 18;
      drawText(title, w/2, h*.76, w*.84, nameFont, Math.round(w*.09), '#ffffff','center');
      ctx.shadowBlur = 0;
      const sub = 'BRAND IDENTITY';
      ctx.font = '600 ' + Math.round(w*.022) + 'px Arial, sans-serif'; ctx.fillStyle = '#ffffffbd'; ctx.textAlign='center';
      ctx.fillText(sub,w/2,h*.88);
    } else {
      const pad = Math.round(w*.085);
      let y = h*.62;
      const business = value('creativeBusiness');
      if (business) {
        ctx.fillStyle = '#ffffff'; roundedRect(ctx,pad,y,w*.48,Math.round(w*.055),Math.round(w*.025)); ctx.fill();
        ctx.fillStyle = '#182039'; ctx.font = '700 '+Math.round(w*.027)+'px Arial,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(business.slice(0,38),pad+w*.24,y+w*.0275,w*.43); y+=h*.085;
      }
      y = drawText(value('creativeHeadline'), w-pad, y, w-pad*2, '800 '+Math.round(w*.075)+'px Arial, sans-serif', Math.round(w*.092), '#ffffff');
      y += Math.round(w*.025);
      y = drawText(value('creativeSubline'), w-pad, y, w-pad*2, '500 '+Math.round(w*.033)+'px Arial, sans-serif', Math.round(w*.047), '#f0f2ff');
      const cta = value('creativeCta');
      if (cta) {
        const buttonY = Math.min(y + Math.round(w*.05), h - Math.round(w*.14));
        const buttonW = Math.min(w*.70, Math.max(w*.36, ctx.measureText(cta).width + w*.12));
        const buttonX = w-pad-buttonW;
        ctx.fillStyle = '#ffffff'; roundedRect(ctx,buttonX,buttonY,buttonW,Math.round(w*.085),Math.round(w*.025)); ctx.fill();
        ctx.fillStyle = '#11182b'; ctx.font = '700 '+Math.round(w*.032)+'px Arial,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(cta,buttonX+buttonW/2,buttonY+w*.0425,buttonW-w*.05);
      }
    }
    empty.classList.add('hidden');
    downloadButton.disabled = false;
  }
  function imageFromBase64(data) {
    return new Promise((resolve,reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('התמונה התקבלה אך לא הצלחנו להציג אותה.'));
      img.src = 'data:' + (data.mimeType || 'image/png') + ';base64,' + data.imageBase64;
    });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const businessName = value('creativeBusiness');
    const description = value('creativeDescription');
    if (!businessName || !description) { setStatus('מלא את שם העסק ותיאור קצר לפני היצירה.'); return; }
    if (!window.NovaBuildAuth?.generateCreativeWithAI) { setStatus('שירות החשבון עדיין נטען. רענן את העמוד ונסה שוב.'); return; }
    const mode = modeInput.value;
    if (mode === 'post' && !value('creativeHeadline')) { setStatus('הוסף כותרת לפוסט כדי שנוכל לעצב אותה בתמונה.'); document.getElementById('creativeHeadline').focus(); return; }
    generateButton.disabled = true; downloadButton.disabled = true;
    generateButton.textContent = 'ה-AI מעצב את התמונה…';
    setStatus('יוצרים תמונה ייחודית. זה עשוי לקחת כחצי דקה.');
    try {
      const result = await window.NovaBuildAuth.generateCreativeWithAI({
        mode, businessName, description,
        style: value('creativeStyle'),
        palette: value('creativePalette'),
        format: mode === 'logo' ? '1:1' : value('creativeFormat'),
        headline: mode === 'post' ? value('creativeHeadline') : '',
        subline: mode === 'post' ? value('creativeSubline') : '',
        callToAction: mode === 'post' ? value('creativeCta') : ''
      });
      sourceImage = await imageFromBase64(result);
      lastMime = 'image/png';
      renderComposition();
      setStatus('העיצוב מוכן. אפשר לערוך את הטקסט ולהוריד קובץ PNG.');
    } catch (error) {
      setStatus(error?.message || 'לא הצלחנו ליצור את העיצוב. בדוק את החיבור ונסה שוב.');
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = 'צור עיצוב עם AI ✦';
    }
  });

  ['creativeBusiness','creativeHeadline','creativeSubline','creativeCta','creativeFormat'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { if (sourceImage) renderComposition(); });
    document.getElementById(id)?.addEventListener('change', () => { if (sourceImage) renderComposition(); });
  });
  downloadButton.addEventListener('click', () => {
    if (!sourceImage) return;
    canvas.toBlob(blob => {
      if (!blob) { setStatus('לא הצלחנו להכין את קובץ ההורדה. נסה שוב.'); return; }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (modeInput.value === 'logo' ? 'novabuild-logo' : 'novabuild-ad-post') + '.png';
      document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('קובץ ה-PNG מוכן. בדוק אותו לפני פרסום.');
    }, lastMime);
  });
  setMode('post');
})();

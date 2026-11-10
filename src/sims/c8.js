// تجارب الفصل الثامن: الكيمياء الحياتية
import { slider, toggle, readouts, svg, el, frame, goals, loop, button, row, note, clamp } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';
import { tex } from '../js/math.js';

/* ===== 1) كشوف الكاربوهيدرات ===== */
const SUG = { glucose: ['الكلوكوز', 'سكر أحادي مختزل'], fructose: ['الفركتوز', 'سكر أحادي مختزل'], sucrose: ['السكروز', 'سكر ثنائي غير مختزل'], starch: ['النشا', 'سكر متعدد'] };
export function biotests(mount, { onGoal } = {}) {
  const f = frame('مختبر الكشف عن الكاربوهيدرات', 'أضف كاشفًا إلى كل أنبوب: محلول اليود يكشف عن النشا (لون أزرق)، ومحلول فهلنك أو تولن يكشف عن السكريات المختزلة.');
  mount.appendChild(f.root);
  const S = { r: {}, used: new Set() };
  const W = 640, H = 250, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  el('defs', {}, s).innerHTML = '<linearGradient id="mir8" x1="0" x2="1"><stop offset="0" stop-color="#e5e7eb"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#f8fafc"/></linearGradient>';
  const res = (k, t) => t === 'iodine' ? (k === 'starch' ? ['أزرق', 'rgba(30,64,175,.9)'] : ['لا تغير (بني فاتح)', 'rgba(180,120,40,.45)'])
    : t === 'fehling' ? ((k === 'glucose' || k === 'fructose') ? ['راسب أحمر طابوقي', 'rgba(185,28,28,.8)'] : ['يبقى أزرق', 'rgba(37,99,235,.6)'])
      : ((k === 'glucose' || k === 'fructose') ? ['مرآة فضية', 'url(#mir8)'] : ['لا مرآة', 'rgba(203,213,225,.25)']);
  const seg = toggle([['iodine', 'محلول اليود'], ['fehling', 'محلول فهلنك (مع التسخين)'], ['tollens', 'كاشف تولن']], 'iodine', (v) => { S.t = v; });
  S.t = 'iodine';
  const G = goals([{ text: 'اكشف عن النشا', test: (st) => st.r.starch && st.r.starch[0] === 'أزرق' }, { text: 'لاحظ: الفركتوز يختزل فهلنك مع أنه كيتون', test: (st) => st.r.fructose && st.r.fructose[0].startsWith('راسب') }, { text: 'بيّن أن السكروز سكر غير مختزل', test: (st) => st.r.sucrose && (st.r.sucrose[0] === 'يبقى أزرق' || st.r.sucrose[0] === 'لا مرآة') }]);
  f.ctrl.append(seg, note('انقر على أي أنبوب لإضافة الكاشف المختار إليه.'), row(button('↺ أنابيب جديدة', () => { S.r = {}; draw(); })), G.el);
  function draw() {
    g.innerHTML = Object.entries(SUG).map(([k, [n, d]], i) => {
      const x = 70 + i * 140, r = S.r[k];
      return `<g data-k="${k}" style="cursor:pointer"><path d="M${x},30 v150 a25,25 0 0 0 50,0 v-150" fill="rgba(255,255,255,.03)" stroke="#cbd5e1" stroke-width="3"/><path d="M${x + 2},100 v80 a23,23 0 0 0 46,0 v-80 z" fill="${r ? r[1] : 'rgba(241,245,249,.18)'}"/>
        <text x="${x + 25}" y="225" fill="#e2e8f0" font-size="14" text-anchor="middle" font-weight="800">${n}</text><text x="${x + 25}" y="243" fill="#fbbf24" font-size="12" text-anchor="middle">${r ? r[0] : ''}</text></g>`;
    }).join('');
    g.querySelectorAll('[data-k]').forEach((t) => t.onclick = () => { const k = t.dataset.k; S.r[k] = res(k, S.t); S.used.add(S.t); sfx.pop(); draw(); });
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 2) الآصرة الببتيدية ===== */
const AA = { gly: ['كلايسين', 'H'], ala: ['ألانين', 'CH3'], ser: ['سيرين', 'CH2OH'], val: ['فالين', 'CH(CH3)2'] };
export function peptide(mount, { onGoal } = {}) {
  const f = frame('بناء الببتيد', 'اختر حامضين أمينيين وربطهما: مجموعة الكاربوكسيل في الأول تتفاعل مع مجموعة الأمين في الثاني، وتتحرر جزيئة ماء وتتكون آصرة ببتيدية (أميدية).');
  mount.appendChild(f.root);
  const S = { a: 'gly', b: 'ala', linked: false, made: new Set() };
  const box = document.createElement('div'); box.className = 'orgmap'; f.stage.appendChild(box);
  const sA = toggle(Object.entries(AA).map(([k, v]) => [k, v[0]]), S.a, (v) => { S.a = v; S.linked = false; draw(); });
  const sB = toggle(Object.entries(AA).map(([k, v]) => [k, v[0]]), S.b, (v) => { S.b = v; S.linked = false; draw(); });
  const G = goals([{ text: 'كوّن ثنائي ببتيد', test: (st) => st.made.size >= 1 }, { text: 'كوّن ثنائيي ببتيد مختلفين من الحامضين نفسيهما بتبديل الترتيب', test: (st) => [...st.made].some((x) => { const [p, q] = x.split('-'); return p !== q && st.made.has(q + '-' + p); }) }]);
  f.ctrl.append(note('الحامض الأميني الأول (طرف الكاربوكسيل):'), sA, note('الحامض الأميني الثاني (طرف الأمين):'), sB, row(button('🔗 كوّن الآصرة الببتيدية', () => { S.linked = true; S.made.add(S.a + '-' + S.b); sfx.unlock2(); draw(); })), G.el);
  function draw() {
    const A = AA[S.a], B = AA[S.b];
    const ch = (R) => (R === 'H' ? 'CH2' : `CH(${R})`), aa = (R) => `H2N-${ch(R)}-COOH`;
    box.innerHTML = `<div class="om-cur"><small>${A[0]} + ${B[0]}</small><div dir="ltr">${tex(`\\ce{${aa(A[1])} + ${aa(B[1])}}`)}</div></div>
      ${S.linked ? `<div class="om-eq"><small>ثنائي الببتيد + ماء</small><div dir="ltr">${tex(`\\ce{H2N-${ch(A[1])}-}\\boxed{\\ce{CO-NH}}\\ce{-${ch(B[1])}-COOH + H2O}`)}</div><p>المربع يحيط بالآصرة الببتيدية $\\ce{-CO-NH-}$.</p></div>` : ''}`;
    box.querySelectorAll('p').forEach((p) => { p.innerHTML = p.innerHTML.replace(/\$([^$]+)\$/g, (m, x) => tex(x)); });
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 3) فعالية الإنزيم ===== */
export function enzyme(mount, { onGoal } = {}) {
  const f = frame('متى يعمل الإنزيم أفضل؟', 'غيّر درجة الحرارة وقيمة pH وراقب سرعة التفاعل الذي يحفزه الإنزيم. الإنزيمات تتلف بالحرارة العالية، ولكل إنزيم مدى pH يعمل فيه.');
  mount.appendChild(f.root);
  const S = { T: 25, pH: 7, best: 0 };
  const W = 640, H = 260, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['v', 'سرعة التفاعل النسبية'], ['st', 'حالة الإنزيم']]);
  const sT = slider('درجة الحرارة', { min: 0, max: 80, step: 1, value: S.T, unit: '°C' }, (v) => { S.T = v; });
  const sP = slider('pH', { min: 1, max: 13, step: 0.1, value: S.pH }, (v) => { S.pH = v; });
  const rate = () => { const t = S.T <= 37 ? Math.exp(-((S.T - 37) ** 2) / 300) : Math.exp(-((S.T - 37) ** 2) / 60); const p = Math.exp(-((S.pH - 7.4) ** 2) / 2.5); return t * p; };
  const G = goals([{ text: 'اجعل الإنزيم يعمل بأقصى سرعة (أكبر من 95%)', test: (st) => st.v > 0.95 }, { text: 'سخّن فوق 60°C ولاحظ تلف الإنزيم', test: (st) => st.T > 60 }, { text: 'أوقف عمل الإنزيم بوسط حامضي قوي (pH < 3)', test: (st) => st.pH < 3 }]);
  f.ctrl.append(sT.el, sP.el, R.el, G.el);
  let ph = 0;
  const stop = loop((dt) => {
    const v = rate(); S.v = v; ph += dt * (0.5 + v * 4);
    const dead = S.T > 60;
    const n = 10; let parts = '';
    for (let i = 0; i < n; i++) { const a = ph + i * (Math.PI * 2 / n); const r = 70 + 30 * Math.sin(a * 2); parts += `<circle cx="${180 + Math.cos(a) * r}" cy="${130 + Math.sin(a) * r * 0.6}" r="6" fill="${(Math.floor(ph * v + i) % 2) ? '#a78bfa' : '#fbbf24'}"/>`; }
    g.innerHTML = `<path d="M150,110 q30,-40 60,0 l-10,15 h-40 z" fill="${dead ? '#64748b' : '#22d3ee'}" stroke="#e0f2fe" stroke-width="2"/>${parts}
      <text x="180" y="240" fill="#cbd5e1" font-size="13" text-anchor="middle">${dead ? 'الإنزيم تلف (فقد شكله)' : 'الإنزيم يحوّل المادة الأساس (أصفر) إلى ناتج (بنفسجي)'}</text>
      <g transform="translate(360,30)"><rect width="250" height="26" rx="13" fill="#1e293b"/><rect width="${250 * v}" height="26" rx="13" fill="${v > 0.7 ? '#22c55e' : v > 0.3 ? '#fbbf24' : '#ef4444'}"/><text x="125" y="18" fill="#0b1120" font-size="14" text-anchor="middle" font-weight="900">${Math.round(v * 100)}%</text>
      <text y="70" fill="#e2e8f0" font-size="14">أنسب درجة حرارة: قرب 37°C</text><text y="96" fill="#e2e8f0" font-size="14">أنسب pH لهذا الإنزيم: قرب 7.4</text></g>`;
    R.set('v', Math.round(v * 100), '\\%'); R.set('st', dead ? '\\text{تالف}' : v > 0.7 ? '\\text{نشط}' : '\\text{بطيء}');
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  });
  return { destroy: stop };
}

/* ===== 4) التصبن ===== */
export function soap(mount, { onGoal } = {}) {
  const f = frame('صناعة الصابون (التصبن)', 'اغلِ الدهن مع قاعدة قوية: يتحلل الدهن (ثلاثي الكليسيريد) إلى كليسرول وأملاح الحوامض الدهنية، وهي الصابون.');
  mount.appendChild(f.root);
  const S = { base: 'NaOH', heat: 0, made: new Set() };
  const box = document.createElement('div'); box.className = 'orgmap'; f.stage.appendChild(box);
  const seg = toggle([['NaOH', 'NaOH (صابون صلب)'], ['KOH', 'KOH (صابون سائل)']], 'NaOH', (v) => { S.base = v; S.heat = 0; draw(); });
  const G = goals([{ text: 'اصنع صابونًا صلبًا', test: (st) => st.made.has('NaOH') }, { text: 'اصنع صابونًا سائلًا', test: (st) => st.made.has('KOH') }]);
  f.ctrl.append(seg, row(button('🔥 سخّن', () => { S.heat = Math.min(3, S.heat + 1); sfx.zap(); if (S.heat === 3) { S.made.add(S.base); sfx.unlock2(); } draw(); })), note('نوع الصابون يعتمد على نوع القاعدة ونوع الزيت أو الدهن المستعمل.'), G.el);
  function draw() {
    const M = S.base === 'NaOH' ? 'Na' : 'K';
    box.innerHTML = `<div class="om-cur"><small>دهن (ثلاثي الكليسيريد) + ${S.base}</small><div dir="ltr">${tex(`\\ce{(C17H35COO)3C3H5 + 3${S.base}}`)}</div><div class="heatbar">${'🔥'.repeat(S.heat)}${'▫️'.repeat(3 - S.heat)}</div></div>
      ${S.heat === 3 ? `<div class="om-eq"><small>${S.base === 'NaOH' ? 'صابون صلب' : 'صابون سائل'} + كليسرول</small><div dir="ltr">${tex(`\\ce{-> 3C17H35COO${M} + C3H5(OH)3}`)}</div></div>` : ''}`;
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

export const SIMS = { biotests, peptide, enzyme, soap };

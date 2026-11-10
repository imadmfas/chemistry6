// تجارب الفصل السادس: طرائق التحليل الكيميائي
import { slider, toggle, readouts, svg, el, frame, goals, loop, button, row, note, clamp, phColor } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks, toast } from '../js/fx.js';

/* ===== 1) فصل الأيونات الموجبة إلى مجاميع ===== */
const IONS = {
  'Ag+': [1, 'AgCl', '#f8fafc'], 'Pb2+': [1, 'PbCl2', '#f1f5f9'], 'Hg22+': [1, 'Hg2Cl2', '#e5e7eb'],
  'Cu2+': [2, 'CuS', '#111827'], 'Cd2+': [2, 'CdS', '#facc15'], 'Hg2+': [2, 'HgS', '#0f172a'], 'Bi3+': [2, 'Bi2S3', '#78350f'],
  'Fe3+': [3, 'Fe(OH)3', '#9a3412'], 'Al3+': [3, 'Al(OH)3', '#f8fafc'], 'Cr3+': [3, 'Cr(OH)3', '#15803d'],
  'Ni2+': [4, 'NiS', '#111827'], 'Zn2+': [4, 'ZnS', '#f8fafc'], 'Mn2+': [4, 'MnS', '#fbcfe8'], 'Co2+': [4, 'CoS', '#111827'],
  'Ca2+': [5, 'CaCO3', '#f8fafc'], 'Ba2+': [5, 'BaCO3', '#f8fafc'], 'Sr2+': [5, 'SrCO3', '#f8fafc'],
  'Na+': [6, null], 'K+': [6, null], 'Mg2+': [6, null],
};
const REAG = [
  [1, 'حامض HCl المخفف', 'المجموعة I'], [2, 'H₂S بوجود HCl المخفف', 'المجموعة II'], [3, 'NH₄OH مع NH₄Cl', 'المجموعة III A'],
  [4, 'H₂S بوجود NH₄OH و NH₄Cl', 'المجموعة III B'], [5, '(NH₄)₂CO₃ بوجود NH₄OH و NH₄Cl', 'المجموعة IV'],
];
const pretty = (k) => k.replace('22+', '₂²⁺').replace('2+', '²⁺').replace('3+', '³⁺').replace('+', '⁺');
export function cations(mount, { onGoal } = {}) {
  const f = frame('مختبر التحليل النوعي: فصل الأيونات الموجبة', 'اختر الأيونات في النموذج، ثم أضف العوامل المرسبة بالترتيب الصحيح. بعد كل ترسيب رشّح الراسب فيبقى الراشح للمجموعة التالية.');
  mount.appendChild(f.root);
  const S = { sel: new Set(['Ag+', 'Cd2+', 'Fe3+']), step: 0, ppt: [], left: [], done: [], wrong: 0 };
  const W = 640, H = 270, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const pick = document.createElement('div'); pick.className = 'cxpick';
  pick.innerHTML = Object.keys(IONS).map((k) => `<button type="button" data-k="${k}" dir="ltr">${pretty(k)}</button>`).join('');
  pick.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; sfx.tap(); S.sel.has(b.dataset.k) ? S.sel.delete(b.dataset.k) : S.sel.add(b.dataset.k); reset(); };
  const rb = document.createElement('div'); rb.className = 'ctrl-row';
  REAG.forEach(([n, name]) => { const b = button(`🧪 ${name}`, () => add(n)); rb.appendChild(b); });
  const log = document.createElement('div'); log.className = 'sim-log';
  const G = goals([
    { text: 'افصل أيونات الفضة عن الكادميوم (سؤال وزاري متكرر)', test: (st) => st.sepAgCd },
    { text: 'أكمل التحليل كله بالترتيب الصحيح دون خطأ', test: (st) => st.step >= 5 && st.wrong === 0 && st.sel.size >= 3 },
    { text: 'رسّب كبريتيد الكادميوم الأصفر', test: (st) => st.ppt.includes('Cd2+') },
  ]);
  f.ctrl.append(note('<b>أيونات النموذج:</b>'), pick, note('<b>العوامل المرسبة:</b>'), rb, row(button('↺ نموذج جديد', reset)), log, G.el);
  function reset() { S.step = 0; S.ppt = []; S.left = [...S.sel]; S.done = []; S.wrong = 0; S.sepAgCd = false; log.innerHTML = ''; draw(); }
  function add(n) {
    if (n !== S.step + 1) { S.wrong++; sfx.wrong(); toast(`الترتيب مهم: العامل المرسب التالي هو عامل ${REAG[S.step] ? REAG[S.step][2] : 'المجاميع'}. لو أضفت هذا الكاشف الآن لترسبت أيونات مجاميع سابقة معه.`, { icon: '⚠️', ms: 4500 }); return; }
    const pp = S.left.filter((k) => IONS[k][0] === n);
    S.left = S.left.filter((k) => IONS[k][0] !== n); S.ppt = pp; S.step = n; S.done.push([n, pp]);
    pp.length ? sfx.pop() : sfx.tap();
    log.insertAdjacentHTML('beforeend', `<div>${REAG[n - 1][2]}: ${pp.length ? `ترسّب ${pp.map((k) => `<b dir="ltr">${IONS[k][1].replace(/(\d)/g, '<sub>$1</sub>')}</b>`).join('، ')}` : 'لم يتكون راسب'}، ثم رُشّح.</div>`);
    if (S.sel.has('Ag+') && S.sel.has('Cd2+') && n >= 1 && S.done.some(([m, p]) => m === 1 && p.includes('Ag+')) && S.left.includes('Cd2+') ) S.sepAgCd = true;
    if (n === 5) log.insertAdjacentHTML('beforeend', `<div>يبقى في الراشح النهائي (المجموعة V): ${S.left.length ? S.left.map((k) => `<b dir="ltr">${pretty(k)}</b>`).join('، ') : 'لا شيء'}</div>`);
    draw();
  }
  function draw() {
    const liquid = S.left.length ? 'rgba(56,189,248,.28)' : 'rgba(148,163,184,.15)';
    const flakes = S.ppt.map((k, j) => Array.from({ length: 14 }, (_, i) => `<ellipse cx="${115 + ((i * 29 + j * 11) % 110)}" cy="${226 - (i % 4) * 4 - j * 6}" rx="6" ry="3" fill="${IONS[k][2]}" stroke="#0003"/>`).join('')).join('');
    g.innerHTML = `<path d="M100,40 v180 q0,14 14,14 h102 q14,0 14,-14 v-180" fill="none" stroke="#cbd5e1" stroke-width="3"/><path d="M103,90 v130 q0,11 11,11 h102 q11,0 11,-11 v-130 z" fill="${liquid}"/>${flakes}
      <text x="170" y="262" fill="#cbd5e1" font-size="13" text-anchor="middle">${S.step ? `بعد ${REAG[S.step - 1][2]}` : 'النموذج الأصلي'}</text>
      <g transform="translate(290,30)"><text fill="#e2e8f0" font-size="15" font-weight="800">الأيونات المتبقية في المحلول:</text>
      ${S.left.map((k, i) => `<g transform="translate(${(i % 5) * 64},${20 + Math.floor(i / 5) * 40})"><rect width="58" height="30" rx="15" fill="#1e293b" stroke="#38bdf8"/><text x="29" y="20" fill="#e0f2fe" font-size="14" text-anchor="middle" direction="ltr">${pretty(k)}</text></g>`).join('')}
      <text y="${30 + Math.ceil(Math.max(1, S.left.length) / 5) * 40 + 20}" fill="#fde68a" font-size="14">${S.step < 5 ? `العامل التالي: ${REAG[S.step][1]}` : 'انتهى التحليل ✓'}</text></g>`;
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  reset();
  return { destroy() {} };
}

/* ===== 2) التسحيح: حامض مع قاعدة ===== */
export function titration(mount, { onGoal } = {}) {
  const f = frame('مختبر التسحيح', 'أضف محلول NaOH القياسي من السحاحة إلى الحامض في الدورق مع دليل الفينولفثالين. نقطة النهاية عند ظهور اللون الوردي الخفيف، ومنها تحسب تركيز الحامض.');
  mount.appendChild(f.root);
  const S = { acid: 'HCl', Ca: 0.1 + Math.round(Math.random() * 10) / 100, Va: 25, Cb: 0.1, Vb: 0, run: 0, hist: [] };
  const W = 640, H = 300, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['Vb', 'حجم القاعدة المضاف'], ['pH', 'pH'], ['eq', 'نقطة التكافؤ المتوقعة'], ['Ca', 'تركيز الحامض المحسوب']]);
  const seg = toggle([['HCl', 'حامض قوي HCl'], ['AcOH', 'حامض ضعيف CH₃COOH']], 'HCl', (v) => { S.acid = v; reset(); });
  function pH(Vb) {
    const na = S.Ca * S.Va / 1000, nb = S.Cb * Vb / 1000, V = (S.Va + Vb) / 1000;
    if (S.acid === 'HCl') { if (nb < na - 1e-12) return -Math.log10((na - nb) / V); if (nb > na + 1e-12) return 14 + Math.log10((nb - na) / V); return 7; }
    const Ka = 1.8e-5;
    if (nb === 0) return -Math.log10(Math.sqrt(Ka * na / V));
    if (nb < na - 1e-12) return -Math.log10(Ka) + Math.log10(nb / (na - nb));
    if (nb > na + 1e-12) return 14 + Math.log10((nb - na) / V);
    return 14 + Math.log10(Math.sqrt((1e-14 / Ka) * na / V));
  }
  let dropping = false;
  const bD = button('💧 قطرة', () => { S.Vb += 0.1; sfx.pop(); draw(); }), bS = button('▶ تنقيط مستمر', () => { dropping = !dropping; bS.innerHTML = dropping ? '⏸ أوقف' : '▶ تنقيط مستمر'; });
  const G = goals([
    { text: 'أوقف التسحيح عند أول لون وردي ثابت (نقطة النهاية)', test: (st) => st.end && st.Vb <= st.eqV + 0.3 },
    { text: 'احسب تركيز الحامض: قارن جوابك بالقيمة المحسوبة أسفل', test: (st) => st.end },
    { text: 'سحّح الحامض الضعيف ولاحظ أن pH نقطة التكافؤ أكبر من 7', test: (st) => st.acid === 'AcOH' && st.Vb > st.eqV },
  ]);
  f.ctrl.append(seg, row(bD, bS, button('↺ دورق جديد', () => { S.Ca = 0.05 + Math.round(Math.random() * 15) / 100; reset(); })), note('عند نقطة التكافؤ: $M_{a} × V_{a} = M_{b} × V_{b}$ (لحامض أحادي البروتون وقاعدة أحادية الهيدروكسيد)'), R.el, G.el);
  function reset() { S.Vb = 0; S.hist = []; dropping = false; bS.innerHTML = '▶ تنقيط مستمر'; S.end = false; draw(); }
  function draw() {
    const p = pH(S.Vb); S.eqV = S.Ca * S.Va / S.Cb; S.pH = p;
    if (!S.hist.length || S.hist[S.hist.length - 1][0] !== S.Vb) S.hist.push([S.Vb, p]);
    const pink = p >= 8.2, col = pink ? `rgba(244,114,182,${clamp((p - 8.2) / 3, 0.25, 0.85)})` : 'rgba(255,255,255,.12)';
    if (pink && !S.end) { S.end = true; sfx.correct(); dropping = false; bS.innerHTML = '▶ تنقيط مستمر'; }
    const lvl = 40 + (S.Vb / 50) * 150;
    const X = (v) => 360 + v / 50 * 260, Y = (q) => 270 - q / 14 * 240;
    g.innerHTML = `<rect x="140" y="20" width="18" height="190" rx="3" fill="rgba(255,255,255,.04)" stroke="#cbd5e1" stroke-width="2"/><rect x="142" y="${lvl}" width="14" height="${208 - lvl}" fill="rgba(56,189,248,.45)"/>
      ${[0, 10, 20, 30, 40, 50].map((v) => `<line x1="158" x2="166" y1="${40 + v / 50 * 150}" y2="${40 + v / 50 * 150}" stroke="#94a3b8"/><text x="170" y="${44 + v / 50 * 150}" fill="#94a3b8" font-size="10">${v}</text>`).join('')}
      <path d="M144,210 l5,14 l5,-14" fill="#cbd5e1"/>
      <path d="M110,240 l20,-12 h40 l20,12 l12,40 h-104 z" fill="${col}" stroke="#cbd5e1" stroke-width="2.5"/><text x="150" y="296" fill="#cbd5e1" font-size="12" text-anchor="middle">${S.Va} mL ${S.acid === 'HCl' ? 'HCl' : 'CH₃COOH'}</text>
      <line x1="360" y1="270" x2="620" y2="270" stroke="#94a3b8"/><line x1="360" y1="30" x2="360" y2="270" stroke="#94a3b8"/><text x="620" y="290" fill="#94a3b8" font-size="12" text-anchor="end">V NaOH (mL)</text><text x="364" y="26" fill="#94a3b8" font-size="12">pH</text>
      <line x1="360" y1="${Y(7)}" x2="620" y2="${Y(7)}" stroke="#475569" stroke-dasharray="3 4"/>
      <path d="${S.hist.map(([v, q], i) => `${i ? 'L' : 'M'}${X(v)},${Y(clamp(q, 0, 14))}`).join('')}" stroke="#f472b6" stroke-width="2.5" fill="none"/>
      ${S.end ? `<circle cx="${X(S.Vb)}" cy="${Y(clamp(p, 0, 14))}" r="6" fill="#fbbf24"/>` : ''}`;
    R.set('Vb', +S.Vb.toFixed(1), 'mL'); R.set('pH', +p.toFixed(2)); R.set('eq', S.end ? +S.eqV.toFixed(1) : '?', S.end ? 'mL' : '');
    R.set('Ca', S.end ? +(S.Cb * S.Vb / S.Va).toFixed(3) : '?', S.end ? 'M' : '');
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  let acc = 0;
  const stop = loop((dt) => { if (dropping) { acc += dt; if (acc > 0.12) { acc = 0; S.Vb = +(S.Vb + (Math.abs(S.Vb - S.eqV) < 2 ? 0.1 : 0.5)).toFixed(1); if (S.Vb >= 50) dropping = false; sfx.tick(); draw(); } } });
  reset();
  return { destroy: stop };
}

export const SIMS = { cations, titration };

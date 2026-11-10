// تجارب الفصل الثالث: الاتزان الأيوني
import { slider, toggle, readouts, svg, el, frame, goals, button, row, note, clamp, phColor, beaker } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';

const lg = Math.log10;
const SUBST = {
  hcl: { n: 'HCl', t: 'sa', d: 'حامض قوي' }, hno3: { n: 'HNO₃', t: 'sa', d: 'حامض قوي' },
  ac: { n: 'CH₃COOH', t: 'wa', K: 1.8e-5, d: 'حامض ضعيف' }, hf: { n: 'HF', t: 'wa', K: 7.2e-4, d: 'حامض ضعيف' },
  naoh: { n: 'NaOH', t: 'sb', d: 'قاعدة قوية' }, nh3: { n: 'NH₃', t: 'wb', K: 1.8e-5, d: 'قاعدة ضعيفة' },
  nacl: { n: 'NaCl', t: 'n', d: 'ملح من حامض قوي وقاعدة قوية (لا يتمذوب)' },
  naac: { n: 'CH₃COONa', t: 'sbw', K: 1.8e-5, d: 'ملح من حامض ضعيف وقاعدة قوية (تمذوب قاعدي)' },
  nh4cl: { n: 'NH₄Cl', t: 'sab', K: 1.8e-5, d: 'ملح من حامض قوي وقاعدة ضعيفة (تمذوب حامضي)' },
};
function phOf(k, C) {
  const s = SUBST[k];
  switch (s.t) {
    case 'sa': return -lg(C);
    case 'sb': return 14 + lg(C);
    case 'wa': return -lg(Math.sqrt(s.K * C));
    case 'wb': return 14 + lg(Math.sqrt(s.K * C));
    case 'n': return 7;
    case 'sbw': return 14 + lg(Math.sqrt((1e-14 / s.K) * C)); // Kh = Kw/Ka
    case 'sab': return -lg(Math.sqrt((1e-14 / s.K) * C));
  }
}

/* ===== 1) مقياس pH والكاشف العام ===== */
export function phlab(mount, { onGoal } = {}) {
  const f = frame('مختبر الحوامض والقواعد والأملاح', 'اختر المادة وتركيزها، وراقب قيمة pH ولون الكاشف العام. قارن بين الحامض القوي والضعيف، وبين الأملاح المختلفة.');
  mount.appendChild(f.root);
  const S = { k: 'hcl', C: 0.1, seen: new Set() };
  const W = 640, H = 280, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['pH', 'pH'], ['pOH', 'pOH'], ['H', '[H₃O⁺]'], ['OH', '[OH⁻]']]);
  const seg1 = toggle([['hcl', 'HCl'], ['ac', 'CH₃COOH'], ['hf', 'HF'], ['naoh', 'NaOH'], ['nh3', 'NH₃']], 'hcl', (v) => { S.k = v; draw(); });
  const seg2 = toggle([['nacl', 'NaCl'], ['naac', 'CH₃COONa'], ['nh4cl', 'NH₄Cl']], '', (v) => { S.k = v; draw(); });
  const sC = slider('التركيز', { min: -3, max: 0, step: 0.1, value: -1, fmt: (v) => (10 ** v).toPrecision(2), unit: 'M' }, (v) => { S.C = 10 ** v; draw(); });
  const G = goals([
    { text: 'قارن: HCl و CH₃COOH بالتركيز نفسه 0.1 M (جرّب الاثنين)', test: (st) => st.seen.has('hcl@0.1') && st.seen.has('ac@0.1') },
    { text: 'اعثر على ملح محلوله قاعدي', test: (st) => st.k === 'naac' },
    { text: 'اعثر على ملح محلوله حامضي', test: (st) => st.k === 'nh4cl' },
    { text: 'اجعل pH أكبر من 12', test: (st) => st.pH > 12 },
  ]);
  f.ctrl.append(note('<b>حوامض وقواعد:</b>'), seg1, note('<b>أملاح:</b>'), seg2, sC.el, R.el, G.el);
  function draw() {
    const pH = phOf(S.k, S.C), sb = SUBST[S.k];
    S.pH = pH; S.seen.add(`${S.k}@${Math.abs(S.C - 0.1) < 0.01 ? '0.1' : 'x'}`);
    const col = phColor(pH);
    g.innerHTML = beaker(60, 60, 170, 190, 0.7, col, `${sb.n} · ${S.C.toPrecision(2)} M`) +
      `<text x="145" y="40" fill="#cbd5e1" font-size="14" text-anchor="middle">${sb.d}</text>
      <g transform="translate(280,40)"><rect width="120" height="80" rx="12" fill="#111827" stroke="#64748b" stroke-width="2"/><text x="60" y="30" fill="#94a3b8" font-size="13" text-anchor="middle">جهاز pH</text><text x="60" y="65" fill="#22d3ee" font-size="30" font-weight="900" text-anchor="middle" font-family="monospace">${pH.toFixed(2)}</text>
      <line x1="60" y1="80" x2="-80" y2="140" stroke="#94a3b8" stroke-width="3"/></g>
      <g transform="translate(300,170)">${Array.from({ length: 15 }, (_, i) => `<rect x="${i * 21}" y="0" width="21" height="28" fill="${phColor(i)}"/><text x="${i * 21 + 10}" y="46" fill="#94a3b8" font-size="11" text-anchor="middle">${i}</text>`).join('')}
      <polygon points="${clamp(pH, 0, 14) * 21 + 10},-4 ${clamp(pH, 0, 14) * 21 + 2},-16 ${clamp(pH, 0, 14) * 21 + 18},-16" fill="#fff"/>
      <text x="0" y="74" fill="#fca5a5" font-size="13">حامضي</text><text x="157" y="74" fill="#86efac" font-size="13" text-anchor="middle">متعادل</text><text x="315" y="74" fill="#93c5fd" font-size="13" text-anchor="end">قاعدي</text></g>`;
    R.set('pH', +pH.toFixed(2)); R.set('pOH', +(14 - pH).toFixed(2)); R.set('H', 10 ** -pH, 'M'); R.set('OH', 10 ** -(14 - pH), 'M');
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 2) المحلول المنظم (بفر) ===== */
export function buffer(mount, { onGoal } = {}) {
  const f = frame('اختبار المحلول المنظم', 'أضف قطرات من حامض قوي أو قاعدة قوية إلى كأسين: ماء نقي، ومحلول منظم من CH₃COOH و CH₃COONa. لاحظ الفرق في تغير pH.');
  mount.appendChild(f.root);
  const Ka = 1.8e-5, V = 1; // لتر
  const S = { ca: 0.1, cs: 0.1, add: 0 }; // add بالمول: موجب قاعدة، سالب حامض
  const W = 640, H = 280, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['pw', 'pH الماء'], ['pb', 'pH المحلول المنظم'], ['dw', 'ΔpH الماء'], ['db', 'ΔpH المنظم']]);
  const sa = slider('تركيز الحامض الضعيف', { min: 0.05, max: 1, step: 0.05, value: S.ca, unit: 'M' }, (v) => { S.ca = v; draw(); });
  const ss = slider('تركيز الملح', { min: 0.05, max: 1, step: 0.05, value: S.cs, unit: 'M' }, (v) => { S.cs = v; draw(); });
  const G = goals([
    { text: 'أضف 0.01 mol من HCl إلى الكأسين وقارن', test: (st) => st.add <= -0.01 },
    { text: 'أضف قاعدة حتى يرتفع pH الماء فوق 12 بينما يبقى المنظم قريبًا من 5', test: (st) => st.pw > 12 && st.pb < 5.5 },
    { text: 'اجعل pH المنظم الابتدائي أكبر من pKa (زد تركيز الملح)', test: (st) => st.add === 0 && st.cs > st.ca },
  ]);
  f.ctrl.append(sa.el, ss.el, row(button('💧 أضف 0.005 mol HCl', () => { S.add -= 0.005; sfx.pop(); draw(); }), button('💧 أضف 0.005 mol NaOH', () => { S.add += 0.005; sfx.pop(); draw(); }), button('↺ ابدأ من جديد', () => { S.add = 0; draw(); })),
    note('$pH = pK_{a} + \\log\\frac{[\\text{ملح}]}{[\\text{حامض}]}$'), R.el, G.el);
  function phWater(a) { if (Math.abs(a) < 1e-9) return 7; return a > 0 ? 14 + lg(a / V) : -lg(-a / V); }
  function phBuf(a) {
    const acid = S.ca * V - a, salt = S.cs * V + a;
    if (acid <= 0) return 14 + lg((-acid) / V + 1e-7); if (salt <= 0) return -lg((-salt) / V + Math.sqrt(Ka * S.ca));
    return -lg(Ka) + lg(salt / acid);
  }
  function draw() {
    const pw = phWater(S.add), pb = phBuf(S.add), pw0 = 7, pb0 = phBuf(0);
    S.pw = pw; S.pb = pb;
    g.innerHTML = beaker(70, 50, 180, 180, 0.7, phColor(pw), 'ماء نقي') + beaker(380, 50, 180, 180, 0.7, phColor(pb), 'محلول منظم') +
      `<text x="160" y="40" fill="#fde68a" font-size="22" text-anchor="middle" font-weight="900">pH ${pw.toFixed(2)}</text><text x="470" y="40" fill="#fde68a" font-size="22" text-anchor="middle" font-weight="900">pH ${pb.toFixed(2)}</text>
      <text x="320" y="140" fill="#94a3b8" font-size="13" text-anchor="middle">المضاف: ${S.add === 0 ? 'لا شيء' : `${Math.abs(S.add).toFixed(3)} mol ${S.add > 0 ? 'NaOH' : 'HCl'}`}</text>`;
    R.set('pw', +pw.toFixed(2)); R.set('pb', +pb.toFixed(2)); R.set('dw', +(pw - pw0).toFixed(2)); R.set('db', +(pb - pb0).toFixed(3));
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 3) الذوبانية وثابت حاصل الذوبان ===== */
export function ksp(mount, { onGoal } = {}) {
  const f = frame('متى يتكوّن الراسب؟', 'اخلط محلولين: AgNO₃ و NaCl. يتكون راسب AgCl عندما يصبح الحاصل الأيوني Q أكبر من K_sp = 1.8 × 10⁻¹⁰.');
  mount.appendChild(f.root);
  const Ksp = 1.8e-10, S = { ag: -6, cl: -6 };
  const W = 640, H = 260, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['ag', '[Ag⁺]'], ['cl', '[Cl⁻]'], ['Q', 'Q = [Ag⁺][Cl⁻]'], ['st', 'النتيجة']]);
  const s1 = slider('[Ag⁺] بعد الخلط', { min: -8, max: -1, step: 0.1, value: S.ag, fmt: (v) => (10 ** v).toExponential(1), unit: 'M' }, (v) => { S.ag = v; draw(); });
  const s2 = slider('[Cl⁻] بعد الخلط', { min: -8, max: -1, step: 0.1, value: S.cl, fmt: (v) => (10 ** v).toExponential(1), unit: 'M' }, (v) => { S.cl = v; draw(); });
  const G = goals([{ text: 'كوّن راسبًا من AgCl', test: (st) => st.Q > Ksp * 1.05 }, { text: 'اجعل المحلول مشبعًا تمامًا (Q ≈ K_sp)', test: (st) => Math.abs(lg(st.Q / Ksp)) < 0.06 }, { text: 'تأثير الأيون المشترك: [Cl⁻] = 0.1 M وأقل [Ag⁺] يكوّن راسبًا', test: (st) => st.cl > -1.05 && st.Q > Ksp && st.ag <= -7.9 }]);
  f.ctrl.append(s1.el, s2.el, R.el, G.el);
  function draw() {
    const a = 10 ** S.ag, c = 10 ** S.cl, Q = a * c, pr = Q > Ksp * 1.05, sat = !pr && Q > Ksp * 0.95;
    S.Q = Q;
    const amount = pr ? clamp((lg(Q / Ksp)) / 8, 0.05, 1) : 0;
    const flakes = Array.from({ length: Math.round(amount * 60) }, (_, i) => `<ellipse cx="${110 + (i * 37) % 150}" cy="${222 - (i % 6) * 3 - ((i * 7) % 4)}" rx="5" ry="2.5" fill="#f8fafc" opacity=".9"/>`).join('');
    g.innerHTML = beaker(90, 50, 190, 190, 0.75, pr ? 'rgba(226,232,240,.55)' : 'rgba(56,189,248,.3)', '') + flakes +
      `<g transform="translate(330,50)"><text fill="#e2e8f0" font-size="15" font-weight="800">AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)</text>
      <text y="40" fill="#cbd5e1" font-size="14" direction="ltr">Q = ${Q.toExponential(2)}</text><text y="64" fill="#cbd5e1" font-size="14" direction="ltr">Ksp = 1.8e-10</text>
      <text y="110" fill="${pr ? '#fca5a5' : sat ? '#fde68a' : '#86efac'}" font-size="20" font-weight="900">${pr ? 'Q > Ksp : يتكوّن راسب' : sat ? 'Q = Ksp : محلول مشبع' : 'Q < Ksp : لا راسب (غير مشبع)'}</text></g>`;
    R.set('ag', a, 'M'); R.set('cl', c, 'M'); R.set('Q', Q); R.set('st', pr ? '\\text{راسب}' : sat ? '\\text{مشبع}' : '\\text{غير مشبع}');
    if (pr && !S.wasPr) sfx.pop(); S.wasPr = pr;
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

export const SIMS = { phlab, buffer, ksp };

// تجارب الفصل الثاني: الاتزان الكيميائي
import { slider, toggle, readouts, svg, el, frame, goals, loop, button, row, note, clamp } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';

/* ===== 1) الوصول إلى حالة الاتزان: A ⇌ B بالجسيمات ومنحني التراكيز ===== */
export function equil(mount, { onGoal } = {}) {
  const f = frame('سباق الاتزان: A ⇌ B', 'جزيئات A (حمراء) تتحول إلى B (زرقاء) وبالعكس. راقب كيف يتساوى معدلا التفاعلين الأمامي والخلفي فتثبت التراكيز: هذه حالة الاتزان الديناميكي.');
  mount.appendChild(f.root);
  const W = 640, H = 300, s = svg(W, H); f.stage.appendChild(s);
  el('rect', { x: 10, y: 20, width: 280, height: 260, rx: 14, fill: '#0b1220', stroke: '#475569', 'stroke-width': 2 }, s);
  const gP = el('g', {}, s), gG = el('g', {}, s);
  const S = { kf: 0.6, kb: 0.3, start: 'A', t: 0, hist: [] };
  const N = 60; let P = [];
  function reset() {
    P = Array.from({ length: N }, () => ({ x: 25 + Math.random() * 250, y: 35 + Math.random() * 230, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, b: S.start === 'B' }));
    S.t = 0; S.hist = []; S.flat = 0; sfx.whoosh(1);
  }
  const R = readouts([['A', '[A] (عدد الجزيئات)'], ['B', '[B]'], ['K', 'K = [B]/[A]'], ['th', 'K النظري = k_f/k_b']]);
  const s1 = slider('سرعة التفاعل الأمامي k_f', { min: 0.1, max: 1.5, step: 0.05, value: S.kf }, (v) => { S.kf = v; });
  const s2 = slider('سرعة التفاعل الخلفي k_b', { min: 0.1, max: 1.5, step: 0.05, value: S.kb }, (v) => { S.kb = v; });
  const seg = toggle([['A', 'ابدأ بـ A فقط'], ['B', 'ابدأ بـ B فقط']], 'A', (v) => { S.start = v; reset(); });
  const G = goals([
    { text: 'انتظر حتى يصل التفاعل إلى الاتزان (ثبات التراكيز)', test: (st) => st.eq },
    { text: 'ابدأ من B فقط ولاحظ الوصول إلى نسبة الاتزان نفسها', test: (st) => st.eq && st.start === 'B' },
    { text: 'اجعل K أكبر من 3 (الاتزان يميل نحو النواتج)', test: (st) => st.eq && st.K > 3 },
  ]);
  f.ctrl.append(seg, s1.el, s2.el, row(button('↺ أعد التجربة', reset)), note('عند الاتزان لا يتوقف التفاعل؛ يتساوى معدل التفاعل الأمامي مع معدل التفاعل الخلفي.'), R.el, G.el);
  reset();
  let acc = 0;
  const stop = loop((dt) => {
    S.t += dt; acc += dt;
    P.forEach((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 22 || p.x > 278) p.vx *= -1; if (p.y < 32 || p.y > 268) p.vy *= -1;
      p.x = clamp(p.x, 22, 278); p.y = clamp(p.y, 32, 268);
      if (Math.random() < (p.b ? S.kb : S.kf) * dt * 0.6) { p.b = !p.b; }
    });
    gP.innerHTML = P.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${p.b ? '#60a5fa' : '#f87171'}"/>`).join('');
    if (acc > 0.25) {
      acc = 0; const nB = P.filter((p) => p.b).length; S.hist.push(nB); if (S.hist.length > 120) S.hist.shift();
      const last = S.hist.slice(-16), avg = last.reduce((a, b) => a + b, 0) / last.length;
      S.eq = S.hist.length > 30 && Math.abs(avg - N * S.kf / (S.kf + S.kb)) < 6;
      const nA = N - nB; S.K = nB / Math.max(1, nA);
      R.set('A', nA); R.set('B', nB); R.set('K', avg / Math.max(1, N - avg)); R.set('th', S.kf / S.kb);
      const X = (i) => 320 + i * 2.6, Y = (n) => 270 - n / N * 240;
      const pathB = S.hist.map((n, i) => `${i ? 'L' : 'M'}${X(i)},${Y(n)}`).join(''), pathA = S.hist.map((n, i) => `${i ? 'L' : 'M'}${X(i)},${Y(N - n)}`).join('');
      gG.innerHTML = `<line x1="320" y1="270" x2="630" y2="270" stroke="#94a3b8"/><line x1="320" y1="30" x2="320" y2="270" stroke="#94a3b8"/><text x="630" y="290" fill="#94a3b8" font-size="12" text-anchor="end">الزمن</text><text x="326" y="26" fill="#94a3b8" font-size="12">التركيز</text>
        <path d="${pathA}" stroke="#f87171" stroke-width="2.5" fill="none"/><path d="${pathB}" stroke="#60a5fa" stroke-width="2.5" fill="none"/>
        ${S.eq ? '<text x="480" y="50" fill="#86efac" font-size="15" text-anchor="middle" font-weight="800">⚖️ حالة اتزان</text>' : ''}<text x="600" y="${Y(N - nB) - 6}" fill="#f87171" font-size="13">[A]</text><text x="600" y="${Y(nB) - 6}" fill="#60a5fa" font-size="13">[B]</text>`;
      G.check({ ...S }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
    }
  });
  return { destroy: stop };
}

/* ===== 2) حاصل التفاعل Q مقابل ثابت الاتزان K ===== */
export function qk(mount, { onGoal } = {}) {
  const f = frame('بوصلة التفاعل: Q مقابل K', 'للتفاعل H₂(g) + I₂(g) ⇌ 2HI(g) ثابت اتزان K_c = 49. غيّر التراكيز الابتدائية وتنبأ باتجاه سير التفاعل.');
  mount.appendChild(f.root);
  const K = 49, S = { h: 0.2, i: 0.2, hi: 0.5 };
  const W = 640, H = 200, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['Q', 'حاصل التفاعل Q'], ['K', 'ثابت الاتزان K_c'], ['d', 'اتجاه التفاعل']]);
  const sl = [['h', '[H₂]'], ['i', '[I₂]'], ['hi', '[HI]']].map(([k, l]) => slider(l, { min: 0.05, max: 2, step: 0.05, value: S[k], fmt: (v) => v.toFixed(2), unit: 'M' }, (v) => { S[k] = v; draw(); }));
  const G = goals([{ text: 'اجعل Q أصغر من K: يتجه التفاعل نحو النواتج', test: (st) => st.Q < K * 0.95 }, { text: 'اجعل Q أكبر من K: يتجه التفاعل نحو المتفاعلات', test: (st) => st.Q > K * 1.05 }, { text: 'اجعل Q ≈ K: التفاعل في حالة اتزان', test: (st) => Math.abs(st.Q - K) / K < 0.06 }]);
  f.ctrl.append(...sl.map((x) => x.el), note('$Q = \\frac{[\\ce{HI}]^{2}}{[\\ce{H2}][\\ce{I2}]}$ يُحسب بالتراكيز الابتدائية، وK بتراكيز الاتزان.'), R.el, G.el);
  function draw() {
    const Q = S.hi ** 2 / (S.h * S.i), lq = Math.log10(Q), lk = Math.log10(K);
    const X = (l) => 320 + clamp(l - lk, -3, 3) * 90;
    const dir = Q < K * 0.95 ? 1 : Q > K * 1.05 ? -1 : 0;
    g.innerHTML = `<line x1="50" y1="100" x2="590" y2="100" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
      <circle cx="320" cy="100" r="12" fill="#a78bfa"/><text x="320" y="70" fill="#c4b5fd" font-size="15" text-anchor="middle" font-weight="800">K = 49</text>
      <circle cx="${X(lq)}" cy="100" r="14" fill="#fbbf24" stroke="#fff" stroke-width="2"/><text x="${X(lq)}" y="140" fill="#fde68a" font-size="15" text-anchor="middle" font-weight="800" direction="ltr">Q = ${Q.toFixed(1)}</text>
      <text x="60" y="180" fill="#94a3b8" font-size="13">Q &lt; K</text><text x="580" y="180" fill="#94a3b8" font-size="13" text-anchor="end">Q &gt; K</text>
      ${dir ? `<text x="320" y="35" fill="${dir > 0 ? '#86efac' : '#fca5a5'}" font-size="18" text-anchor="middle" font-weight="800">${dir > 0 ? 'التفاعل يسير نحو اليمين ← تكوين HI' : 'التفاعل يسير نحو اليسار ← تفكك HI'}</text>` : '<text x="320" y="35" fill="#86efac" font-size="18" text-anchor="middle" font-weight="800">⚖️ التفاعل في حالة اتزان</text>'}`;
    R.set('Q', Q); R.set('K', K); R.set('d', dir > 0 ? '\\text{نحو النواتج}' : dir < 0 ? '\\text{نحو المتفاعلات}' : '\\text{اتزان}');
    G.check({ Q }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 3) قاعدة لو شاتليه: تحضير الأمونيا ===== */
export function lechat(mount, { onGoal } = {}) {
  const f = frame('مختبر لو شاتليه: تحضير الأمونيا', 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + حرارة. أضف مادة أو اسحبها، أو غيّر الضغط ودرجة الحرارة، وراقب انزياح الاتزان.');
  mount.appendChild(f.root);
  const W = 640, H = 290, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  // نموذج اتزان مبسّط: Kc(T) = Kc0·exp(ΔH/R (1/T − 1/T0)) مع ΔH = −92 kJ
  const S = { n: 1, h: 3, a: 0.4, V: 10, T: 500, shift: 0, msg: '' };
  const Kc = () => 6 * Math.exp((92000 / 8.314) * (1 / S.T - 1 / 500));
  function relax() { // نحل لإيجاد x بحيث تتحقق Kc
    const K = Kc(), V = S.V; let lo = -Math.min(S.n, S.h / 3) + 1e-9, hi = S.a / 2 - 1e-9;
    const Qf = (x) => ((S.a - 2 * x) / V) ** 2 / (((S.n + x) / V) * ((S.h + 3 * x) / V) ** 3);
    // x موجب يعني تفكك NH3 (انزياح لليسار)
    lo = -Math.min(S.n, S.h / 3) * 0.999; hi = S.a / 2 * 0.999;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (Qf(m) > K) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  let anim = null;
  function disturb(fn, msg) { fn(); const x = relax(); const from = { n: S.n, h: S.h, a: S.a }, to = { n: S.n + x, h: S.h + 3 * x, a: S.a - 2 * x }; S.shift = x < -1e-4 ? 1 : x > 1e-4 ? -1 : 0; S.msg = msg; anim = { from, to, t: 0 }; sfx.whoosh(S.shift || 1); }
  const R = readouts([['n', 'N₂ (mol)'], ['h', 'H₂ (mol)'], ['a', 'NH₃ (mol)'], ['K', 'K_c عند الدرجة الحالية']]);
  const b = (l, fn, msg) => button(l, () => disturb(fn, msg));
  const sT = slider('درجة الحرارة', { min: 300, max: 800, step: 10, value: S.T, unit: 'K' }, (v) => { disturb(() => { S.T = v; }, v > 500 ? 'رفع الحرارة يفضّل التفاعل الماص (الخلفي)، فتقل K' : 'خفض الحرارة يفضّل التفاعل الباعث (الأمامي)، فتزداد K'); });
  const G = goals([
    { text: 'أضف N₂ وراقب انزياح الاتزان نحو اليمين', test: (st) => st.last === 'addN' && st.shift === 1 },
    { text: 'قلّل الحجم (زد الضغط) فيزداد NH₃', test: (st) => st.last === 'press' && st.shift === 1 },
    { text: 'ارفع درجة الحرارة فوق 650 K ولاحظ نقصان K', test: (st) => st.T > 650 },
    { text: 'اجعل كمية NH₃ أكبر من 1.2 mol', test: (st) => st.a > 1.2 },
  ]);
  let last = '';
  f.ctrl.append(row(b('➕ أضف N₂', () => { S.n += 0.5; last = 'addN'; }, 'إضافة N₂ تزيد تركيزه، فينزاح الاتزان نحو اليمين لاستهلاك جزء منه'), b('➕ أضف H₂', () => { S.h += 1; last = 'addH'; }, 'إضافة H₂ تزيح الاتزان نحو تكوين NH₃'), b('➖ اسحب NH₃', () => { S.a *= 0.4; last = 'rem'; }, 'سحب الناتج يزيح الاتزان نحو اليمين لتعويضه')),
    row(b('🗜️ قلّل الحجم (ضغط أعلى)', () => { S.V = Math.max(2, S.V / 2); last = 'press'; }, 'زيادة الضغط تزيح الاتزان نحو الجهة ذات المولات الغازية الأقل (2 مول NH₃ مقابل 4 مول متفاعلات)'), b('📦 كبّر الحجم (ضغط أقل)', () => { S.V = Math.min(40, S.V * 2); last = 'vol'; }, 'تقليل الضغط يزيح الاتزان نحو الجهة ذات المولات الأكثر')),
    sT.el, R.el, G.el);
  function draw() {
    const w = 60 + (S.V / 40) * 200;
    const parts = [];
    const put = (n, col, r) => { const k = Math.round(n * 8); for (let i = 0; i < k; i++) parts.push(`<circle cx="${130 - w / 2 + 12 + ((i * 37 + col.length * 13) % (w - 24))}" cy="${60 + ((i * 53 + r * 17) % 190)}" r="${r}" fill="${col}"/>`); };
    put(S.n, '#a78bfa', 7); put(S.h / 3, '#e2e8f0', 4); put(S.a, '#34d399', 8);
    g.innerHTML = `<rect x="${130 - w / 2}" y="40" width="${w}" height="230" rx="10" fill="rgba(255,255,255,.03)" stroke="#94a3b8" stroke-width="2"/><rect x="${130 - w / 2 - 6}" y="28" width="${w + 12}" height="12" rx="4" fill="#64748b"/>
      ${parts.join('')}
      <text x="130" y="22" fill="#94a3b8" font-size="12" text-anchor="middle">V = ${S.V} L · T = ${S.T} K</text>
      <g transform="translate(270,30)"><text fill="#e2e8f0" font-size="15" font-weight="800">N₂ + 3H₂ ⇌ 2NH₃ + حرارة</text>
      <circle cx="10" cy="30" r="7" fill="#a78bfa"/><text x="24" y="35" fill="#cbd5e1" font-size="13">N₂</text><circle cx="70" cy="30" r="4" fill="#e2e8f0"/><text x="80" y="35" fill="#cbd5e1" font-size="13">H₂</text><circle cx="130" cy="30" r="8" fill="#34d399"/><text x="144" y="35" fill="#cbd5e1" font-size="13">NH₃</text>
      ${S.shift ? `<text x="180" y="90" fill="${S.shift > 0 ? '#86efac' : '#fca5a5'}" font-size="30" text-anchor="middle" font-weight="900">${S.shift > 0 ? '⟶ الاتزان ينزاح نحو اليمين' : '⟵ الاتزان ينزاح نحو اليسار'}</text>` : ''}
      <foreignObject x="0" y="110" width="350" height="150"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#fde68a;font-size:15px;line-height:1.7">${S.msg}</div></foreignObject></g>`;
    R.set('n', S.n); R.set('h', S.h); R.set('a', S.a); R.set('K', Kc());
    G.check({ ...S, last }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  const stop = loop((dt) => {
    if (anim) { anim.t = Math.min(1, anim.t + dt * 1.2); const e = 1 - (1 - anim.t) ** 3; ['n', 'h', 'a'].forEach((k) => { S[k] = anim.from[k] + (anim.to[k] - anim.from[k]) * e; }); if (anim.t >= 1) anim = null; draw(); }
  });
  disturb(() => {}, 'الخليط في حالة اتزان. جرّب أحد المؤثرات.'); S.shift = 0;
  return { destroy: stop };
}

export const SIMS = { equil, qk, lechat };

// تجارب الفصل الرابع: الكيمياء الكهربائية
import { slider, toggle, readouts, svg, el, frame, goals, loop, button, row, note, clamp } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';

const MET = { Mg: [-2.37, 2, '#cbd5e1', 'Mg²⁺'], Al: [-1.66, 3, '#e5e7eb', 'Al³⁺'], Zn: [-0.76, 2, '#94a3b8', 'Zn²⁺'], Fe: [-0.44, 2, '#78716c', 'Fe²⁺'], Ni: [-0.25, 2, '#a3a3a3', 'Ni²⁺'], Pb: [-0.13, 2, '#64748b', 'Pb²⁺'], Cu: [0.34, 2, '#f59e0b', 'Cu²⁺'], Ag: [0.8, 1, '#f1f5f9', 'Ag⁺'], Au: [1.5, 3, '#fbbf24', 'Au³⁺'] };

/* ===== 1) الخلية الكلفانية ===== */
export function galvanic(mount, { onGoal } = {}) {
  const f = frame('بنّاء الخلية الكلفانية', 'اختر فلزين. القطب ذو جهد الاختزال الأقل يتأكسد فيصبح أنودًا، والآخر كاثود يحدث عنده الاختزال. تنتقل الإلكترونات في السلك من الأنود إلى الكاثود.');
  mount.appendChild(f.root);
  const S = { L: 'Zn', Rm: 'Cu', bridge: true, t: 0 };
  const W = 640, H = 300, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s), ge = el('g', {}, s);
  const R = readouts([['E', 'E°_cell'], ['an', 'الأنود'], ['ca', 'الكاثود'], ['G', 'ΔG° (لكل مول تفاعل)']]);
  const opts = Object.keys(MET).map((k) => [k, k]);
  const sL = toggle(opts, S.L, (v) => { S.L = v; draw(); }), sR = toggle(opts, S.Rm, (v) => { S.Rm = v; draw(); });
  const sB = toggle([['1', '🌉 القنطرة الملحية موصولة'], ['0', '✂️ بلا قنطرة ملحية']], '1', (v) => { S.bridge = v === '1'; sfx.zap(); draw(); });
  const G = goals([
    { text: 'ابنِ خلية دانيال (Zn و Cu) واقرأ جهدها 1.10 V', test: (st) => st.pair === 'Cu|Zn' && st.bridge },
    { text: 'ارفع القنطرة الملحية ولاحظ توقف التيار', test: (st) => !st.bridge && st.E > 0 },
    { text: 'ابنِ خلية جهدها أكبر من 2.5 V', test: (st) => st.bridge && st.E > 2.5 },
  ]);
  f.ctrl.append(note('القطب الأيسر:'), sL, note('القطب الأيمن:'), sR, sB, R.el, G.el);
  function draw() {
    const a = MET[S.L], b = MET[S.Rm];
    if (S.L === S.Rm) { g.innerHTML = `<text x="320" y="150" fill="#fca5a5" font-size="18" text-anchor="middle">اختر فلزين مختلفين</text>`; ge.innerHTML = ''; S.E = 0; return; }
    const leftAnode = a[0] < b[0], an = leftAnode ? S.L : S.Rm, ca = leftAnode ? S.Rm : S.L;
    const E = MET[ca][0] - MET[an][0], n = MET[an][1] * MET[ca][1] / gcd(MET[an][1], MET[ca][1]);
    S.E = E; S.pair = [S.L, S.Rm].sort().join('|'); S.leftAnode = leftAnode;
    const flow = S.bridge;
    const elec = (x, met, isAnode) => `<rect x="${x - 15}" y="80" width="30" height="130" rx="4" fill="${MET[met][2]}" stroke="#0f172a"/>
      <text x="${x}" y="72" fill="#e2e8f0" font-size="15" text-anchor="middle" font-weight="800">${met}</text>
      <text x="${x}" y="292" fill="${isAnode ? '#fca5a5' : '#93c5fd'}" font-size="14" text-anchor="middle" font-weight="800">${isAnode ? 'أنود (تأكسد)' : 'كاثود (اختزال)'}</text>
      <text x="${x}" y="255" fill="#cbd5e1" font-size="13" text-anchor="middle">محلول ${MET[met][3]}</text>`;
    g.innerHTML = `<path d="M60,150 v90 q0,10 10,10 h140 q10,0 10,-10 v-90" fill="rgba(56,189,248,.18)" stroke="#cbd5e1" stroke-width="2"/>
      <path d="M420,150 v90 q0,10 10,10 h140 q10,0 10,-10 v-90" fill="rgba(56,189,248,.18)" stroke="#cbd5e1" stroke-width="2"/>
      ${elec(140, S.L, leftAnode)}${elec(500, S.Rm, !leftAnode)}
      <line x1="140" y1="80" x2="140" y2="30" stroke="#cbd5e1" stroke-width="3"/><line x1="500" y1="80" x2="500" y2="30" stroke="#cbd5e1" stroke-width="3"/>
      <line x1="140" y1="30" x2="280" y2="30" stroke="#cbd5e1" stroke-width="3"/><line x1="360" y1="30" x2="500" y2="30" stroke="#cbd5e1" stroke-width="3"/>
      <circle cx="320" cy="30" r="28" fill="#111827" stroke="#fbbf24" stroke-width="3"/><text x="320" y="36" fill="#fde68a" font-size="16" text-anchor="middle" font-weight="900" direction="ltr">${flow ? E.toFixed(2) : '0.00'} V</text>
      ${S.bridge ? `<path d="M185,170 v-60 h270 v60" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-opacity=".25"/><text x="320" y="105" fill="#cbd5e1" font-size="13" text-anchor="middle">قنطرة ملحية KNO₃</text>` : ''}`;
    const nE = 6;
    ge.innerHTML = flow ? Array.from({ length: nE }, (_, i) => `<circle r="6" fill="#22d3ee"><animateMotion dur="${2.4}s" begin="${-i * 0.4}s" repeatCount="indefinite" path="${leftAnode ? 'M140,80 L140,30 L500,30 L500,80' : 'M500,80 L500,30 L140,30 L140,80'}"/></circle>`).join('') + `<text x="320" y="78" fill="#22d3ee" font-size="13" text-anchor="middle">e⁻ ${leftAnode ? '⟵' : '⟶'}</text>` : '';
    R.set('E', flow ? E : 0, 'V'); R.set('an', `\\ce{${an}}`); R.set('ca', `\\ce{${ca}}`); R.set('G', -n * 96500 * E / 1000, 'kJ');
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/* ===== 2) التحليل الكهربائي وقوانين فاراداي ===== */
export function electrolysis(mount, { onGoal } = {}) {
  const f = frame('خلية الطلاء الكهربائي وقوانين فاراداي', 'مرّر تيارًا في محلول ملح الفلز وراقب ترسّبه على الكاثود. الكتلة المترسبة m = (M × I × t)/(n × F).');
  mount.appendChild(f.root);
  const S = { m: 'Cu', I: 2, run: false, t: 0, mass: 0 };
  const W = 640, H = 280, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const MM = { Cu: [63.5, 2, '#f59e0b'], Ag: [108, 1, '#f1f5f9'], Ni: [58.7, 2, '#a3a3a3'], Au: [197, 3, '#fbbf24'] };
  const R = readouts([['Q', 'الشحنة Q = I t'], ['ne', 'مولات الإلكترونات'], ['m', 'الكتلة المترسبة'], ['t', 'الزمن']]);
  const seg = toggle(Object.keys(MM).map((k) => [k, k]), S.m, (v) => { S.m = v; S.t = 0; S.mass = 0; draw(); });
  const sI = slider('شدة التيار I', { min: 0.5, max: 10, step: 0.5, value: S.I, unit: 'A' }, (v) => { S.I = v; });
  const bR = button('▶ شغّل', () => { S.run = !S.run; bR.innerHTML = S.run ? '⏸ أوقف' : '▶ شغّل'; S.run && sfx.zap(); });
  const G = goals([{ text: 'رسّب 1 g من النحاس', test: (st) => st.m === 'Cu' && st.mass >= 1 }, { text: 'رسّب فضة لمدة 965 s بتيار 10 A (≈ 10.8 g)', test: (st) => st.m === 'Ag' && st.t >= 965 && st.I === 10 }, { text: 'مرّر فارادايًا كاملًا (96500 C)', test: (st) => st.I * st.t >= 96500 || st.Qtot >= 96500 }]);
  f.ctrl.append(seg, sI.el, row(bR, button('↺ ابدأ من جديد', () => { S.t = 0; S.mass = 0; S.Qtot = 0; draw(); })), note('$m = \\frac{M × I × t}{n × F}$ ، $F = 96500\\ C$'), R.el, G.el);
  S.Qtot = 0;
  function draw() {
    const [M, n, col] = MM[S.m], th = clamp(S.mass / 12, 0, 1) * 14;
    g.innerHTML = `<path d="M150,90 v150 q0,12 12,12 h316 q12,0 12,-12 v-150" fill="rgba(56,189,248,.22)" stroke="#cbd5e1" stroke-width="2.5"/>
      <rect x="215" y="70" width="${18 + th}" height="150" fill="#64748b"/><rect x="${215 + 18}" y="100" width="${th}" height="120" fill="${col}"/>
      <rect x="400" y="70" width="18" height="150" fill="${col}" opacity=".85"/>
      <text x="224" y="60" fill="#93c5fd" font-size="14" text-anchor="middle" font-weight="800">كاثود (−)</text><text x="409" y="60" fill="#fca5a5" font-size="14" text-anchor="middle" font-weight="800">أنود (+)</text>
      <path d="M224,70 V30 H300 M340,30 H409 V70" stroke="#cbd5e1" stroke-width="3" fill="none"/><rect x="300" y="18" width="40" height="24" rx="4" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/><text x="320" y="35" fill="#fbbf24" font-size="12" text-anchor="middle">${S.I} A</text>
      ${S.run ? Array.from({ length: 6 }, (_, i) => `<circle r="5" fill="#${S.m === 'Cu' ? 'f59e0b' : 'e2e8f0'}"><animateMotion dur="1.6s" begin="${-i * 0.27}s" repeatCount="indefinite" path="M395,${110 + i * 18} L${240 + th},${110 + i * 18}"/></circle>`).join('') : ''}
      <text x="320" y="272" fill="#cbd5e1" font-size="13" text-anchor="middle">محلول ${S.m === 'Cu' ? 'CuSO₄' : S.m === 'Ag' ? 'AgNO₃' : S.m === 'Ni' ? 'NiSO₄' : 'AuCl₃'}</text>`;
    R.set('Q', S.Qtot, 'C'); R.set('ne', S.Qtot / 96500, 'mol'); R.set('m', S.mass, 'g'); R.set('t', S.t, 's');
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  const stop = loop((dt) => { if (S.run) { const dts = dt * 120; S.t += dts; S.Qtot += S.I * dts; const [M, n] = MM[S.m]; S.mass = M * S.Qtot / (n * 96500); draw(); } });
  draw();
  return { destroy: stop };
}

export const SIMS = { galvanic, electrolysis };

// تجارب الفصل الخامس: الكيمياء التناسقية
import { readouts, svg, el, frame, goals, loop, note, toggle } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';
import { tex } from '../js/math.js';

// المعقدات من أمثلة الكتاب: [الصيغة، الفلز، Z، عدد التأكسد، الدورة (3 أو 4 أو 5)، الليكند، شحنة الليكند، العدد التناسقي، قوي؟]
const CX = [
  ['[Ag(NH3)2]+', 'Ag', 47, 1, 4, 'NH3', 0, 2, 1],
  ['[Ni(CN)4]^2-', 'Ni', 28, 2, 3, 'CN-', -1, 4, 1],
  ['[NiCl4]^2-', 'Ni', 28, 2, 3, 'Cl-', -1, 4, 0],
  ['[Ni(NH3)4]^2+', 'Ni', 28, 2, 3, 'NH3', 0, 4, 1],
  ['[Zn(NH3)4]^2+', 'Zn', 30, 2, 3, 'NH3', 0, 4, 1],
  ['[PtCl4]^2-', 'Pt', 78, 2, 5, 'Cl-', -1, 4, 0],
  ['[Ni(CO)4]', 'Ni', 28, 0, 3, 'CO', 0, 4, 1],
  ['[Fe(CO)5]', 'Fe', 26, 0, 3, 'CO', 0, 5, 1],
  ['[Co(NH3)6]^3+', 'Co', 27, 3, 3, 'NH3', 0, 6, 1],
  ['[CoF6]^3-', 'Co', 27, 3, 3, 'F-', -1, 6, 0],
  ['[Fe(CN)6]^4-', 'Fe', 26, 2, 3, 'CN-', -1, 6, 1],
  ['[Fe(CN)6]^3-', 'Fe', 26, 3, 3, 'CN-', -1, 6, 1],
  ['[Fe(H2O)6]^2+', 'Fe', 26, 2, 3, 'H2O', 0, 6, 0],
  ['[Cr(H2O)6]^3+', 'Cr', 24, 3, 3, 'H2O', 0, 6, 0],
];
const SH = ['', '', '', '3d', '4d', '5d'];
function analyse(c) {
  const [f, m, Z, ox, row, L, lc, cn, strong] = c;
  // عدد إلكترونات d للأيون (للفلزات الانتقالية: الإلكترونات بعد غلاف الغاز النبيل ناقص التأكسد، و ns تفرغ أولًا)
  const groupE = { Cr: 6, Fe: 8, Co: 9, Ni: 10, Zn: 12, Ag: 11, Pt: 10 }[m];
  let d = groupE - ox; if (m === 'Zn' || m === 'Ag') d = Math.min(10, d);
  let hyb, geo, used = 0, pair;
  if (cn === 2) { hyb = 'sp'; geo = 'خطي'; pair = false; }
  else if (cn === 4) {
    if (d === 10 || (!strong && row === 3)) { hyb = 'sp^{3}'; geo = 'رباعي السطوح'; pair = d === 10 && ox === 0; }
    else { hyb = 'dsp^{2}'; geo = 'مربع مستو'; used = 1; pair = true; }
  } else if (cn === 5) { hyb = 'dsp^{3}'; geo = 'ثنائي الهرم المثلثي'; used = 1; pair = true; }
  else {
    if (strong || d <= 3) { hyb = 'd^{2}sp^{3}'; geo = 'ثماني السطوح'; used = 2; pair = true; }
    else { hyb = 'sp^{3}d^{2}'; geo = 'ثماني السطوح'; pair = false; }
  }
  const mo = 5 - used;
  const unp = pair ? (d <= mo ? d : 2 * mo - d) : (d <= 5 ? d : 10 - d);
  const charge = ox + lc * cn;
  return { f, m, d, hyb, geo, used, pair, unp, mu: Math.sqrt(unp * (unp + 2)), ean: Z - ox + 2 * cn, cn, charge, ox, L, strong, row, inner: hyb === 'd^{2}sp^{3}', outer: hyb === 'sp^{3}d^{2}' };
}

export function complex(mount, { onGoal } = {}) {
  const f = frame('مختبر المعقدات التناسقية', 'اختر معقدًا من أمثلة الكتاب: شاهد توزيع الإلكترونات في أوربيتالات الأيون الفلزي حسب نظرية آصرة التكافؤ (VBT)، ونوع التهجين، والشكل الهندسي، والعزم المغناطيسي، والعدد الذري الفعال.');
  mount.appendChild(f.root);
  const W = 690, H = 360, s = svg(W, H); f.stage.appendChild(s); const gO = el('g', {}, s), gG = el('g', {}, s);
  const S = { i: 1, seen: new Set() };
  const R = readouts([['ox', 'عدد التأكسد'], ['d', 'إلكترونات d'], ['hyb', 'التهجين'], ['geo', 'الشكل الهندسي'], ['mag', 'الصفة المغناطيسية'], ['mu', 'العزم μ'], ['ean', 'EAN']]);
  const box = document.createElement('div'); box.className = 'cxpick';
  box.innerHTML = CX.map((c, i) => `<button type="button" data-i="${i}" dir="ltr">${tex(`\\ce{${c[0]}}`)}</button>`).join('');
  box.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; sfx.flip(); S.i = +b.dataset.i; draw(); };
  const G = goals([
    { text: 'اعثر على معقد مربع مستو (تهجين dsp²)', test: (st) => st.a.hyb === 'dsp^{2}' },
    { text: 'قارن معقدين من النيكل: [NiCl₄]²⁻ و [Ni(CN)₄]²⁻', test: (st) => st.seen.has(1) && st.seen.has(2) },
    { text: 'اعثر على معقد ثماني السطوح دايامغناطيسي', test: (st) => st.a.cn === 6 && st.a.unp === 0 },
    { text: 'اعثر على معقد عزمه المغناطيسي أكبر من 4.5', test: (st) => st.a.mu > 4.5 },
  ]);
  f.ctrl.append(box, note('الليكندات القوية في الكتاب: $\\ce{CN-}$ و $\\ce{NH3}$ و $\\ce{CO}$؛ والضعيفة: $\\ce{Cl-}$ و $\\ce{Br-}$ و $\\ce{H2O}$ و $\\ce{F-}$. معقدات $\\ce{Pd}$ و $\\ce{Pt}$ الرباعية مربعة مستوية دائمًا.'), R.el, G.el);
  let ang = 0;
  function orbitals(a) {
    const sh = SH[a.row], nsh = { 3: '4', 4: '5', 5: '6' }[a.row];
    const bw = 44, y = 44, xs = 10;
    const cells = []; // [label, content]
    // d
    const dEl = []; let left = a.d;
    const mo = 5 - a.used;
    if (a.pair) { for (let k = 0; k < mo; k++) dEl.push(0); let e = left; for (let k = 0; k < mo && e > 0; k++) { dEl[k]++; e--; } for (let k = 0; k < mo && e > 0; k++) { dEl[k]++; e--; } }
    else { for (let k = 0; k < 5; k++) dEl.push(0); let e = left; for (let k = 0; k < 5 && e > 0; k++) { dEl[k]++; e--; } for (let k = 0; k < 5 && e > 0; k++) { dEl[k]++; e--; } }
    const dCells = [];
    if (a.pair) { for (let k = 0; k < 5; k++) dCells.push(k < mo ? ['e', dEl[k]] : ['L']); }
    else for (let k = 0; k < 5; k++) dCells.push(['e', dEl[k]]);
    // s, p
    const nsp = { sp: [1, 1], 'sp^{3}': [1, 3], 'dsp^{2}': [1, 2], 'dsp^{3}': [1, 3], 'd^{2}sp^{3}': [1, 3], 'sp^{3}d^{2}': [1, 3] }[a.hyb];
    const sC = [['L']], pC = [0, 1, 2].map((k) => (k < nsp[1] ? ['L'] : ['e', 0]));
    const dOut = a.hyb === 'sp^{3}d^{2}' ? [0, 1, 2, 3, 4].map((k) => (k < 2 ? ['L'] : ['e', 0])) : null;
    const draw = (x, c) => c[0] === 'L' ? `<rect x="${x}" y="${y}" width="${bw}" height="40" fill="rgba(52,211,153,.18)" stroke="#34d399"/><text x="${x + bw / 2}" y="${y + 24}" fill="#34d399" font-size="15" text-anchor="middle" font-weight="900">⇅</text>`
      : `<rect x="${x}" y="${y}" width="${bw}" height="40" fill="none" stroke="#94a3b8"/>${c[1] >= 1 ? `<text x="${x + bw / 2 - (c[1] === 2 ? 6 : 0)}" y="${y + 25}" fill="#fbbf24" font-size="20" text-anchor="middle">↑</text>` : ''}${c[1] === 2 ? `<text x="${x + bw / 2 + 6}" y="${y + 25}" fill="#fbbf24" font-size="20" text-anchor="middle">↓</text>` : ''}`;
    let out = '', x = xs;
    const grp = (lab, arr) => { const x0 = x; arr.forEach((c) => { out += draw(x, c); x += bw; }); out += `<text x="${(x0 + x) / 2}" y="${y + 56}" fill="#cbd5e1" font-size="14" text-anchor="middle" direction="ltr">${lab}</text>`; x += 14; };
    grp(sh, dCells); grp(nsh + 's', sC); grp(nsh + 'p', pC); if (dOut) grp(nsh + 'd', dOut);
    out += `<text x="${xs}" y="24" fill="#e2e8f0" font-size="14">توزيع الإلكترونات في المعقد (السهم الأصفر إلكترون الفلز، والمربع الأخضر زوج إلكترونات من الليكند):</text>`;
    return out;
  }
  function geometry(a, t) {
    const cx = 420, cy = 250, r = 88;
    const V = { 2: [[1, 0, 0], [-1, 0, 0]], 4: a.hyb === 'dsp^{2}' ? [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]] : [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((q) => q / Math.sqrt(3))), 5: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]], 6: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] }[a.cn];
    const ca = Math.cos(t), sa = Math.sin(t), tilt = 0.35;
    const P = V.map(([x, y, z]) => { const X = x * ca + z * sa, Z = -x * sa + z * ca; const Y = y * Math.cos(tilt) - Z * Math.sin(tilt), Z2 = y * Math.sin(tilt) + Z * Math.cos(tilt); return [cx + X * r, cy - Y * r, Z2]; });
    const lig = a.L.replace('-', '');
    const order = P.map((p, i) => [p, i]).sort((u, v) => u[0][2] - v[0][2]);
    let o = '';
    order.forEach(([p]) => { if (p[2] < 0) o += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#94a3b8" stroke-width="3"/><circle cx="${p[0]}" cy="${p[1]}" r="15" fill="#34d399" opacity=".7"/><text x="${p[0]}" y="${p[1] + 4}" fill="#052e1c" font-size="11" text-anchor="middle" font-weight="800">${lig}</text>`; });
    o += `<circle cx="${cx}" cy="${cy}" r="20" fill="#fbbf24"/><text x="${cx}" y="${cy + 5}" fill="#1c1400" font-size="14" text-anchor="middle" font-weight="900">${a.m}</text>`;
    order.forEach(([p]) => { if (p[2] >= 0) o += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#cbd5e1" stroke-width="4"/><circle cx="${p[0]}" cy="${p[1]}" r="17" fill="#34d399"/><text x="${p[0]}" y="${p[1] + 4}" fill="#052e1c" font-size="12" text-anchor="middle" font-weight="800">${lig}</text>`; });
    o += `<text x="80" y="200" fill="#fde68a" font-size="18" font-weight="900">${a.geo}</text><text x="80" y="226" fill="#cbd5e1" font-size="14">العدد التناسقي ${a.cn}</text>`;
    return o;
  }
  function draw() {
    const a = analyse(CX[S.i]); S.a = a; S.seen.add(S.i);
    gO.innerHTML = orbitals(a);
    box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.i === S.i));
    R.set('ox', a.ox > 0 ? '+' + a.ox : a.ox); R.set('d', `d^{${a.d}}`); R.set('hyb', a.hyb + (a.inner ? '\\ (\\text{داخلي})' : a.outer ? '\\ (\\text{خارجي})' : ''));
    R.set('geo', `\\text{${a.geo}}`); R.set('mag', a.unp ? `\\text{بارامغناطيسي (${a.unp} مفرد)}` : '\\text{دايامغناطيسي}'); R.set('mu', +a.mu.toFixed(2), 'B.M'); R.set('ean', a.ean);
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  const stop = loop((dt) => { ang += dt * 0.6; gG.innerHTML = geometry(S.a, ang); });
  return { destroy: stop };
}

export const SIMS = { complex };

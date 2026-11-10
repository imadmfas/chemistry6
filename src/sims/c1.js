// تجارب الفصل الأول: الثرموداينمك
import { slider, toggle, readouts, svg, el, frame, goals, loop, button, row, note, clamp } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';
import { tex } from '../js/math.js';

/* ===== 1) المسعر: q = m c ΔT ===== */
export function calorimeter(mount, { onGoal } = {}) {
  const f = frame('المسعر الحراري', 'اختر المادة وكتلتها، ثم شغّل المسخّن وراقب ارتفاع درجة الحرارة. كمية الحرارة الممتصة q = m × c × ΔT.');
  mount.appendChild(f.root);
  const MAT = { water: ['الماء', 4.18, '#38bdf8'], al: ['الألمنيوم', 0.9, '#cbd5e1'], fe: ['الحديد', 0.45, '#94a3b8'], cu: ['النحاس', 0.385, '#f59e0b'] };
  const S = { mat: 'water', m: 100, P: 50, T0: 25, T: 25, q: 0, on: false };
  const W = 640, H = 300, s = svg(W, H); f.stage.appendChild(s);
  const g = el('g', {}, s);
  const R = readouts([['q', 'الحرارة الممتصة q'], ['dT', 'ΔT'], ['T', 'درجة الحرارة'], ['c', 'الحرارة النوعية c']]);
  const seg = toggle(Object.entries(MAT).map(([k, v]) => [k, v[0]]), S.mat, (v) => { S.mat = v; reset(); });
  const sm = slider('الكتلة m', { min: 20, max: 500, step: 10, value: S.m, unit: 'g' }, (v) => { S.m = v; reset(); });
  const sp = slider('قدرة المسخّن', { min: 10, max: 200, step: 10, value: S.P, unit: 'J/s' }, (v) => { S.P = v; });
  const bOn = button('🔥 شغّل المسخّن', () => { S.on = !S.on; bOn.innerHTML = S.on ? '⏸ أوقف المسخّن' : '🔥 شغّل المسخّن'; S.on && sfx.zap(); });
  const bR = button('↺ ابدأ من جديد', () => { reset(); });
  const G = goals([
    { text: 'أوصل 5000 J إلى 100 g من الماء', test: (st) => st.mat === 'water' && st.m === 100 && st.q >= 5000 },
    { text: 'لاحظ: الكمية نفسها من الحرارة ترفع حرارة النحاس أكثر من الماء (ΔT > 40°C للنحاس)', test: (st) => st.mat === 'cu' && st.T - st.T0 > 40 },
    { text: 'سخّن 500 g من الحديد حتى تتجاوز 75°C', test: (st) => st.mat === 'fe' && st.m === 500 && st.T > 75 },
  ]);
  f.ctrl.append(seg, sm.el, sp.el, row(bOn, bR), R.el, G.el);
  function reset() { S.q = 0; S.T = S.T0; S.on = false; bOn.innerHTML = '🔥 شغّل المسخّن'; draw(); }
  function draw() {
    const [nm, c, col] = MAT[S.mat];
    const dT = S.T - S.T0, th = clamp((S.T - 0) / 120, 0, 1);
    const glow = S.on ? `<ellipse cx="250" cy="262" rx="70" ry="10" fill="#f97316" opacity="${0.4 + 0.3 * Math.sin(performance.now() / 120)}"/>` : '';
    const block = S.mat === 'water'
      ? `<rect x="185" y="${200 - S.m / 500 * 90}" width="130" height="${S.m / 500 * 90 + 40}" fill="${col}" opacity=".75" rx="6"/>`
      : `<rect x="${250 - 20 - S.m / 500 * 30}" y="${210 - S.m / 500 * 50}" width="${40 + S.m / 500 * 60}" height="${S.m / 500 * 50 + 30}" fill="${col}" rx="5" stroke="#fff3" />`;
    const hot = clamp(dT / 60, 0, 1);
    g.innerHTML = `<rect x="160" y="80" width="180" height="175" rx="16" fill="#0b1220" stroke="#64748b" stroke-width="3"/>
      <rect x="170" y="90" width="160" height="155" rx="10" fill="rgba(255,255,255,.03)" stroke="#334155"/>
      ${block}
      <rect x="185" y="250" width="130" height="10" rx="3" fill="${S.on ? '#f97316' : '#475569'}"/>${glow}
      <text x="250" y="70" fill="#e2e8f0" font-size="15" text-anchor="middle" font-weight="700">${nm}: ${S.m} g</text>
      <g transform="translate(420,40)"><rect x="-9" y="0" width="18" height="210" rx="9" fill="#0b1220" stroke="#cbd5e1" stroke-width="2"/><circle cx="0" cy="222" r="16" fill="#ef4444"/>
      <rect x="-5" y="${205 - 200 * th}" width="10" height="${200 * th + 10}" fill="#ef4444"/>
      ${[0, 20, 40, 60, 80, 100, 120].map((t) => `<line x1="10" x2="18" y1="${205 - t / 120 * 200}" y2="${205 - t / 120 * 200}" stroke="#94a3b8"/><text x="24" y="${209 - t / 120 * 200}" fill="#94a3b8" font-size="11">${t}°</text>`).join('')}</g>
      <g transform="translate(500,70)"><text fill="#fbbf24" font-size="15" font-weight="800">q = m c ΔT</text>
      <text y="30" fill="#cbd5e1" font-size="13" direction="ltr">${S.m} × ${c} × ${dT.toFixed(1)}</text><text y="56" fill="#fde68a" font-size="16" font-weight="800">${Math.round(S.q)} J</text></g>
      ${S.on ? [0, 1, 2].map((i) => `<path d="M${215 + i * 35},245 q6,-12 0,-24 q-6,-12 0,-24" stroke="rgba(249,115,22,${0.25 + hot * 0.5})" stroke-width="3" fill="none" class="flow"/>`).join('') : ''}`;
    R.set('q', S.q, 'J'); R.set('dT', dT, '°C'); R.set('T', S.T, '°C'); R.set('c', c, 'J/g.°C');
    G.check({ ...S }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  let acc = 0;
  const stop = loop((dt) => {
    if (S.on && S.T < 118) { const dq = S.P * dt * 8; S.q += dq; S.T = S.T0 + S.q / (S.m * MAT[S.mat][1]); acc += dt; if (acc > 0.5) { acc = 0; sfx.tick(); } }
    if (S.T >= 118 && S.on) { S.on = false; bOn.innerHTML = '🔥 شغّل المسخّن'; }
    draw();
  });
  return { destroy: stop };
}

/* ===== 2) قانون هيس: لعبة جمع المعادلات ===== */
export function hess(mount, { onGoal } = {}) {
  const f = frame('مختبر قانون هيس', 'كوّن المعادلة الهدف بجمع المعادلات المعطاة: اقلب المعادلة (تتغير إشارة ΔH) أو اضربها في عدد (تُضرب ΔH في العدد نفسه).');
  mount.appendChild(f.root);
  const PUZ = [
    { target: 'C(s) + 1/2O2(g) -> CO(g)', dH: -110.5, species: ['C(s)', 'O2(g)', 'CO(g)', 'CO2(g)'], tgt: { 'C(s)': -1, 'O2(g)': -0.5, 'CO(g)': 1 },
      eqs: [{ ce: 'C(s) + O2(g) -> CO2(g)', dH: -393.5, v: { 'C(s)': -1, 'O2(g)': -1, 'CO2(g)': 1 } }, { ce: 'CO(g) + 1/2O2(g) -> CO2(g)', dH: -283, v: { 'CO(g)': -1, 'O2(g)': -0.5, 'CO2(g)': 1 } }] },
    { target: 'C(s) + 2H2(g) -> CH4(g)', dH: -74.8, species: ['C(s)', 'H2(g)', 'CH4(g)', 'O2(g)', 'CO2(g)', 'H2O(l)'], tgt: { 'C(s)': -1, 'H2(g)': -2, 'CH4(g)': 1 },
      eqs: [{ ce: 'C(s) + O2(g) -> CO2(g)', dH: -393.5, v: { 'C(s)': -1, 'O2(g)': -1, 'CO2(g)': 1 } }, { ce: 'H2(g) + 1/2O2(g) -> H2O(l)', dH: -285.8, v: { 'H2(g)': -1, 'O2(g)': -0.5, 'H2O(l)': 1 } }, { ce: 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', dH: -890.3, v: { 'CH4(g)': -1, 'O2(g)': -2, 'CO2(g)': 1, 'H2O(l)': 2 } }] },
  ];
  let P = 0; const st = { k: [] };
  const box = document.createElement('div'); box.className = 'hess'; f.stage.appendChild(box);
  const G = goals([{ text: 'كوّن المعادلة الهدف الأولى (تكوين CO)', test: (s) => s.solved && s.P === 0 }, { text: 'كوّن المعادلة الهدف الثانية (تكوين الميثان)', test: (s) => s.solved && s.P === 1 }]);
  const seg = toggle([['0', 'اللغز 1'], ['1', 'اللغز 2']], '0', (v) => { P = +v; st.k = PUZ[P].eqs.map(() => 1); draw(); });
  f.ctrl.append(seg, G.el);
  st.k = PUZ[0].eqs.map(() => 1);
  function draw() {
    const pz = PUZ[P], sum = {}; let dH = 0;
    pz.eqs.forEach((e, i) => { const k = st.k[i]; dH += k * e.dH; for (const sp in e.v) sum[sp] = (sum[sp] || 0) + k * e.v[sp]; });
    const ok = pz.species.every((sp) => Math.abs((sum[sp] || 0) - (pz.tgt[sp] || 0)) < 1e-9);
    const side = (sgn) => Object.entries(sum).filter(([, v]) => sgn * v > 1e-9).map(([sp, v]) => `${Math.abs(v) === 1 ? '' : (Math.abs(v) === 0.5 ? '1/2' : Math.abs(v))}${sp}`).join(' + ') || '0';
    box.innerHTML = `<div class="hess-t">المعادلة الهدف: <span dir="ltr">${tex(`\\ce{${pz.target}}`)}</span> &nbsp; <b>ΔH = ?</b></div>
      ${pz.eqs.map((e, i) => { const k = st.k[i]; const ce = k < 0 ? e.ce.split(' -> ').reverse().join(' -> ') : e.ce;
        return `<div class="hess-eq ${k === 0 ? 'off' : ''}"><span class="hk">×${Math.abs(k)}</span><span dir="ltr">${tex(`\\ce{${ce}}`)}</span><span class="hdh" dir="ltr">${tex(`ΔH = ${(k * e.dH).toFixed(1)}\\ kJ`)}</span>
        <span class="hb"><button data-i="${i}" data-a="flip">⇄ اقلب</button><button data-i="${i}" data-a="x">× العدد</button></span></div>`; }).join('')}
      <div class="hess-sum ${ok ? 'ok' : ''}"><div>المجموع بعد حذف المواد المتكررة:</div><div dir="ltr">${tex(`\\ce{${side(-1)} -> ${side(1)}}`)}</div><b dir="ltr">${tex(`ΔH = ${dH.toFixed(1)}\\ kJ`)}</b>${ok ? '<div class="hess-win">✓ أحسنت! هذه هي المعادلة الهدف</div>' : ''}</div>`;
    box.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; sfx.flip();
      if (b.dataset.a === 'flip') st.k[i] = -st.k[i] || -1; else { const c = [1, 2, 0.5, 0]; const a = Math.abs(st.k[i]), s = Math.sign(st.k[i]) || 1; st.k[i] = s * c[(c.indexOf(a) + 1) % c.length]; }
      draw(); };
    if (ok) sfx.correct();
    G.check({ solved: ok, P }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 3) طاقة كبس الحرة: ΔG = ΔH − TΔS ===== */
export function gibbs(mount, { onGoal } = {}) {
  const f = frame('ميزان التلقائية: طاقة كبس الحرة', 'حرّك ΔH و ΔS ودرجة الحرارة، وراقب إشارة ΔG. التفاعل تلقائي عندما تكون ΔG سالبة.');
  mount.appendChild(f.root);
  const S = { dH: -50, dS: -100, T: 298 };
  const W = 640, H = 300, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  const R = readouts([['G', 'ΔG = ΔH − TΔS'], ['Teq', 'درجة الاتزان T = ΔH/ΔS'], ['sp', 'الحالة']]);
  const sH = slider('ΔH', { min: -200, max: 200, step: 5, value: S.dH, unit: 'kJ' }, (v) => { S.dH = v; draw(); });
  const sS = slider('ΔS', { min: -300, max: 300, step: 10, value: S.dS, unit: 'J/K' }, (v) => { S.dS = v; draw(); });
  const sT = slider('درجة الحرارة T', { min: 100, max: 2000, step: 10, value: S.T, unit: 'K' }, (v) => { S.T = v; draw(); });
  const G = goals([
    { text: 'اجعل التفاعل تلقائيًا في كل درجات الحرارة (ΔH سالبة و ΔS موجبة)', test: (st) => st.dH < 0 && st.dS > 0 },
    { text: 'تفاعل ماص للحرارة يصبح تلقائيًا بالتسخين: اجعل ΔH موجبة و ΔG سالبة', test: (st) => st.dH > 0 && st.G < 0 },
    { text: 'تفاعل باعث وتلقائي في درجات الحرارة الواطئة فقط: اجعل ΔG موجبة عند درجة عالية', test: (st) => st.dH < 0 && st.dS < 0 && st.G > 0 },
  ]);
  f.ctrl.append(sH.el, sS.el, sT.el, R.el, G.el);
  function draw() {
    const Gv = S.dH - S.T * S.dS / 1000;
    // رسم ΔG مقابل T
    const x0 = 60, x1 = 600, y0 = 30, y1 = 270, Tm = 2000, Gm = 800;
    const X = (T) => x0 + (T / Tm) * (x1 - x0), Y = (G) => (y0 + y1) / 2 - (G / Gm) * (y1 - y0) / 2;
    const G0 = S.dH, G1 = S.dH - Tm * S.dS / 1000;
    const Teq = S.dS !== 0 ? S.dH * 1000 / S.dS : NaN;
    g.innerHTML = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${(y1 - y0) / 2}" fill="rgba(239,68,68,.08)"/><rect x="${x0}" y="${(y0 + y1) / 2}" width="${x1 - x0}" height="${(y1 - y0) / 2}" fill="rgba(34,197,94,.1)"/>
      <text x="${x1 - 6}" y="${y0 + 18}" fill="#fca5a5" font-size="13" text-anchor="end">ΔG موجبة: غير تلقائي</text><text x="${x1 - 6}" y="${y1 - 8}" fill="#86efac" font-size="13" text-anchor="end">ΔG سالبة: تلقائي</text>
      <line x1="${x0}" y1="${Y(0)}" x2="${x1}" y2="${Y(0)}" stroke="#94a3b8"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="#94a3b8"/>
      <text x="${x0 - 8}" y="${Y(0) + 4}" fill="#94a3b8" font-size="12" text-anchor="end">0</text><text x="${x1}" y="${Y(0) + 18}" fill="#94a3b8" font-size="12" text-anchor="end">T (K)</text><text x="${x0 + 6}" y="${y0 + 14}" fill="#94a3b8" font-size="12">ΔG</text>
      <line x1="${X(0)}" y1="${Y(clamp(G0, -Gm, Gm))}" x2="${X(Tm)}" y2="${Y(clamp(G1, -Gm, Gm))}" stroke="#fbbf24" stroke-width="3"/>
      ${isFinite(Teq) && Teq > 0 && Teq < Tm ? `<circle cx="${X(Teq)}" cy="${Y(0)}" r="6" fill="#a78bfa"/><text x="${X(Teq)}" y="${Y(0) - 10}" fill="#c4b5fd" font-size="12" text-anchor="middle">${Math.round(Teq)} K</text>` : ''}
      <line x1="${X(S.T)}" y1="${y0}" x2="${X(S.T)}" y2="${y1}" stroke="#22d3ee" stroke-dasharray="4 4"/><circle cx="${X(S.T)}" cy="${Y(clamp(Gv, -Gm, Gm))}" r="8" fill="${Gv < 0 ? '#22c55e' : '#ef4444'}" stroke="#fff" stroke-width="2"/>`;
    R.set('G', Gv, 'kJ'); R.set('Teq', isFinite(Teq) && Teq > 0 ? Teq : '—', isFinite(Teq) && Teq > 0 ? 'K' : ''); R.set('sp', Gv < 0 ? '\\text{تلقائي}' : Gv > 0 ? '\\text{غير تلقائي}' : '\\text{اتزان}');
    G.check({ ...S, G: Gv }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== 4) الانتروبي: جسيمات المادة في حالاتها الثلاث ===== */
export function entropy(mount, { onGoal } = {}) {
  const f = frame('الانتروبي والعشوائية', 'سخّن المادة وراقب حركة جسيماتها: كلما زادت حرية الحركة زادت العشوائية (الانتروبي).');
  mount.appendChild(f.root);
  const W = 640, H = 280, s = svg(W, H); f.stage.appendChild(s);
  const box = el('rect', { x: 120, y: 20, width: 400, height: 240, rx: 14, fill: '#0b1220', stroke: '#475569', 'stroke-width': 2 }, s);
  const N = 36, P = [];
  for (let i = 0; i < N; i++) { const gx = 250 + (i % 6) * 24, gy = 150 + Math.floor(i / 6) * 18; P.push({ x: gx, y: gy, hx: gx, hy: gy, vx: 0, vy: 0, c: el('circle', { r: 8, fill: '#38bdf8', stroke: '#e0f2fe' }, s) }); }
  const lab = el('text', { x: 320, y: 48, fill: '#fde68a', 'font-size': 18, 'text-anchor': 'middle', 'font-weight': 800 }, s);
  const S = { T: 200 };
  const R = readouts([['st', 'الحالة الفيزيائية'], ['S', 'الانتروبي (نسبيًا)']]);
  const sT = slider('درجة الحرارة', { min: 100, max: 500, step: 5, value: S.T, unit: 'K' }, (v) => { S.T = v; });
  const G = goals([{ text: 'حوّل المادة الصلبة إلى سائل (انصهار: ΔS موجبة)', test: (s) => s.st === 1 }, { text: 'حوّلها إلى غاز: أعلى انتروبي', test: (s) => s.st === 2 }]);
  f.ctrl.append(sT.el, note('<b>تذكّر:</b> انتروبي الغاز أكبر من انتروبي السائل، وانتروبي السائل أكبر من انتروبي الصلب: $S_{gas} > S_{liquid} > S_{solid}$'), R.el, G.el);
  let prevSt = -1;
  const stop = loop((dt) => {
    const st = S.T < 273 ? 0 : S.T < 373 ? 1 : 2, amp = S.T / 100;
    P.forEach((p) => {
      if (st === 0) { p.x = p.hx + (Math.random() - 0.5) * amp * 1.2; p.y = p.hy + (Math.random() - 0.5) * amp * 1.2; }
      else {
        const sp = st === 1 ? 40 + S.T / 4 : 120 + S.T / 2;
        p.vx += (Math.random() - 0.5) * sp * dt * 6; p.vy += (Math.random() - 0.5) * sp * dt * 6 + (st === 1 ? 60 * dt : 0);
        const vm = Math.hypot(p.vx, p.vy), cap = st === 1 ? 70 : 260; if (vm > cap) { p.vx *= cap / vm; p.vy *= cap / vm; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        const top = st === 1 ? 150 : 30;
        if (p.x < 130 || p.x > 510) p.vx *= -1; if (p.y < top || p.y > 250) p.vy *= -1;
        p.x = clamp(p.x, 130, 510); p.y = clamp(p.y, top, 250);
      }
      p.c.setAttribute('cx', p.x); p.c.setAttribute('cy', p.y); p.c.setAttribute('fill', ['#38bdf8', '#22d3ee', '#f472b6'][st]);
    });
    if (st !== prevSt) { if (prevSt >= 0) sfx.whoosh(st > prevSt ? 1 : -1); if (st === 0) P.forEach((p) => { p.vx = p.vy = 0; }); prevSt = st;
      lab.textContent = ['صلب: جسيمات مرتبة تهتز في أماكنها', 'سائل: جسيمات تنزلق بعضها فوق بعض', 'غاز: جسيمات حرة الحركة تملأ الإناء'][st];
      R.set('st', ['\\text{صلب}', '\\text{سائل}', '\\text{غاز}'][st]); R.set('S', ['\\text{منخفض}', '\\text{متوسط}', '\\text{عالٍ}'][st]);
      G.check({ st }, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); }); }
  });
  return { destroy: stop };
}

export const SIMS = { calorimeter, hess, gibbs, entropy };

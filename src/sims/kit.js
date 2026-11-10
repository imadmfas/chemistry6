// أدوات مشتركة للتجارب الافتراضية: منزلقات، مفاتيح، لوحة قراءات.
import { tex, sci, rich } from '../js/math.js';
import { sfx } from '../js/sfx.js';

export const E0 = 8.85e-12;
export const NS = 'http://www.w3.org/2000/svg';

export function slider(label, { min, max, step, value, fmt = (v) => v, unit = '' }, onInput) {
  const w = document.createElement('label'); w.className = 'sl';
  w.innerHTML = `<span class="sl-l">${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><b class="sl-v" dir="ltr"></b>`;
  const inp = w.querySelector('input'), out = w.querySelector('.sl-v');
  const upd = () => { out.innerHTML = fmt(+inp.value) + (unit ? ' ' + unit : ''); inp.style.setProperty('--p', ((inp.value - min) / (max - min)) * 100 + '%'); };
  let lastTick = 0;
  inp.addEventListener('input', () => { upd(); const t = performance.now(); if (t - lastTick > 60) { sfx.tick(); lastTick = t; } onInput(+inp.value); });
  upd();
  return { el: w, get value() { return +inp.value; }, set value(v) { inp.value = v; upd(); } };
}

export function toggle(options, value, onChange) {
  const w = document.createElement('div'); w.className = 'seg';
  w.innerHTML = options.map(([v, t]) => `<button type="button" data-v="${v}" class="${v === value ? 'on' : ''}">${t}</button>`).join('');
  w.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; sfx.tap();
    w.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); onChange(b.dataset.v);
  });
  return w;
}

export function readouts(items) {
  const w = document.createElement('div'); w.className = 'reads';
  w.innerHTML = items.map(([k, l]) => `<div class="rd" data-k="${k}"><span>${l}</span><b dir="ltr"></b></div>`).join('');
  return {
    el: w,
    set(k, v, unit = '') {
      const b = w.querySelector(`[data-k="${k}"] b`); if (!b) return;
      const html = tex(`${typeof v === 'number' ? sci(v, 3) : v}${unit ? '\\ ' + unit : ''}`);
      if (b.dataset.h !== html) { b.innerHTML = html; b.dataset.h = html; b.parentElement.classList.remove('blink'); void b.offsetWidth; b.parentElement.classList.add('blink'); }
    },
  };
}

export function svg(w, h, cls = '') {
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('class', 'simsvg ' + cls); return s;
}
export function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e;
}

export function frame(title, hint) {
  const w = document.createElement('div'); w.className = 'sim';
  w.innerHTML = `<div class="sim-h"><span class="sim-badge">تجربة افتراضية</span><b>${title}</b></div>${hint ? `<div class="sim-hint">${hint}</div>` : ''}<div class="sim-stage"></div><div class="sim-ctrl"></div>`;
  return { root: w, stage: w.querySelector('.sim-stage'), ctrl: w.querySelector('.sim-ctrl') };
}

// مهمة صغيرة داخل التجربة: هدف يتحقق الطالب منه فيكسب مكافأة
export function goals(list) {
  const w = document.createElement('div'); w.className = 'goals';
  w.innerHTML = `<div class="goals-h">🎯 مهام التجربة</div>` + list.map((g, i) => `<div class="goal" data-i="${i}"><i></i><span>${g.text}</span></div>`).join('');
  const done = new Set();
  return {
    el: w,
    check(state, onHit) {
      list.forEach((g, i) => {
        if (done.has(i) || !g.test(state)) return;
        done.add(i); const d = w.querySelector(`[data-i="${i}"]`); d.classList.add('done'); sfx.coin(); onHit && onHit(d, i);
      });
    },
    get count() { return done.size; },
  };
}

// حلقة رسم متحركة تعيد دالة إيقاف
export const loop = (fn) => { let raf = 0, last = performance.now(), on = true; const f = (t) => { if (!on) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt, t / 1000); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => { on = false; cancelAnimationFrame(raf); }; };
export function button(label, onClick, cls = '') { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn sm ' + cls; b.innerHTML = label; b.onclick = (e) => { sfx.tap(); onClick(e); }; return b; }
export function row(...kids) { const r = document.createElement('div'); r.className = 'ctrl-row'; r.append(...kids.filter(Boolean)); return r; }
export function note(html) { const d = document.createElement('div'); d.className = 'sim-note'; d.innerHTML = html.replace(/\$([^$]+)\$/g, (m, x) => `<span class="m" dir="ltr">${tex(x)}</span>`); return d; }
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
// لون الكاشف العام حسب pH
export function phColor(pH) {
  const st = [[0, '#d7263d'], [2, '#f46036'], [4, '#f6ae2d'], [6, '#f2e863'], [7, '#7bc950'], [8, '#2e933c'], [10, '#2f6690'], [12, '#3a2e8f'], [14, '#5b1a6b']];
  pH = clamp(pH, 0, 14); let i = 0; while (i < st.length - 2 && pH > st[i + 1][0]) i++;
  const [a, ca] = st[i], [b, cb] = st[i + 1], t = (pH - a) / (b - a);
  const h = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const A = h(ca), B = h(cb); return `rgb(${A.map((x, k) => Math.round(x + (B[k] - x) * t)).join(',')})`;
}
// كأس زجاجية بسائل؛ level من 0 إلى 1
export function beaker(x, y, w, h, level, color, label = '') {
  const ly = y + h - h * level;
  return `<g class="beaker"><path d="M${x},${y} v${h - 10} q0,10 10,10 h${w - 20} q10,0 10,-10 v${-(h - 10)}" fill="rgba(255,255,255,.04)" stroke="#cbd5e1" stroke-width="2.5"/>
    <path d="M${x + 2},${ly} h${w - 4} v${y + h - ly - 10} q0,8 -8,8 h${-(w - 20)} q-8,0 -8,-8 z" fill="${color}" opacity=".85"/>
    <line x1="${x + 2}" y1="${ly}" x2="${x + w - 2}" y2="${ly}" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>
    ${label ? `<text x="${x + w / 2}" y="${y + h + 22}" fill="#e2e8f0" font-size="14" text-anchor="middle" font-weight="700">${label}</text>` : ''}</g>`;
}

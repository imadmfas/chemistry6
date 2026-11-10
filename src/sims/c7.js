// تجارب الفصل السابع: الكيمياء العضوية
import { toggle, readouts, svg, el, frame, goals, button, row, note, beaker } from './kit.js';
import { sfx } from '../js/sfx.js';
import { sparks } from '../js/fx.js';
import { tex } from '../js/math.js';

// خريطة التفاعلات: لكل مركب قائمة [الكاشف، الناتج، المعادلة، نوع التفاعل]
const C = {
  ethene: ['الإيثين (إثيلين)', 'CH2=CH2'], bromoethane: ['بروميد الإثيل', 'CH3CH2Br'], ethanol: ['الإيثانول', 'CH3CH2OH'], ethanal: ['الإيثانال', 'CH3CHO'],
  ethanoic: ['حامض الإيثانويك (الخليك)', 'CH3COOH'], ester: ['إيثانوات الإثيل', 'CH3COOCH2CH3'], ether: ['ثنائي إثيل إيثر', 'CH3CH2OCH2CH3'], grignard: ['بروميد إثيل المغنيسيوم', 'CH3CH2MgBr'],
  propanoic: ['حامض البروبانويك', 'CH3CH2COOH'], propanol2: ['2-بروبانول', 'CH3CH(OH)CH3'], propanone: ['البروبانون (أسيتون)', 'CH3COCH3'], amine: ['أمين الإثيل', 'CH3CH2NH2'],
  sodium_eth: ['إيثوكسيد الصوديوم', 'CH3CH2ONa'], acetate: ['خلات الصوديوم', 'CH3COONa'], butanol2: ['2-بيوتانول', 'CH3CH2CH(OH)CH3'], propane: ['البروبان', 'CH3CH2CH3'], methylether: ['إثيل مثيل إيثر', 'CH3CH2OCH3'],
};
const RX = {
  ethene: [['H₂O / H₂SO₄', 'ethanol', 'CH2=CH2 + H2O ->[H2SO4] CH3CH2OH', 'إضافة الماء (تميؤ)'], ['HBr', 'bromoethane', 'CH2=CH2 + HBr -> CH3CH2Br', 'إضافة هاليد الهيدروجين']],
  bromoethane: [['KOH مائي', 'ethanol', 'CH3CH2Br + KOH(aq) -> CH3CH2OH + KBr', 'تعويض'], ['KOH كحولي', 'ethene', 'CH3CH2Br + KOH(alc) -> CH2=CH2 + KBr + H2O', 'حذف'], ['Mg / إيثر جاف', 'grignard', 'CH3CH2Br + Mg ->[dry ether] CH3CH2MgBr', 'تحضير كاشف كرينيارد'], ['CH₃ONa (وليامسون)', 'methylether', 'CH3CH2Br + CH3ONa -> CH3CH2OCH3 + NaBr', 'تحضير الإيثرات'], ['NH₃', 'amine', 'CH3CH2Br + NH3 -> CH3CH2NH2 + HBr', 'تحضير الأمينات']],
  ethanol: [['K₂Cr₂O₇ / H⁺ (أكسدة)', 'ethanal', 'CH3CH2OH ->[K2Cr2O7/H+] CH3CHO', 'أكسدة كحول أولي'], ['H₂SO₄ مركز، 170°C', 'ethene', 'CH3CH2OH ->[H2SO4][170°C] CH2=CH2 + H2O', 'حذف الماء'], ['H₂SO₄ مركز، 140°C', 'ether', '2CH3CH2OH ->[H2SO4][140°C] CH3CH2OCH2CH3 + H2O', 'تحضير الإيثر'], ['فلز Na', 'sodium_eth', '2CH3CH2OH + 2Na -> 2CH3CH2ONa + H2 ^', 'حامضية الكحولات'], ['HBr', 'bromoethane', 'CH3CH2OH + HBr -> CH3CH2Br + H2O', 'تعويض مجموعة OH'], ['CH₃COOH / H⁺', 'ester', 'CH3COOH + CH3CH2OH <=>[H+] CH3COOCH2CH3 + H2O', 'الأسترة']],
  ethanal: [['K₂Cr₂O₇ / H⁺ أو كاشف تولن', 'ethanoic', 'CH3CHO ->[[O]] CH3COOH', 'أكسدة الألديهايد'], ['H₂ / Ni', 'ethanol', 'CH3CHO + H2 ->[Ni] CH3CH2OH', 'اختزال'], ['1) CH₃MgBr  2) H₂O', 'propanol2', 'CH3CHO + CH3MgBr ->[H2O] CH3CH(OH)CH3', 'إضافة كاشف كرينيارد']],
  ethanoic: [['NaOH', 'acetate', 'CH3COOH + NaOH -> CH3COONa + H2O', 'تعادل'], ['CH₃CH₂OH / H⁺', 'ester', 'CH3COOH + CH3CH2OH <=>[H+] CH3COOCH2CH3 + H2O', 'الأسترة'], ['LiAlH₄', 'ethanol', 'CH3COOH ->[LiAlH4] CH3CH2OH', 'اختزال']],
  ester: [['NaOH (تصبن)', 'acetate', 'CH3COOCH2CH3 + NaOH -> CH3COONa + CH3CH2OH', 'التحلل المائي القاعدي'], ['H₂O / H⁺', 'ethanoic', 'CH3COOCH2CH3 + H2O <=>[H+] CH3COOH + CH3CH2OH', 'التحلل المائي الحامضي']],
  grignard: [['1) CO₂  2) H₃O⁺', 'propanoic', 'CH3CH2MgBr + CO2 ->[H3O+] CH3CH2COOH', 'تحضير الحوامض الكاربوكسيلية'], ['1) CH₃CHO  2) H₂O', 'butanol2', 'CH3CH2MgBr + CH3CHO ->[H2O] CH3CH2CH(OH)CH3', 'تحضير كحول ثانوي']],
  propanol2: [['K₂Cr₂O₇ / H⁺ (أكسدة)', 'propanone', 'CH3CH(OH)CH3 ->[K2Cr2O7/H+] CH3COCH3', 'أكسدة كحول ثانوي']],
  propanone: [['H₂ / Ni', 'propanol2', 'CH3COCH3 + H2 ->[Ni] CH3CH(OH)CH3', 'اختزال'], ['Zn(Hg) / HCl (كليمنسن)', 'propane', 'CH3COCH3 ->[Zn(Hg)/HCl] CH3CH2CH3 + H2O', 'اختزال كليمنسن']],
  propanoic: [], amine: [], sodium_eth: [], acetate: [], butanol2: [], propane: [], ether: [], methylether: [],
};
export function orgmap(mount, { onGoal } = {}) {
  const f = frame('خريطة التحويلات العضوية', 'ابدأ من مركب، واختر الكاشف لترى الناتج ومعادلة التفاعل. تابع السلسلة لتحضّر المركب المطلوب، كما في أسئلة «حضّر» الوزارية.');
  mount.appendChild(f.root);
  const S = { cur: 'ethene', path: ['ethene'], made: new Set(['ethene']) };
  const box = document.createElement('div'); box.className = 'orgmap'; f.stage.appendChild(box);
  const G = goals([
    { text: 'مبتدئًا بالإيثين حضّر حامض الخليك', test: (st) => st.made.has('ethanoic') && st.path[0] === 'ethene' },
    { text: 'حضّر إيثانوات الإثيل (أستر)', test: (st) => st.made.has('ester') },
    { text: 'حضّر حامض البروبانويك عن طريق كاشف كرينيارد', test: (st) => st.made.has('propanoic') },
    { text: 'حضّر الأسيتون من الإيثانال (ثلاث خطوات)', test: (st) => st.made.has('propanone') },
  ]);
  const start = toggle([['ethene', 'ابدأ بالإيثين'], ['bromoethane', 'ببروميد الإثيل'], ['ethanol', 'بالإيثانول'], ['ethanal', 'بالإيثانال']], 'ethene', (v) => { S.cur = v; S.path = [v]; S.made = new Set([v]); draw(); });
  f.ctrl.append(start, G.el);
  function draw(eq) {
    const [nm, fm] = C[S.cur], rx = RX[S.cur] || [];
    box.innerHTML = `<div class="om-path">${S.path.map((k) => `<span>${C[k][0]}</span>`).join('<i>←</i>')}</div>
      <div class="om-cur"><small>المركب الحالي</small><b>${nm}</b><div dir="ltr">${tex(`\\ce{${fm}}`)}</div></div>
      ${eq ? `<div class="om-eq"><small>${eq[1]}</small><div dir="ltr">${tex(`\\ce{${eq[0]}}`)}</div></div>` : ''}
      <div class="om-rx">${rx.length ? rx.map((r, i) => `<button type="button" data-i="${i}">🧪 ${r[0]}</button>`).join('') : '<p>هذا الناتج نهاية السلسلة هنا. ابدأ من مركب آخر.</p>'}</div>`;
    box.querySelectorAll('.om-rx button').forEach((b) => b.onclick = () => {
      const r = rx[+b.dataset.i]; sfx.whoosh(1); sfx.pop();
      S.cur = r[1]; S.path.push(r[1]); S.made.add(r[1]); draw([r[2], r[3]]);
    });
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

/* ===== كشوف التمييز: لوكاس، تولن، فهلنك، الصوديوم ===== */
const UNK = {
  'CH3CH2CH2CH2OH': ['1-بيوتانول', 'كحول أولي'], 'CH3CH(OH)CH2CH3': ['2-بيوتانول', 'كحول ثانوي'], '(CH3)3COH': ['2-مثيل-2-بروبانول', 'كحول ثالثي'],
  'CH3CH2CHO': ['البروبانال', 'ألديهايد'], 'CH3COCH3': ['البروبانون', 'كيتون'], 'CH3OCH3': ['ثنائي مثيل إيثر', 'إيثر'],
};
const TESTS = {
  lucas: ['كاشف لوكاس ZnCl₂/HCl', (k, cls) => cls === 'كحول ثالثي' ? ['عكارة فورية', 'rgba(241,245,249,.75)'] : cls === 'كحول ثانوي' ? ['عكارة بعد نحو 5 دقائق', 'rgba(241,245,249,.45)'] : cls === 'كحول أولي' ? ['لا عكارة في درجة حرارة الغرفة', 'rgba(56,189,248,.25)'] : ['لا يُستعمل هذا الكشف لهذا الصنف', 'rgba(56,189,248,.2)']],
  tollens: ['كاشف تولن (نترات الفضة الأمونياكية)', (k, cls) => cls === 'ألديهايد' ? ['مرآة فضية على جدار الأنبوب', 'url(#mir)'] : ['لا تتكون مرآة فضية', 'rgba(203,213,225,.25)']],
  fehling: ['محلول فهلنك', (k, cls) => cls === 'ألديهايد' ? ['راسب أحمر طابوقي Cu₂O', 'rgba(185,28,28,.8)'] : ['يبقى اللون أزرق', 'rgba(37,99,235,.6)']],
  na: ['فلز الصوديوم', (k, cls) => cls.startsWith('كحول') ? ['فوران غاز الهيدروجين', 'rgba(56,189,248,.3)'] : ['لا يتفاعل', 'rgba(56,189,248,.2)']],
};
export function orgtests(mount, { onGoal } = {}) {
  const f = frame('مختبر الكشف عن المركبات العضوية', 'لديك مركب مجهول في أنبوب. اختر الكشف المناسب وراقب النتيجة، ثم حدّد صنف المركب.');
  mount.appendChild(f.root);
  const keys = Object.keys(UNK); const S = { u: keys[(Math.random() * keys.length) | 0], res: null, t: null, solved: 0, used: new Set() };
  const W = 640, H = 250, s = svg(W, H); f.stage.appendChild(s); const g = el('g', {}, s);
  el('defs', {}, s).innerHTML = '<linearGradient id="mir" x1="0" x2="1"><stop offset="0" stop-color="#e5e7eb"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#f8fafc"/></linearGradient>';
  const tb = document.createElement('div'); tb.className = 'ctrl-row';
  Object.entries(TESTS).forEach(([k, [n]]) => tb.appendChild(button(`🧪 ${n}`, () => { S.t = k; S.used.add(k); S.res = TESTS[k][1](S.u, UNK[S.u][1]); sfx.pop(); draw(); })));
  const ans = document.createElement('div'); ans.className = 'ctrl-row';
  ['كحول أولي', 'كحول ثانوي', 'كحول ثالثي', 'ألديهايد', 'كيتون', 'إيثر'].forEach((c) => ans.appendChild(button(c, () => {
    if (c === UNK[S.u][1]) { sfx.correct(); S.solved++; S.msg = `✓ صحيح! المركب ${UNK[S.u][0]}`; } else { sfx.wrong(); S.msg = '✗ ليس هذا. جرّب كشفًا آخر.'; }
    draw();
  })));
  const G = goals([{ text: 'حدّد صنف مركبين مجهولين بشكل صحيح', test: (st) => st.solved >= 2 }, { text: 'استعمل كاشف تولن وكاشف لوكاس', test: (st) => st.used.has('tollens') && st.used.has('lucas') }, { text: 'حدّد 5 مركبات', test: (st) => st.solved >= 5 }]);
  f.ctrl.append(note('<b>الكشوف:</b>'), tb, note('<b>جوابك: صنف المركب هو…</b>'), ans, row(button('🔄 مركب مجهول جديد', () => { S.u = keys[(Math.random() * keys.length) | 0]; S.res = null; S.msg = ''; draw(); })), G.el);
  function draw() {
    const fill = S.res ? S.res[1] : 'rgba(56,189,248,.2)';
    g.innerHTML = `<path d="M150,30 v170 a30,30 0 0 0 60,0 v-170" fill="none" stroke="#cbd5e1" stroke-width="3"/><path d="M152,110 v90 a28,28 0 0 0 56,0 v-90 z" fill="${fill}"/>
      ${S.t === 'na' && S.res && S.res[0].startsWith('فوران') ? Array.from({ length: 10 }, (_, i) => `<circle cx="${165 + (i * 7) % 30}" cy="${200 - i * 9}" r="3" fill="none" stroke="#e0f2fe"><animate attributeName="cy" from="210" to="110" dur="${1 + (i % 3) * 0.3}s" repeatCount="indefinite"/></circle>`).join('') : ''}
      <text x="180" y="22" fill="#fde68a" font-size="16" text-anchor="middle" font-weight="800">المركب المجهول X</text>
      <g transform="translate(280,60)"><text fill="#e2e8f0" font-size="16" font-weight="800">${S.t ? 'الكشف: ' + TESTS[S.t][0] : 'اختر كشفًا'}</text>
      <text y="40" fill="#fbbf24" font-size="18" font-weight="900">${S.res ? 'النتيجة: ' + S.res[0] : ''}</text>
      <text y="90" fill="${(S.msg || '').startsWith('✓') ? '#86efac' : '#fca5a5'}" font-size="16" font-weight="800">${S.msg || ''}</text></g>`;
    G.check(S, (d) => { sparks(d, '#fbbf24'); onGoal && onGoal(); });
  }
  draw();
  return { destroy() {} };
}

export const SIMS = { orgmap, orgtests };

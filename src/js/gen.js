// مولّدات «تحدّي الأرقام» للكيمياء: مسائل عددية جديدة في كل مرة، تُصحَّح آليًا.
// كل مولّد يعيد سؤالًا بصيغة محرّك الأسئلة {q, value, unit, show, steps, tol}.
import { sci } from './math.js';

const pick = (a) => a[(Math.random() * a.length) | 0];
const fmt = (x, d = 3) => sci(x, d);
const r2 = (x) => Math.round(x * 100) / 100;
const lg = Math.log10;
const R = 8.314, F = 96500;

const G = {
  /* ===== الفصل الأول: الثرموداينمك ===== */
  heat_q() {
    const [name, c] = pick([['الحديد', 0.45], ['النحاس', 0.385], ['الألمنيوم', 0.9], ['الماء', 4.18], ['الفضة', 0.24]]);
    const m = pick([20, 25, 50, 100, 150, 200, 250, 500]), T1 = pick([20, 22, 25, 30]), T2 = T1 + pick([10, 15, 20, 25, 40, 50, 75]);
    const q = m * c * (T2 - T1);
    return { q: `احسب كمية الحرارة اللازمة لرفع درجة حرارة $${m} g$ من ${name} من $${T1}°C$ إلى $${T2}°C$، علمًا أن الحرارة النوعية له $${c} J/g.°C$.`,
      value: q, unit: 'J', show: `${fmt(q)} J`, steps: ['q = m × c × ΔT', `ΔT = ${T2} - ${T1} = ${T2 - T1}°C`, `q = ${m} × ${c} × ${T2 - T1} = ${fmt(q)} J`] };
  },
  heat_c() {
    const m = pick([10, 20, 25, 40, 50]), c = pick([0.13, 0.24, 0.385, 0.45, 0.9]), dT = pick([10, 20, 25, 40, 50]), q = m * c * dT;
    return { q: `امتصت قطعة فلز كتلتها $${m} g$ كمية من الحرارة مقدارها $${fmt(q)} J$ فارتفعت درجة حرارتها $${dT}°C$. احسب الحرارة النوعية للفلز.`,
      value: c, unit: 'J/g.°C', show: `${c} J/g.°C`, steps: ['c = \\frac{q}{m × ΔT}', `c = \\frac{${fmt(q)}}{${m} × ${dT}}`, `c = ${c} J/g.°C`] };
  },
  calor() {
    const [fuel, M] = pick([['الإيثانول $\\ce{C2H5OH}$', 46], ['الميثانول $\\ce{CH3OH}$', 32], ['الكلوكوز $\\ce{C6H12O6}$', 180]]);
    const mf = pick([0.46, 0.92, 1.38, 2.3, 3.2, 0.64, 1.8, 3.6]), mw = pick([500, 1000, 1500, 2000]), dT = pick([4, 5, 6, 8, 10, 12]);
    const q = mw * 4.18 * dT, n = mf / M, dH = -q / n / 1000;
    return { q: `احترق $${mf} g$ من ${fuel} في مسعر يحتوي $${mw} g$ من الماء، فارتفعت درجة حرارة الماء $${dT}°C$. احسب حرارة احتراق المادة $ΔH$ بوحدة $kJ/mol$، بإهمال السعة الحرارية للمسعر. ($c_{ماء} = 4.18 J/g.°C$)`,
      value: dH, unit: 'kJ/mol', show: `${fmt(dH)} kJ/mol`, tol: 0.03, steps: [`q = m × c × ΔT = ${mw} × 4.18 × ${dT} = ${fmt(q)} J`, `n = \\frac{m}{M} = \\frac{${mf}}{${M}} = ${fmt(n)} mol`, `ΔH = -\\frac{q}{n} = -\\frac{${fmt(q / 1000)}}{${fmt(n)}} = ${fmt(dH)} kJ/mol`] };
  },
  gibbs() {
    const dH = pick([-120, -92, -60, -45, 30, 44, 58, 90, 178]), dS = pick([-200, -150, -80, 90, 120, 160, 200]), T = pick([298, 300, 350, 400, 500, 1000]);
    const dG = dH - T * dS / 1000;
    return { q: `لتفاعل ما $ΔH° = ${dH} kJ$ و$ΔS° = ${dS} J/K$. احسب $ΔG°$ عند درجة $${T} K$ بوحدة $kJ$، ثم بيّن هل التفاعل تلقائي.`,
      value: dG, unit: 'kJ', show: `${fmt(dG)} kJ (${dG < 0 ? 'تلقائي' : 'غير تلقائي'})`, tol: 0.02, steps: ['ΔG° = ΔH° - TΔS°', `ΔS° = ${dS} J/K = ${dS / 1000} kJ/K`, `ΔG° = ${dH} - (${T} × ${dS / 1000}) = ${fmt(dG)} kJ`, dG < 0 ? 'ΔG° سالبة، فالتفاعل تلقائي' : 'ΔG° موجبة، فالتفاعل غير تلقائي'] };
  },
  gibbs_t() {
    const dH = pick([44, 58, 90, 120, 178]), dS = pick([90, 120, 160, 200]);
    const T = dH * 1000 / dS;
    return { q: `تفاعل ماص للحرارة فيه $ΔH° = ${dH} kJ$ و$ΔS° = ${dS} J/K$. احسب أقل درجة حرارة يصبح عندها التفاعل تلقائيًا (درجة الاتزان $ΔG° = 0$).`,
      value: T, unit: 'K', show: `${fmt(T)} K`, steps: ['ΔG° = ΔH° - TΔS° = 0', 'T = \\frac{ΔH°}{ΔS°}', `T = \\frac{${dH * 1000}}{${dS}} = ${fmt(T)} K`] };
  },
  svap() {
    const [name, dH, Tb] = pick([['الماء', 40.7, 373], ['الإيثانول', 38.6, 351], ['البنزين', 30.8, 353], ['الأمونيا', 23.4, 240], ['الميثانول', 35.3, 338]]);
    const S = dH * 1000 / Tb;
    return { q: `احسب انتروبي تبخر ${name} $ΔS_{vap}$ علمًا أن انثالبي تبخره $${dH} kJ/mol$ ودرجة غليانه $${Tb} K$.`,
      value: S, unit: 'J/K.mol', show: `${fmt(S)} J/K.mol`, steps: ['ΔS_{vap} = \\frac{ΔH_{vap}}{T_{b}}', `ΔS_{vap} = \\frac{${dH} × 1000}{${Tb}} = ${fmt(S)} J/K.mol`] };
  },
  hf_rxn() {
    const set = pick([
      { eq: '\\ce{CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)}', p: [['CO2(g)', -394, 1], ['H2O(l)', -286, 2]], r: [['CH4(g)', -75, 1]] },
      { eq: '\\ce{C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)}', p: [['CO2(g)', -394, 2], ['H2O(l)', -286, 3]], r: [['C2H5OH(l)', -278, 1]] },
      { eq: '\\ce{2CO(g) + O2(g) -> 2CO2(g)}', p: [['CO2(g)', -394, 2]], r: [['CO(g)', -111, 2]] },
      { eq: '\\ce{CaCO3(s) -> CaO(s) + CO2(g)}', p: [['CaO(s)', -635, 1], ['CO2(g)', -394, 1]], r: [['CaCO3(s)', -1207, 1]] },
      { eq: '\\ce{2NO(g) + O2(g) -> 2NO2(g)}', p: [['NO2(g)', 33, 2]], r: [['NO(g)', 90, 2]] },
    ]);
    const sp = set.p.reduce((s, x) => s + x[1] * x[2], 0), sr = set.r.reduce((s, x) => s + x[1] * x[2], 0), dH = sp - sr;
    const data = [...set.p, ...set.r].map((x) => `$ΔH_{f}° \\ce{${x[0]}} = ${x[1]}$`).join('، ');
    return { q: `احسب $ΔH°$ للتفاعل $${set.eq}$ بوحدة $kJ$ إذا علمت أن (بوحدة $kJ/mol$): ${data}.`,
      value: dH, unit: 'kJ', show: `${dH} kJ`, steps: ['ΔH°_{r} = Σn ΔH_{f}°(نواتج) - Σn ΔH_{f}°(متفاعلات)', `ΔH°_{r} = [${set.p.map((x) => `${x[2]}(${x[1]})`).join(' + ')}] - [${set.r.map((x) => `${x[2]}(${x[1]})`).join(' + ')}]`, `ΔH°_{r} = ${sp} - (${sr}) = ${dH} kJ`] };
  },

  /* ===== الفصل الثاني: الاتزان الكيميائي ===== */
  kc_calc() {
    const a = pick([0.1, 0.2, 0.4, 0.5]), b = pick([0.1, 0.2, 0.3]), c = pick([0.2, 0.4, 0.6, 0.8]);
    const K = c * c / (a * b);
    return { q: `في تفاعل الاتزان $\\ce{H2(g) + I2(g) <=> 2HI(g)}$ كانت التراكيز عند الاتزان: $[\\ce{H2}] = ${a} M$ و$[\\ce{I2}] = ${b} M$ و$[\\ce{HI}] = ${c} M$. احسب ثابت الاتزان $K_{c}$.`,
      value: K, unit: '', show: `${fmt(K)}`, steps: ['K_{c} = \\frac{[\\ce{HI}]^{2}}{[\\ce{H2}][\\ce{I2}]}', `K_{c} = \\frac{(${c})^{2}}{(${a})(${b})} = ${fmt(K)}`] };
  },
  kp_kc() {
    const Kc = pick([0.5, 1.2, 2, 4.5, 10, 50]), T = pick([300, 400, 500, 600]);
    const set = pick([['\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}', -2], ['\\ce{2SO2(g) + O2(g) <=> 2SO3(g)}', -1], ['\\ce{PCl5(g) <=> PCl3(g) + Cl2(g)}', 1], ['\\ce{N2O4(g) <=> 2NO2(g)}', 1]]);
    const Kp = Kc * (0.082 * T) ** set[1];
    return { q: `للتفاعل $${set[0]}$ قيمة $K_{c} = ${Kc}$ عند $${T} K$. احسب $K_{p}$ عند الدرجة نفسها. ($R = 0.082 L.atm/mol.K$)`,
      value: Kp, unit: '', show: fmt(Kp), tol: 0.03, steps: ['K_{p} = K_{c}(RT)^{Δn}', `Δn = ${set[1]}`, `K_{p} = ${Kc} × (0.082 × ${T})^{${set[1]}} = ${fmt(Kp)}`] };
  },
  qk() {
    const K = pick([0.25, 1, 4, 10, 49]), a = pick([0.1, 0.2, 0.5]), b = pick([0.1, 0.2, 0.4]), c = pick([0.1, 0.4, 0.8, 1.2]);
    const Q = c * c / (a * b);
    const dir = Q < K ? 'نحو تكوين النواتج (اليمين)' : Q > K ? 'نحو تكوين المتفاعلات (اليسار)' : 'التفاعل في حالة اتزان';
    return { q: `للتفاعل $\\ce{H2(g) + I2(g) <=> 2HI(g)}$ ثابت اتزان $K_{c} = ${K}$. في لحظة ما كانت التراكيز $[\\ce{H2}] = ${a}$ و$[\\ce{I2}] = ${b}$ و$[\\ce{HI}] = ${c} M$. احسب حاصل التفاعل $Q$ وحدّد اتجاه سير التفاعل.`,
      value: Q, unit: '', show: `Q = ${fmt(Q)}، ${dir}`, steps: ['Q = \\frac{[\\ce{HI}]^{2}}{[\\ce{H2}][\\ce{I2}]}', `Q = \\frac{(${c})^{2}}{(${a})(${b})} = ${fmt(Q)}`, `Q ${Q < K ? '<' : Q > K ? '>' : '='} K_{c}، فيسير التفاعل ${dir}`] };
  },
  dg_k() {
    const K = pick([10, 100, 1000, 1e5, 0.01, 1e-4]), T = 298;
    const dG = -R * T * Math.log(K) / 1000;
    return { q: `احسب التغير في الطاقة الحرة القياسية $ΔG°$ بوحدة $kJ$ لتفاعل ثابت اتزانه $K = ${fmt(K)}$ عند $25°C$. ($R = 8.314 J/K.mol$)`,
      value: dG, unit: 'kJ', show: `${fmt(dG)} kJ`, tol: 0.03, steps: ['ΔG° = -2.303 RT \\log K', `ΔG° = -2.303 × 8.314 × 298 × \\log(${fmt(K)})`, `ΔG° = ${fmt(dG * 1000)} J = ${fmt(dG)} kJ`] };
  },

  /* ===== الفصل الثالث: الاتزان الأيوني ===== */
  ph_strong() {
    const [name, n] = pick([['$\\ce{HCl}$', 1], ['$\\ce{HNO3}$', 1], ['$\\ce{NaOH}$', -1], ['$\\ce{KOH}$', -1], ['$\\ce{Ba(OH)2}$', -2]]);
    const C = pick([0.1, 0.01, 0.001, 0.05, 0.005, 0.02]);
    const conc = C * Math.abs(n), pH = n > 0 ? -lg(conc) : 14 + lg(conc);
    return { q: `احسب قيمة $pH$ لمحلول ${name} تركيزه $${C} M$.`,
      value: pH, unit: '', show: `pH = ${r2(pH)}`, tol: 0.02, steps: n > 0 ? ['حامض قوي يتأين تمامًا', `[\\ce{H3O+}] = ${conc} M`, `pH = -\\log(${conc}) = ${r2(pH)}`] : ['قاعدة قوية تتأين تمامًا', `[\\ce{OH-}] = ${Math.abs(n)} × ${C} = ${fmt(conc)} M`, `pOH = -\\log(${fmt(conc)}) = ${r2(14 - pH)}`, `pH = 14 - pOH = ${r2(pH)}`] };
  },
  ph_weak() {
    const [name, Ka] = pick([['حامض الخليك $\\ce{CH3COOH}$', 1.8e-5], ['حامض الهيدروفلوريك $\\ce{HF}$', 7.2e-4], ['حامض الفورميك $\\ce{HCOOH}$', 1.8e-4], ['حامض الهيبوكلوروز $\\ce{HOCl}$', 3.5e-8]]);
    const C = pick([0.1, 0.2, 0.05, 0.01, 0.5]);
    const h = Math.sqrt(Ka * C), pH = -lg(h);
    return { q: `احسب $pH$ لمحلول ${name} تركيزه $${C} M$، علمًا أن $K_{a} = ${fmt(Ka)}$.`,
      value: pH, unit: '', show: `pH = ${r2(pH)}`, tol: 0.02, steps: ['[\\ce{H3O+}] = \\sqrt{K_{a} × C_{a}}', `[\\ce{H3O+}] = \\sqrt{${fmt(Ka)} × ${C}} = ${fmt(h)} M`, `pH = -\\log(${fmt(h)}) = ${r2(pH)}`] };
  },
  ph_weakb() {
    const Kb = 1.8e-5, C = pick([0.1, 0.2, 0.05, 0.01]);
    const oh = Math.sqrt(Kb * C), pOH = -lg(oh), pH = 14 - pOH;
    return { q: `احسب $pH$ لمحلول الأمونيا $\\ce{NH3}$ تركيزه $${C} M$، علمًا أن $K_{b} = 1.8 × 10^{-5}$.`,
      value: pH, unit: '', show: `pH = ${r2(pH)}`, tol: 0.02, steps: ['[\\ce{OH-}] = \\sqrt{K_{b} × C_{b}}', `[\\ce{OH-}] = \\sqrt{1.8×10^{-5} × ${C}} = ${fmt(oh)} M`, `pOH = ${r2(pOH)}`, `pH = 14 - ${r2(pOH)} = ${r2(pH)}`] };
  },
  buffer() {
    const Ka = 1.8e-5, ca = pick([0.1, 0.2, 0.5]), cs = pick([0.1, 0.2, 0.3, 0.5, 1]);
    const pH = -lg(Ka) + lg(cs / ca);
    return { q: `محلول منظم يتكون من حامض الخليك بتركيز $${ca} M$ وخلات الصوديوم $\\ce{CH3COONa}$ بتركيز $${cs} M$. احسب $pH$ المحلول. ($K_{a} = 1.8 × 10^{-5}$)`,
      value: pH, unit: '', show: `pH = ${r2(pH)}`, tol: 0.02, steps: ['pH = pK_{a} + \\log\\frac{[\\text{ملح}]}{[\\text{حامض}]}', `pK_{a} = -\\log(1.8×10^{-5}) = ${r2(-lg(Ka))}`, `pH = ${r2(-lg(Ka))} + \\log\\frac{${cs}}{${ca}} = ${r2(pH)}`] };
  },
  ksp_s() {
    const set = pick([['$\\ce{AgCl}$', 1, 1.8e-10], ['$\\ce{BaSO4}$', 1, 1.1e-10], ['$\\ce{CaF2}$', 2, 3.9e-11], ['$\\ce{PbCl2}$', 2, 1.6e-5], ['$\\ce{Ag2CrO4}$', 2, 1.1e-12]]);
    const [name, t, Ksp] = set;
    const s = t === 1 ? Math.sqrt(Ksp) : Math.cbrt(Ksp / 4);
    return { q: `احسب ذوبانية الملح ${name} بوحدة $mol/L$ إذا علمت أن $K_{sp} = ${fmt(Ksp)}$.`,
      value: s, unit: 'mol/L', show: `${fmt(s)} mol/L`, tol: 0.03, steps: t === 1 ? ['K_{sp} = s × s = s^{2}', `s = \\sqrt{${fmt(Ksp)}} = ${fmt(s)} mol/L`] : ['K_{sp} = s × (2s)^{2} = 4s^{3}', `s = \\sqrt[3]{\\frac{${fmt(Ksp)}}{4}} = ${fmt(s)} mol/L`] };
  },
  ksp_k() {
    const s = pick([1.3e-5, 2e-4, 1e-3, 3e-6, 5e-5]);
    const Ksp = s * s;
    return { q: `ذوبانية كبريتات الباريوم $\\ce{BaSO4}$ في الماء $${fmt(s)} mol/L$. احسب ثابت حاصل الذوبان $K_{sp}$.`,
      value: Ksp, unit: '', show: fmt(Ksp), tol: 0.03, steps: ['\\ce{BaSO4(s) <=> Ba^2+(aq) + SO4^2-(aq)}', `K_{sp} = [\\ce{Ba^2+}][\\ce{SO4^2-}] = s^{2} = (${fmt(s)})^{2} = ${fmt(Ksp)}`] };
  },

  /* ===== الفصل الرابع: الكيمياء الكهربائية ===== */
  ecell() {
    const M = [['Zn', -0.76, 2], ['Fe', -0.44, 2], ['Ni', -0.25, 2], ['Pb', -0.13, 2], ['Cu', 0.34, 2], ['Ag', 0.8, 1], ['Mg', -2.37, 2], ['Al', -1.66, 3]];
    let a = pick(M), b = pick(M); while (b[0] === a[0]) b = pick(M);
    const [an, ca] = a[1] < b[1] ? [a, b] : [b, a], E = ca[1] - an[1];
    return { q: `خلية كلفانية تتكون من قطب $\\ce{${a[0]}}$ و قطب $\\ce{${b[0]}}$، علمًا أن جهود الاختزال القياسية: $E°_{\\ce{${a[0]}}} = ${a[1]} V$ و$E°_{\\ce{${b[0]}}} = ${b[1]} V$. احسب جهد الخلية القياسي $E°_{cell}$.`,
      value: E, unit: 'V', show: `${r2(E)} V (الأنود ${an[0]})`, steps: [`الأنود هو القطب الأقل جهد اختزال: $\\ce{${an[0]}}$، والكاثود $\\ce{${ca[0]}}$`, 'E°_{cell} = E°_{cathode} - E°_{anode}', `E°_{cell} = ${ca[1]} - (${an[1]}) = ${r2(E)} V`] };
  },
  dg_e() {
    const n = pick([1, 2, 3, 6]), E = pick([0.46, 1.1, 0.59, 1.56, 0.32, 2.71]);
    const dG = -n * F * E / 1000;
    return { q: `احسب $ΔG°$ بوحدة $kJ$ لتفاعل خلية عدد الإلكترونات المنتقلة فيه $n = ${n}$ وجهدها القياسي $E°_{cell} = ${E} V$. ($F = 96500 C/mol$)`,
      value: dG, unit: 'kJ', show: `${fmt(dG)} kJ`, steps: ['ΔG° = -nFE°_{cell}', `ΔG° = -${n} × 96500 × ${E} = ${fmt(dG * 1000)} J`, `ΔG° = ${fmt(dG)} kJ`] };
  },
  faraday() {
    const [name, M, n] = pick([['النحاس', 63.5, 2], ['الفضة', 108, 1], ['الخارصين', 65.4, 2], ['النيكل', 58.7, 2], ['الألمنيوم', 27, 3]]);
    const I = pick([0.5, 1, 2, 2.5, 5, 10]), tmin = pick([10, 20, 30, 60, 90, 100]);
    const t = tmin * 60, m = M * I * t / (n * F);
    return { q: `مُرّر تيار شدته $${I} A$ مدة $${tmin}$ دقيقة في محلول أحد أملاح ${name} (الأيون $\\ce{M^{${n > 1 ? n : ''}+}}$). احسب كتلة ${name} المترسبة على الكاثود. (الكتلة الذرية $${M}$)`,
      value: m, unit: 'g', show: `${fmt(m)} g`, tol: 0.03, steps: [`Q = I × t = ${I} × ${t} = ${I * t} C`, `m = \\frac{M × Q}{n × F}`, `m = \\frac{${M} × ${I * t}}{${n} × 96500} = ${fmt(m)} g`] };
  },

  /* ===== الفصل الخامس: الكيمياء التناسقية ===== */
  ean() {
    const set = pick([
      ['$\\ce{[Fe(CN)6]^4-}$', 'Fe', 26, 2, 6], ['$\\ce{[Co(NH3)6]^3+}$', 'Co', 27, 3, 6], ['$\\ce{[Ni(CO)4]}$', 'Ni', 28, 0, 4],
      ['$\\ce{[Cu(NH3)4]^2+}$', 'Cu', 29, 2, 4], ['$\\ce{[Zn(NH3)4]^2+}$', 'Zn', 30, 2, 4], ['$\\ce{[Cr(H2O)6]^3+}$', 'Cr', 24, 3, 6], ['$\\ce{[Fe(CO)5]}$', 'Fe', 26, 0, 5]]);
    const [f, m, Z, ox, cn] = set, ean = Z - ox + 2 * cn;
    return { q: `احسب العدد الذري الفعال (EAN) للأيون الفلزي في المعقد ${f}، علمًا أن العدد الذري لـ $\\ce{${m}}$ هو $${Z}$.`,
      value: ean, unit: '', show: String(ean), tol: 0, steps: [`عدد تأكسد الفلز = ${ox}، والعدد التناسقي = ${cn}`, 'EAN = Z - عدد التأكسد + 2 × العدد التناسقي', `EAN = ${Z} - ${ox} + 2 × ${cn} = ${ean}`] };
  },

  /* ===== الفصل السادس: طرائق التحليل الكيميائي ===== */
  titr() {
    const [acid, na] = pick([['$\\ce{HCl}$', 1], ['$\\ce{H2SO4}$', 2]]);
    const Mb = pick([0.1, 0.2, 0.25, 0.5]), Vb = pick([10, 20, 25, 30, 40]), Va = pick([10, 20, 25, 50]);
    const Ma = Mb * Vb / (na * Va);
    return { q: `سُحّح $${Va} mL$ من محلول ${acid} مع محلول $\\ce{NaOH}$ تركيزه $${Mb} M$، فاحتاج إلى $${Vb} mL$ منه للوصول إلى نقطة التكافؤ. احسب التركيز المولاري للحامض.`,
      value: Ma, unit: 'M', show: `${fmt(Ma)} M`, steps: [na === 2 ? '\\ce{H2SO4 + 2NaOH -> Na2SO4 + 2H2O}' : '\\ce{HCl + NaOH -> NaCl + H2O}', `n_{\\text{قاعدة}} = ${Mb} × ${Vb / 1000} = ${fmt(Mb * Vb / 1000)} mol`, `n_{\\text{حامض}} = \\frac{${fmt(Mb * Vb / 1000)}}{${na}} = ${fmt(Mb * Vb / 1000 / na)} mol`, `M = \\frac{${fmt(Mb * Vb / 1000 / na)}}{${Va / 1000}} = ${fmt(Ma)} M`] };
  },
  grav() {
    const w = pick([0.5, 0.8, 1, 1.2, 2]), mp = pick([0.2, 0.35, 0.5, 0.717, 1.0, 1.165]);
    const set = pick([['الكبريتات $\\ce{SO4^2-}$', 'كبريتات الباريوم $\\ce{BaSO4}$', 96, 233], ['الكلوريد $\\ce{Cl-}$', 'كلوريد الفضة $\\ce{AgCl}$', 35.5, 143.5], ['الباريوم $\\ce{Ba}$', 'كبريتات الباريوم $\\ce{BaSO4}$', 137, 233]]);
    const pct = mp * set[2] / set[3] / w * 100;
    if (pct > 100) return G.grav();
    return { q: `أذيب $${w} g$ من نموذج ورُسِّب ${set[0]} فيه على هيئة ${set[1]} فكانت كتلة الراسب بعد التجفيف $${mp} g$. احسب النسبة المئوية لـ ${set[0]} في النموذج. (الكتل المولية: $${set[2]}$ و$${set[3]} g/mol$)`,
      value: pct, unit: '%', show: `${r2(pct)} %`, tol: 0.02, steps: [`كتلة المكون = كتلة الراسب × \\frac{${set[2]}}{${set[3]}} = ${mp} × \\frac{${set[2]}}{${set[3]}} = ${fmt(mp * set[2] / set[3])} g`, `النسبة = \\frac{${fmt(mp * set[2] / set[3])}}{${w}} × 100 = ${r2(pct)} \\%`] };
  },
  combust() {
    const w = pick([0.2, 0.3, 0.45, 0.5]), mco2 = pick([0.44, 0.66, 0.88, 0.55]);
    const C = mco2 * 12 / 44, pct = C / w * 100;
    if (pct > 92) return G.combust();
    return { q: `أحرق $${w} g$ من مركب عضوي فنتج $${mco2} g$ من $\\ce{CO2}$. احسب النسبة المئوية للكاربون في المركب. ($\\ce{C} = 12$، $\\ce{CO2} = 44$)`,
      value: pct, unit: '%', show: `${r2(pct)} %`, tol: 0.02, steps: [`كتلة الكاربون = ${mco2} × \\frac{12}{44} = ${fmt(C)} g`, `\\%C = \\frac{${fmt(C)}}{${w}} × 100 = ${r2(pct)} \\%`] };
  },
};

export function generate(key) {
  const f = G[key]; if (!f) return null;
  try { const q = f(); return { id: 'gen-' + key + '-' + Math.random().toString(36).slice(2, 7), kind: 'numeric', source: 'gen', kindLabel: 'تحدّي الأرقام', ...q }; } catch (e) { return null; }
}
export const GEN_KEYS = Object.keys(G);

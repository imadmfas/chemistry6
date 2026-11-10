#!/usr/bin/env python3
"""يجمع بيانات فصل الكيمياء (الكتاب + الوزاريات + الامتحانات الكاملة + الرسوم + أسئلة التدريب) في data/chN.json.
الاستعمال: python3 tools/build_ch.py N   (أو all لكل الفصول مع ملف الامتحانات)"""
import json, os, re, sys, glob
from collections import Counter
W = '/home/claude/cw'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG_ALL = json.load(open(os.path.join(ROOT, 'tools', 'chapters.json')))

FIGS = {}
for f in glob.glob(f'{W}/figs*.json'): FIGS.update(json.load(open(f)))
def fig(key): return FIGS.get(key) if key else None

SES_ORDER = {'التمهيدي': 0, 'الدور الأول': 1, 'الدور الثاني': 2, 'الدور الثالث': 3, 'التكميلي': 4, 'خارج القطر': 5, 'النازحين': 6}
strip_opt = lambda o: re.sub(r'^\s*\(?[a-dA-Dأبجد][)\-]\s*', '', str(o)).strip()

def load_papers():
    P = []
    for f in sorted(glob.glob(f'{W}/exams_*.json')): P += json.load(open(f))
    P.sort(key=lambda p: (p['year'], SES_ORDER.get(p['session'], 9), p['id']))
    return P

def item_q(it, base):
    """يحوّل بندًا من ورقة امتحان أو بنك وزاري إلى سؤال بصيغة المحرّك"""
    if it.get('options') and it.get('correct') is not None and len(it['options']) >= 2:
        return {**base, 'kind': 'mcq', 'options': [strip_opt(o) for o in it['options']], 'correct': it['correct'], 'why': it.get('answer') or it.get('why')}
    if it.get('steps'):
        return {**base, 'kind': 'reveal', 'steps': it['steps'], 'final': it.get('final'), 'answer': it.get('answer')}
    return {**base, 'kind': 'reveal', 'answer': it.get('answer') or it.get('final') or ''}

def build(N, papers):
    CFG = CFG_ALL.get(str(N), {})
    book = json.load(open(f'{W}/ch{N}_book.json'))
    tags = json.load(open(f'{W}/ch{N}_booktags.json')) if os.path.exists(f'{W}/ch{N}_booktags.json') else {}
    SIMS, GENS, ICONS = CFG.get('sims', {}), CFG.get('gens', {}), CFG.get('icons', {})
    lessons = []
    for L in book['lessons']:
        blocks = []
        for b in L['blocks']:
            b = dict(b)
            if b.get('figkey'): b['svg'] = fig(b['figkey'])
            for k in ('describe', 'figure', 'figkey'): b.pop(k, None)
            if b['type'] == 'figure' and not b.get('svg'): continue
            blocks.append(b)
        lessons.append({'id': L['id'], 'title': L['title'], 'titleEn': L.get('titleEn', ''), 'pages': L.get('pages', []), 'icon': ICONS.get(L['id']), 'blocks': blocks, 'gens': GENS.get(L['id'], [])})
    lesson_ids = {L['id'] for L in lessons}

    questions = []
    eq = book.get('endQuestions', {})
    def tag(kind, num): return (tags.get(kind) or {}).get(str(num))
    for q in eq.get('mcq', []):
        if q.get('doubt'): continue
        questions.append({'id': f'c{N}bm{q["num"]}', 'kind': 'mcq', 'source': 'book', 'lesson': tag('mcq', q['num']), 'q': q['q'], 'options': [strip_opt(o) for o in q['options']], 'correct': q['correct'], 'why': q.get('why'), 'figure': fig(q.get('figkey')), 'kindLabel': 'أسئلة الكتاب'})
    for q in eq.get('conceptual', []):
        if q.get('doubt'): continue
        questions.append({'id': f'c{N}bc{q["num"]}', 'kind': 'reveal', 'source': 'book', 'lesson': tag('conceptual', q['num']), 'q': q['q'], 'answer': q.get('answer'), 'figure': fig(q.get('figkey')), 'kindLabel': 'أسئلة الكتاب'})
    for q in eq.get('problems', []):
        if q.get('doubt'): continue
        questions.append({'id': f'c{N}bp{q["num"]}', 'kind': 'reveal', 'source': 'book', 'lesson': tag('problems', q['num']), 'q': q['q'], 'steps': q.get('solution'), 'final': q.get('answer'), 'figure': fig(q.get('figkey')), 'kindLabel': 'مسائل الكتاب'})

    # الوزاريات 2013–2019 (من الملزمة المحلولة، بإجابات مكتوبة من جديد)
    waz = []
    for f in sorted(glob.glob(f'{W}/ch{N}_waz_*.json')): waz += json.load(open(f))
    seen = {}
    for q in waz:
        if q.get('doubt'): continue
        base = {'id': q['id'], 'source': 'wizari', 'lesson': q.get('lesson'), 'q': q['q'], 'occ': q.get('occurrences', []), 'kindLabel': q.get('kind'), 'figure': fig(q.get('figkey'))}
        questions.append(item_q(q, base))
        for o in q.get('occurrences', []): seen[(o.get('year'), o.get('session'))] = 1
    # الوزاريات من 2020 فصاعدًا تؤخذ من الأوراق الكاملة
    for p in papers:
        if p['year'] < 2020: continue
        for Q in p['questions']:
            for it in Q['items']:
                if it.get('chapter') != N or it.get('doubt'): continue
                base = {'id': f"{p['id']}-{Q['num']}-{it['label']}", 'source': 'wizari', 'lesson': it.get('lesson'), 'q': it['q'], 'occ': [{'year': p['year'], 'session': p['session'], 'note': p.get('note')}], 'kindLabel': it.get('kind'), 'figure': fig(it.get('figkey')), 'paper': p['id']}
                questions.append(item_q(it, base))

    lab = json.load(open(f'{W}/ch{N}_mcq_lab.json')) if os.path.exists(f'{W}/ch{N}_mcq_lab.json') else []
    for q in lab:
        questions.append({'id': q['id'], 'kind': 'mcq', 'source': 'lab', 'lesson': q['lesson'], 'q': q['q'], 'options': q['options'], 'correct': q['correct'], 'why': q.get('why'), 'kindLabel': 'اختر الإجابة الصحيحة'})
    for q in questions:
        if q.get('lesson') not in lesson_ids: q['lesson'] = None
        for k in [k for k, v in q.items() if v is None]: q.pop(k)

    # إدراج التجارب وسؤال وزاري سريع داخل كل درس
    for L in lessons:
        bl = L['blocks']
        for k in SIMS.get(L['id'], []):
            pos = max([j + 1 for j, b in enumerate(bl) if b['type'] in ('law', 'activity', 'definition')] or [len(bl)])
            ex = [j for j, b in enumerate(bl) if b['type'] in ('example', 'exercise')]
            if ex: pos = min(pos, ex[0])
            bl.insert(pos, {'type': 'sim', 'key': k})
        chk = [q for q in questions if q.get('lesson') == L['id'] and q['kind'] == 'mcq' and q['source'] == 'wizari'] or [q for q in questions if q.get('lesson') == L['id'] and q['kind'] == 'mcq' and q['source'] == 'lab']
        if chk and len(bl) > 3:
            bl.insert(max(2, int(len(bl) * 0.55)), {'type': 'check', 'qid': chk[0]['id']})

    out = {'chapter': N, 'title': book['title'], 'titleEn': book['titleEn'], 'pages': book.get('pages'), 'objectives': book.get('objectives', []), 'terms': book.get('terms', []), 'lessons': lessons, 'questions': questions}
    if book.get('glossary'): out['glossary'] = book['glossary']
    os.makedirs(f'{ROOT}/data', exist_ok=True)
    json.dump(out, open(f'{ROOT}/data/ch{N}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    c = Counter((q['source'], q['kind']) for q in questions)
    print(N, 'lessons', len(lessons), 'questions', len(questions), dict(c), 'no-lesson', sum(1 for q in questions if not q.get('lesson')), 'KB', os.path.getsize(f'{ROOT}/data/ch{N}.json') // 1024)
    return out

def build_papers(papers):
    out = []
    for p in papers:
        qs = []
        for Q in p['questions']:
            items = []
            for it in Q['items']:
                x = {k: it.get(k) for k in ('label', 'kind', 'chapter', 'lesson', 'q', 'options', 'correct', 'answer', 'steps', 'final', 'marks')}
                x['figure'] = fig(it.get('figkey'))
                if it.get('doubt'): x['doubt'] = True; x['dnote'] = it.get('check')
                items.append({k: v for k, v in x.items() if v not in (None, [], '')})
            qs.append({k: v for k, v in {'num': Q['num'], 'marks': Q.get('marks'), 'note': Q.get('note'), 'items': items}.items() if v is not None})
        out.append({k: v for k, v in {'id': p['id'], 'year': p['year'], 'session': p['session'], 'note': p.get('note'), 'header': p.get('header'), 'duration': p.get('duration'), 'given': p.get('given'), 'questions': qs}.items() if v})
    json.dump(out, open(f'{ROOT}/data/papers.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print('papers', len(out), 'KB', os.path.getsize(f'{ROOT}/data/papers.json') // 1024)

TITLES = [('الثرموداينمك', 'Thermodynamics'), ('الاتزان الكيميائي', 'Chemical Equilibrium'), ('الاتزان الأيوني', 'Ionic Equilibrium'), ('التأكسد والاختزال والكيمياء الكهربائية', 'Redox & Electrochemistry'), ('الكيمياء التناسقية', 'Coordination Chemistry'), ('طرائق التحليل الكيميائي', 'Chemical Analysis'), ('الكيمياء العضوية للهيدروكاربونات المعوضة', 'Substituted Hydrocarbons'), ('الكيمياء الحياتية', 'Biochemistry')]

if __name__ == '__main__':
    papers = load_papers()
    arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    Ns = range(1, 9) if arg == 'all' else [int(arg)]
    for n in Ns: build(n, papers)
    build_papers(papers)
    chs = []
    for i, (t, e) in enumerate(TITLES):
        fp = f'{ROOT}/data/ch{i + 1}.json'; ready = os.path.exists(fp)
        d = json.load(open(fp)) if ready else None
        chs.append({'n': i + 1, 'title': t, 'titleEn': e, 'ready': ready, 'lessons': len(d['lessons']) if d else 0, 'wizari': sum(1 for q in d['questions'] if q['source'] == 'wizari') if d else 0})
    json.dump({'book': 'الكيمياء — السادس العلمي', 'chapters': chs, 'papers': len(papers)}, open(f'{ROOT}/data/index.json', 'w'), ensure_ascii=False, indent=1)

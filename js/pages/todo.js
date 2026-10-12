(function () {
  const KEY = 'me-idea:todo';
  let T = load();
  let editing = null, F = {};

  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return TodoModel.clean(JSON.parse(s)); } catch (e) {}
    return TodoModel.clean({});
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} }
  const el = (tag, props, ...kids) => { const e = document.createElement(tag); Object.assign(e, props || {}); e.append(...kids); return e; };

  function mount(root) {
    F.title = el('input', { placeholder: '要做什麼', maxLength: 200 });
    F.cat = el('input', { placeholder: '類別（選填）', maxLength: 40 });
    F.due = el('input', { type: 'date', title: '期限' });
    F.est = el('input', { type: 'number', min: 1, placeholder: '預估分鐘' });
    F.val = el('select', { title: '價值 1–5' }, ...[1, 2, 3, 4, 5].map(n => el('option', { value: n, textContent: '價值 ' + n, selected: n === 3 })));
    F.must = el('input', { type: 'checkbox' });
    F.save = el('button', { textContent: '加入', onclick: save });
    F.cancel = el('button', { textContent: '取消修改', hidden: true, onclick: resetForm });
    F.title.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    F.active = el('div', { className: 'todo-list' });
    F.closed = el('div', { className: 'todo-list todo-closed' });
    root.append(
      el('div', { className: 'todo-form' }, F.title, F.cat, F.due, F.est, F.val,
        el('label', {}, F.must, ' 必要'), F.save, F.cancel),
      F.active, F.closed);
    editing = null;
    render();
  }

  function resetForm() {
    editing = null;
    F.title.value = F.cat.value = F.due.value = F.est.value = '';
    F.val.value = '3'; F.must.checked = false;
    F.save.textContent = '加入'; F.cancel.hidden = true;
  }

  function save() {
    const f = { title: F.title.value, category: F.cat.value, due: F.due.value, est: F.est.value, value: F.val.value, must: F.must.checked };
    if (!f.title.trim()) return F.title.focus();
    if (editing) {
      const n = TodoModel.newTask(f);
      Object.assign(editing, { title: n.title, category: n.category, due: n.due, est: n.est, value: n.value, must: n.must });
    } else T.tasks.push(TodoModel.newTask(f));
    persist(); resetForm(); render();
  }

  function edit(t) {
    editing = t;
    F.title.value = t.title; F.cat.value = t.category; F.due.value = t.due || '';
    F.est.value = t.est || ''; F.val.value = String(t.value); F.must.checked = t.must;
    F.save.textContent = '儲存修改'; F.cancel.hidden = false; F.title.focus();
  }

  const set = (t, status) => { t.status = status; t.doneAt = status === 'done' ? new Date().toISOString() : null; persist(); render(); };

  function row(t) {
    const open = t.status === 'todo' || t.status === 'doing';
    const meta = [t.category, t.due && '期限 ' + t.due, t.est && t.est + ' 分', '價值 ' + t.value, t.must && '必要'].filter(Boolean).join(' · ');
    const btns = open
      ? [el('button', { textContent: '完成', onclick: () => set(t, 'done') }),
         el('button', { textContent: '修改', onclick: () => edit(t) }),
         el('button', { textContent: '捨棄', onclick: () => set(t, 'dropped') })]
      : [el('button', { textContent: '還原', onclick: () => set(t, 'todo') })];
    return el('div', { className: 'todo-row' + (open ? '' : ' off') },
      el('div', { className: 'todo-main' }, el('span', { className: 'todo-title', textContent: t.title }), el('span', { className: 'todo-meta', textContent: meta })),
      el('div', { className: 'todo-btns' }, ...btns));
  }

  function render() {
    const open = T.tasks.filter(t => t.status === 'todo' || t.status === 'doing');
    const closed = T.tasks.filter(t => t.status === 'done' || t.status === 'dropped');
    F.active.replaceChildren(...(open.length ? open.map(row) : [el('p', { className: 'mute', textContent: '還沒有待辦' })]));
    F.closed.replaceChildren(...(closed.length ? [el('h3', { textContent: '已完成／已捨棄（' + closed.length + '）' }), ...closed.map(row)] : []));
  }

  function getData() { return T; }
  function setData(o) { T = TodoModel.clean(o); persist(); Shell.show('todo'); }

  Shell.register({ id: 'todo', title: '待辦', mount, getData, setData });
})();

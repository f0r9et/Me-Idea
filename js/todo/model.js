/* 待辦資料：結構與檢查。純函式，不碰畫面。 */
const TodoModel = (function () {
  const STATUS = ['todo', 'doing', 'done', 'dropped'];
  const newId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

  function cleanTask(t) {
    const v = Math.round(Number(t.value));
    const est = Math.round(Number(t.est));
    let ai = null;
    if (t.ai && typeof t.ai === 'object' && Number.isFinite(Number(t.ai.score))) {
      ai = { score: Number(t.ai.score), reason: str(t.ai.reason, 300), at: str(t.ai.at, 40) || null };
    }
    return {
      id: str(t.id, 40) || newId(),
      title: str(t.title, 200),
      category: str(t.category, 40),
      due: /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : null,
      est: Number.isFinite(est) && est > 0 ? est : null,
      value: Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 3,
      must: !!t.must,
      status: STATUS.includes(t.status) ? t.status : 'todo',
      createdAt: str(t.createdAt, 40) || new Date().toISOString(),
      doneAt: str(t.doneAt, 40) || null,
      ai
    };
  }

  function clean(o) {
    o = o && typeof o === 'object' ? o : {};
    const tasks = (Array.isArray(o.tasks) ? o.tasks : [])
      .filter(t => t && typeof t === 'object' && str(t.title, 200))
      .map(cleanTask);
    return { tasks, slots: Array.isArray(o.slots) ? o.slots : [], logs: Array.isArray(o.logs) ? o.logs : [] };
  }

  return { STATUS, clean, newTask: f => cleanTask({ ...f, id: null, createdAt: null, doneAt: null, status: 'todo' }) };
})();

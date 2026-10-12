/* 殼層：負責 tab、載入頁、呼叫子頁。子頁用 Shell.register({id,title,mount}) 註冊。 */
const Shell = (function () {
  const pages = [];
  function register(p) { pages.push(p); }
  function show(id) {
    const p = pages.find(x => x.id === id); if (!p) return;
    const view = document.getElementById('view');
    view.replaceChildren();
    p.mount(view);
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === id)));
    try { history.replaceState(null, '', '#' + id); } catch (e) {} // file:// 下可能被擋，不影響功能
  }
  function start() {
    const tabs = document.getElementById('tabs');
    pages.forEach(p => {
      const b = document.createElement('button');
      b.textContent = p.title; b.dataset.id = p.id; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => show(p.id));
      tabs.append(b);
    });
    tabs.hidden = pages.length < 2; // 只有一個子頁時不顯示 tab 列
    const want = location.hash.slice(1);
    show(pages.some(p => p.id === want) ? want : pages[0].id);
    document.getElementById('loading').classList.add('done');
  }
  return { register, start };
})();

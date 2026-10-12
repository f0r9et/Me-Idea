/* 殼層：負責 tab、載入頁、呼叫子頁。子頁用 Shell.register({id,title,mount,getData,setData}) 註冊。 */
const Shell = (function () {
  const LAST = 'me-idea:tab';
  const pages = [];
  let current = null;
  function register(p) { pages.push(p); }
  const has = id => pages.some(p => p.id === id);

  function show(id) {
    const p = pages.find(x => x.id === id); if (!p) return;
    current = id;
    const view = document.getElementById('view');
    view.replaceChildren();
    p.mount(view);
    if (p.getData && p.setData) IO.attach(p, view);
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === id)));
    if (location.hash.slice(1) !== id) location.hash = id;   // 重新整理後停在同一頁
    try { localStorage.setItem(LAST, id); } catch (e) {}
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
    let last = null;
    try { last = localStorage.getItem(LAST); } catch (e) {}
    const hash = location.hash.slice(1);
    show(has(hash) ? hash : has(last) ? last : pages[0].id);   // 網址 > 上次開的頁 > 第一頁
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (has(h) && h !== current) show(h); });
    document.getElementById('loading').classList.add('done');
  }
  return { register, start, show };
})();

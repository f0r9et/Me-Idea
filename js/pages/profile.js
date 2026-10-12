(function () {
const TEMPLATE = `
  <h1>人物企劃</h1>
  <p class="lead">這是一個把我的現實狀態公開的企劃。看完下面的需求，如果你的能力、時間或資源剛好派得上用場，告訴我。事情之後怎麼發展，會記錄在這一頁。</p>

  <h2>我是誰</h2>
  <p id="who"></p>

  <h2>現在狀態</h2>
  <p id="status"></p>
  <p class="mute">最後更新：<span id="updated"></span></p>

  <h2>目前的需求</h2>
  <div id="needs"></div>

  <h2>怎麼參與</h2>
  <ol>
    <li>選一個上面的需求。</li>
    <li>告訴我你能提供什麼：技能、時間、經驗或資源，多小都可以。</li>
    <li>我回覆你，並把結果記錄在下面。</li>
  </ol>
  <p>聯絡方式：<span id="contact"></span></p>

  <h2>已發生的結果</h2>
  <div id="results"></div>
  <details class="demo">
    <summary>示範：不同協助在這裡會怎麼呈現（非真實紀錄）</summary>
    <p class="mute">規則：真實紀錄只會出現「成果」和「進行中」。「沒對上」只用在示範，一律匿名，意思是需求還沒被滿足，不是在評價幫忙的人。</p>
    <div class="tools"><button data-f="all" aria-pressed="true">全部</button><button data-f="win" aria-pressed="false">只看有成果的</button></div>
    <div id="demos"></div>
  </details>
`;
const $ = id => document.getElementById(id);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
function card(title, chip, rows) {
  const a = el('article', 'need'), h = el('header');
  h.append(el('h3', '', title));
  if (chip) h.append(el('span', 'chip', chip));
  a.append(h);
  const dl = el('dl');
  rows.forEach(([k, v]) => { dl.append(el('dt', '', k), el('dd', '', v)); });
  a.append(dl);
  return a;
}

const TIER = { '成果': 0, '進行中': 1, '沒對上': 2 };
let filt = 'all';
function renderDemos() {
  const box = $('demos'); box.replaceChildren();
  DATA.demos.filter(d => filt === 'all' || d.tier === '成果')
    .sort((a, b) => TIER[a.tier] - TIER[b.tier])
    .forEach(d => {
      const a = card(d.need, d.tier, [['誰幫的', d.tier === '沒對上' ? '匿名' : d.who], ['做了什麼', d.what], ['之後怎麼改變', d.after]]);
      a.classList.add('t' + TIER[d.tier]); box.append(a);
    });
}
function mount(root) {
  root.innerHTML = TEMPLATE;
  filt = 'all';
  $('who').textContent = DATA.who;
  $('status').textContent = DATA.status;
  $('updated').textContent = DATA.updated;
  DATA.needs.forEach(n => $('needs').append(card(n.title, n.state, [['卡在哪', n.stuck], ['誰能幫', n.helpers], ['完成後', n.done]])));
  const c = DATA.contact.trim();
  if (!c) { $('contact').append(el('span', 'ph', '尚未設定')); }
  else if (/^(https?:\/\/|mailto:)/.test(c)) { const a = el('a', '', c.replace(/^mailto:/, '')); a.href = c; $('contact').append(a); }
  else { $('contact').textContent = c; }
  if (DATA.results.length === 0) { $('results').append(el('div', 'empty', '目前還沒有結果。第一個結果出現時會放在這裡，包含誰幫了什麼、之後怎麼改變。')); }
  else { DATA.results.forEach(r => $('results').append(card(r.need, '', [['誰幫的', r.who], ['做了什麼', r.what], ['之後怎麼改變', r.after]]))); }

  document.querySelectorAll('.tools button').forEach(b => b.addEventListener('click', () => {
    filt = b.dataset.f;
    document.querySelectorAll('.tools button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderDemos();
  }));
  renderDemos();
}
Shell.register({ id: 'profile', title: '人物企劃', mount });
})();

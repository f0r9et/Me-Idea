/* 資料出入口。每個驅動都長這樣：{ label, save(id, payload), load(id) -> Promise<payload> }
   之後要加 Google 驅動，只需要在 IO.drivers 多放一個同樣形狀的物件。 */
const IO = (function () {
  const wrap = (id, data) => ({ page: id, version: 1, exported: new Date().toISOString(), data });

  const local = {
    label: '本機',
    save(id, payload) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      a.download = id + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    load() {
      return new Promise((resolve, reject) => {
        const f = document.createElement('input');
        f.type = 'file'; f.accept = '.json,application/json';
        f.onchange = () => {
          if (!f.files[0]) return reject(new Error('沒有選檔案'));
          f.files[0].text().then(t => resolve(JSON.parse(t)), reject);
        };
        f.click();
      });
    }
  };

  const drivers = { local };

  function attach(page, root) {
    const bar = document.createElement('div');
    bar.className = 'io';
    Object.values(drivers).forEach(d => {
      const s = document.createElement('button'); s.textContent = '存到' + d.label;
      const l = document.createElement('button'); l.textContent = '從' + d.label + '讀取';
      s.onclick = () => Promise.resolve().then(() => d.save(page.id, wrap(page.id, page.getData()))).then(() => {
        const t = s.textContent; s.textContent = '已存 ✓'; setTimeout(() => s.textContent = t, 1500);
      }).catch(e => alert('儲存失敗：' + e.message));
      l.onclick = () => d.load(page.id).then(p => {
        if (!p || p.page !== page.id) throw new Error('這不是「' + page.title + '」的資料檔');
        page.setData(p.data);
      }).catch(e => alert('讀取失敗：' + e.message));
      bar.append(s, l);
    });
    root.prepend(bar);
  }
  return { drivers, attach };
})();

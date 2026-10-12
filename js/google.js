/* Google 驅動：登入後把資料存在使用者自己 Drive 的隱藏應用資料夾（drive.appdata）。
   只有這個網頁能讀寫那個資料夾，使用者的其他 Drive 檔案碰不到。 */
(function () {
  const CLIENT_ID = '1075856932605-6kfumm6j5a6hh20ucheodmp7j88oc43v.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

  // 預先載入登入元件：彈窗必須在點擊當下開，不能等載入
  const gsi = document.createElement('script');
  gsi.src = 'https://accounts.google.com/gsi/client'; gsi.async = true;
  document.head.append(gsi);

  let client, pending, token, expiry = 0;

  function getToken() {
    if (token && Date.now() < expiry) return Promise.resolve(token);
    return new Promise((resolve, reject) => {
      if (!window.google || !google.accounts) return reject(new Error('Google 登入元件尚未載入，稍後再試'));
      pending = { resolve, reject };
      if (!client) client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, scope: SCOPE,
        callback: r => {
          if (r.error) return pending.reject(new Error(r.error));
          token = r.access_token; expiry = Date.now() + (r.expires_in - 60) * 1000;
          pending.resolve(token);
        },
        error_callback: e => pending.reject(new Error(e.type === 'popup_closed' ? '登入視窗被關閉' : (e.type || '登入失敗')))
      });
      client.requestAccessToken();
    });
  }

  async function call(url, opt = {}) {
    const t = await getToken();
    const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + t } });
    if (r.status === 401) { token = null; throw new Error('登入已過期，請再按一次'); }
    if (!r.ok) throw new Error('Drive 回應 ' + r.status);
    return r;
  }

  async function findId(name) {
    const q = encodeURIComponent("name='" + name + "'");
    const r = await call(API + '?spaces=appDataFolder&fields=files(id)&q=' + q);
    const j = await r.json();
    return j.files[0] ? j.files[0].id : null;
  }

  IO.drivers.google = {
    label: 'Google',
    async save(id, payload) {
      const name = id + '.json', body = JSON.stringify(payload);
      const fid = await findId(name);
      if (fid) {
        await call(UPLOAD + '/' + fid + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
      } else {
        const b = 'b' + Math.random().toString(36).slice(2);
        const meta = JSON.stringify({ name, parents: ['appDataFolder'] });
        await call(UPLOAD + '?uploadType=multipart', {
          method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b },
          body: '--' + b + '\r\nContent-Type: application/json\r\n\r\n' + meta + '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + body + '\r\n--' + b + '--'
        });
      }
    },
    async load(id) {
      const fid = await findId(id + '.json');
      if (!fid) throw new Error('雲端還沒有存檔');
      return (await call(API + '/' + fid + '?alt=media')).json();
    }
  };
})();

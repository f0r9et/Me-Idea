# 進度

- 結構：index.html（載入頁＋tab）→ js/shell.js 註冊子頁 → js/pages/*.js
- 子頁要有 id、title、mount、getData、setData，就自動得到存／讀按鈕（js/io.js）
- 儲存驅動放在 IO.drivers：local（下載／匯入 JSON）、google（Drive 隱藏資料夾，js/google.js）
- 已完成：拆檔、本機匯出入、Google 驅動（待在 GitHub Pages 實測）
- 下一步：分享模式（匯出指定時間段）。需要先決定行程資料欄位
- Google 只能在 https 網址測，雙擊 file:// 不行

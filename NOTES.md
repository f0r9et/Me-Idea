# 進度

- 結構：index.html（載入頁＋tab）→ js/shell.js 註冊子頁 → js/pages/*.js
- 子頁要有 id、title、mount、getData、setData，就自動得到存／讀按鈕（js/io.js）
- 儲存驅動在 IO.drivers：local（JSON 檔）、google（Drive 隱藏資料夾，js/google.js，待實測）
- 子頁：profile（人物企劃）、todo（待辦，js/todo/model.js 管資料格式）
- todo 已完成：新增／修改／完成／捨棄／還原、瀏覽器自動暫存、匯出入
- todo 下一步：期限倒數與排序 → AI 往返 → 時間紀錄 → 彈性時程 → 每週統計
- Google 只能在 https 網址測，雙擊 file:// 不行

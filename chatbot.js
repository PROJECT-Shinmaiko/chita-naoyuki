/* ============================================================
   知多なおゆきサポート チャットボット
   組み込み方: index.html の </body> 直前に
   <script src="chatbot.js"></script> を追加するだけ
   ============================================================ */

(function () {
  /* ── 設定 ── */
  const LINE_URL = "https://line.me/ti/p/c7HkOEEUXS"; /* ← あなたのLINE公式アカウントURLに変更 */
  const BRAND_COLOR = "#06C755"; /* LINEグリーン（お好みで変更可） */
  const BASE_PRICE_EXCL = 18000;
  const BASE_PRICE_INCL = 19800;

  /* ── FAQ定義 ── */
  const FAQ = [
    {
      keywords: ["即日", "すぐ", "今日", "急"],
      answer:
        "スケジュールが空いていれば即日で作業をさせていただくこともあります。料金等をその場でご提示して納得いただければ、作業することは可能です。",
    },
    {
      keywords: ["料金", "値段", "費用", "いくら", "価格"],
      answer:
        "基本料金は1人あたり日当18,000円（税込19,800円）です。人数と日数をお知らせいただければ、具体的な金額をお伝えします。",
    },
    {
      keywords: ["支払", "支払い", "クレジット", "現金", "振込"],
      answer:
        "お支払い方法についての詳細は、LINEにてご確認ください。",
    },
    {
      keywords: ["エリア", "対応地域", "どこ", "場所", "知多"],
      answer:
        "主に知多半島エリアを中心にサービスを提供しております。詳しい対応エリアはLINEにてお問い合わせください。",
    },
  ];

  /* ── ステップ管理 ── */
  // null = アイドル / "ask_count" = 人数待ち / "ask_days" = 日数待ち
  let step = null;
  let savedCount = 0;

  /* ── スタイル注入 ── */
  const style = document.createElement("style");
  style.textContent = `
    #cns-launcher {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: ${BRAND_COLOR}; color: #fff;
      border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.22);
      display: flex; align-items: center; justify-content: center;
      transition: transform .15s, box-shadow .15s;
    }
    #cns-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(0,0,0,.28); }
    #cns-launcher svg { width: 28px; height: 28px; }

    #cns-window {
      position: fixed; bottom: 92px; right: 24px; z-index: 9999;
      width: min(360px, calc(100vw - 32px));
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,.18);
      display: flex; flex-direction: column;
      transition: opacity .2s, transform .2s;
      font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
      font-size: 14px;
    }
    #cns-window.cns-hidden { opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none; }

    #cns-header {
      background: ${BRAND_COLOR}; color: #fff;
      padding: 12px 16px; display: flex; align-items: center; gap: 10px;
    }
    #cns-header-title { font-weight: 700; font-size: 15px; flex: 1; }
    #cns-close {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 20px; line-height: 1; padding: 2px 4px; border-radius: 4px;
      opacity: .85; transition: opacity .1s;
    }
    #cns-close:hover { opacity: 1; }

    #cns-messages {
      background: #f5f5f5; flex: 1;
      padding: 14px 12px; overflow-y: auto;
      max-height: 340px; min-height: 180px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .cns-msg { display: flex; gap: 8px; align-items: flex-end; }
    .cns-msg.user { flex-direction: row-reverse; }

    .cns-avatar {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      background: ${BRAND_COLOR}; display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }

    .cns-bubble {
      max-width: 80%; padding: 9px 12px; border-radius: 16px;
      line-height: 1.55; white-space: pre-wrap; word-break: break-word;
    }
    .cns-msg.bot .cns-bubble {
      background: #fff; color: #222; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .cns-msg.user .cns-bubble {
      background: ${BRAND_COLOR}; color: #fff; border-bottom-right-radius: 4px;
    }

    .cns-quick { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px 4px; background: #f5f5f5; }
    .cns-qbtn {
      background: #fff; border: 1.5px solid ${BRAND_COLOR}; color: ${BRAND_COLOR};
      border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer;
      transition: background .12s, color .12s; font-family: inherit;
    }
    .cns-qbtn:hover { background: ${BRAND_COLOR}; color: #fff; }

    #cns-input-row {
      display: flex; gap: 6px; padding: 10px 12px;
      background: #fff; border-top: 1px solid #e8e8e8;
    }
    #cns-input {
      flex: 1; border: 1.5px solid #ddd; border-radius: 22px;
      padding: 8px 14px; font-size: 14px; outline: none;
      font-family: inherit; transition: border-color .15s;
    }
    #cns-input:focus { border-color: ${BRAND_COLOR}; }
    #cns-send {
      background: ${BRAND_COLOR}; border: none; color: #fff;
      border-radius: 50%; width: 38px; height: 38px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity .15s;
    }
    #cns-send:hover { opacity: .88; }
    #cns-send svg { width: 18px; height: 18px; }

    .cns-line-btn {
      display: inline-flex; align-items: center; gap: 7px;
      background: ${BRAND_COLOR}; color: #fff !important;
      text-decoration: none; padding: 9px 18px; border-radius: 24px;
      font-weight: 700; font-size: 14px; margin-top: 4px;
      transition: opacity .15s; box-shadow: 0 2px 8px rgba(6,199,85,.3);
    }
    .cns-line-btn:hover { opacity: .9; }
    .cns-line-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
  `;
  document.head.appendChild(style);

  /* ── LINE アイコン SVG ── */
  const lineIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.03 2 11c0 3.1 1.64 5.84 4.13 7.56L5 22l4.26-2.24A10.6 10.6 0 0012 20c5.52 0 10-4.03 10-9S17.52 2 12 2zm-3 11.5H7.5v-5H9v5zm3.25 0h-1.5V9h1.5v4.5zm3.25 0h-1.5v-5h1.5v5z"/></svg>`;

  /* ── DOM構築 ── */
  const launcher = document.createElement("button");
  launcher.id = "cns-launcher";
  launcher.setAttribute("aria-label", "チャットを開く");
  launcher.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/></svg>`;

  const win = document.createElement("div");
  win.id = "cns-window";
  win.className = "cns-hidden";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", "チャットサポート");
  win.innerHTML = `
    <div id="cns-header">
      <div class="cns-avatar" aria-hidden="true">🌿</div>
      <div id="cns-header-title">知多なおゆきサポート</div>
      <button id="cns-close" aria-label="閉じる">✕</button>
    </div>
    <div id="cns-messages" aria-live="polite"></div>
    <div class="cns-quick" id="cns-quick"></div>
    <div id="cns-input-row">
      <input id="cns-input" type="text" placeholder="メッセージを入力…" aria-label="メッセージ入力" />
      <button id="cns-send" aria-label="送信">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  const msgArea = document.getElementById("cns-messages");
  const quickArea = document.getElementById("cns-quick");
  const input = document.getElementById("cns-input");

  /* ── ユーティリティ ── */
  function addMsg(text, role) {
    const wrap = document.createElement("div");
    wrap.className = `cns-msg ${role}`;
    if (role === "bot") {
      wrap.innerHTML = `<div class="cns-avatar" aria-hidden="true">🌿</div><div class="cns-bubble">${text}</div>`;
    } else {
      wrap.innerHTML = `<div class="cns-bubble">${escHtml(text)}</div>`;
    }
    msgArea.appendChild(wrap);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function lineBtnHtml(label) {
    return `<a class="cns-line-btn" href="${LINE_URL}" target="_blank" rel="noopener">${lineIcon}${label}</a>`;
  }

  function setQuick(btns) {
    quickArea.innerHTML = "";
    btns.forEach(({ label, value }) => {
      const b = document.createElement("button");
      b.className = "cns-qbtn";
      b.textContent = label;
      b.addEventListener("click", () => handleInput(value || label));
      quickArea.appendChild(b);
    });
  }

  function clearQuick() { quickArea.innerHTML = ""; }

  /* ── 料金計算 ── */
  function calcMsg(count, days) {
    const excl = BASE_PRICE_EXCL * count * days;
    const incl = BASE_PRICE_INCL * count * days;
    return `📋 <strong>お見積り</strong>\n\n` +
      `👷 人数：${count}名\n📅 日数：${days}日\n\n` +
      `日当（税抜）：¥${excl.toLocaleString()}\n` +
      `日当（税込）：¥${incl.toLocaleString()}\n\n` +
      `※現地の状況により変動する場合があります。\n詳細はLINEでご確認ください。\n\n` +
      lineBtnHtml("LINEで正式見積もりを依頼");
  }

  /* ── FAQ照合 ── */
  function matchFaq(text) {
    for (const faq of FAQ) {
      if (faq.keywords.some(k => text.includes(k))) return faq.answer;
    }
    return null;
  }

  /* ── 人数・日数パース ── */
  function parseNum(text) {
    const m = text.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  /* ── メインロジック ── */
  function handleInput(text) {
    text = text.trim();
    if (!text) return;

    clearQuick();
    addMsg(text, "user");
    input.value = "";

    /* ステップ処理 */
    if (step === "ask_count") {
      const n = parseNum(text);
      if (!n || n < 1 || n > 100) {
        addMsg("人数を半角数字でお知らせください（例：3）", "bot");
        setQuick([{label:"1名"},{label:"2名"},{label:"3名"},{label:"5名"}]);
        return;
      }
      savedCount = n;
      step = "ask_days";
      addMsg(`${n}名ですね。\n作業日数は何日間ですか？（例：1、2、5）`, "bot");
      setQuick([{label:"1日"},{label:"2日"},{label:"3日"},{label:"5日"}]);
      return;
    }

    if (step === "ask_days") {
      const d = parseNum(text);
      if (!d || d < 1 || d > 365) {
        addMsg("日数を半角数字でお知らせください（例：2）", "bot");
        setQuick([{label:"1日"},{label:"2日"},{label:"3日"},{label:"5日"}]);
        return;
      }
      step = null;
      addMsg(calcMsg(savedCount, d), "bot");
      return;
    }

    /* 料金計算トリガー */
    if (/料金|見積|いくら|計算|費用|値段|価格|人/.test(text)) {
      step = "ask_count";
      addMsg("料金のお見積りですね！\n何名分の料金を計算しますか？", "bot");
      setQuick([{label:"1名"},{label:"2名"},{label:"3名"},{label:"5名"}]);
      return;
    }

    /* FAQ照合 */
    const faqAnswer = matchFaq(text);
    if (faqAnswer) {
      addMsg(faqAnswer + "\n\n他にご質問があればLINEでもお気軽にどうぞ。\n\n" + lineBtnHtml("LINEで相談する"), "bot");
      setQuick([{label:"料金を計算する"},{label:"他の質問をする"}]);
      return;
    }

    /* デフォルト返答 */
    addMsg(`ご質問ありがとうございます。\n詳しい内容はLINEにてお気軽にお問い合わせください！\n\n${lineBtnHtml("LINEで問い合わせる")}`, "bot");
    setQuick([{label:"料金を計算する"},{label:"即日対応できますか？"}]);
  }

  /* ── 初期メッセージ ── */
  function showWelcome() {
    if (msgArea.childElementCount > 0) return;
    addMsg(
      "こんにちは！<strong>知多なおゆきサポート</strong>のチャットサポートです 🌿\n\n" +
      "以下のことができます。何でもお気軽にどうぞ！\n" +
      "・料金の自動計算\n・よくある質問への回答",
      "bot"
    );
    setQuick([
      { label: "料金を計算する" },
      { label: "即日対応できますか？" },
      { label: "LINEで相談する", value: "__line__" },
    ]);
  }

  /* ── 開閉制御 ── */
  let isOpen = false;
  function openChat() {
    isOpen = true;
    win.classList.remove("cns-hidden");
    launcher.setAttribute("aria-expanded", "true");
    showWelcome();
    input.focus();
  }
  function closeChat() {
    isOpen = false;
    win.classList.add("cns-hidden");
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => isOpen ? closeChat() : openChat());
  document.getElementById("cns-close").addEventListener("click", closeChat);

  /* ── 送信ハンドラ ── */
  document.getElementById("cns-send").addEventListener("click", () => {
    const v = input.value.trim();
    if (v === "__line__") { window.open(LINE_URL, "_blank"); return; }
    handleInput(v);
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const v = input.value.trim();
      if (v === "__line__") { window.open(LINE_URL, "_blank"); return; }
      handleInput(v);
    }
  });

  /* クイックボタンで LINE を開く場合 */
  const origSetQuick = setQuick;

})();

(() => {
  const GAME_NAME = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  let activePkContext = null;

  function decodeChallenge() {
    const value = new URLSearchParams(window.location.search).get("challenge");
    if (!value) return null;
    try {
      const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function normalizeSeconds(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10);
  }

  function getNativeSetter(element) {
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    return Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  }

  function setNativeValue(element, value) {
    if (!element) return;
    const setter = getNativeSetter(element);
    if (setter) setter.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function readPlayerName() {
    const field = document.querySelector(".identity-row input");
    if (field?.value?.trim()) return field.value.trim();
    try {
      const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
      if (saved.name?.trim()) return saved.name.trim();
    } catch {}
    return "我";
  }

  function readComparisonContext() {
    const comparison = document.querySelector(".comparison-result");
    const challenge = decodeChallenge();
    if (!comparison || !challenge) return null;
    const text = comparison.textContent || "";
    const faster = /你快了\s*(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const slower = /慢了\s*(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const tie = /打平/.test(text);
    if (!faster && !slower && !tie) return null;
    const delta = Number.parseFloat((faster || slower)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const state = faster ? "faster" : slower ? "slower" : "tie";
    const myElapsed = state === "faster" ? Math.max(0, targetElapsed - delta) : state === "slower" ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    return {
      myName: readPlayerName(),
      opponent: challenge.name || "TA",
      round,
      targetElapsed,
      myElapsed,
      delta,
      state,
    };
  }

  function isPkPhrase(text = "") {
    return /\bPK\b|回击|反超|比.+(?:快|慢)\s*\d+(?:\.\d+)?\s*秒|快了\s*\d+(?:\.\d+)?\s*秒|慢了\s*\d+(?:\.\d+)?\s*秒/.test(text);
  }

  function findMottoInput() {
    return [...document.querySelectorAll(".share-fields input")].find((input) => !input.closest(".identity-row"));
  }

  function cleanOrdinaryMotto() {
    const motto = findMottoInput();
    if (!motto) return;
    const livePk = Boolean(readComparisonContext());
    if (!livePk && isPkPhrase(motto.value)) {
      setNativeValue(motto, "");
      try {
        const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
        if (saved && isPkPhrase(saved.motto || "")) {
          saved.motto = "";
          localStorage.setItem("pack-share-identity", JSON.stringify(saved));
        }
      } catch {}
    }
    if (!motto.placeholder || isPkPhrase(motto.placeholder)) motto.placeholder = DEFAULT_MOTTO;
  }

  function buildPkText(context) {
    const delta = normalizeSeconds(context.delta || 0);
    const my = context.myName || "我";
    const ta = context.opponent || "TA";
    const round = `第 ${context.round}/${TOTAL_LEVELS} 关`;
    if (context.state === "faster") {
      return {
        title: `${my} 比 ${ta} 快 ${delta} 秒`,
        text: `${my} PK ${ta}，在《${GAME_NAME}》${round}快了 ${delta} 秒！我 ${normalizeSeconds(context.myElapsed)} 秒，${ta} ${normalizeSeconds(context.targetElapsed)} 秒。轮到你追我。`,
      };
    }
    if (context.state === "slower") {
      return {
        title: `${my} 比 ${ta} 慢 ${delta} 秒`,
        text: `${my} PK ${ta}，在《${GAME_NAME}》${round}慢了 ${delta} 秒。我 ${normalizeSeconds(context.myElapsed)} 秒，${ta} ${normalizeSeconds(context.targetElapsed)} 秒。下一局追回来。`,
      };
    }
    return {
      title: `${my} 和 ${ta} 打平了`,
      text: `${my} PK ${ta}，在《${GAME_NAME}》${round}用时打平！我和 ${ta} 都是 ${normalizeSeconds(context.myElapsed)} 秒。再来一局分胜负。`,
    };
  }

  function getPkDataUrl(context) {
    if (window.__packForcePkModalPoster?.getDataUrl) return window.__packForcePkModalPoster.getDataUrl(context);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ee3048";
    ctx.fillRect(0, 0, 540, 1440);
    ctx.fillStyle = "#2451d7";
    ctx.fillRect(540, 0, 540, 1440);
    ctx.fillStyle = "#ffe04a";
    ctx.beginPath();
    ctx.moveTo(493, 0); ctx.lineTo(632, 0); ctx.lineTo(558, 430); ctx.lineTo(652, 430); ctx.lineTo(454, 1440); ctx.lineTo(516, 748); ctx.lineTo(420, 748); ctx.closePath(); ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "900 84px system-ui, sans-serif";
    ctx.fillText("PK 回击战", 540, 190);
    ctx.fillStyle = "#15122d";
    ctx.font = "1000 150px system-ui, sans-serif";
    ctx.fillText("VS", 540, 620);
    ctx.fillStyle = "white";
    ctx.font = "1000 88px system-ui, sans-serif";
    const delta = normalizeSeconds(context.delta || 0);
    ctx.fillText(context.state === "faster" ? `我快 ${delta} 秒` : context.state === "slower" ? `我慢 ${delta} 秒` : "用时打平", 540, 990);
    return canvas.toDataURL("image/png");
  }

  function dataUrlToFile(dataUrl) {
    const [meta, body] = dataUrl.split(",");
    const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], "谁最能装-PK回击.png", { type: mime });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
  }

  function closePkModal() {
    document.getElementById("pack-pk-duel-modal")?.remove();
  }

  function openPkModal(context = activePkContext || readComparisonContext()) {
    if (!context) return false;
    activePkContext = context;
    try { sessionStorage.setItem("pack-active-pk-context", JSON.stringify(context)); } catch {}
    closePkModal();
    const dataUrl = getPkDataUrl(context);
    const copy = buildPkText(context);
    const modal = document.createElement("div");
    modal.id = "pack-pk-duel-modal";
    modal.innerHTML = `
      <section class="pack-pk-duel-panel" role="dialog" aria-label="PK 回击战分享">
        <button class="pack-pk-duel-close" type="button" aria-label="关闭">×</button>
        <div class="pack-pk-duel-kicker">PK 回击战</div>
        <h2>${copy.title}</h2>
        <div class="pack-pk-duel-preview"><img src="${dataUrl}" alt="PK 回击战海报" /></div>
        <p>${copy.text}</p>
        <div class="pack-pk-duel-actions">
          <button class="pack-pk-share" type="button">分享 PK 图片</button>
          <button class="pack-pk-save" type="button">保存图片</button>
          <button class="pack-pk-copy" type="button">复制 PK 文案</button>
        </div>
      </section>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".pack-pk-duel-close").addEventListener("click", closePkModal);
    modal.addEventListener("click", (event) => { if (event.target === modal) closePkModal(); });
    modal.querySelector(".pack-pk-share").addEventListener("click", async () => {
      const file = dataUrlToFile(dataUrl);
      if (navigator.share) {
        const payload = { title: copy.title, text: copy.text, url: window.location.href };
        if (!navigator.canShare || navigator.canShare({ files: [file] })) payload.files = [file];
        try { await navigator.share(payload); return; } catch {}
      }
      await copyText(`${copy.title}\n${copy.text}\n${window.location.href}`);
      modal.querySelector("p").textContent = "已复制 PK 文案和链接，发回去让 TA 追你。";
    });
    modal.querySelector(".pack-pk-save").addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "谁最能装-PK回击.png";
      link.click();
    });
    modal.querySelector(".pack-pk-copy").addEventListener("click", async () => {
      await copyText(`${copy.title}\n${copy.text}\n${window.location.href}`);
      modal.querySelector("p").textContent = "已复制 PK 文案，直接发回去继续 Battle。";
    });
    return true;
  }

  function shouldInterceptClick(event) {
    const button = event.target.closest("button, a");
    if (!button) return null;
    const text = (button.textContent || "").replace(/\s+/g, "");
    const liveContext = readComparisonContext();
    if (!liveContext) return null;
    if (button.classList.contains("share-cta")) return liveContext;
    if (/我更快|发回去|打平了|喊TA|晒战绩|追一次|生成我的装箱战绩/.test(text)) return liveContext;
    return null;
  }

  function injectStyle() {
    if (document.getElementById("pack-pk-controller-style")) return;
    const style = document.createElement("style");
    style.id = "pack-pk-controller-style";
    style.textContent = `
      #pack-pk-duel-modal { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 22px; background: rgba(4, 5, 18, 0.78); backdrop-filter: blur(14px); }
      .pack-pk-duel-panel { width: min(940px, 96vw); max-height: 94vh; overflow: auto; border-radius: 34px; padding: 28px; color: #fff; background: linear-gradient(135deg, #e82f45 0%, #241b70 49%, #2054de 100%); border: 4px solid rgba(255, 224, 74, .88); box-shadow: 0 30px 90px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.14); position: relative; }
      .pack-pk-duel-close { position: absolute; top: 20px; right: 20px; width: 64px; height: 64px; border-radius: 18px; border: 2px solid rgba(255,255,255,.6); background: rgba(8,12,28,.72); color: #fff; font-size: 46px; line-height: 1; }
      .pack-pk-duel-kicker { color: #fff044; font-weight: 1000; letter-spacing: .08em; font-size: 22px; }
      .pack-pk-duel-panel h2 { margin: 8px 76px 18px 0; font-size: clamp(30px, 5vw, 54px); line-height: 1.08; }
      .pack-pk-duel-preview { display: grid; place-items: center; padding: 14px; border-radius: 26px; background: rgba(0,0,0,.28); }
      .pack-pk-duel-preview img { display: block; width: min(390px, 78vw); max-height: 54vh; object-fit: contain; border-radius: 18px; box-shadow: 0 20px 54px rgba(0,0,0,.44); }
      .pack-pk-duel-panel p { margin: 18px 0 0; font-size: 20px; line-height: 1.55; font-weight: 800; color: #fff8d6; }
      .pack-pk-duel-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; margin-top: 18px; }
      .pack-pk-duel-actions button { min-height: 64px; border: 0; border-radius: 18px; font-size: 20px; font-weight: 1000; color: #17122b; background: linear-gradient(180deg, #fff044 0%, #ff9b31 60%, #ff5f87 100%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.28), 0 12px 28px rgba(0,0,0,.3); }
      @media (max-width: 680px) { .pack-pk-duel-actions { grid-template-columns: 1fr; } .pack-pk-duel-panel { padding: 22px; } }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", (event) => {
    const context = shouldInterceptClick(event);
    if (!context) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openPkModal(context);
  }, true);

  function handleExistingShareStudio() {
    injectStyle();
    cleanOrdinaryMotto();
    const studio = document.querySelector(".share-studio");
    if (!studio) return;
    const liveContext = readComparisonContext();
    const text = studio.textContent || "";
    const motto = findMottoInput()?.value || "";
    if (liveContext && (isPkPhrase(text) || isPkPhrase(motto))) {
      document.querySelector(".share-studio header button")?.click();
      requestAnimationFrame(() => openPkModal(liveContext));
    }
  }

  injectStyle();
  handleExistingShareStudio();
  new MutationObserver(() => requestAnimationFrame(handleExistingShareStudio)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "value"],
  });
  setInterval(handleExistingShareStudio, 500);

  window.__packPkController = { readComparisonContext, openPkModal, cleanOrdinaryMotto, buildPkText };
})();

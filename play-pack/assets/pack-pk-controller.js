(() => {
  const GAME_NAME = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const W = 1080;
  const H = 1440;
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
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
    const faster = /(?:你快了|快了|更快|反超).*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const slower = /(?:你慢了|慢了|更慢|差).*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const tie = /打平|平局/.test(text);
    if (!faster && !slower && !tie) return null;
    const delta = Number.parseFloat((faster || slower)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const state = faster ? "faster" : slower ? "slower" : "tie";
    const myElapsed = state === "faster" ? Math.max(0, targetElapsed - delta) : state === "slower" ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    const context = {
      myName: readPlayerName(),
      opponent: challenge.name || "TA",
      round,
      targetElapsed,
      myElapsed,
      delta,
      state,
    };
    activePkContext = context;
    try { sessionStorage.setItem("pack-active-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function readStoredPkContext() {
    const live = readComparisonContext();
    if (live) return live;
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-active-pk-context") || "null");
      return stored?.opponent ? { ...stored, myName: readPlayerName() } : null;
    } catch {
      return null;
    }
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

  function getLabels(context) {
    const rawMe = (context.myName || "我").trim() || "我";
    const rawTa = (context.opponent || "TA").trim() || "TA";
    if (rawMe === rawTa) return { me: "我", ta: "TA", rawMe, rawTa };
    return { me: rawMe, ta: rawTa, rawMe, rawTa };
  }

  function buildPkText(context) {
    const delta = normalizeSeconds(context.delta || 0);
    const { me, ta } = getLabels(context);
    const round = `第 ${context.round}/${TOTAL_LEVELS} 关`;
    if (context.state === "faster") {
      return {
        title: `${me} 比 ${ta} 快 ${delta} 秒`,
        text: `${me} PK ${ta}，在《${GAME_NAME}》${round}快了 ${delta} 秒！${me} ${normalizeSeconds(context.myElapsed)} 秒，${ta} ${normalizeSeconds(context.targetElapsed)} 秒。轮到你追我。`,
      };
    }
    if (context.state === "slower") {
      return {
        title: `${me} 比 ${ta} 慢 ${delta} 秒`,
        text: `${me} PK ${ta}，在《${GAME_NAME}》${round}慢了 ${delta} 秒。${me} ${normalizeSeconds(context.myElapsed)} 秒，${ta} ${normalizeSeconds(context.targetElapsed)} 秒。下一局追回来。`,
      };
    }
    return {
      title: `${me} 和 ${ta} 打平了`,
      text: `${me} PK ${ta}，在《${GAME_NAME}》${round}用时打平！都是 ${normalizeSeconds(context.myElapsed)} 秒。再来一局分胜负。`,
    };
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, width, height, radius, fill) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function fitText(ctx, text, x, y, maxWidth, fontSize, color = "#fff", weight = 1000) {
    let size = fontSize;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    do {
      ctx.font = `${weight} ${size}px ${FONT}`;
      if (ctx.measureText(text).width <= maxWidth || size <= 22) break;
      size -= 3;
    } while (size > 22);
    ctx.fillText(text, x, y);
  }

  function drawItemBadge(ctx, x, y, color, icon, rotate = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.shadowColor = "rgba(0,0,0,.34)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 10;
    fillRound(ctx, -74, -54, 148, 108, 28, color);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fillRect(-48, -34, 96, 8);
    ctx.font = `44px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, 8);
    ctx.restore();
  }

  function drawPkPoster(canvas, context) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { me, ta } = getLabels(context);
    const delta = normalizeSeconds(context.delta || 0);
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const result = context.state === "tie" ? "打平" : faster ? `快 ${delta} 秒` : `慢 ${delta} 秒`;
    const headline = context.state === "tie" ? "平手再战" : faster ? "反超成功" : "差点追回";

    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#f33247");
    bg.addColorStop(0.48, "#35145e");
    bg.addColorStop(0.52, "#11142a");
    bg.addColorStop(1, "#2455f0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#ffe14a";
    for (let x = -100; x < W; x += 76) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 100, 54); ctx.lineTo(x + 60, 54); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#10121b";
    for (let x = -50; x < W; x += 76) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 100, 54); ctx.lineTo(x + 60, 54); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#ffe14a";
    ctx.beginPath();
    ctx.moveTo(492, 54); ctx.lineTo(628, 54); ctx.lineTo(558, 510); ctx.lineTo(656, 510); ctx.lineTo(452, H); ctx.lineTo(515, 760); ctx.lineTo(420, 760); ctx.closePath(); ctx.fill();

    ctx.globalAlpha = .16;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(120, 230, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(970, 230, 330, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    fitText(ctx, "PK 回击战", 540, 122, 820, 56, "#fff36b");
    fitText(ctx, `${GAME_NAME} · 第 ${context.round}/${TOTAL_LEVELS} 关`, 540, 184, 860, 30, "#f0fbff", 900);

    fillRound(ctx, 58, 260, 430, 380, 40, "rgba(255,45,66,.92)");
    fillRound(ctx, 592, 260, 430, 380, 40, "rgba(28,82,224,.92)");
    fitText(ctx, me, 273, 326, 330, 52, "#fff");
    fitText(ctx, ta, 807, 326, 330, 52, "#fff");
    fitText(ctx, `${normalizeSeconds(context.myElapsed)} 秒`, 273, 560, 330, 76, faster || context.state === "tie" ? "#fff36b" : "#dce8ff");
    fitText(ctx, `${normalizeSeconds(context.targetElapsed)} 秒`, 807, 560, 330, 76, slower || context.state === "tie" ? "#fff36b" : "#dce8ff");

    drawItemBadge(ctx, 155, 430, "#ffb22e", "🧸", -0.14);
    drawItemBadge(ctx, 278, 442, "#ff5b76", "📦", 0.1);
    drawItemBadge(ctx, 382, 425, "#63df76", "🎒", -0.08);
    drawItemBadge(ctx, 695, 430, "#3aa7ff", "📚", 0.12);
    drawItemBadge(ctx, 818, 442, "#a970ff", "👕", -0.1);
    drawItemBadge(ctx, 922, 425, "#26d7e4", "🧃", 0.08);

    ctx.save();
    ctx.translate(540, 500);
    ctx.fillStyle = "#fff36b";
    ctx.beginPath();
    for (let i = 0; i < 36; i += 1) {
      const angle = Math.PI * 2 * i / 36;
      const radius = i % 2 ? 118 : 184;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    fitText(ctx, "VS", 540, 500, 280, 132, "#15122d");

    fillRound(ctx, 108, 720, 864, 250, 52, "rgba(6,8,24,.86)");
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 6;
    roundRect(ctx, 108, 720, 864, 250, 52);
    ctx.stroke();
    fitText(ctx, headline, 540, 790, 780, 56, faster ? "#76ff74" : slower ? "#fff36b" : "#35f2ff");
    fitText(ctx, result, 540, 890, 800, 104, "#fff");

    const slogan = context.state === "tie" ? "这局打平，再来一箱！" : faster ? "我已反超，轮到你追我！" : "我差一点，下一局追回来！";
    fitText(ctx, slogan, 540, 1080, 900, 48, "#fff6c7");
    fillRound(ctx, 108, 1188, 864, 130, 40, faster ? "#ffe14a" : "#ff6bd1");
    fitText(ctx, context.state === "tie" ? "再战一局" : faster ? "发回去，让 TA 追我" : "再来一次，追回来", 540, 1253, 800, 46, "#141226");
    return true;
  }

  function getPkDataUrl(context) {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    drawPkPoster(canvas, context);
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
    try { await navigator.clipboard.writeText(text); }
    catch {
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

  function openPkModal(context = activePkContext || readStoredPkContext()) {
    if (!context) return false;
    activePkContext = context;
    try { sessionStorage.setItem("pack-active-pk-context", JSON.stringify(context)); } catch {}
    closePkModal();
    const dataUrl = getPkDataUrl(context);
    const copy = buildPkText(context);
    const { me, ta } = getLabels(context);
    const delta = normalizeSeconds(context.delta || 0);
    const resultLine = context.state === "tie" ? `${me} 和 ${ta} 打平` : context.state === "faster" ? `${me} 比 ${ta} 快 ${delta} 秒` : `${me} 比 ${ta} 慢 ${delta} 秒`;
    const modal = document.createElement("div");
    modal.id = "pack-pk-duel-modal";
    modal.innerHTML = `
      <section class="pack-pk-duel-panel" role="dialog" aria-label="PK 回击战分享">
        <button class="pack-pk-duel-close" type="button" aria-label="关闭">×</button>
        <div class="pack-pk-duel-head">
          <span>PK 回击战</span>
          <strong>${resultLine}</strong>
        </div>
        <div class="pack-pk-duel-preview"><img src="${dataUrl}" alt="PK 回击战海报" /></div>
        <div class="pack-pk-duel-actions">
          <button class="pack-pk-share" type="button">分享 PK 图</button>
          <button class="pack-pk-save" type="button">保存图片</button>
          <button class="pack-pk-copy" type="button">复制文案</button>
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
    });
    modal.querySelector(".pack-pk-save").addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "谁最能装-PK回击.png";
      link.click();
    });
    modal.querySelector(".pack-pk-copy").addEventListener("click", async () => {
      await copyText(`${copy.title}\n${copy.text}\n${window.location.href}`);
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
      #pack-pk-duel-modal { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 18px; background: rgba(4, 5, 18, .82); backdrop-filter: blur(14px); }
      .pack-pk-duel-panel { width: min(760px, 96vw); max-height: 94vh; overflow: auto; border-radius: 34px; padding: 24px; color: #fff; background: linear-gradient(135deg, #e93247 0%, #30145e 50%, #2254e6 100%); border: 4px solid rgba(255, 224, 74, .92); box-shadow: 0 30px 90px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.14); position: relative; }
      .pack-pk-duel-close { position: absolute; top: 18px; right: 18px; width: 56px; height: 56px; border-radius: 18px; border: 2px solid rgba(255,255,255,.62); background: rgba(8,12,28,.72); color: #fff; font-size: 40px; line-height: 1; }
      .pack-pk-duel-head { padding-right: 76px; margin-bottom: 16px; }
      .pack-pk-duel-head span { display: block; color: #fff044; font-size: 22px; font-weight: 1000; letter-spacing: .08em; }
      .pack-pk-duel-head strong { display: block; margin-top: 8px; color: #fff; font-size: clamp(30px, 6vw, 52px); line-height: 1.08; }
      .pack-pk-duel-preview { display: grid; place-items: center; padding: 12px; border-radius: 26px; background: rgba(0,0,0,.3); }
      .pack-pk-duel-preview img { display: block; width: min(360px, 78vw); max-height: 60vh; object-fit: contain; border-radius: 18px; box-shadow: 0 20px 54px rgba(0,0,0,.44); }
      .pack-pk-duel-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-top: 16px; }
      .pack-pk-duel-actions button { min-height: 60px; border: 0; border-radius: 18px; font-size: 19px; font-weight: 1000; color: #17122b; background: linear-gradient(180deg, #fff044 0%, #ff9b31 60%, #ff5f87 100%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.28), 0 12px 28px rgba(0,0,0,.3); }
      @media (max-width: 680px) { .pack-pk-duel-actions { grid-template-columns: 1fr; } .pack-pk-duel-panel { padding: 20px; } }
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

  window.__packPkController = { readComparisonContext, openPkModal, cleanOrdinaryMotto, buildPkText, drawPkPoster };
})();
(() => {
  const GAME_NAME = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const W = 1080;
  const H = 1440;
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
  let lastContext = null;

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

  function readPlayerName() {
    const field = document.querySelector(".identity-row input");
    if (field?.value?.trim()) return field.value.trim();
    try {
      const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
      if (saved.name?.trim()) return saved.name.trim();
    } catch {}
    return "我";
  }

  function readPageText() {
    const parts = [];
    [".comparison-result", ".challenge-result", ".result-card", ".share-studio"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => parts.push(node.textContent || ""));
    });
    document.querySelectorAll(".share-fields input, .share-studio input, .share-studio textarea").forEach((field) => {
      if (field.value) parts.push(field.value);
      if (field.placeholder) parts.push(field.placeholder);
    });
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function parseContext() {
    const challenge = decodeChallenge();
    if (!challenge) return null;
    const text = readPageText();
    const faster = /(?:你快了|我更快|更快|反超|快了?|比[^，。]*快)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const slower = /(?:你慢了|更慢|慢了?|比[^，。]*慢|差一点)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const tie = /打平|平手|平局/.test(text);
    if (!faster && !slower && !tie) return null;
    const delta = Number.parseFloat((faster || slower)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const state = faster ? "faster" : slower ? "slower" : "tie";
    const myElapsed = state === "faster" ? Math.max(0, targetElapsed - delta) : state === "slower" ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    lastContext = {
      myName: readPlayerName(),
      opponent: challenge.name || "TA",
      round,
      targetElapsed,
      myElapsed,
      delta,
      state,
    };
    try { sessionStorage.setItem("pack-clean-pk-context", JSON.stringify(lastContext)); } catch {}
    return lastContext;
  }

  function getContext() {
    return parseContext() || lastContext || (() => {
      try {
        const stored = JSON.parse(sessionStorage.getItem("pack-clean-pk-context") || "null");
        return stored ? { ...stored, myName: readPlayerName() } : null;
      } catch { return null; }
    })();
  }

  function getLabels(context) {
    const rawMe = (context.myName || "我").trim() || "我";
    const rawTa = (context.opponent || "TA").trim() || "TA";
    if (rawMe === rawTa) return { me: "我", ta: "TA" };
    return { me: rawMe, ta: rawTa };
  }

  function buildCopy(context) {
    const { me, ta } = getLabels(context);
    const delta = normalizeSeconds(context.delta || 0);
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

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
    else {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, fill) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function fitText(ctx, text, x, y, maxWidth, size, color = "#fff", weight = 1000) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    let current = size;
    while (current > 20) {
      ctx.font = `${weight} ${current}px ${FONT}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      current -= 3;
    }
    ctx.fillText(text, x, y);
  }

  function badge(ctx, x, y, color, icon, rotate = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 12;
    fillRound(ctx, -78, -58, 156, 116, 30, color);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fillRect(-48, -34, 96, 8);
    ctx.font = `48px system-ui, sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, 0, 8);
    ctx.restore();
  }

  function drawPoster(canvas, context) {
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { me, ta } = getLabels(context);
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const delta = normalizeSeconds(context.delta || 0);
    const result = tie ? "用时打平" : faster ? `快 ${delta} 秒` : `慢 ${delta} 秒`;
    const headline = tie ? "平手再战" : faster ? "反超成功" : "差点追回";

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ed3048";
    ctx.fillRect(0, 0, W / 2, H);
    ctx.fillStyle = "#2451d7";
    ctx.fillRect(W / 2, 0, W / 2, H);
    ctx.fillStyle = "#10121b";
    ctx.fillRect(0, 0, W, 54);
    ctx.fillStyle = "#ffe14a";
    for (let x = -50; x < W; x += 76) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 100, 54); ctx.lineTo(x + 60, 54); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#ffe14a";
    ctx.beginPath();
    ctx.moveTo(492, 54); ctx.lineTo(628, 54); ctx.lineTo(558, 510); ctx.lineTo(656, 510); ctx.lineTo(452, H); ctx.lineTo(515, 760); ctx.lineTo(420, 760); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .16;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(90, 190, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1000, 160, 330, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    fitText(ctx, "PK 回击战", 540, 122, 820, 56, "#fff36b");
    fitText(ctx, `${GAME_NAME} · 第 ${context.round}/${TOTAL_LEVELS} 关`, 540, 184, 860, 32, "#f0fbff", 900);
    fillRound(ctx, 58, 260, 430, 380, 40, "#e92740");
    fillRound(ctx, 592, 260, 430, 380, 40, "#1c52e0");
    fitText(ctx, me, 273, 326, 330, 56, "#fff");
    fitText(ctx, ta, 807, 326, 330, 56, "#fff");
    fitText(ctx, `${normalizeSeconds(context.myElapsed)} 秒`, 273, 560, 330, 80, faster || tie ? "#fff36b" : "#dce8ff");
    fitText(ctx, `${normalizeSeconds(context.targetElapsed)} 秒`, 807, 560, 330, 80, slower || tie ? "#fff36b" : "#dce8ff");
    badge(ctx, 155, 430, "#ffb22e", "🧸", -0.14);
    badge(ctx, 278, 442, "#ff5b76", "📦", 0.1);
    badge(ctx, 382, 425, "#63df76", "🎒", -0.08);
    badge(ctx, 695, 430, "#3aa7ff", "📚", 0.12);
    badge(ctx, 818, 442, "#a970ff", "👕", -0.1);
    badge(ctx, 922, 425, "#26d7e4", "🧃", 0.08);

    ctx.save(); ctx.translate(540, 500); ctx.fillStyle = "#fff36b"; ctx.beginPath();
    for (let i = 0; i < 36; i += 1) {
      const angle = Math.PI * 2 * i / 36;
      const radius = i % 2 ? 118 : 184;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
    fitText(ctx, "VS", 540, 500, 280, 136, "#15122d");

    fillRound(ctx, 100, 894, 880, 176, 48, "rgba(8,8,26,.92)");
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 7; roundRect(ctx, 100, 894, 880, 176, 48); ctx.stroke();
    fitText(ctx, headline, 540, 944, 790, 52, faster ? "#72ff78" : slower ? "#fff36b" : "#35f2ff");
    fitText(ctx, result, 540, 1020, 800, 96, "#fff");
    fitText(ctx, faster ? "我已反超，轮到你追我！" : slower ? "我差一点，下一局追回来！" : "这局打平，再来一箱！", 540, 1150, 900, 48, "#fff6c7");
    fillRound(ctx, 108, 1240, 864, 130, 40, faster ? "#ffe14a" : "#ff6bd1");
    fitText(ctx, faster ? "发回去，让 TA 追我" : slower ? "再来一次，追回来" : "再战一局", 540, 1305, 800, 46, "#141226");
    return true;
  }

  function getDataUrl(context) {
    const canvas = document.createElement("canvas");
    drawPoster(canvas, context);
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

  function closeModal() { document.getElementById("pack-clean-pk-modal")?.remove(); }

  function openModal(context = getContext()) {
    if (!context) return false;
    lastContext = context;
    closeModal();
    document.getElementById("pack-pk-duel-modal")?.remove();
    const oldShare = document.querySelector(".share-studio");
    oldShare?.querySelector("header button")?.click();
    const copy = buildCopy(context);
    const dataUrl = getDataUrl(context);
    const modal = document.createElement("div");
    modal.id = "pack-clean-pk-modal";
    modal.innerHTML = `
      <section class="pack-clean-pk-panel" role="dialog" aria-label="PK 回击战">
        <button class="pack-clean-pk-close" type="button" aria-label="关闭">×</button>
        <div class="pack-clean-pk-head"><span>PK 回击战</span><strong>${copy.title}</strong></div>
        <div class="pack-clean-pk-preview"><img src="${dataUrl}" alt="PK 回击战海报" /></div>
        <div class="pack-clean-pk-actions">
          <button class="pack-clean-pk-share" type="button">分享 PK 图</button>
          <button class="pack-clean-pk-save" type="button">保存图片</button>
          <button class="pack-clean-pk-copy" type="button">复制文案</button>
        </div>
      </section>`;
    document.body.appendChild(modal);
    modal.querySelector(".pack-clean-pk-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
    modal.querySelector(".pack-clean-pk-share").addEventListener("click", async () => {
      const file = dataUrlToFile(dataUrl);
      if (navigator.share) {
        const payload = { title: copy.title, text: copy.text, url: window.location.href };
        if (!navigator.canShare || navigator.canShare({ files: [file] })) payload.files = [file];
        try { await navigator.share(payload); return; } catch {}
      }
      await copyText(`${copy.title}\n${copy.text}\n${window.location.href}`);
    });
    modal.querySelector(".pack-clean-pk-save").addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "谁最能装-PK回击.png";
      link.click();
    });
    modal.querySelector(".pack-clean-pk-copy").addEventListener("click", () => copyText(`${copy.title}\n${copy.text}\n${window.location.href}`));
    return true;
  }

  function injectStyle() {
    if (document.getElementById("pack-clean-pk-style")) return;
    const style = document.createElement("style");
    style.id = "pack-clean-pk-style";
    style.textContent = `
      #pack-clean-pk-modal { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 16px; background: rgba(4,5,18,.84); backdrop-filter: blur(14px); }
      .pack-clean-pk-panel { width: min(680px, 96vw); max-height: 94vh; overflow: auto; border-radius: 34px; padding: 22px; color: #fff; background: linear-gradient(135deg, #e93247 0%, #30145e 50%, #2254e6 100%); border: 4px solid #ffe14a; box-shadow: 0 30px 90px rgba(0,0,0,.58); position: relative; }
      .pack-clean-pk-close { position: absolute; top: 18px; right: 18px; width: 56px; height: 56px; border-radius: 18px; border: 2px solid rgba(255,255,255,.7); background: rgba(8,12,28,.72); color: #fff; font-size: 40px; line-height: 1; }
      .pack-clean-pk-head { padding-right: 76px; margin-bottom: 14px; }
      .pack-clean-pk-head span { display: block; color: #fff044; font-size: 22px; font-weight: 1000; letter-spacing: .08em; }
      .pack-clean-pk-head strong { display: block; margin-top: 8px; color: #fff; font-size: clamp(30px, 6vw, 48px); line-height: 1.08; }
      .pack-clean-pk-preview { display: grid; place-items: center; padding: 12px; border-radius: 26px; background: rgba(0,0,0,.3); }
      .pack-clean-pk-preview img { display: block; width: min(340px, 76vw); max-height: 58vh; object-fit: contain; border-radius: 18px; box-shadow: 0 20px 54px rgba(0,0,0,.44); }
      .pack-clean-pk-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-top: 16px; }
      .pack-clean-pk-actions button { min-height: 58px; border: 0; border-radius: 18px; font-size: 19px; font-weight: 1000; color: #17122b; background: linear-gradient(180deg, #fff044 0%, #ff9b31 60%, #ff5f87 100%); }
      @media (max-width: 680px) { .pack-clean-pk-actions { grid-template-columns: 1fr; } .pack-clean-pk-panel { padding: 20px; } }
    `;
    document.head.appendChild(style);
  }

  function cleanOrdinaryMotto() {
    const motto = [...document.querySelectorAll(".share-fields input")].find((input) => !input.closest(".identity-row"));
    if (!motto) return;
    const value = motto.value || "";
    if (/\bPK\b|回击|反超|比.+(?:快|慢)\s*\d+(?:\.\d+)?\s*秒/.test(value) && !getContext()) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      if (setter) setter.call(motto, ""); else motto.value = "";
      motto.dispatchEvent(new Event("input", { bubbles: true }));
      motto.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (!motto.placeholder || /\bPK\b|回击|比.+秒/.test(motto.placeholder)) motto.placeholder = DEFAULT_MOTTO;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button, a");
    if (!button) return;
    const text = (button.textContent || "").replace(/\s+/g, "");
    const context = getContext();
    if (!context) return;
    if (!/我更快|发回去|打平了|喊TA|晒战绩|分享图片|分享PK图|生成我的装箱战绩|追一次/.test(text)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal(context);
  }, true);

  function enforce() {
    injectStyle();
    cleanOrdinaryMotto();
    const context = getContext();
    const studio = document.querySelector(".share-studio");
    if (context && studio && /PK|回击|反超|比.+(?:快|慢)\s*\d+(?:\.\d+)?\s*秒|快了?\s*\d+(?:\.\d+)?\s*秒|慢了?\s*\d+(?:\.\d+)?\s*秒/.test(studio.textContent || readPageText())) {
      studio.querySelector("header button")?.click();
      requestAnimationFrame(() => openModal(context));
    }
  }

  injectStyle();
  setInterval(enforce, 300);
  new MutationObserver(() => requestAnimationFrame(enforce)).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "value"] });
  window.__packPkControllerV2 = { openModal, getContext, drawPoster, buildCopy };
})();
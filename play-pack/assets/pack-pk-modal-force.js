(() => {
  const W = 1080;
  const H = 1440;
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
  let cachedKey = "";
  let cachedDataUrl = "";
  let lastFile = null;

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

  function readAllText() {
    const parts = [];
    const comparison = document.querySelector(".comparison-result");
    if (comparison) parts.push(comparison.textContent || "");
    document.querySelectorAll(".share-fields input, .share-studio input, .share-studio textarea").forEach((field) => {
      if (field.value) parts.push(field.value);
    });
    const studio = document.querySelector(".share-studio");
    if (studio) parts.push(studio.textContent || "");
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function inferContext() {
    const challenge = decodeChallenge();
    if (!challenge || !document.querySelector(".share-studio")) return null;
    const text = readAllText();
    const deltaMatch = text.match(/(?:快了?|慢了?)\s*(\d+(?:\.\d+)?)\s*秒/);
    const fast = /快了?\s*\d/.test(text) || /反超成功/.test(text);
    const slow = /慢了?\s*\d/.test(text) || /差一点/.test(text);
    const tie = /打平|平手|平局/.test(text);
    if (!deltaMatch && !tie) return null;

    const delta = deltaMatch ? Number.parseFloat(deltaMatch[1]) : 0;
    const targetElapsed = Number(challenge.elapsed) || 0;
    const state = tie ? "tie" : fast ? "faster" : slow ? "slower" : null;
    if (!state) return null;

    const pkMatch = text.match(/([^\s，。]+)\s*比\s*([^\s，。]+)\s*(快了?|慢了?)\s*\d+(?:\.\d+)?\s*秒/);
    const myName = pkMatch?.[1] || readPlayerName();
    const opponent = challenge.name || pkMatch?.[2] || "TA";
    const myElapsed = state === "faster" ? Math.max(0, targetElapsed - delta) : state === "slower" ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    const context = { myName, opponent, round, targetElapsed, myElapsed, delta, state };
    try { sessionStorage.setItem("pack-last-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, radius);
    else {
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
  }

  function fillRoundRect(ctx, x, y, w, h, r, fill) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function fitText(ctx, text, x, y, maxWidth, size, color = "#fff", weight = 1000) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    let current = size;
    while (current > 24) {
      ctx.font = `${weight} ${current}px ${FONT}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      current -= 3;
    }
    ctx.fillText(text, x, y);
  }

  function drawCaution(ctx) {
    ctx.fillStyle = "#ffe04a";
    ctx.fillRect(0, 0, W, 48);
    ctx.fillStyle = "#111218";
    for (let x = -80; x < W; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 38, 0);
      ctx.lineTo(x + 92, 48);
      ctx.lineTo(x + 54, 48);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawCard(ctx, x, y, color, icon, rotate, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    const w = 176 * scale;
    const h = 136 * scale;
    ctx.shadowColor = "rgba(0,0,0,.44)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 12;
    fillRoundRect(ctx, -w / 2, -h / 2, w, h, 30 * scale, color);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.58)";
    ctx.lineWidth = 5 * scale;
    roundRect(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 24 * scale);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fillRect(-w / 2 + 22 * scale, -h / 2 + 20 * scale, w - 44 * scale, 10 * scale);
    ctx.font = `${58 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, 5 * scale);
    ctx.restore();
  }

  function drawSide(ctx, left, winner, name) {
    const panelX = left ? 64 : 586;
    const baseX = left ? 250 : 830;
    const panelColor = left ? "#f02d45" : "#2354e6";
    const accent = winner ? "#fff044" : "#dfe8ff";
    ctx.save();
    ctx.shadowColor = left ? "rgba(255,45,66,.55)" : "rgba(30,86,240,.55)";
    ctx.shadowBlur = winner ? 44 : 18;
    fillRoundRect(ctx, panelX, 318, 430, 548, 42, panelColor);
    ctx.restore();
    ctx.strokeStyle = accent;
    ctx.lineWidth = winner ? 9 : 5;
    roundRect(ctx, panelX, 318, 430, 548, 42);
    ctx.stroke();

    fillRoundRect(ctx, panelX + 32, 350, 160, 58, 29, accent);
    fitText(ctx, left ? "挑战者" : "守擂者", panelX + 112, 379, 140, 28, "#17122b", 1000);
    fitText(ctx, name, baseX, 458, 335, 58, "#fff", 1000);

    const cards = left
      ? [["🧸", -98, 58, -0.18, 1.05, "#ffb52f"], ["📦", 34, 120, 0.12, 1.12, "#ff354b"], ["🧰", -76, 244, 0.1, 1, "#ff65bd"], ["🎒", 90, 272, -0.1, 1.03, "#39df72"]]
      : [["📦", 98, 58, 0.18, 1.05, "#35a7ff"], ["📚", -34, 120, -0.12, 1.12, "#a56bff"], ["👕", 76, 244, -0.1, 1, "#25d9e7"], ["🧃", -90, 272, 0.1, 1.03, "#39df72"]];
    cards.forEach(([icon, dx, dy, rotate, scale, color]) => drawCard(ctx, baseX + dx, 518 + dy, color, icon, rotate, scale));
  }

  function drawBurst(ctx, x, y, radius, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = fill;
    ctx.shadowColor = "rgba(255,255,255,.58)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    for (let i = 0; i < 36; i += 1) {
      const angle = (Math.PI * 2 * i) / 36;
      const r = i % 2 ? radius * 0.62 : radius;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPoster(canvas, context) {
    const ctx = canvas.getContext("2d");
    if (!ctx || !context) return false;
    canvas.width = W;
    canvas.height = H;
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const delta = normalizeSeconds(context.delta || 0);
    const resultText = tie ? "用时打平" : faster ? `我快 ${delta} 秒` : `我慢 ${delta} 秒`;
    const headline = faster ? "反超成功！" : slower ? "差一点，继续追！" : "平手，再战！";
    const myWinner = faster || tie;
    const opponentWinner = slower || tie;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ed3048";
    ctx.fillRect(0, 0, W / 2, H);
    ctx.fillStyle = "#2451d7";
    ctx.fillRect(W / 2, 0, W / 2, H);
    drawCaution(ctx);
    ctx.fillStyle = "#ffe04a";
    ctx.beginPath();
    ctx.moveTo(493, 0); ctx.lineTo(632, 0); ctx.lineTo(558, 430); ctx.lineTo(652, 430); ctx.lineTo(454, H); ctx.lineTo(516, 748); ctx.lineTo(420, 748); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.17;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(90, 190, 270, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1000, 160, 320, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    fitText(ctx, "PACK BATTLE", 540, 100, 760, 48, "#fff044", 1000);
    fitText(ctx, "PK 回击战", 540, 174, 860, 86, "#fff", 1000);
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关 · ${GAME_NAME}`, 540, 238, 850, 36, "#effcff", 1000);
    drawSide(ctx, true, myWinner, context.myName || "我");
    drawSide(ctx, false, opponentWinner, context.opponent || "TA");
    drawBurst(ctx, 540, 620, 178, faster ? "#fff044" : slower ? "#ff72d1" : "#35f2ff");
    fitText(ctx, "VS", 540, 614, 270, 140, "#15122d", 1000);

    fillRoundRect(ctx, 100, 894, 880, 176, 48, "rgba(8,8,26,.9)");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    roundRect(ctx, 100, 894, 880, 176, 48); ctx.stroke();
    fitText(ctx, headline, 540, 944, 790, 50, faster ? "#72ff78" : slower ? "#fff044" : "#35f2ff", 1000);
    fitText(ctx, resultText, 540, 1020, 800, 94, "#fff", 1000);

    fillRoundRect(ctx, 88, 1112, 420, 188, 36, "rgba(0,0,0,.42)");
    fillRoundRect(ctx, 572, 1112, 420, 188, 36, "rgba(0,0,0,.42)");
    ctx.strokeStyle = "rgba(255,255,255,.62)";
    ctx.lineWidth = 3;
    roundRect(ctx, 88, 1112, 420, 188, 36); ctx.stroke();
    roundRect(ctx, 572, 1112, 420, 188, 36); ctx.stroke();
    fitText(ctx, context.myName || "我", 298, 1160, 340, 40, "#fff", 1000);
    fitText(ctx, context.opponent || "TA", 782, 1160, 340, 40, "#fff", 1000);
    fitText(ctx, `${normalizeSeconds(context.myElapsed)} 秒`, 298, 1238, 340, 74, myWinner ? "#fff044" : "#dfe8ff", 1000);
    fitText(ctx, `${normalizeSeconds(context.targetElapsed)} 秒`, 782, 1238, 340, 74, opponentWinner ? "#fff044" : "#dfe8ff", 1000);
    fitText(ctx, faster ? "我已反超，轮到你追我！" : slower ? "这局先认输，下一把追回来！" : "完全打平，再来一局！", 540, 1370, 900, 50, "#fff6c7", 1000);
    return true;
  }

  function getDataUrl(context) {
    const key = JSON.stringify(context);
    if (key === cachedKey && cachedDataUrl) return cachedDataUrl;
    const canvas = document.createElement("canvas");
    drawPoster(canvas, context);
    cachedKey = key;
    cachedDataUrl = canvas.toDataURL("image/png");
    return cachedDataUrl;
  }

  function dataUrlToFile(dataUrl) {
    const [meta, body] = dataUrl.split(",");
    const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], "谁最能装-PK回击.png", { type: mime });
  }

  function applyModal() {
    const context = inferContext();
    if (!context) return;
    const dataUrl = getDataUrl(context);
    document.querySelectorAll(".share-card-preview img, .wechat-image-scroll img").forEach((image) => {
      if (image.src !== dataUrl) image.src = dataUrl;
      image.alt = "PK 回击战海报";
      image.dataset.pkForcedPoster = "1";
    });
    const title = document.querySelector(".share-studio header h2");
    if (title) title.textContent = "把战绩发回去";
    const label = document.querySelector(".share-studio header span");
    if (label) label.textContent = "PK 回击战";
  }

  function patchDownload() {
    if (HTMLAnchorElement.prototype.__packPkForceDownload) return;
    const nativeClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedClick(...args) {
      const context = inferContext();
      if (context && this.download && this.href?.startsWith("data:image/")) {
        this.href = getDataUrl(context);
        this.download = "谁最能装-PK回击.png";
      }
      return nativeClick.apply(this, args);
    };
    HTMLAnchorElement.prototype.__packPkForceDownload = true;
  }

  function patchShare() {
    if (!navigator.share || navigator.share.__packPkForceShare) return;
    const nativeShare = navigator.share.bind(navigator);
    const wrapped = async (payload = {}) => {
      const context = inferContext();
      if (!context) return nativeShare(payload);
      const dataUrl = getDataUrl(context);
      const file = dataUrlToFile(dataUrl);
      const delta = normalizeSeconds(context.delta || 0);
      const result = context.state === "faster" ? `快了 ${delta} 秒` : context.state === "slower" ? `慢了 ${delta} 秒` : "用时打平";
      const text = `${context.myName || "我"} PK ${context.opponent || "TA"}，在《${GAME_NAME}》第 ${context.round}/${TOTAL_LEVELS} 关${result}！我 ${normalizeSeconds(context.myElapsed)} 秒，${context.opponent || "TA"} ${normalizeSeconds(context.targetElapsed)} 秒。继续 PK。`;
      const nextPayload = { ...payload, title: "谁最能装？PK 回击战", text };
      if (!navigator.canShare || navigator.canShare({ files: [file] })) nextPayload.files = [file];
      return nativeShare(nextPayload);
    };
    wrapped.__packPkForceShare = true;
    try { Object.defineProperty(navigator, "share", { configurable: true, value: wrapped }); }
    catch { navigator.share = wrapped; }
  }

  function run() {
    patchDownload();
    patchShare();
    applyModal();
  }

  window.__packForcePkModalPoster = { inferContext, getDataUrl, drawPoster };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["src", "class", "value"],
  });
  setInterval(run, 450);
})();
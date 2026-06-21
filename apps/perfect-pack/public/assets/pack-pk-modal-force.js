(() => {
  const W = 1080;
  const H = 1440;
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
  let cachedKey = "";
  let cachedDataUrl = "";

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
    return { myName, opponent, round, targetElapsed, myElapsed, delta, state };
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
    ctx.fillStyle = "#ffe04a";
    ctx.fillRect(0, 0, W, 48);
    ctx.fillStyle = "#111218";
    for (let x = -80; x < W; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 38, 0); ctx.lineTo(x + 92, 48); ctx.lineTo(x + 54, 48); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#ffe04a";
    ctx.beginPath(); ctx.moveTo(493, 0); ctx.lineTo(632, 0); ctx.lineTo(558, 430); ctx.lineTo(652, 430); ctx.lineTo(454, H); ctx.lineTo(516, 748); ctx.lineTo(420, 748); ctx.closePath(); ctx.fill();

    fitText(ctx, "PACK BATTLE", 540, 100, 760, 48, "#fff044", 1000);
    fitText(ctx, "PK 回击战", 540, 174, 860, 86, "#fff", 1000);
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关 · ${GAME_NAME}`, 540, 238, 850, 36, "#effcff", 1000);

    function side(left, winner, name) {
      const x = left ? 64 : 586;
      const baseX = left ? 250 : 830;
      const panel = left ? "#f02d45" : "#2354e6";
      const accent = winner ? "#fff044" : "#dfe8ff";
      fillRoundRect(ctx, x, 318, 430, 548, 42, panel);
      ctx.strokeStyle = accent; ctx.lineWidth = winner ? 9 : 5; roundRect(ctx, x, 318, 430, 548, 42); ctx.stroke();
      fillRoundRect(ctx, x + 32, 350, 160, 58, 29, accent);
      fitText(ctx, left ? "挑战者" : "守擂者", x + 112, 379, 140, 28, "#17122b", 1000);
      fitText(ctx, name, baseX, 458, 335, 58, "#fff", 1000);
      const cards = left ? [["🧸", -98, 58, -0.18, "#ffb52f"], ["📦", 34, 120, 0.12, "#ff354b"], ["🧰", -76, 244, 0.1, "#ff65bd"], ["🎒", 90, 272, -0.1, "#39df72"]] : [["📦", 98, 58, 0.18, "#35a7ff"], ["📚", -34, 120, -0.12, "#a56bff"], ["👕", 76, 244, -0.1, "#25d9e7"], ["🧃", -90, 272, 0.1, "#39df72"]];
      cards.forEach(([icon, dx, dy, rotate, color]) => {
        ctx.save(); ctx.translate(baseX + dx, 518 + dy); ctx.rotate(rotate); fillRoundRect(ctx, -88, -68, 176, 136, 30, color); ctx.font = `58px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.fillText(icon, 0, 5); ctx.restore();
      });
    }
    side(true, myWinner, context.myName || "我");
    side(false, opponentWinner, context.opponent || "TA");

    ctx.save(); ctx.translate(540, 620); ctx.fillStyle = faster ? "#fff044" : slower ? "#ff72d1" : "#35f2ff"; ctx.beginPath(); for (let i = 0; i < 36; i += 1) { const a = Math.PI * 2 * i / 36; const r = i % 2 ? 110 : 178; const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fill(); ctx.restore();
    fitText(ctx, "VS", 540, 614, 270, 140, "#15122d", 1000);

    fillRoundRect(ctx, 100, 894, 880, 176, 48, "rgba(8,8,26,.9)");
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 7; roundRect(ctx, 100, 894, 880, 176, 48); ctx.stroke();
    fitText(ctx, headline, 540, 944, 790, 50, faster ? "#72ff78" : slower ? "#fff044" : "#35f2ff", 1000);
    fitText(ctx, resultText, 540, 1020, 800, 94, "#fff", 1000);

    fillRoundRect(ctx, 88, 1112, 420, 188, 36, "rgba(0,0,0,.42)");
    fillRoundRect(ctx, 572, 1112, 420, 188, 36, "rgba(0,0,0,.42)");
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyModal, { once: true });
  else applyModal();
  new MutationObserver(() => requestAnimationFrame(applyModal)).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["src", "class", "value"] });
  setInterval(applyModal, 450);
})();
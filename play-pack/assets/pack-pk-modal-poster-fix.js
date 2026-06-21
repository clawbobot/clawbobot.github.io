(() => {
  const W = 1080;
  const H = 1440;
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
  const COLORS = ["#ff354b", "#ffb52f", "#39df72", "#35a7ff", "#a56bff", "#25d9e7", "#ff65bd"];

  function decodeChallengeFromUrl() {
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

  function readMyName() {
    const field = document.querySelector(".identity-row input");
    if (field?.value?.trim()) return field.value.trim();
    try {
      const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
      if (saved.name?.trim()) return saved.name.trim();
    } catch {}
    return "我";
  }

  function readContextFromComparison() {
    const comparison = document.querySelector(".comparison-result");
    const challenge = decodeChallengeFromUrl();
    if (!comparison || !challenge) return null;
    const text = comparison.textContent || "";
    const isFaster = /你快了|快了|更快|反超|赢/.test(text);
    const isSlower = /慢了|更慢|差一点|追/.test(text);
    const isTie = /打平|平局/.test(text);
    if (!isFaster && !isSlower && !isTie) return null;
    const delta = Number.parseFloat(text.match(/(\d+(?:\.\d+)?)\s*秒/)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const myElapsed = isFaster ? Math.max(0, targetElapsed - delta) : isSlower ? targetElapsed + delta : targetElapsed;
    const context = {
      myName: readMyName(),
      opponent: challenge.name || "分享者",
      round: Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1,
      targetElapsed,
      myElapsed,
      delta,
      state: isFaster ? "faster" : isSlower ? "slower" : "tie",
    };
    try { sessionStorage.setItem("pack-last-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function readContext() {
    const current = readContextFromComparison();
    if (current) return current;
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-last-pk-context") || sessionStorage.getItem("pack-current-pk-context") || "null");
      if (stored?.opponent) return { ...stored, myName: readMyName() };
    } catch {}
    return null;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, r);
      return;
    }
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
  }

  function fillRoundRect(ctx, x, y, width, height, radius, fill) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function fitText(ctx, text, x, y, maxWidth, fontSize, color = "#fff", weight = 1000, align = "center") {
    let size = fontSize;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    do {
      ctx.font = `${weight} ${size}px ${FONT}`;
      if (ctx.measureText(text).width <= maxWidth || size <= 24) break;
      size -= 4;
    } while (size > 24);
    ctx.fillText(text, x, y);
  }

  function formatSeconds(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? `${number}` : `${Math.round(number * 10) / 10}`;
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

  function drawLightning(ctx) {
    ctx.save();
    ctx.fillStyle = "#ffe04a";
    ctx.shadowColor = "rgba(255,224,74,.72)";
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.moveTo(493, 0);
    ctx.lineTo(632, 0);
    ctx.lineTo(558, 430);
    ctx.lineTo(652, 430);
    ctx.lineTo(454, H);
    ctx.lineTo(516, 748);
    ctx.lineTo(420, 748);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBurst(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(255,255,255,.52)";
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

  function drawCard(ctx, { x, y, color, icon, label, rotate = 0, scale = 1 }) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    const w = 178 * scale;
    const h = 138 * scale;
    ctx.shadowColor = "rgba(0,0,0,.38)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 12;
    fillRoundRect(ctx, -w / 2, -h / 2, w, h, 30 * scale, color);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 4 * scale;
    roundRect(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 24 * scale);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(-w / 2 + 22 * scale, -h / 2 + 20 * scale, w - 44 * scale, 10 * scale);
    ctx.font = `${48 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, -4 * scale);
    fitText(ctx, label, 0, h / 2 - 28 * scale, w - 30 * scale, 22 * scale, "#11142b", 1000);
    ctx.restore();
  }

  function drawSide(ctx, side, context, winner) {
    const left = side === "left";
    const x = left ? 64 : 586;
    const baseX = left ? 250 : 830;
    const name = left ? context.myName || "我" : context.opponent || "TA";
    const panelColor = left ? "rgba(255,45,66,.96)" : "rgba(30,76,226,.96)";
    const labelColor = winner ? "#fff044" : "#e6edff";
    ctx.save();
    ctx.shadowColor = left ? "rgba(255,45,66,.58)" : "rgba(40,105,255,.58)";
    ctx.shadowBlur = winner ? 42 : 18;
    fillRoundRect(ctx, x, 318, 430, 548, 42, panelColor);
    ctx.restore();
    ctx.strokeStyle = winner ? "#fff044" : "rgba(255,255,255,.48)";
    ctx.lineWidth = winner ? 9 : 5;
    roundRect(ctx, x, 318, 430, 548, 42);
    ctx.stroke();

    fillRoundRect(ctx, x + 32, 350, 160, 58, 29, labelColor);
    fitText(ctx, left ? "挑战者" : "守擂者", x + 112, 379, 140, 27, winner ? "#17122b" : "#263775", 1000);
    fitText(ctx, name, baseX, 458, 335, 56, "#fff", 1000);

    const cards = left
      ? [
          ["🧸", "我", -98, 56, -0.18, 1.02, COLORS[1]],
          ["📦", "反超", 32, 118, 0.12, 1.08, COLORS[0]],
          ["🧰", "出手", -78, 242, 0.10, 0.98, COLORS[6]],
          ["🎒", "加速", 88, 270, -0.10, 1.0, COLORS[2]],
        ]
      : [
          ["📦", "TA", 96, 56, 0.18, 1.02, COLORS[3]],
          ["📚", "守擂", -32, 118, -0.12, 1.08, COLORS[4]],
          ["👕", "接招", 78, 242, -0.10, 0.98, COLORS[5]],
          ["🧃", "再战", -88, 270, 0.10, 1.0, COLORS[2]],
        ];
    cards.forEach(([icon, label, dx, dy, rotate, scale, color]) => {
      drawCard(ctx, { x: baseX + dx, y: 518 + dy, color, icon, label, rotate, scale });
    });
  }

  function drawDuelPoster(canvas, context) {
    const ctx = canvas.getContext("2d");
    if (!ctx || !context) return false;
    canvas.width = W;
    canvas.height = H;

    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const delta = formatSeconds(context.delta || 0);
    const myWinner = faster || tie;
    const opponentWinner = slower || tie;
    const resultText = tie ? "用时打平" : faster ? `我快 ${delta} 秒` : `我慢 ${delta} 秒`;
    const headline = faster ? "反超成功！" : slower ? "差一点，继续追！" : "平手，再战！";

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ed3048";
    ctx.fillRect(0, 0, W / 2, H);
    ctx.fillStyle = "#2451d7";
    ctx.fillRect(W / 2, 0, W / 2, H);
    drawCaution(ctx);
    drawLightning(ctx);

    ctx.globalAlpha = 0.17;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(90, 190, 270, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1000, 160, 320, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    fitText(ctx, "PACK BATTLE", 540, 100, 760, 46, "#fff044", 1000);
    fitText(ctx, "PK 回击战", 540, 174, 860, 82, "#fff", 1000);
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关 · ${GAME_NAME}`, 540, 238, 850, 34, "#effcff", 1000);

    drawSide(ctx, "left", context, myWinner);
    drawSide(ctx, "right", context, opponentWinner);

    drawBurst(ctx, 540, 620, 178, faster ? "#fff044" : slower ? "#ff72d1" : "#35f2ff");
    fitText(ctx, "VS", 540, 614, 270, 138, "#15122d", 1000);

    fillRoundRect(ctx, 100, 894, 880, 176, 48, "rgba(8,8,26,.86)");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    roundRect(ctx, 100, 894, 880, 176, 48);
    ctx.stroke();
    fitText(ctx, headline, 540, 944, 790, 48, faster ? "#72ff78" : slower ? "#fff044" : "#35f2ff", 1000);
    fitText(ctx, resultText, 540, 1020, 800, 92, "#fff", 1000);

    fillRoundRect(ctx, 88, 1112, 420, 188, 36, "rgba(0,0,0,.32)");
    fillRoundRect(ctx, 572, 1112, 420, 188, 36, "rgba(0,0,0,.32)");
    ctx.strokeStyle = "rgba(255,255,255,.44)";
    ctx.lineWidth = 3;
    roundRect(ctx, 88, 1112, 420, 188, 36); ctx.stroke();
    roundRect(ctx, 572, 1112, 420, 188, 36); ctx.stroke();

    fitText(ctx, context.myName || "我", 298, 1160, 340, 38, "#fff", 1000);
    fitText(ctx, context.opponent || "TA", 782, 1160, 340, 38, "#fff", 1000);
    fitText(ctx, `${formatSeconds(context.myElapsed)} 秒`, 298, 1238, 340, 72, myWinner ? "#fff044" : "#dfe8ff", 1000);
    fitText(ctx, `${formatSeconds(context.targetElapsed)} 秒`, 782, 1238, 340, 72, opponentWinner ? "#fff044" : "#dfe8ff", 1000);

    const slogan = faster ? "我已反超，轮到你追我！" : slower ? "这局先认输，下一把追回来！" : "完全打平，再来一局！";
    fitText(ctx, slogan, 540, 1370, 900, 48, "#fff6c7", 1000);
    return true;
  }

  function getPosterDataUrl(context) {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    drawDuelPoster(canvas, context);
    return canvas.toDataURL("image/png");
  }

  function getPosterBlob(context) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      drawDuelPoster(canvas, context);
      canvas.toBlob(resolve, "image/png", 0.95);
    });
  }

  async function getPosterFile(context) {
    const blob = await getPosterBlob(context);
    if (!blob || typeof File === "undefined") return null;
    return new File([blob], "谁最能装-PK回击.png", { type: "image/png" });
  }

  function replaceShareModalImages() {
    const context = readContext();
    if (!context) return;
    const dataUrl = getPosterDataUrl(context);
    document.querySelectorAll(".share-card-preview img, .wechat-image-scroll img").forEach((img) => {
      if (img.dataset.packPkDuelPreview === "1" && img.src === dataUrl) return;
      img.dataset.packPkDuelPreview = "1";
      img.src = dataUrl;
      img.alt = "PK 回击战绩海报";
    });
  }

  function patchDownloads() {
    if (HTMLAnchorElement.prototype.__packPkModalDownloadFixed) return;
    const nativeClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function packPkDownloadClick(...args) {
      const context = readContext();
      if (
        context &&
        typeof this.download === "string" &&
        /这也能装|谁最能装|装箱/.test(this.download) &&
        typeof this.href === "string" &&
        this.href.startsWith("data:image/")
      ) {
        this.href = getPosterDataUrl(context);
        this.download = "谁最能装-PK回击.png";
      }
      return nativeClick.apply(this, args);
    };
    HTMLAnchorElement.prototype.__packPkModalDownloadFixed = true;
  }

  function patchNavigatorShare() {
    if (!navigator.share || navigator.share.__packPkModalPosterFixed) return;
    const nativeShare = navigator.share.bind(navigator);
    const wrapped = async (payload = {}) => {
      const context = readContext();
      if (!context) return nativeShare(payload);
      const combined = `${payload.title || ""}\n${payload.text || ""}`;
      const isPackShare = combined.includes(GAME_NAME) || combined.includes("这也能装") || Boolean(document.querySelector(".share-studio"));
      if (!isPackShare) return nativeShare(payload);
      const file = await getPosterFile(context);
      const delta = formatSeconds(context.delta || 0);
      const roundText = `第 ${context.round}/${TOTAL_LEVELS} 关`;
      const resultText = context.state === "faster" ? `快了 ${delta} 秒` : context.state === "slower" ? `慢了 ${delta} 秒` : "用时打平";
      const text = `${context.myName || "我"} PK ${context.opponent || "TA"}，在《${GAME_NAME}》${roundText}${resultText}！我 ${formatSeconds(context.myElapsed)} 秒，${context.opponent || "TA"} ${formatSeconds(context.targetElapsed)} 秒。继续 PK。`;
      const nextPayload = { ...payload, title: "谁最能装？PK 回击战", text };
      if (file && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        nextPayload.files = [file];
      }
      return nativeShare(nextPayload);
    };
    wrapped.__packPkModalPosterFixed = true;
    try { Object.defineProperty(navigator, "share", { configurable: true, value: wrapped }); }
    catch { navigator.share = wrapped; }
  }

  function run() {
    readContextFromComparison();
    patchDownloads();
    patchNavigatorShare();
    replaceShareModalImages();
  }

  window.__packDuelPoster = {
    ...(window.__packDuelPoster || {}),
    W,
    H,
    readPkContext: readContext,
    drawDuelPkPoster: drawDuelPoster,
    createPkPosterFile: getPosterFile,
    getPkPosterDataUrl: getPosterDataUrl,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();

  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["src", "class", "value"],
  });
})();
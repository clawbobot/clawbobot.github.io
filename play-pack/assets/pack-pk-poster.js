(() => {
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const W = 1080;
  const H = 1440;
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
  const ITEM_COLORS = ["#ff4d5f", "#ffb22e", "#35d967", "#39a8ff", "#a66cff", "#26d7e4", "#ff66bf"];
  const ITEM_ICONS = ["📦", "🧸", "🎒", "📚", "👕", "🧃", "🧰"];

  function injectPkButtonStyle() {
    if (document.getElementById("pack-pk-poster-style")) return;
    const style = document.createElement("style");
    style.id = "pack-pk-poster-style";
    style.textContent = `
      .pack-pk-retry {
        position: relative !important;
        overflow: hidden !important;
        min-height: 56px !important;
        border: 0 !important;
        border-radius: 22px !important;
        color: #231300 !important;
        font-weight: 1000 !important;
        letter-spacing: .02em !important;
        background:
          radial-gradient(circle at 18% 18%, rgba(255,255,255,.72), transparent 24%),
          linear-gradient(135deg, #ffe95f 0%, #ffb12e 42%, #ff5cc8 100%) !important;
        box-shadow:
          0 16px 30px rgba(255, 88, 184, .34),
          0 0 0 3px rgba(255, 238, 95, .18),
          inset 0 -5px 0 rgba(91, 36, 0, .18) !important;
        animation: packPkButtonBounce 1.25s ease-in-out infinite !important;
      }
      .pack-pk-retry::after {
        content: "";
        position: absolute;
        inset: 4px 12px auto 12px;
        height: 12px;
        border-radius: 999px;
        background: rgba(255,255,255,.42);
        pointer-events: none;
      }
      .pack-pk-retry:active { transform: translateY(2px) scale(.99) !important; }
      @keyframes packPkButtonBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-2px) scale(1.025); }
      }
    `;
    document.head.appendChild(style);
  }

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

  function readPkContextFromDom() {
    const comparison = document.querySelector(".comparison-result");
    const challenge = decodeChallengeFromUrl();
    if (!comparison || !challenge) return null;
    const text = comparison.textContent || "";
    const isFaster = /快了|更快|反超|赢/.test(text);
    const isSlower = /慢了|更慢|差一点|追/.test(text);
    const isTie = /打平|平局/.test(text);
    if (!isFaster && !isSlower && !isTie) return null;
    const delta = Number.parseFloat(text.match(/(\d+(?:\.\d+)?)\s*秒/)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const myElapsed = isFaster ? Math.max(0, targetElapsed - delta) : isSlower ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    const context = {
      myName: readMyName(),
      opponent: challenge.name || "分享者",
      round,
      targetElapsed,
      myElapsed,
      delta,
      state: isFaster ? "faster" : isSlower ? "slower" : "tie",
    };
    try { sessionStorage.setItem("pack-last-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function readPkContext() {
    const current = readPkContextFromDom();
    if (current) return current;
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-last-pk-context") || sessionStorage.getItem("pack-current-pk-context") || "null");
      return stored?.opponent ? { ...stored, myName: readMyName() } : null;
    } catch {
      return null;
    }
  }

  function formatSeconds(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? `${number}` : `${Math.round(number * 10) / 10}`;
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
    ctx.closePath();
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
      if (ctx.measureText(text).width <= maxWidth || size <= 22) break;
      size -= 3;
    } while (size > 22);
    ctx.fillText(text, x, y);
  }

  function drawLightning(ctx) {
    ctx.save();
    ctx.fillStyle = "#ffe14a";
    ctx.shadowColor = "rgba(255,225,74,.55)";
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.moveTo(501, 0);
    ctx.lineTo(618, 0);
    ctx.lineTo(552, 438);
    ctx.lineTo(638, 438);
    ctx.lineTo(463, 1440);
    ctx.lineTo(515, 744);
    ctx.lineTo(431, 744);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCaution(ctx) {
    ctx.fillStyle = "#ffe14a";
    ctx.fillRect(0, 0, W, 42);
    ctx.fillStyle = "#111218";
    for (let x = -80; x < W; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 34, 0);
      ctx.lineTo(x + 86, 42);
      ctx.lineTo(x + 52, 42);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawCard(ctx, { x, y, color, icon, label, rotate = 0, scale = 1 }) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    const w = 170 * scale;
    const h = 132 * scale;
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 12;
    fillRoundRect(ctx, -w / 2, -h / 2, w, h, 28 * scale, color);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.34)";
    ctx.lineWidth = 3 * scale;
    roundRect(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 24 * scale);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fillRect(-w / 2 + 20 * scale, -h / 2 + 18 * scale, w - 40 * scale, 8 * scale);
    ctx.font = `${46 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, -2 * scale);
    fitText(ctx, label, 0, h / 2 - 28 * scale, w - 28 * scale, 22 * scale, "#11142b", 1000);
    ctx.restore();
  }

  function drawPlayerStack(ctx, side, context, winner) {
    const left = side === "left";
    const baseX = left ? 248 : 832;
    const name = left ? context.myName || "我" : context.opponent || "TA";
    const label = left ? "挑战者" : "守擂者";
    const panelColor = left ? "rgba(255,44,66,.92)" : "rgba(30,78,225,.92)";
    const accent = winner ? "#fff36b" : "rgba(255,255,255,.78)";

    ctx.save();
    ctx.shadowColor = left ? "rgba(255,44,66,.45)" : "rgba(40,110,255,.45)";
    ctx.shadowBlur = winner ? 34 : 18;
    fillRoundRect(ctx, left ? 64 : 586, 314, 430, 540, 42, panelColor);
    ctx.restore();
    ctx.strokeStyle = winner ? "#fff36b" : "rgba(255,255,255,.34)";
    ctx.lineWidth = winner ? 8 : 4;
    roundRect(ctx, left ? 64 : 586, 314, 430, 540, 42);
    ctx.stroke();

    fillRoundRect(ctx, left ? 96 : 618, 346, 150, 54, 27, accent);
    fitText(ctx, label, left ? 171 : 693, 374, 126, 25, winner ? "#15122d" : "#1f2d5f", 1000);
    fitText(ctx, name, baseX, 450, 330, 50, "#fff", 1000);

    const cards = left
      ? [
          ["🧸", "我", -98, 54, -0.18, 1.02, ITEM_COLORS[1]],
          ["📦", "反超", 30, 112, 0.12, 1.08, ITEM_COLORS[0]],
          ["🧰", "出手", -74, 230, 0.1, 0.96, ITEM_COLORS[6]],
          ["🎒", "加速", 82, 258, -0.1, 1, ITEM_COLORS[2]],
        ]
      : [
          ["📦", "TA", 94, 54, 0.18, 1.02, ITEM_COLORS[3]],
          ["📚", "守擂", -30, 112, -0.12, 1.08, ITEM_COLORS[4]],
          ["👕", "接招", 74, 230, -0.1, 0.96, ITEM_COLORS[5]],
          ["🧃", "再战", -82, 258, 0.1, 1, ITEM_COLORS[2]],
        ];
    cards.forEach(([icon, text, dx, dy, rotate, scale, color]) => drawCard(ctx, { x: baseX + dx, y: 510 + dy, color, icon, label: text, rotate, scale }));
  }

  function drawBurst(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(255,255,255,.45)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i < 34; i += 1) {
      const angle = (Math.PI * 2 * i) / 34;
      const r = i % 2 ? radius * 0.63 : radius;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBottomQr(ctx, qr) {
    fillRoundRect(ctx, 730, 1170, 290, 190, 32, "rgba(0,0,0,.42)");
    if (qr) {
      ctx.save();
      fillRoundRect(ctx, 780, 1138, 220, 220, 26, "#fff");
      ctx.putImageData(qr, 730, 1036);
      ctx.restore();
      fitText(ctx, "扫码继续 PK", 890, 1380, 220, 24, "#fff", 1000);
    } else {
      fitText(ctx, "点链接继续 PK", 875, 1258, 240, 30, "#fff", 1000);
    }
  }

  function drawDuelPkPoster(canvas, context, options = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx || !context) return false;
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const delta = formatSeconds(context.delta || 0);
    const myWinner = faster || tie;
    const opponentWinner = slower || tie;
    const resultText = tie ? "用时打平" : faster ? `我快 ${delta} 秒` : `我慢 ${delta} 秒`;
    const headline = faster ? "反超成功！" : slower ? "差一点，继续追！" : "平手，再战！";

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#12122a";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = faster ? "#ed3048" : slower ? "#d72f62" : "#d6334d";
    ctx.fillRect(0, 0, W / 2, H);
    ctx.fillStyle = faster ? "#2451d7" : slower ? "#2444c8" : "#2252d8";
    ctx.fillRect(W / 2, 0, W / 2, H);
    drawCaution(ctx);
    drawLightning(ctx);

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(84, 190, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1000, 160, 310, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    fitText(ctx, "PACK BATTLE", 540, 96, 760, 44, "#fff36b", 1000);
    fitText(ctx, "PK 回击战", 540, 166, 850, 72, "#fff", 1000);
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关 · ${GAME_NAME}`, 540, 224, 820, 30, "#e9f8ff", 900);

    drawPlayerStack(ctx, "left", context, myWinner);
    drawPlayerStack(ctx, "right", context, opponentWinner);

    drawBurst(ctx, 540, 612, 166, faster ? "#fff36b" : slower ? "#ff73d1" : "#35f2ff");
    fitText(ctx, "VS", 540, 606, 260, 126, "#15122d", 1000);

    fillRoundRect(ctx, 126, 890, 828, 152, 46, "rgba(8,8,26,.78)");
    ctx.strokeStyle = "rgba(255,255,255,.88)";
    ctx.lineWidth = 5;
    roundRect(ctx, 126, 890, 828, 152, 46);
    ctx.stroke();
    fitText(ctx, headline, 540, 936, 760, 42, faster ? "#73ff78" : slower ? "#fff36b" : "#35f2ff", 1000);
    fitText(ctx, resultText, 540, 1004, 760, 80, "#fff", 1000);

    fillRoundRect(ctx, 92, 1098, 420, 208, 36, "rgba(255,255,255,.13)");
    fillRoundRect(ctx, 568, 1098, 420, 208, 36, "rgba(255,255,255,.13)");
    fitText(ctx, context.myName || "我", 302, 1148, 330, 34, "#fff", 1000);
    fitText(ctx, context.opponent || "TA", 778, 1148, 330, 34, "#fff", 1000);
    fitText(ctx, `${formatSeconds(context.myElapsed)} 秒`, 302, 1228, 330, 64, myWinner ? "#fff36b" : "#dfe8ff", 1000);
    fitText(ctx, `${formatSeconds(context.targetElapsed)} 秒`, 778, 1228, 330, 64, opponentWinner ? "#fff36b" : "#dfe8ff", 1000);

    const slogan = faster ? "我已反超，轮到你追我！" : slower ? "这局先认输，下一把追回来！" : "完全打平，再来一局！";
    fitText(ctx, slogan, 380, 1358, 610, 34, "#fff6c7", 1000);
    if (options.qr) drawBottomQr(ctx, options.qr);
    return true;
  }

  function createPkPosterFile(context) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      drawDuelPkPoster(canvas, context);
      canvas.toBlob((blob) => {
        if (!blob || typeof File === "undefined") return resolve(null);
        resolve(new File([blob], "谁最能装-PK回击.png", { type: "image/png" }));
      }, "image/png", 0.95);
    });
  }

  function isGameSharePayload(payload) {
    const combined = `${payload?.title || ""}\n${payload?.text || ""}`;
    return combined.includes(GAME_NAME) || combined.includes("这也能装") || Boolean(document.querySelector(".comparison-result"));
  }

  function enhancePayloadText(payload, context) {
    const delta = formatSeconds(context.delta || 0);
    const roundText = `第 ${context.round}/${TOTAL_LEVELS} 关`;
    const prefix = context.state === "faster"
      ? `${context.myName} PK ${context.opponent}，${roundText}快了 ${delta} 秒！`
      : context.state === "slower"
        ? `${context.myName} PK ${context.opponent}，${roundText}慢了 ${delta} 秒。`
        : `${context.myName} PK ${context.opponent}，${roundText}用时打平！`;
    const detail = `我 ${formatSeconds(context.myElapsed)} 秒，${context.opponent} ${formatSeconds(context.targetElapsed)} 秒。`;
    return {
      ...payload,
      title: context.state === "faster" ? "我更快，轮到你追我" : context.state === "slower" ? "我再刷一局追回来" : "打平了，再来一局",
      text: `${prefix}${detail}来继续 PK。`,
    };
  }

  function wrapNavigatorShare() {
    if (!navigator.share || navigator.share.__packPkPosterWrappedV2) return;
    const previousShare = navigator.share.bind(navigator);
    const wrappedShare = async (payload = {}) => {
      const context = readPkContext();
      if (!context || !isGameSharePayload(payload)) return previousShare(payload);
      const nextPayload = enhancePayloadText(payload, context);
      const poster = await createPkPosterFile(context);
      if (poster) {
        const filePayload = { ...nextPayload, files: [poster] };
        if (!navigator.canShare || navigator.canShare({ files: [poster] })) return previousShare(filePayload);
      }
      return previousShare(nextPayload);
    };
    wrappedShare.__packPkPosterWrappedV2 = true;
    try { Object.defineProperty(navigator, "share", { configurable: true, value: wrappedShare }); }
    catch { navigator.share = wrappedShare; }
  }

  function run() {
    injectPkButtonStyle();
    wrapNavigatorShare();
    readPkContext();
  }

  window.__packDuelPoster = { W, H, readPkContext, drawDuelPkPoster, createPkPosterFile, enhancePayloadText };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
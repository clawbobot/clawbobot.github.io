(() => {
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const W = 1080;
  const H = 1440;

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
      .pack-pk-retry:active {
        transform: translateY(2px) scale(.99) !important;
      }
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
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
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
    } catch {
      // optional storage
    }
    return "我";
  }

  function readPkContextFromDom() {
    const comparison = document.querySelector(".comparison-result");
    const challenge = decodeChallengeFromUrl();
    if (!comparison || !challenge) return null;
    const text = comparison.textContent || "";
    const isFaster = text.includes("你快了");
    const isSlower = text.includes("慢了");
    const isTie = text.includes("打平");
    if (!isFaster && !isSlower && !isTie) return null;
    const delta = Number.parseFloat(text.match(/(\d+(?:\.\d+)?)\s*秒/)?.[1] || "0");
    const opponent = challenge.name || "分享者";
    const targetElapsed = Number(challenge.elapsed) || 0;
    const myElapsed = isFaster ? Math.max(0, targetElapsed - delta) : isSlower ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : 1;
    return {
      myName: readMyName(),
      opponent,
      round,
      targetElapsed,
      myElapsed,
      delta,
      state: isFaster ? "faster" : isSlower ? "slower" : "tie",
    };
  }

  function readPkContext() {
    const current = readPkContextFromDom();
    if (current) {
      try { sessionStorage.setItem("pack-last-pk-context", JSON.stringify(current)); } catch {}
      return current;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-last-pk-context") || "null");
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

  function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function fitText(ctx, text, x, y, maxWidth, fontSize, weight = 1000, color = "#fff", align = "center") {
    const fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
    let size = fontSize;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    do {
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      if (ctx.measureText(text).width <= maxWidth || size <= 24) break;
      size -= 3;
    } while (size > 24);
    ctx.fillText(text, x, y);
  }

  function drawBurst(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24;
      const r = i % 2 === 0 ? radius : radius * 0.76;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPlayerCard(ctx, { x, y, name, label, time, colorA, colorB, winner }) {
    const gradient = ctx.createLinearGradient(x, y, x + 390, y + 360);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.save();
    ctx.shadowColor = `${colorB}88`;
    ctx.shadowBlur = winner ? 34 : 18;
    ctx.shadowOffsetY = 16;
    fillRoundRect(ctx, x, y, 390, 360, 44, gradient);
    ctx.restore();

    ctx.strokeStyle = winner ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.32)";
    ctx.lineWidth = winner ? 6 : 3;
    roundRect(ctx, x + 8, y + 8, 374, 344, 38);
    ctx.stroke();

    fillRoundRect(ctx, x + 34, y + 34, 116, 48, 24, winner ? "rgba(255,255,255,.92)" : "rgba(5,12,38,.42)");
    fitText(ctx, label, x + 92, y + 59, 90, 22, 1000, winner ? "#14122d" : "#fff7c8");

    fitText(ctx, name, x + 195, y + 140, 310, 48, 1000, "#ffffff");
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(x + 195, y + 229, 116, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    fitText(ctx, `${formatSeconds(time)}秒`, x + 195, y + 218, 300, 74, 1000, winner ? "#fff36b" : "#dce8ff");

    if (winner) {
      ctx.font = "56px system-ui, sans-serif";
      ctx.fillText("👑", x + 323, y + 66);
    }
  }

  function drawFlyingItem(ctx, icon, x, y, rotate, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    const w = 112 * scale;
    const h = 90 * scale;
    fillRoundRect(ctx, -w / 2, -h / 2, w, h, 22 * scale, color);
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.fillRect(-w / 2 + 14 * scale, -h / 2 + 12 * scale, w - 28 * scale, 7 * scale);
    ctx.font = `${42 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, 4 * scale);
    ctx.restore();
  }

  function drawPkPoster(ctx, context) {
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const deltaText = formatSeconds(context.delta || 0);
    const resultText = tie ? "用时打平" : faster ? `快 ${deltaText} 秒` : `慢 ${deltaText} 秒`;
    const headline = faster ? "反超成功！" : slower ? "差一点，继续追！" : "打平了，再战！";
    const myWinner = faster || tie;
    const opponentWinner = slower || tie;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, faster ? "#1422a8" : slower ? "#45105f" : "#13258c");
    bg.addColorStop(0.48, "#121347");
    bg.addColorStop(1, faster ? "#00d4ff" : slower ? "#ff6bc8" : "#ffcf48");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = faster ? "#22f5ff" : slower ? "#ff6bc8" : "#fff06a";
    ctx.beginPath();
    ctx.arc(105, 100, 210, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = faster ? "#ff4ec8" : "#32e6ff";
    ctx.beginPath();
    ctx.arc(980, 70, 290, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ["📦", "🧸", "🎒", "📚", "👕", "🧃"].forEach((icon, index) => {
      drawFlyingItem(ctx, icon, 118 + index * 170, 1010 + (index % 2) * 75, (index - 2) * 0.13, 0.95, ["#ff5b76", "#ffb22e", "#63df76", "#3aa7ff", "#a970ff", "#26d7e4"][index]);
    });

    ctx.fillStyle = "rgba(4,8,34,.62)";
    fillRoundRect(ctx, 70, 70, 940, 1230, 62, "rgba(5, 9, 38, .62)");
    ctx.strokeStyle = faster ? "rgba(50,230,255,.62)" : slower ? "rgba(255,107,200,.7)" : "rgba(255,240,106,.66)";
    ctx.lineWidth = 5;
    roundRect(ctx, 70, 70, 940, 1230, 62);
    ctx.stroke();

    fitText(ctx, "PACK BATTLE", 540, 130, 760, 48, 1000, "#38f4ff");
    fitText(ctx, "PK 回击战", 540, 205, 760, 84, 1000, "#ffffff");
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关`, 540, 274, 760, 34, 900, "#c8f7ff");

    drawBurst(ctx, 540, 445, 170, faster ? "#fff06a" : slower ? "#ff6bc8" : "#32e6ff");
    fitText(ctx, "VS", 540, 445, 290, 128, 1000, "#15122d");
    fitText(ctx, headline, 540, 610, 820, 72, 1000, faster ? "#6cff77" : slower ? "#fff06a" : "#32e6ff");
    fitText(ctx, resultText, 540, 696, 780, 96, 1000, "#ffffff");

    drawPlayerCard(ctx, {
      x: 105,
      y: 770,
      name: context.myName || "我",
      label: "我",
      time: context.myElapsed,
      colorA: faster ? "#15dfff" : slower ? "#9c62ff" : "#32e6ff",
      colorB: faster ? "#57ff74" : slower ? "#ff6bc8" : "#fff06a",
      winner: myWinner,
    });
    drawPlayerCard(ctx, {
      x: 585,
      y: 770,
      name: context.opponent || "分享者",
      label: "TA",
      time: context.targetElapsed,
      colorA: slower ? "#ffe95f" : "#ff5b76",
      colorB: slower ? "#ff9f1c" : "#a970ff",
      winner: opponentWinner,
    });

    const slogan = faster
      ? "我已经反超，轮到你追我。"
      : slower
        ? "这局我先认输，下一局追回来。"
        : "谁也没赢，下一局见真章。";
    fitText(ctx, slogan, 540, 1200, 860, 42, 1000, "#fff6c7");
    fitText(ctx, "扫码/点链接继续 PK，看谁才是装箱王", 540, 1265, 860, 30, 900, "#c8f7ff");
  }

  function createPkPosterFile(context) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      drawPkPoster(ctx, context);
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
    if (!navigator.share || navigator.share.__packPkPosterWrapped) return;
    const previousShare = navigator.share.bind(navigator);
    const wrappedShare = async (payload = {}) => {
      const context = readPkContext();
      if (!context || !isGameSharePayload(payload)) return previousShare(payload);
      const nextPayload = enhancePayloadText(payload, context);
      const poster = await createPkPosterFile(context);
      if (poster) {
        const filePayload = { ...nextPayload, files: [poster] };
        if (!navigator.canShare || navigator.canShare({ files: [poster] })) {
          return previousShare(filePayload);
        }
      }
      return previousShare(nextPayload);
    };
    wrappedShare.__packPkPosterWrapped = true;
    try {
      Object.defineProperty(navigator, "share", { configurable: true, value: wrappedShare });
    } catch {
      navigator.share = wrappedShare;
    }
  }

  function run() {
    injectPkButtonStyle();
    wrapNavigatorShare();
    readPkContext();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();

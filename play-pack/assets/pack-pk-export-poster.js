(() => {
  const W = 1080;
  const H = 1440;
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";

  function hasChallengeMode() {
    return new URLSearchParams(window.location.search).has("challenge") || Boolean(document.querySelector(".comparison-result"));
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
    const challenge = decodeChallengeFromUrl();
    const comparison = document.querySelector(".comparison-result");
    if (!challenge || !comparison) return null;
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
    try { sessionStorage.setItem("pack-current-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function readPkContext() {
    const current = readPkContextFromDom();
    if (current) return current;
    if (!hasChallengeMode()) return null;
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-current-pk-context") || sessionStorage.getItem("pack-last-pk-context") || "null");
      if (stored?.opponent) return { ...stored, myName: readMyName() };
    } catch {}
    return null;
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

  function fitText(ctx, text, x, y, maxWidth, fontSize, color = "#fff", weight = 1000) {
    const fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif";
    let size = fontSize;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    do {
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      if (ctx.measureText(text).width <= maxWidth || size <= 22) break;
      size -= 3;
    } while (size > 22);
    ctx.fillText(text, x, y);
  }

  function drawChip(ctx, text, x, y, width, color) {
    fillRoundRect(ctx, x - width / 2, y - 30, width, 60, 30, color);
    fitText(ctx, text, x, y, width - 36, 28, "#13122d", 1000);
  }

  function drawItem(ctx, icon, x, y, rotate, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    const w = 116 * scale;
    const h = 92 * scale;
    ctx.shadowColor = "rgba(0,0,0,.28)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 12;
    fillRoundRect(ctx, -w / 2, -h / 2, w, h, 24 * scale, color);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fillRect(-w / 2 + 15 * scale, -h / 2 + 12 * scale, w - 30 * scale, 8 * scale);
    ctx.font = `${44 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(icon, 0, 5 * scale);
    ctx.restore();
  }

  function drawPlayer(ctx, { x, y, label, name, seconds, winner, colorA, colorB }) {
    const gradient = ctx.createLinearGradient(x, y, x + 396, y + 360);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.save();
    ctx.shadowColor = winner ? `${colorB}aa` : "rgba(0,0,0,.32)";
    ctx.shadowBlur = winner ? 36 : 18;
    ctx.shadowOffsetY = 14;
    fillRoundRect(ctx, x, y, 396, 360, 46, gradient);
    ctx.restore();
    ctx.lineWidth = winner ? 7 : 3;
    ctx.strokeStyle = winner ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.28)";
    roundRect(ctx, x + 9, y + 9, 378, 342, 38);
    ctx.stroke();
    drawChip(ctx, label, x + 88, y + 62, 114, winner ? "#fff36b" : "rgba(255,255,255,.78)");
    fitText(ctx, name, x + 198, y + 143, 318, 48, "#fff", 1000);
    ctx.fillStyle = "rgba(0,0,0,.24)";
    ctx.beginPath();
    ctx.ellipse(x + 198, y + 236, 126, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    fitText(ctx, `${formatSeconds(seconds)}秒`, x + 198, y + 222, 320, 76, winner ? "#fff36b" : "#e1edff", 1000);
    if (winner) {
      ctx.font = "58px system-ui, sans-serif";
      ctx.fillText("👑", x + 330, y + 68);
    }
  }

  function captureQr(canvas) {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      return ctx.getImageData(730, 1036, 310, 334);
    } catch {
      return null;
    }
  }

  function drawPkReplyPoster(canvas, context) {
    if (!context) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const qr = captureQr(canvas);
    const faster = context.state === "faster";
    const slower = context.state === "slower";
    const tie = context.state === "tie";
    const delta = formatSeconds(context.delta || 0);
    const myWinner = faster || tie;
    const opponentWinner = slower || tie;
    const resultText = tie ? "用时打平" : faster ? `我快 ${delta} 秒` : `我慢 ${delta} 秒`;
    const headline = faster ? "反超成功！" : slower ? "差一点，继续追！" : "平手，再战！";

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, faster ? "#1429d8" : slower ? "#5a1481" : "#1730b5");
    bg.addColorStop(.55, "#161047");
    bg.addColorStop(1, faster ? "#00e6ff" : slower ? "#ff64c7" : "#ffe45f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = .28;
    ctx.fillStyle = faster ? "#ff4fc9" : "#35f2ff";
    ctx.beginPath();
    ctx.arc(110, 90, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = faster ? "#35f2ff" : "#ffe45f";
    ctx.beginPath();
    ctx.arc(960, 88, 310, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    [["📦",110,1050,-.22,1.1,"#ff5b76"],["🧸",256,1125,.16,1.0,"#ffb22e"],["🎒",420,1056,-.08,1.1,"#58df70"],["📚",602,1124,.12,1.0,"#35a5ff"],["👕",780,1050,-.14,1.1,"#a970ff"],["🧃",950,1132,.18,.95,"#23d4e6"]].forEach(([icon, x, y, rot, scale, color]) => drawItem(ctx, icon, x, y, rot, scale, color));

    fillRoundRect(ctx, 64, 64, 952, 1236, 64, "rgba(5,8,36,.64)");
    ctx.lineWidth = 6;
    ctx.strokeStyle = faster ? "rgba(52,240,255,.7)" : slower ? "rgba(255,100,199,.75)" : "rgba(255,228,95,.75)";
    roundRect(ctx, 64, 64, 952, 1236, 64);
    ctx.stroke();

    fitText(ctx, "PACK BATTLE", 540, 128, 760, 48, "#38f4ff", 1000);
    fitText(ctx, "PK 回击战", 540, 206, 790, 88, "#ffffff", 1000);
    fitText(ctx, `第 ${context.round}/${TOTAL_LEVELS} 关 · ${GAME_NAME}`, 540, 280, 820, 34, "#cff9ff", 900);

    const burstColor = faster ? "#fff15f" : slower ? "#ff64c7" : "#35f2ff";
    ctx.save();
    ctx.translate(540, 450);
    ctx.fillStyle = burstColor;
    ctx.beginPath();
    for (let i = 0; i < 32; i += 1) {
      const angle = (Math.PI * 2 * i) / 32;
      const radius = i % 2 ? 132 : 184;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    fitText(ctx, "VS", 540, 450, 300, 140, "#15122d", 1000);
    fitText(ctx, headline, 540, 615, 840, 72, faster ? "#73ff78" : slower ? "#fff15f" : "#35f2ff", 1000);
    fitText(ctx, resultText, 540, 702, 830, 104, "#fff", 1000);

    drawPlayer(ctx, {
      x: 100,
      y: 782,
      label: "我",
      name: context.myName || "我",
      seconds: context.myElapsed,
      winner: myWinner,
      colorA: faster ? "#15dfff" : slower ? "#9d66ff" : "#32e6ff",
      colorB: faster ? "#57ff74" : slower ? "#ff6bc8" : "#fff06a",
    });
    drawPlayer(ctx, {
      x: 584,
      y: 782,
      label: "TA",
      name: context.opponent || "分享者",
      seconds: context.targetElapsed,
      winner: opponentWinner,
      colorA: slower ? "#ffe95f" : "#ff5b76",
      colorB: slower ? "#ff9f1c" : "#a970ff",
    });

    const slogan = faster ? "我已经反超，轮到你追我。" : slower ? "这局先认输，下一把追回来。" : "谁也没赢，下一局见真章。";
    fitText(ctx, slogan, 540, 1198, 850, 42, "#fff6c7", 1000);
    fitText(ctx, "点链接继续 PK，看谁才是装箱王", 540, 1258, 840, 30, "#c8f7ff", 900);

    if (qr) {
      ctx.save();
      ctx.globalAlpha = .96;
      fillRoundRect(ctx, 760, 1044, 250, 250, 22, "#fff");
      ctx.putImageData(qr, 730, 1036);
      ctx.restore();
    }
    return true;
  }

  function shouldReplaceCanvas(canvas) {
    return canvas?.width === W && canvas?.height === H && hasChallengeMode() && Boolean(readPkContext());
  }

  function ensurePkCanvas(canvas) {
    if (!shouldReplaceCanvas(canvas)) return;
    const context = readPkContext();
    if (!context) return;
    drawPkReplyPoster(canvas, context);
  }

  function wrapCanvasExports() {
    const proto = HTMLCanvasElement.prototype;
    if (!proto || proto.__packPkExportWrapped) return;
    const previousToBlob = proto.toBlob;
    const previousToDataURL = proto.toDataURL;
    proto.toBlob = function wrappedToBlob(...args) {
      ensurePkCanvas(this);
      return previousToBlob.apply(this, args);
    };
    proto.toDataURL = function wrappedToDataURL(...args) {
      ensurePkCanvas(this);
      return previousToDataURL.apply(this, args);
    };
    proto.__packPkExportWrapped = true;
  }

  function run() {
    wrapCanvasExports();
    readPkContext();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();

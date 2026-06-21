(() => {
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1440;
  const TOTAL_LEVELS = 5;
  const GAME_NAME = "谁最能装？";
  const COLORS = ["#ff5b76", "#ffb22e", "#63df76", "#3aa7ff", "#a970ff", "#26d7e4"];
  const ICONS = ["📦", "🧸", "🎒", "🧃", "👕", "📚"];

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
  }

  function fillRoundRect(ctx, x, y, width, height, radius, color) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawTinyTile(ctx, index, x, y, rotate, scale) {
    const width = 120 * scale;
    const height = 96 * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.beginPath();
    ctx.ellipse(10, height / 2 + 16, width * 0.48, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    fillRoundRect(ctx, -width / 2, -height / 2, width, height, 24, COLORS[index % COLORS.length]);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-width / 2 + 18, -height / 2 + 16, width - 36, 8);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${42 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ICONS[index % ICONS.length], 0, -2);
    ctx.restore();
  }

  function cleanupPosterCaption(canvas) {
    if (!canvas || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    roundRect(ctx, 88, 292, 904, 666, 24);
    ctx.clip();

    const patch = ctx.createLinearGradient(96, 842, 984, 962);
    patch.addColorStop(0, "#22155a");
    patch.addColorStop(0.55, "#17366d");
    patch.addColorStop(1, "#0f2149");
    ctx.fillStyle = patch;
    ctx.fillRect(96, 840, 888, 122);

    ctx.fillStyle = "rgba(255,210,63,0.12)";
    ctx.beginPath();
    ctx.ellipse(540, 910, 340, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(540, 932, 270, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    drawTinyTile(ctx, 0, 332, 892, -0.12, 0.94);
    drawTinyTile(ctx, 1, 468, 876, 0.1, 1.03);
    drawTinyTile(ctx, 2, 612, 884, -0.08, 0.98);
    drawTinyTile(ctx, 3, 744, 898, 0.12, 0.9);
    ctx.restore();
  }

  const previousToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function packCleanPosterToDataURL(...args) {
    if (this?.width === POSTER_WIDTH && this?.height === POSTER_HEIGHT) {
      previousToDataURL.call(this, "image/png");
      cleanupPosterCaption(this);
    }
    return previousToDataURL.apply(this, args);
  };

  const previousToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function packCleanPosterToBlob(callback, ...args) {
    if (this?.width !== POSTER_WIDTH || this?.height !== POSTER_HEIGHT) {
      return previousToBlob.call(this, callback, ...args);
    }
    return previousToBlob.call(this, () => {
      cleanupPosterCaption(this);
      previousToBlob.call(this, callback, ...args);
    }, "image/png");
  };

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
      // ignore optional local storage
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
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL_LEVELS) : "这一";
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

  function capturePkContext() {
    const context = readPkContextFromDom();
    if (!context) return;
    try {
      sessionStorage.setItem("pack-last-pk-context", JSON.stringify(context));
    } catch {
      // session storage is optional
    }
  }

  function readStoredPkContext() {
    capturePkContext();
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-last-pk-context") || "null");
      return stored && stored.opponent ? { ...stored, myName: readMyName() } : null;
    } catch {
      return null;
    }
  }

  function buildPkSharePayload() {
    const context = readStoredPkContext();
    if (!context) return null;
    const deltaText = context.delta ? `${context.delta} 秒` : "0 秒";
    const roundText = typeof context.round === "number" ? `第 ${context.round}/${TOTAL_LEVELS} 关` : "这一关";
    const timeText = context.myElapsed && context.targetElapsed
      ? `我用 ${context.myElapsed} 秒，${context.opponent} 用 ${context.targetElapsed} 秒。`
      : "";

    if (context.state === "faster") {
      return {
        title: `${context.myName} 比 ${context.opponent} 快 ${deltaText}`,
        text: `${context.myName} PK ${context.opponent}，在《${GAME_NAME}》${roundText}快了 ${deltaText}！${timeText}来追我。`,
      };
    }
    if (context.state === "slower") {
      return {
        title: `${context.myName} 比 ${context.opponent} 慢 ${deltaText}`,
        text: `${context.myName} PK ${context.opponent}，在《${GAME_NAME}》${roundText}慢了 ${deltaText}。${timeText}我再刷一局追回来。`,
      };
    }
    return {
      title: `${context.myName} 和 ${context.opponent} 打平了`,
      text: `${context.myName} PK ${context.opponent}，在《${GAME_NAME}》${roundText}用时打平！${timeText}再来一局分胜负。`,
    };
  }

  function shouldUsePkCopy(payload) {
    if (!payload) return false;
    const combined = `${payload.title || ""}\n${payload.text || ""}`;
    return combined.includes(GAME_NAME) || combined.includes("这也能装") || Boolean(document.querySelector(".share-studio"));
  }

  if (navigator.share) {
    const nativeShare = navigator.share.bind(navigator);
    try {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: (payload = {}) => {
          const pk = buildPkSharePayload();
          if (pk && shouldUsePkCopy(payload)) {
            return nativeShare({ ...payload, title: pk.title, text: pk.text });
          }
          return nativeShare(payload);
        },
      });
    } catch {
      // Some browsers do not allow wrapping navigator.share.
    }
  }

  if (navigator.clipboard?.writeText) {
    const nativeWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    try {
      Object.defineProperty(navigator.clipboard, "writeText", {
        configurable: true,
        value: (text) => {
          const pk = buildPkSharePayload();
          if (pk && typeof text === "string" && (text.includes(GAME_NAME) || text.includes("这也能装"))) {
            const url = text.match(/https?:\/\/\S+/)?.[0] || window.location.href;
            return nativeWriteText(`${pk.title}\n${pk.text}\n${url}`);
          }
          return nativeWriteText(text);
        },
      });
    } catch {
      // Clipboard remains unchanged when the browser blocks wrapping.
    }
  }

  function runPkFix() {
    capturePkContext();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPkFix, { once: true });
  } else {
    runPkFix();
  }
  new MutationObserver(() => requestAnimationFrame(runPkFix)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();

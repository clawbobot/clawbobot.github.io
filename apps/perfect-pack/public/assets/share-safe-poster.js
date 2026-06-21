(() => {
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1440;
  const GAME_TITLE = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const LINK_PREVIEW_IMAGE = "share-preview.jpg";
  const LEVEL_LABELS = [
    ["新手开塞", "简单"],
    ["拧一拧试试", "普通"],
    ["歪打正着", "进阶"],
    ["手速爆箱", "困难"],
    ["终极塞箱王", "专家"],
  ];
  const COLORS = ["#ff5b76", "#ffb22e", "#63df76", "#3aa7ff", "#a970ff", "#26d7e4", "#ff66ba", "#d8ef43", "#ff865f"];
  const NAMES = ["方块怪", "长条君", "收纳仔", "工具侠", "箱子怪", "水壶团", "衣服包", "配件宝", "救急包"];
  const ICONS = ["📦", "🧸", "🎒", "🧃", "👕", "📚", "🧰", "🎁", "🛟"];
  const TEXT_REPLACEMENTS = [
    ["这也能装？", GAME_TITLE],
    ["完美订单", "终极塞箱王"],
    ["基础装箱", "新手开塞"],
    ["转向练习", "拧一拧试试"],
    ["错位拼合", "歪打正着"],
    ["限时调度", "手速爆箱"],
    ["空间装箱挑战", "装箱 Battle"],
    ["100% 完美装箱", "满格！这都塞进去了"],
    ["订单 ", "第 "],
    ["订单已暂停", "先别急，箱子暂停中"],
    ["完成全部五轮订单", "五关全塞完，装箱王登场"],
    ["专家订单", "终极塞箱王"],
    ["挑战同一订单", "挑战同一箱"],
    ["打开挑战同一订单", "打开挑战同一箱"],
    ["同一箱子、同一组物品。挑战", "同一箱、同一堆东西，来挑战"],
    ["旋转物品，填满箱子。每一关都有唯一的空间挑战。", "旋一旋、塞一塞，每一局都像在跟箱子斗智斗勇。"],
    ["旋转物品，填满箱子。你能完成 100% 完美装箱吗？", "旋一旋、塞一塞，看看谁才是装箱天才。"],
    ["同一箱子、同一组物品。打开即玩，挑战朋友的完美装箱成绩。", "同一箱、同一堆东西，打开就塞，看看谁才是装箱王。"],
    ["旋转物品，填满每一格，再挑战朋友的完美装箱成绩。", "转一转、塞一塞，发给朋友比比谁更能装。"],
    ["点击传送带物品开始装箱", "已默认选中第一个，双击箱格直接塞进去"],
    ["点箱格定位，再调整方向并放入", "双击箱格可直接塞进去，也可以先旋转"],
    ["用户标记", "玩家昵称"],
    ["一句话宣言", "装箱口号"],
  ];
  const SLOTS = [
    [138, 704, -0.16, 1.24], [278, 686, 0.14, 1.28], [418, 724, -0.1, 1.2],
    [552, 668, 0.15, 1.34], [706, 712, -0.13, 1.22], [852, 674, 0.12, 1.18],
    [220, 548, 0.18, 1.15], [370, 500, -0.12, 1.25], [530, 526, 0.12, 1.18],
    [686, 498, -0.16, 1.22], [836, 536, 0.15, 1.14], [432, 372, 0.1, 1.12],
    [598, 368, -0.1, 1.1], [746, 404, 0.13, 1.0], [288, 402, -0.14, 1.02],
  ];

  function replaceCopy(value) {
    if (!value) return value;
    return TEXT_REPLACEMENTS.reduce((current, [from, to]) => current.replaceAll(from, to), value);
  }

  function setMeta(selector, attributes) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.entries(attributes)
        .filter(([key]) => key !== "content")
        .forEach(([key, value]) => element.setAttribute(key, value));
      document.head.appendChild(element);
    }
    if (attributes.content) element.setAttribute("content", attributes.content);
  }

  function polishSharePreviewMeta() {
    const imageUrl = `${window.location.origin}/play-pack/assets/${LINK_PREVIEW_IMAGE}`;
    setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    setMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url", content: imageUrl });
    setMeta('meta[property="og:image:type"]', { property: "og:image:type", content: "image/jpeg" });
    setMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
    setMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
  }

  function injectGameJuiceStyles() {
    if (document.getElementById("pack-game-juice-style")) return;
    const style = document.createElement("style");
    style.id = "pack-game-juice-style";
    style.textContent = `
      :root {
        --bg: #12082f;
        --surface: #1b1644;
        --surface-2: #231b58;
        --line: rgba(111, 238, 255, 0.28);
        --line-soft: rgba(255, 255, 255, 0.1);
        --text: #fff9f0;
        --muted: #b8b4ff;
        --cyan: #37e6f6;
        --green: #72f06e;
        --amber: #ffd23f;
        --coral: #ff5f87;
        --shadow: 0 18px 36px rgba(12, 5, 35, 0.48);
      }
      .game-shell {
        background:
          radial-gradient(circle at 15% 12%, rgba(255, 95, 160, 0.28), transparent 26rem),
          radial-gradient(circle at 88% 6%, rgba(55, 230, 246, 0.22), transparent 24rem),
          radial-gradient(circle at 50% 100%, rgba(255, 210, 63, 0.18), transparent 28rem),
          linear-gradient(160deg, #170a3a 0%, #10236a 54%, #07122e 100%) !important;
      }
      .game-frame {
        border-inline: 2px solid rgba(255,255,255,0.13) !important;
        background:
          linear-gradient(180deg, rgba(40, 28, 92, 0.96), rgba(12, 10, 34, 0.98)),
          var(--bg) !important;
        box-shadow: 0 0 0 5px rgba(55,230,246,0.09), 0 24px 80px rgba(0,0,0,0.45);
      }
      .topbar,
      .mission-panel,
      .conveyor-window,
      .next-preview,
      .overlay-panel,
      .share-studio {
        background: linear-gradient(135deg, rgba(39, 28, 93, 0.96), rgba(14, 20, 58, 0.96)) !important;
        border-color: rgba(111, 238, 255, 0.24) !important;
      }
      .mission-panel,
      .conveyor-window,
      .packing-board,
      .overlay-panel,
      .share-studio { box-shadow: var(--shadow), inset 0 0 0 1px rgba(255,255,255,0.06) !important; }
      .packing-board {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.04), transparent 45%),
          #15103a !important;
        border-color: rgba(55,230,246,0.48) !important;
        box-shadow: 0 18px 46px rgba(0,0,0,0.42), 0 0 28px rgba(55,230,246,0.18), inset 0 0 0 4px rgba(255,255,255,0.06) !important;
      }
      .grid-cell {
        border-color: rgba(255,255,255,0.14) !important;
        background: rgba(255,255,255,0.07) !important;
      }
      .grid-cell.is-filled { animation: packPop 240ms cubic-bezier(.2,1.45,.3,1); }
      .grid-cell.is-preview-valid {
        border-color: #37e6f6 !important;
        background: rgba(55,230,246,0.25) !important;
        box-shadow: 0 0 16px rgba(55,230,246,0.35) inset !important;
      }
      .belt-item {
        border-radius: 14px !important;
        background: rgba(255,255,255,0.06) !important;
        transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
      }
      .belt-item:not(.is-selected) { animation: beltFloat 2.4s ease-in-out infinite; }
      .belt-item.is-selected {
        border-color: #ffd23f !important;
        background: linear-gradient(180deg, rgba(255,210,63,0.22), rgba(55,230,246,0.12)) !important;
        color: #fff !important;
        transform: translateY(-4px) scale(1.06);
        box-shadow: 0 0 0 2px rgba(255,210,63,0.32), 0 12px 22px rgba(0,0,0,0.25) !important;
        animation: selectedBounce 900ms ease-in-out infinite;
      }
      .controls button,
      .primary-action,
      .share-actions button {
        border-radius: 14px !important;
      }
      .controls .place-button,
      .primary-action,
      .share-actions .share-primary {
        background: linear-gradient(180deg, #ffd23f 0%, #ff8c42 58%, #ff5f87 100%) !important;
        color: #201000 !important;
        box-shadow: 0 10px 22px rgba(255, 140, 66, 0.26), inset 0 0 0 2px rgba(255,255,255,0.22) !important;
      }
      .interaction-hint { color: #ffe8a3 !important; font-weight: 700; }
      .piece-shape i.is-block { border-radius: 4px !important; }
      @keyframes packPop { 0% { transform: scale(.72) rotate(-3deg); } 70% { transform: scale(1.12) rotate(2deg); } 100% { transform: scale(1); } }
      @keyframes selectedBounce { 0%, 100% { transform: translateY(-4px) scale(1.06); } 50% { transform: translateY(-8px) scale(1.09); } }
      @keyframes beltFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    `;
    document.head.appendChild(style);
  }

  function polishPageCopy() {
    document.title = replaceCopy(document.title);
    document.querySelectorAll("meta[content]").forEach((meta) => {
      meta.setAttribute("content", replaceCopy(meta.getAttribute("content")));
    });
    polishSharePreviewMeta();
    injectGameJuiceStyles();

    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = replaceCopy(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  function schedulePolish() {
    if (schedulePolish.pending) return;
    schedulePolish.pending = true;
    requestAnimationFrame(() => {
      schedulePolish.pending = false;
      polishPageCopy();
      ensureDefaultPieceSelected();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", polishPageCopy, { once: true });
  } else {
    polishPageCopy();
  }
  new MutationObserver(schedulePolish).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  function isGameBlocked() {
    const overlay = document.querySelector(".overlay-backdrop, .share-backdrop, .wechat-image-viewer");
    return Boolean(overlay);
  }

  function isPlaying() {
    return !isGameBlocked() && Boolean(document.querySelector(".belt-item")) && !document.querySelector(".belt-empty");
  }

  function ensureDefaultPieceSelected() {
    if (!isPlaying()) return;
    if (document.querySelector(".belt-item.is-selected")) return;
    const first = document.querySelector(".belt-item:not([disabled])");
    if (first) first.click();
  }

  function quickPlaceAtCell(cell) {
    if (!cell || isGameBlocked()) return;
    ensureDefaultPieceSelected();
    window.setTimeout(() => {
      cell.click();
      window.setTimeout(() => {
        const placeButton = document.querySelector(".place-button:not(:disabled)");
        if (placeButton) {
          placeButton.click();
          window.setTimeout(ensureDefaultPieceSelected, 80);
        }
      }, 0);
    }, 0);
  }

  document.addEventListener("dblclick", (event) => {
    const cell = event.target.closest?.(".grid-cell");
    if (cell) quickPlaceAtCell(cell);
  }, true);

  let lastTap = { time: 0, cell: null };
  document.addEventListener("pointerup", (event) => {
    const cell = event.target.closest?.(".grid-cell");
    if (!cell) return;
    const now = Date.now();
    if (lastTap.cell === cell && now - lastTap.time < 320) {
      event.preventDefault();
      quickPlaceAtCell(cell);
      lastTap = { time: 0, cell: null };
      return;
    }
    lastTap = { time: now, cell };
  }, true);

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

  function strokeRoundRect(ctx, x, y, width, height, radius, color, lineWidth = 3) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function readRoundNumber() {
    const value = Number.parseInt(document.querySelector(".level-readout strong")?.textContent || "", 10);
    if (!Number.isFinite(value) || value < 1) return null;
    return Math.min(value, TOTAL_LEVELS);
  }

  function getRoundMeta() {
    const round = readRoundNumber() || 1;
    const [name, difficulty] = LEVEL_LABELS[round - 1] || ["连装挑战", "开玩"];
    return { round, name, difficulty, progress: `第 ${round}/${TOTAL_LEVELS} 关`, badge: `已玩到 ${round}/${TOTAL_LEVELS}` };
  }

  function readIdentity() {
    const name = document.querySelector(".identity-row input")?.value?.trim() || "神秘装箱师";
    const mark = document.querySelector(".identity-row b")?.textContent?.replace("#", "").trim() || "";
    const mottoInput = [...document.querySelectorAll(".share-fields input")][1];
    const motto = mottoInput?.value?.trim() || DEFAULT_MOTTO;
    return { name, mark, motto };
  }

  function readScore() {
    return document.querySelector(".score-readout strong")?.textContent?.trim() || "";
  }

  function drawConfetti(ctx) {
    const confetti = [
      [84, 326, 28, 8, "#ff5f87"], [160, 70, 34, 10, "#ffd23f"], [958, 228, 26, 8, "#72f06e"],
      [1000, 366, 36, 10, "#37e6f6"], [64, 1030, 30, 8, "#a970ff"], [978, 52, 36, 10, "#ff8c42"],
      [164, 1228, 30, 8, "#37e6f6"], [910, 960, 26, 8, "#ffd23f"], [64, 760, 24, 8, "#72f06e"],
    ];
    confetti.forEach(([x, y, w, h, color], index) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((index % 5 - 2) * 0.16);
      fillRoundRect(ctx, 0, 0, w, h, h / 2, color);
      ctx.restore();
    });
  }

  function drawHeader(ctx) {
    const meta = getRoundMeta();
    const titleGradient = ctx.createLinearGradient(64, 88, 650, 178);
    titleGradient.addColorStop(0, "#ffffff");
    titleGradient.addColorStop(1, "#dbf9ff");

    ctx.fillStyle = "rgba(55,230,246,0.12)";
    ctx.beginPath();
    ctx.arc(902, 92, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,95,135,0.1)";
    ctx.beginPath();
    ctx.arc(104, 112, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#37e6f6";
    ctx.font = "900 40px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PACK BATTLE", 72, 88);

    ctx.fillStyle = titleGradient;
    ctx.font = "900 78px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(GAME_TITLE, 72, 170);

    ctx.fillStyle = "#c8f7ff";
    ctx.font = "800 30px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${meta.progress} · ${meta.name}`, 74, 226);

    const pill = ctx.createLinearGradient(744, 70, 1010, 146);
    pill.addColorStop(0, "rgba(255,210,63,0.25)");
    pill.addColorStop(1, "rgba(55,230,246,0.2)");
    fillRoundRect(ctx, 742, 70, 270, 78, 39, pill);
    strokeRoundRect(ctx, 742, 70, 270, 78, 39, "rgba(255,255,255,0.32)", 3);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 29px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(meta.badge, 877, 121);
    ctx.textAlign = "start";
  }

  function drawItemTile(ctx, index, x, y, rotate, scale) {
    const width = 142 * scale;
    const height = 120 * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(14, height / 2 + 22, width * 0.5, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    fillRoundRect(ctx, -width / 2, -height / 2, width, height, 30, COLORS[index % COLORS.length]);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-width / 2 + 20, -height / 2 + 19, width - 40, 9);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${56 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ICONS[index % ICONS.length], 0, -8);
    ctx.fillStyle = "rgba(25,17,48,0.78)";
    ctx.font = `900 ${18 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillText(NAMES[index % NAMES.length], 0, height / 2 - 23);
    ctx.restore();
  }

  function drawSafePile(ctx) {
    const panel = ctx.createLinearGradient(66, 270, 1014, 980);
    panel.addColorStop(0, "#24135d");
    panel.addColorStop(0.55, "#102c68");
    panel.addColorStop(1, "#0d1b40");
    fillRoundRect(ctx, 66, 270, 948, 710, 36, panel);
    strokeRoundRect(ctx, 84, 288, 912, 674, 0, "rgba(111,238,255,0.38)", 4);

    ctx.save();
    roundRect(ctx, 88, 292, 904, 666, 24);
    ctx.clip();
    ctx.fillStyle = "rgba(255,210,63,0.13)";
    ctx.beginPath();
    ctx.ellipse(548, 790, 410, 94, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(548, 826, 330, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    SLOTS.forEach((slot, index) => drawItemTile(ctx, index, ...slot));
    ctx.restore();

    ctx.fillStyle = "#fff7e8";
    ctx.font = "900 38px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("摆法别偷看，自己塞一局", 540, 914);
    ctx.fillStyle = "#37e6f6";
    ctx.font = "900 30px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${getRoundMeta().badge} · 这局满格`, 540, 952);
    ctx.textAlign = "start";
  }

  function drawFooter(ctx, qrImageData) {
    const identity = readIdentity();
    const score = readScore();
    ctx.fillStyle = "#72f06e";
    ctx.font = "900 58px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("满格通关！", 72, 1062);
    ctx.fillStyle = "#fff9f0";
    ctx.font = "900 36px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(identity.name, 72, 1116);
    if (identity.mark) {
      ctx.fillStyle = "rgba(255,255,255,0.46)";
      ctx.font = "800 21px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(`挑战码 ${identity.mark}`, 74, 1152);
    }
    ctx.fillStyle = "#c7d7e3";
    ctx.font = "700 28px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`“${identity.motto}”`, 72, 1198);

    if (score) {
      ctx.fillStyle = "#37e6f6";
      ctx.font = "900 48px 'Chakra Petch', system-ui, sans-serif";
      ctx.fillText(`${score} 分`, 72, 1298);
    }
    ctx.fillStyle = "#fff9f0";
    ctx.font = "800 27px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("双击箱格，直接开塞", 72, 1340);

    fillRoundRect(ctx, 760, 1078, 260, 260, 22, "#ffffff");
    if (qrImageData) ctx.putImageData(qrImageData, 764, 1082);
    ctx.fillStyle = "#fff9f0";
    ctx.font = "900 25px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("扫码来比谁更能装", 890, 1380);
    ctx.textAlign = "start";
  }

  function patchPoster(canvas) {
    if (!canvas || canvas.__packPosterPatched || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let qrImageData = null;
    try {
      qrImageData = ctx.getImageData(764, 1082, 252, 252);
    } catch {
      qrImageData = null;
    }
    canvas.__packPosterPatched = true;

    const bg = ctx.createLinearGradient(0, 0, 1080, 1440);
    bg.addColorStop(0, "#2a0f5f");
    bg.addColorStop(0.44, "#102c68");
    bg.addColorStop(1, "#070a20");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1440);
    drawConfetti(ctx);
    drawHeader(ctx);
    drawSafePile(ctx);
    drawFooter(ctx, qrImageData);
  }

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function patchedToDataURL(...args) {
    patchPoster(this);
    return originalToDataURL.apply(this, args);
  };

  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function patchedToBlob(callback, ...args) {
    patchPoster(this);
    return originalToBlob.call(this, callback, ...args);
  };
})();
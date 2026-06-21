(() => {
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1440;
  const GAME_TITLE = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const QR_CAPTION = "扫码来比谁更能装";
  const SPOILER_LINE = "别偷看摆法，自己来装一局";
  const COLORS = ["#ff6b6b", "#ffad32", "#55d68b", "#4d9cff", "#a56bff", "#24c8d8", "#f06fb5", "#c4dd45", "#ff8058"];
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
    ["完成全部五轮订单", "五关全塞完，装箱王登场"],
    ["专家订单", "终极塞箱王"],
    ["挑战同一订单", "挑战同一箱"],
    ["打开挑战同一订单", "打开挑战同一箱"],
    ["同一箱子、同一组物品。挑战", "同一箱、同一堆东西，来挑战"],
    ["旋转物品，填满箱子。每一关都有唯一的空间挑战。", "旋一旋、塞一塞，每一局都像在跟箱子斗智斗勇。"],
    ["旋转物品，填满箱子。你能完成 100% 完美装箱吗？", "旋一旋、塞一塞，看看谁才是装箱天才。"],
    ["同一箱子、同一组物品。打开即玩，挑战朋友的完美装箱成绩。", "同一箱、同一堆东西，打开就塞，看看谁才是装箱王。"],
    ["旋转物品，填满每一格，再挑战朋友的完美装箱成绩。", "转一转、塞一塞，发给朋友比比谁更能装。"],
  ];
  const SLOTS = [
    [190, 735, -0.12, 1.04],
    [310, 690, 0.1, 1.12],
    [438, 725, -0.08, 1.02],
    [565, 675, 0.13, 1.14],
    [700, 725, -0.1, 1.06],
    [820, 690, 0.08, 1],
    [255, 575, 0.16, 0.98],
    [395, 535, -0.1, 1.08],
    [545, 550, 0.12, 1],
    [690, 535, -0.14, 1.06],
    [465, 420, 0.08, 0.96],
    [610, 420, -0.08, 0.94],
  ];

  function replaceCopy(value) {
    if (!value) return value;
    return TEXT_REPLACEMENTS.reduce((current, [from, to]) => current.replaceAll(from, to), value);
  }

  function polishPageCopy() {
    document.title = replaceCopy(document.title);
    document.querySelectorAll('meta[content]').forEach((meta) => {
      meta.setAttribute("content", replaceCopy(meta.getAttribute("content")));
    });

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

  function readRoundNumber() {
    const value = Number.parseInt(document.querySelector(".level-readout strong")?.textContent || "", 10);
    if (!Number.isFinite(value) || value < 1) return null;
    return Math.min(value, TOTAL_LEVELS);
  }

  function getRoundCopy() {
    const round = readRoundNumber();
    return round ? `已玩到第 ${round}/${TOTAL_LEVELS} 关` : `${TOTAL_LEVELS} 关连装挑战`;
  }

  function drawHeaderCopy(ctx) {
    const headerBackground = ctx.createLinearGradient(64, 45, 64, 195);
    headerBackground.addColorStop(0, "#101e29");
    headerBackground.addColorStop(1, "#071018");
    ctx.fillStyle = headerBackground;
    ctx.fillRect(58, 42, 670, 165);

    ctx.fillStyle = "#32d8df";
    ctx.font = "800 42px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "start";
    ctx.fillText("PACK BATTLE", 72, 88);
    ctx.fillStyle = "#eef7fb";
    ctx.font = "900 78px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(GAME_TITLE, 72, 170);

    roundRect(ctx, 762, 72, 248, 76, 38);
    ctx.fillStyle = "rgba(50,216,223,0.14)";
    ctx.fill();
    ctx.strokeStyle = "rgba(50,216,223,0.42)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#eef7fb";
    ctx.font = "800 30px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(getRoundCopy(), 886, 120);
  }

  function coverSpoilerLayout(canvas) {
    if (canvas.__packSharePosterSafe || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.__packSharePosterSafe = true;

    ctx.save();
    drawHeaderCopy(ctx);

    roundRect(ctx, 66, 270, 948, 710, 34);
    ctx.fillStyle = "#101b25";
    ctx.fill();
    ctx.strokeStyle = "#354a59";
    ctx.lineWidth = 4;
    ctx.strokeRect(84, 288, 912, 674);

    roundRect(ctx, 150, 770, 780, 94, 47);
    ctx.fillStyle = "rgba(50, 216, 223, 0.12)";
    ctx.fill();

    SLOTS.forEach(([x, y, rotate, scale], index) => {
      const width = 132 * scale;
      const height = 112 * scale;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotate);

      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.beginPath();
      ctx.ellipse(12, height / 2 + 18, width * 0.46, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      roundRect(ctx, -width / 2, -height / 2, width, height, 26);
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(-width / 2 + 18, -height / 2 + 18, width - 36, 8);

      ctx.fillStyle = "#ffffff";
      ctx.font = `${52 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ICONS[index % ICONS.length], 0, -6);

      ctx.fillStyle = "rgba(4,10,15,0.72)";
      ctx.font = `800 ${19 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillText(NAMES[index % NAMES.length], 0, height / 2 - 24);
      ctx.restore();
    });

    ctx.fillStyle = "#eef7fb";
    ctx.font = "900 38px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(SPOILER_LINE, 540, 910);
    ctx.fillStyle = "#32d8df";
    ctx.font = "900 34px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${getRoundCopy()} · 这局满格`, 540, 955);

    ctx.fillStyle = "#03070b";
    ctx.fillRect(730, 1348, 320, 48);
    ctx.fillStyle = "#eef7fb";
    ctx.font = "800 25px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(QR_CAPTION, 890, 1376);
    ctx.restore();
  }

  const rawToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function patchedToDataURL(...args) {
    coverSpoilerLayout(this);
    return rawToDataURL.apply(this, args);
  };

  const rawToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function patchedToBlob(callback, type, quality) {
    coverSpoilerLayout(this);
    return rawToBlob.call(this, callback, type, quality);
  };
})();
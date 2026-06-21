(() => {
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1440;
  const GAME_TITLE = "谁最能装？";
  const TOTAL_LEVELS = 5;
  const QR_CAPTION = "扫码来比谁更能装";
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const LEVEL_LABELS = [
    ["新手开塞", "简单"],
    ["拧一拧试试", "普通"],
    ["歪打正着", "进阶"],
    ["手速爆箱", "困难"],
    ["终极塞箱王", "专家"],
  ];
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
  ];
  const SLOTS = [
    [155, 716, -0.14, 1.15],
    [285, 684, 0.12, 1.18],
    [418, 724, -0.08, 1.1],
    [548, 674, 0.14, 1.22],
    [692, 714, -0.12, 1.12],
    [835, 680, 0.1, 1.08],
    [225, 560, 0.16, 1.04],
    [365, 518, -0.1, 1.13],
    [520, 540, 0.12, 1.08],
    [676, 515, -0.15, 1.12],
    [815, 548, 0.14, 1.02],
    [432, 392, 0.09, 1.02],
    [594, 390, -0.08, 1.0],
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
    const imageUrl = `${window.location.origin}/play-pack/assets/link-preview.svg`;
    setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    setMeta('meta[property="og:image:type"]', { property: "og:image:type", content: "image/svg+xml" });
    setMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
    setMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
  }

  function polishPageCopy() {
    document.title = replaceCopy(document.title);
    document.querySelectorAll("meta[content]").forEach((meta) => {
      meta.setAttribute("content", replaceCopy(meta.getAttribute("content")));
    });
    polishSharePreviewMeta();

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
    return {
      round,
      name,
      difficulty,
      progress: `第 ${round}/${TOTAL_LEVELS} 关`,
      badge: `已玩到第 ${round}/${TOTAL_LEVELS} 关`,
    };
  }

  function readIdentity() {
    const name = document.querySelector(".identity-row input")?.value?.trim() || "神秘装箱师";
    const mark = document.querySelector(".identity-row b")?.textContent?.replace("#", "").trim() || "";
    const mottoInput = [...document.querySelectorAll(".share-fields input")][1];
    const motto = mottoInput?.value?.trim() || DEFAULT_MOTTO;
    return { name, mark, motto };
  }

  function drawHeaderCopy(ctx) {
    const meta = getRoundMeta();

    fillRoundRect(ctx, 46, 34, 592, 226, 0, "#071018");
    const headerBackground = ctx.createLinearGradient(54, 36, 620, 256);
    headerBackground.addColorStop(0, "rgba(16,30,41,0.96)");
    headerBackground.addColorStop(1, "rgba(7,16,24,0.92)");
    fillRoundRect(ctx, 54, 42, 558, 204, 30, headerBackground);

    ctx.fillStyle = "rgba(50,216,223,0.18)";
    ctx.fillRect(72, 214, 270, 4);

    ctx.fillStyle = "#32d8df";
    ctx.font = "800 38px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PACK BATTLE", 72, 88);

    ctx.fillStyle = "#eef7fb";
    ctx.font = "900 72px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(GAME_TITLE, 72, 162);

    ctx.fillStyle = "#9fb0bc";
    ctx.font = "700 27px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${meta.progress} · ${meta.name}`, 74, 216);

    fillRoundRect(ctx, 742, 72, 268, 76, 38, "rgba(50,216,223,0.14)");
    strokeRoundRect(ctx, 742, 72, 268, 76, 38, "rgba(50,216,223,0.45)", 3);
    ctx.fillStyle = "#eef7fb";
    ctx.font = "800 29px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(meta.badge, 876, 120);
    ctx.textAlign = "start";
  }

  function drawItemTile(ctx, index, x, y, rotate, scale) {
    const width = 138 * scale;
    const height = 116 * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);

    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.beginPath();
    ctx.ellipse(14, height / 2 + 20, width * 0.48, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    fillRoundRect(ctx, -width / 2, -height / 2, width, height, 28, COLORS[index % COLORS.length]);

    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.fillRect(-width / 2 + 18, -height / 2 + 18, width - 36, 8);

    ctx.fillStyle = "#ffffff";
    ctx.font = `${54 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ICONS[index % ICONS.length], 0, -8);

    ctx.fillStyle = "rgba(4,10,15,0.74)";
    ctx.font = `800 ${18 * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillText(NAMES[index % NAMES.length], 0, height / 2 - 23);
    ctx.restore();
  }

  function drawSafePile(ctx) {
    fillRoundRect(ctx, 66, 270, 948, 710, 34, "#101b25");
    strokeRoundRect(ctx, 84, 288, 912, 674, 0, "#354a59", 4);

    ctx.save();
    roundRect(ctx, 86, 292, 908, 666, 20);
    ctx.clip();

    fillRoundRect(ctx, 150, 770, 780, 94, 47, "rgba(50, 216, 223, 0.12)");
    fillRoundRect(ctx, 132, 800, 820, 78, 39, "rgba(50, 216, 223, 0.1)");

    SLOTS.forEach((slot, index) => drawItemTile(ctx, index, ...slot));

    ctx.fillStyle = "rgba(7,16,24,0.82)";
    ctx.fillRect(0, 884, 1080, 90);
    ctx.restore();

    ctx.fillStyle = "#eef7fb";
    ctx.font = "900 36px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("别偷看摆法，自己来装一局", 540, 918);

    ctx.fillStyle = "#32d8df";
    ctx.font = "900 32px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${getRoundMeta().badge} · 这局满格`, 540, 958);
  }

  function drawBottomCopy(ctx) {
    const identity = readIdentity();

    const footerGradient = ctx.createLinearGradient(48, 1000, 48, 1192);
    footerGradient.addColorStop(0, "#03070b");
    footerGradient.addColorStop(1, "rgba(3,7,11,0.92)");
    ctx.fillStyle = footerGradient;
    ctx.fillRect(48, 1002, 688, 188);

    ctx.fillStyle = "#65db72";
    ctx.font = "900 58px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "start";
    ctx.fillText("满格装箱 100%", 72, 1060);

    ctx.fillStyle = "#eef7fb";
    ctx.font = "800 34px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(identity.name, 72, 1110);

    if (identity.mark) {
      ctx.fillStyle = "rgba(159,176,188,0.55)";
      ctx.font = "700 20px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(`挑战码 ${identity.mark}`, 72, 1140);
    }

    ctx.fillStyle = "#9fb0bc";
    ctx.font = "600 26px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const motto = identity.motto.length > 20 ? `${identity.motto.slice(0, 20)}…` : identity.motto;
    ctx.fillText(`“${motto}”`, 72, 1178);

    ctx.fillStyle = "#03070b";
    ctx.fillRect(730, 1348, 320, 48);
    ctx.fillStyle = "#eef7fb";
    ctx.font = "800 25px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(QR_CAPTION, 890, 1376);
    ctx.textAlign = "start";
  }

  function coverSpoilerLayout(canvas) {
    if (canvas.__packSharePosterSafe || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.__packSharePosterSafe = true;

    ctx.save();
    drawHeaderCopy(ctx);
    drawSafePile(ctx);
    drawBottomCopy(ctx);
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
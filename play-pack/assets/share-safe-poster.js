(() => {
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1440;
  const COLORS = ["#ff6b6b", "#ffad32", "#55d68b", "#4d9cff", "#a56bff", "#24c8d8", "#f06fb5", "#c4dd45", "#ff8058"];
  const NAMES = ["易碎件", "长条盒", "收纳盒", "工具包", "文件箱", "水壶组", "服装袋", "配件盒", "应急包"];
  const ICONS = ["📦", "🧸", "🎒", "🧃", "👕", "📚", "🧰", "🎁", "🛟"];
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

  function coverSpoilerLayout(canvas) {
    if (canvas.__packSharePosterSafe || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.__packSharePosterSafe = true;

    ctx.save();
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
    ctx.fillText("战绩已达成，摆法留给你挑战", 540, 920);
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

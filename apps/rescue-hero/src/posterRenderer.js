import { GAME_CONFIG } from './gameConfig.js';

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawPseudoQr(ctx, x, y, size, text) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, size, size, 28);
  ctx.fill();
  const cells = 23;
  const cell = Math.floor((size - 34) / cells);
  const ox = x + 17;
  const oy = y + 17;
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  ctx.fillStyle = '#101827';
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const finder = (row < 6 && col < 6) || (row < 6 && col > cells - 7) || (row > cells - 7 && col < 6);
      const on = finder || ((row * 17 + col * 31 + hash) % 5 < 2);
      if (on) ctx.fillRect(ox + col * cell, oy + row * cell, cell - 1, cell - 1);
    }
  }
  ctx.restore();
}

function drawIncidentPile(ctx, result) {
  const icons = ['💦', '😤', '📦', '📣', '🔧', '🧭', '🚨', '🧹', '🙂'];
  const colors = ['#36dff2', '#ff5f9d', '#ffb33d', '#76f06b', '#9b7cff', '#4aa3ff', '#ff4b5f'];
  const slots = [
    [215, 580, -0.12, 1.06], [360, 510, 0.09, 1.15], [520, 560, -0.07, 1.05], [685, 505, 0.12, 1.13], [835, 580, -0.1, 1.02],
    [285, 710, 0.1, 1.0], [455, 700, -0.11, 1.1], [635, 710, 0.09, 1.0], [790, 705, -0.05, 1.0],
  ];
  ctx.fillStyle = 'rgba(8,15,35,.72)';
  roundRect(ctx, 120, 405, 840, 470, 52);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.beginPath();
  ctx.ellipse(540, 800, 390, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  slots.forEach(([x, y, rotate, scale], index) => {
    const width = 150 * scale;
    const height = 118 * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillStyle = 'rgba(0,0,0,.24)';
    ctx.beginPath();
    ctx.ellipse(12, height / 2 + 16, width * 0.45, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[index % colors.length];
    roundRect(ctx, -width / 2, -height / 2, width, height, 28);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.26)';
    ctx.fillRect(-width / 2 + 22, -height / 2 + 18, width - 44, 9);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${54 * scale}px system-ui, sans-serif`;
    ctx.fillText(icons[index % icons.length], 0, -4);
    ctx.fillStyle = '#101827';
    ctx.font = `900 ${22 * scale}px system-ui, sans-serif`;
    ctx.fillText(index < result.rescueCount ? '已救' : '待救', 0, height / 2 - 24);
    ctx.restore();
  });
}

export function renderPoster({ result, playerName, motto, challengeUrl }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1440);
  gradient.addColorStop(0, '#22145f');
  gradient.addColorStop(0.52, '#102463');
  gradient.addColorStop(1, '#060817');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1440);

  ctx.fillStyle = 'rgba(255, 95, 157, .18)';
  ctx.beginPath();
  ctx.arc(80, 120, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(55, 230, 242, .16)';
  ctx.beginPath();
  ctx.arc(960, 160, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#37e6f2';
  ctx.font = '900 44px system-ui, sans-serif';
  ctx.fillText('RESCUE RUSH', 72, 96);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 82px system-ui, sans-serif';
  ctx.fillText(GAME_CONFIG.title, 72, 180);
  ctx.fillStyle = '#d6f8ff';
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.fillText(`第 ${result.levelId}/${GAME_CONFIG.totalLevels} 关 · ${result.levelName}`, 76, 240);

  ctx.fillStyle = 'rgba(255,255,255,.12)';
  roundRect(ctx, 742, 78, 260, 80, 40);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${result.accuracy}% 正确率`, 872, 130);
  ctx.textAlign = 'start';

  drawIncidentPile(ctx, result);

  ctx.fillStyle = result.perfect ? '#76f06b' : '#ffe56b';
  ctx.font = '900 66px system-ui, sans-serif';
  ctx.fillText(result.perfect ? '满分救场！' : '全场稳住！', 76, 980);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px system-ui, sans-serif';
  ctx.fillText(playerName, 76, 1036);
  ctx.fillStyle = '#bac7e8';
  ctx.font = '800 30px system-ui, sans-serif';
  ctx.fillText(`救回 ${result.rescueCount}/${result.totalCount} 个状况`, 76, 1084);
  ctx.fillStyle = '#37e6f2';
  ctx.font = '900 64px system-ui, sans-serif';
  ctx.fillText(`${result.score.toLocaleString()} 分`, 76, 1194);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px system-ui, sans-serif';
  ctx.fillText(`用时 ${result.elapsed} 秒`, 76, 1244);

  ctx.fillStyle = '#dfe7ff';
  ctx.font = '900 34px system-ui, sans-serif';
  ctx.fillText(`“${motto}”`, 76, 1138);

  drawPseudoQr(ctx, 766, 1010, 230, challengeUrl);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('扫码来救同一场', 881, 1290);
  ctx.textAlign = 'start';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve({ blob, dataUrl: canvas.toDataURL('image/png') }), 'image/png', 0.95);
  });
}

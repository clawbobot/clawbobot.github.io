import { buildChallengeUrl, buildShareText } from './challengeService.js';
import { renderPoster } from './posterRenderer.js';

export async function createShareAsset({ result, playerName, motto }) {
  const challengeUrl = buildChallengeUrl(result, playerName);
  const poster = await renderPoster({ result, playerName, motto, challengeUrl });
  const text = buildShareText({ playerName, result, motto, challengeUrl });
  return { ...poster, challengeUrl, text };
}

export async function shareImage(asset) {
  const file = new File([asset.blob], '谁最会救场-战绩.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: '谁最会救场？', text: asset.text, files: [file] });
    return true;
  }
  await navigator.clipboard?.writeText(asset.text);
  return false;
}

export function saveImage(asset) {
  const link = document.createElement('a');
  link.href = asset.dataUrl;
  link.download = '谁最会救场-战绩.png';
  link.click();
}

export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

export async function shareChallengeLink(asset) {
  if (navigator.share) {
    await navigator.share({ title: '谁最会救场？', text: '来挑战同一场救场局。', url: asset.challengeUrl });
  } else {
    await copyText(asset.challengeUrl);
  }
}

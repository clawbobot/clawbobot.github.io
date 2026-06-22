import { GAME_CONFIG } from './gameConfig.js';

export function base64UrlEncode(payload) {
  const json = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

export function base64UrlDecode(value) {
  if (!value) return null;
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return JSON.parse(decodeURIComponent(escape(atob(normalized))));
  } catch (error) {
    console.warn('Invalid challenge payload', error);
    return null;
  }
}

export function getChallengeFromLocation(search = window.location.search) {
  const params = new URLSearchParams(search);
  return base64UrlDecode(params.get('challenge'));
}

export function buildChallengePayload(result, playerName) {
  return {
    game: GAME_CONFIG.slug,
    levelId: result.levelId,
    seed: result.seed,
    playerName,
    score: result.score,
    elapsed: result.elapsed,
    accuracy: result.accuracy,
    rescueCount: result.rescueCount,
    ts: Date.now(),
  };
}

export function buildChallengeUrl(result, playerName) {
  const payload = buildChallengePayload(result, playerName);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('challenge', base64UrlEncode(payload));
  return url.toString();
}

function safeName(name, fallback) {
  const clean = String(name || '').trim();
  return clean || fallback;
}

export function compareChallenge(result, challenge, currentName) {
  if (!challenge) return null;
  const me = safeName(currentName, GAME_CONFIG.defaultPlayerName);
  const opponent = safeName(challenge.playerName, 'TA');
  const sameName = me === opponent;
  const displayMe = sameName ? '我' : me;
  const displayOpponent = sameName ? 'TA' : opponent;

  let status = 'tie';
  let metric = 'elapsed';
  let diff = 0;
  if (result.accuracy !== challenge.accuracy) {
    metric = 'accuracy';
    diff = Math.abs(result.accuracy - challenge.accuracy);
    status = result.accuracy > challenge.accuracy ? 'win' : 'lose';
  } else if (result.elapsed !== challenge.elapsed) {
    metric = 'elapsed';
    diff = Math.abs(result.elapsed - challenge.elapsed);
    status = result.elapsed < challenge.elapsed ? 'win' : 'lose';
  } else if (result.score !== challenge.score) {
    metric = 'score';
    diff = Math.abs(result.score - challenge.score);
    status = result.score > challenge.score ? 'win' : 'lose';
  }

  return {
    status,
    metric,
    diff,
    me: displayMe,
    opponent: displayOpponent,
    rawMe: me,
    rawOpponent: opponent,
    myElapsed: result.elapsed,
    opponentElapsed: challenge.elapsed,
    myScore: result.score,
    opponentScore: challenge.score,
    myAccuracy: result.accuracy,
    opponentAccuracy: challenge.accuracy,
  };
}

export function buildPkMotto(comparison) {
  if (!comparison) return GAME_CONFIG.defaultMotto;
  if (comparison.status === 'tie') return `${comparison.me}和${comparison.opponent}打平了，再来一场救场局。`;
  const verb = comparison.status === 'win' ? '比' : '还差';
  if (comparison.metric === 'accuracy') {
    return comparison.status === 'win'
      ? `${comparison.me}比${comparison.opponent}多救对${comparison.diff}%，轮到你救场。`
      : `${comparison.me}还差${comparison.opponent}${comparison.diff}%，再救一次。`;
  }
  if (comparison.metric === 'score') {
    return comparison.status === 'win'
      ? `${comparison.me}比${comparison.opponent}多拿${comparison.diff}分，轮到你救。`
      : `${comparison.me}还差${comparison.opponent}${comparison.diff}分，再来救场。`;
  }
  return comparison.status === 'win'
    ? `${comparison.me}比${comparison.opponent}快${comparison.diff}秒救回全场，轮到你。`
    : `${comparison.me}还差${comparison.opponent}${comparison.diff}秒，再来一场救回来。`;
}

export function buildShareText({ playerName, result, motto, challengeUrl }) {
  return `${playerName}在《${GAME_CONFIG.title}》第${result.levelId}/${GAME_CONFIG.totalLevels}关救回全场，${result.elapsed}秒、${result.accuracy}%正确率、${result.score}分。${motto} ${challengeUrl}`;
}

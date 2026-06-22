import { ACTIONS, ACTION_BY_ID, GAME_CONFIG } from './gameConfig.js';
import { LEVELS } from './levels.js';
import { buildResult, clearWrong, createRound, getAccuracy, getElapsedSeconds, getProgress, handleIncident, makeSeed, selectAction } from './gameEngine.js';
import { buildPkMotto, compareChallenge, getChallengeFromLocation } from './challengeService.js';
import { getDefaultMotto, getResultCopy } from './copywriting.js';
import { copyText, createShareAsset, saveImage, shareChallengeLink, shareImage } from './shareService.js';

const app = document.querySelector('#app');
const storedName = localStorage.getItem('rescue-player-name') || GAME_CONFIG.defaultPlayerName;

let state = {
  screen: 'home',
  playerName: storedName,
  currentLevelId: getChallengeFromLocation()?.levelId || 1,
  challenge: getChallengeFromLocation(),
  round: null,
  result: null,
  comparison: null,
  shareAsset: null,
  shareMotto: GAME_CONFIG.defaultMotto,
  toast: '',
};
let timer = null;
let shareLoading = false;

window.addEventListener('rescue-reset-wrong', (event) => {
  if (state.round) {
    state.round = clearWrong(state.round, event.detail.incidentId);
    render();
  }
});

function levelById(id) {
  return LEVELS.find((level) => level.id === Number(id)) || LEVELS[0];
}

function setToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = '';
    render();
  }, 1400);
}

function startLevel(levelId = state.currentLevelId, seed) {
  const level = levelById(levelId);
  state.screen = 'playing';
  state.currentLevelId = level.id;
  state.result = null;
  state.comparison = null;
  state.round = createRound(level, seed || state.challenge?.seed || makeSeed());
  state.round = selectAction(state.round, ACTIONS[0].id);
  startTimer();
  render();
}

function startTimer() {
  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    if (state.screen === 'playing') render();
  }, 250);
}

function finishRound() {
  if (timer) window.clearInterval(timer);
  const result = buildResult(state.round);
  const comparison = state.challenge ? compareChallenge(result, state.challenge, state.playerName) : null;
  state.result = result;
  state.comparison = comparison;
  state.screen = 'result';
  state.shareMotto = comparison ? buildPkMotto(comparison) : getDefaultMotto(result);
  render();
}

function handleAction(actionId) {
  if (!state.round) return;
  state.round = selectAction(state.round, actionId);
  render();
}

function handleCard(incidentId) {
  if (!state.round) return;
  state.round = handleIncident(state.round, incidentId);
  if (state.round.finishedAt) finishRound();
  else render();
}

function nextLevel() {
  const next = Math.min(GAME_CONFIG.totalLevels, state.currentLevelId + 1);
  state.challenge = null;
  startLevel(next, makeSeed());
}

function retryLevel() {
  startLevel(state.currentLevelId, state.challenge?.seed || makeSeed());
}

function goHome() {
  state.screen = 'home';
  state.round = null;
  state.result = null;
  render();
}

async function openShare(forcePk = false) {
  if (!state.result || shareLoading) return;
  shareLoading = true;
  const motto = forcePk && state.comparison ? buildPkMotto(state.comparison) : (state.shareMotto || getDefaultMotto(state.result));
  state.shareMotto = motto;
  render();
  state.shareAsset = await createShareAsset({ result: state.result, playerName: state.playerName, motto });
  shareLoading = false;
  render();
}

function closeShare() {
  state.shareAsset = null;
  render();
}

function updateName(value) {
  state.playerName = value || GAME_CONFIG.defaultPlayerName;
  localStorage.setItem('rescue-player-name', state.playerName);
}

function updateMotto(value) {
  state.shareMotto = value;
}

function renderHome() {
  const challenge = state.challenge;
  app.innerHTML = `
    <main class="page home-page">
      <section class="hero-card">
        <div class="eyebrow">${GAME_CONFIG.englishTitle}</div>
        <h1>${GAME_CONFIG.title}</h1>
        <p class="lead">突发状况砸过来，点对工具，最快稳住全场。</p>
        ${challenge ? `<div class="challenge-banner">${challenge.playerName || '好友'} 用 ${challenge.elapsed} 秒救完第 ${challenge.levelId}/5 关，来追 TA。</div>` : ''}
        <div class="hero-actions">
          <button class="primary-btn" data-action="start">${challenge ? '开始挑战 TA' : '开始救场'}</button>
          <button class="ghost-btn" data-action="start-l1">从第 1 关开始</button>
        </div>
      </section>
      <section class="rule-strip">
        <div><b>1</b><span>先选工具</span></div>
        <div><b>2</b><span>点状况卡</span></div>
        <div><b>3</b><span>比谁更快</span></div>
      </section>
    </main>`;
}

function renderPlaying() {
  const round = state.round;
  const elapsed = getElapsedSeconds(round);
  const left = Math.max(0, round.level.timeLimit - elapsed);
  const progress = getProgress(round);
  const accuracy = getAccuracy(round);
  app.innerHTML = `
    <main class="page game-page">
      <header class="topbar">
        <div><span>关卡</span><b>${round.level.id}/5</b></div>
        <div><span>得分</span><b>${round.score}</b></div>
        <div class="wide"><span>救场进度</span><i><em style="width:${progress}%"></em></i></div>
        <div><span>剩余</span><b>${left}s</b></div>
      </header>
      <section class="level-card">
        <div>
          <small>${round.level.badge}</small>
          <h2>第 ${round.level.id}/5 关 · ${round.level.name}</h2>
          <p>${round.lastMessage}</p>
        </div>
        <strong>${accuracy}% 正确</strong>
      </section>
      <section class="incident-grid">
        ${round.incidents.map((incident) => {
          const action = ACTION_BY_ID[incident.actionId];
          return `<button class="incident-card ${incident.status}" data-incident="${incident.id}">
            <span class="incident-icon">${incident.icon}</span>
            <b>${incident.title}</b>
            <small>${incident.tip}</small>
            <i>${incident.status === 'done' ? '已救回' : action.label}</i>
          </button>`;
        }).join('')}
      </section>
      <section class="action-dock">
        <p>救场工具</p>
        <div>${ACTIONS.map((action) => `<button class="tool-btn ${round.selectedActionId === action.id ? 'selected' : ''}" style="--tool:${action.color}" data-tool="${action.id}"><span>${action.icon}</span><b>${action.label}</b></button>`).join('')}</div>
      </section>
    </main>`;
}

function renderResult() {
  const result = state.result;
  const comparison = state.comparison;
  const copy = getResultCopy(result, comparison);
  app.innerHTML = `
    <main class="page result-page">
      <section class="result-card ${comparison?.status || ''}">
        <div class="trophy">🏆 救场王登场</div>
        <h1>${copy.title}</h1>
        <div class="compare-pill">${copy.subtitle}</div>
        <p>${result.rescueCount} 个状况全部救回，正确率 ${result.accuracy}%，用时 ${result.elapsed} 秒。</p>
        <div class="stat-row">
          <div><b>${result.score}</b><span>得分</span></div>
          <div><b>${result.accuracy}%</b><span>正确率</span></div>
          <div><b>${result.elapsed}s</b><span>用时</span></div>
        </div>
        ${comparison ? `<button class="primary-btn" data-action="share-pk">${copy.cta}</button>` : `<button class="primary-btn" data-action="share">${copy.cta}</button>`}
        <button class="secondary-btn" data-action="retry">再救一次，继续压秒</button>
        ${result.levelId < GAME_CONFIG.totalLevels && !comparison ? `<button class="ghost-btn" data-action="next">下一关继续救</button>` : ''}
        <button class="text-btn" data-action="home">回到首页</button>
      </section>
    </main>`;
}

function renderShareModal() {
  if (!state.shareAsset && !shareLoading) return '';
  return `
    <div class="modal-backdrop">
      <section class="share-modal">
        <button class="close-btn" data-action="close-share">×</button>
        <small>分享战绩</small>
        <h2>让朋友挑战同一场</h2>
        <div class="poster-preview">${shareLoading ? '<div class="loading">正在生成海报...</div>' : `<img src="${state.shareAsset.dataUrl}" alt="分享海报" />`}</div>
        <label>玩家昵称<input data-field="name" value="${state.playerName}" maxlength="12" /></label>
        <label>救场口号<input data-field="motto" value="${state.shareMotto}" maxlength="32" /></label>
        <div class="share-actions">
          <button class="primary-btn" data-action="share-image" ${shareLoading ? 'disabled' : ''}>分享图片</button>
          <button class="secondary-btn" data-action="save-image" ${shareLoading ? 'disabled' : ''}>保存图片</button>
          <button class="secondary-btn" data-action="copy-text" ${shareLoading ? 'disabled' : ''}>复制文案</button>
          <button class="ghost-btn" data-action="share-link" ${shareLoading ? 'disabled' : ''}>分享挑战链接</button>
        </div>
      </section>
    </div>`;
}

function renderToast() {
  return state.toast ? `<div class="toast">${state.toast}</div>` : '';
}

function bindEvents() {
  app.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', async () => {
      const action = element.dataset.action;
      if (action === 'start') startLevel(state.currentLevelId, state.challenge?.seed);
      if (action === 'start-l1') { state.challenge = null; startLevel(1, makeSeed()); }
      if (action === 'next') nextLevel();
      if (action === 'retry') retryLevel();
      if (action === 'home') goHome();
      if (action === 'share') openShare(false);
      if (action === 'share-pk') openShare(true);
      if (action === 'close-share') closeShare();
      if (action === 'share-image' && state.shareAsset) { await shareImage(state.shareAsset); setToast('能分享就分享，不能分享已复制文案。'); }
      if (action === 'save-image' && state.shareAsset) { saveImage(state.shareAsset); }
      if (action === 'copy-text' && state.shareAsset) { await copyText(state.shareAsset.text); setToast('文案已复制'); }
      if (action === 'share-link' && state.shareAsset) { await shareChallengeLink(state.shareAsset); setToast('挑战链接已准备好'); }
    });
  });
  app.querySelectorAll('[data-tool]').forEach((element) => element.addEventListener('click', () => handleAction(element.dataset.tool)));
  app.querySelectorAll('[data-incident]').forEach((element) => element.addEventListener('click', () => handleCard(element.dataset.incident)));
  app.querySelectorAll('[data-field="name"]').forEach((input) => input.addEventListener('input', (event) => updateName(event.target.value)));
  app.querySelectorAll('[data-field="motto"]').forEach((input) => input.addEventListener('input', (event) => updateMotto(event.target.value)));
}

function render() {
  if (state.screen === 'home') renderHome();
  if (state.screen === 'playing') renderPlaying();
  if (state.screen === 'result') renderResult();
  app.insertAdjacentHTML('beforeend', renderShareModal());
  app.insertAdjacentHTML('beforeend', renderToast());
  bindEvents();
}

render();

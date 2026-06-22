import { GAME_CONFIG } from './gameConfig.js';

export function getResultCopy(result, comparison) {
  if (comparison) {
    if (comparison.status === 'win') return { title: '反超救场！', subtitle: comparison.metric === 'elapsed' ? `你快了 ${comparison.diff} 秒` : '这波你更稳', cta: '我更会救，发回去' };
    if (comparison.status === 'lose') return { title: '差点救回！', subtitle: comparison.metric === 'elapsed' ? `慢了 ${comparison.diff} 秒` : '再救一次能追上', cta: '再救一次，追上 TA' };
    return { title: '平手救场！', subtitle: '再来一局分胜负', cta: '打平了，喊 TA 再战' };
  }
  if (result.levelId === GAME_CONFIG.totalLevels) return { title: '救场王登场！', subtitle: '全场稳住了', cta: '晒出我的救场战绩' };
  if (result.perfect) return { title: '满分救场！', subtitle: '这波不是慌，是专业', cta: '晒出这一关' };
  return { title: '救回来了！', subtitle: '再快一点还能更强', cta: '晒出这一关' };
}

export const mottos = [
  '全场稳住了，轮到你救。',
  '这波不是慌，是专业。',
  '别急，我来救场。',
  '状况再多，也能救回来。',
];

export function getDefaultMotto(result) {
  if (!result) return GAME_CONFIG.defaultMotto;
  if (result.perfect) return '100%救场成功，轮到你上。';
  return mottos[result.levelId % mottos.length];
}

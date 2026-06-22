export const GAME_CONFIG = {
  slug: 'rescue-hero',
  title: '谁最会救场？',
  englishTitle: 'RESCUE RUSH',
  defaultPlayerName: '神秘救场王',
  defaultMotto: '全场稳住了，轮到你救。',
  totalLevels: 5,
  shareTitle: '谁最会救场？',
  shareDescription: '突发状况砸过来，看谁最快稳住全场。',
};

export const ACTIONS = [
  { id: 'mop', icon: '🧹', label: '拖地', color: '#37e6f2' },
  { id: 'calm', icon: '🙂', label: '安抚', color: '#79f269' },
  { id: 'restock', icon: '📦', label: '补货', color: '#ffb33d' },
  { id: 'broadcast', icon: '📣', label: '广播', color: '#ff5fa8' },
  { id: 'repair', icon: '🔧', label: '维修', color: '#9a7cff' },
  { id: 'guide', icon: '🧭', label: '指路', color: '#4aa3ff' },
];

export const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((action) => [action.id, action]));

function rng(seed) {
  let value = (Number(seed) || 1) % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function makeSeed() {
  return Math.floor(Math.random() * 900000) + 100000;
}

export function shuffleBySeed(list, seed) {
  const random = rng(seed);
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function createRound(level, seed = makeSeed()) {
  return {
    level,
    seed,
    incidents: shuffleBySeed(level.incidents, seed).map((incident) => ({ ...incident, status: 'pending' })),
    selectedActionId: 'mop',
    startedAt: Date.now(),
    finishedAt: null,
    score: 0,
    streak: 0,
    mistakes: 0,
    lastMessage: '先点救场工具，再点状况卡片。',
  };
}

export function selectAction(round, actionId) {
  return { ...round, selectedActionId: actionId };
}

export function handleIncident(round, incidentId) {
  if (!round || round.finishedAt) return round;
  const incident = round.incidents.find((item) => item.id === incidentId);
  if (!incident || incident.status === 'done') return round;

  const correct = incident.actionId === round.selectedActionId;
  const nextIncidents = round.incidents.map((item) => {
    if (item.id !== incidentId) return item;
    return { ...item, status: correct ? 'done' : 'wrong' };
  });
  const streak = correct ? round.streak + 1 : 0;
  const scoreGain = correct ? 120 + streak * 25 + incident.urgency * 20 : -35;
  const nextRound = {
    ...round,
    incidents: nextIncidents,
    streak,
    mistakes: correct ? round.mistakes : round.mistakes + 1,
    score: Math.max(0, round.score + scoreGain),
    lastMessage: correct ? `${incident.title}，救回来了！` : '救错了，换个工具再来。',
  };
  if (!correct) {
    window.setTimeout(() => {
      const event = new CustomEvent('rescue-reset-wrong', { detail: { incidentId } });
      window.dispatchEvent(event);
    }, 260);
  }
  return finishIfComplete(nextRound);
}

export function clearWrong(round, incidentId) {
  return {
    ...round,
    incidents: round.incidents.map((item) => (item.id === incidentId && item.status === 'wrong' ? { ...item, status: 'pending' } : item)),
  };
}

export function finishIfComplete(round) {
  if (round.incidents.every((incident) => incident.status === 'done')) {
    return { ...round, finishedAt: round.finishedAt || Date.now() };
  }
  return round;
}

export function getElapsedSeconds(round) {
  if (!round) return 0;
  const end = round.finishedAt || Date.now();
  return Math.max(0, Math.round((end - round.startedAt) / 1000));
}

export function getAccuracy(round) {
  if (!round) return 100;
  const totalAttempts = round.incidents.filter((item) => item.status === 'done').length + round.mistakes;
  if (!totalAttempts) return 100;
  return Math.max(0, Math.round((round.incidents.filter((item) => item.status === 'done').length / totalAttempts) * 100));
}

export function getProgress(round) {
  if (!round) return 0;
  return Math.round((round.incidents.filter((item) => item.status === 'done').length / round.incidents.length) * 100);
}

export function buildResult(round) {
  const elapsed = getElapsedSeconds(round);
  const accuracy = getAccuracy(round);
  const rescueCount = round.incidents.filter((item) => item.status === 'done').length;
  const timeBonus = Math.max(0, round.level.timeLimit - elapsed) * 18;
  const score = Math.max(0, Math.round(round.score + timeBonus + accuracy * 4));
  return {
    levelId: round.level.id,
    levelName: round.level.name,
    seed: round.seed,
    score,
    elapsed,
    accuracy,
    rescueCount,
    totalCount: round.incidents.length,
    perfect: accuracy === 100,
  };
}

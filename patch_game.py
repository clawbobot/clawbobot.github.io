import json

# 1. Rewrite App.jsx
app_jsx = """import {
  ArrowCounterClockwise,
  Broadcast,
  CaretRight,
  Crosshair,
  Lightning,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  Timer,
  Trophy,
  Truck,
  Warning,
  Wind,
  BatteryFull,
  BatteryWarning
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

const ROUND_CONFIG = [
  {
    duration: 30,
    scoreGoal: 15000,
    speed: 0.72,
    title: "充能与设备激活",
    event: "月尘遮挡：发电降低",
    eventAt: 14,
    eventFactor: 0.75,
  },
  {
    duration: 35,
    scoreGoal: 25000,
    speed: 1.02,
    title: "多设备并行测试",
    event: "月食波动：目标加速",
    eventAt: 17,
    eventFactor: 0.85,
  },
  {
    duration: 40,
    scoreGoal: 35000,
    speed: 1.32,
    title: "极端条件生存",
    event: "基地峰值用电：需求上升",
    eventAt: 20,
    eventFactor: 0.80,
  },
];

const SYSTEMS = [
  { id: "oxygen", name: "氧气", watts: 40, icon: Wind, essential: true },
  { id: "comms", name: "通讯", watts: 20, icon: Broadcast },
  { id: "rover", name: "探测车", watts: 15, icon: Truck },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function getBestScore() {
  try {
    return Number(localStorage.getItem("lunar-energy-best") || 0);
  } catch {
    return 0;
  }
}

const triggerHaptic = (type) => {
  try {
    if (!window.navigator.vibrate) return;
    if (type === 'tick') window.navigator.vibrate(10);
    else if (type === 'success') window.navigator.vibrate([30, 50, 30]);
    else if (type === 'error') window.navigator.vibrate([50, 50, 50]);
  } catch {}
};

const logAnalytics = (event, data) => {
  try {
    const records = JSON.parse(localStorage.getItem("moon-energy-analytics") || "[]");
    records.push({ event, timestamp: Date.now(), viewport: `${window.innerWidth}x${window.innerHeight}`, ...data });
    localStorage.setItem("moon-energy-analytics", JSON.stringify(records));
  } catch {}
};

export function App() {
  const [hasActed, setHasActed] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_CONFIG[0].duration);
  const [player, setPlayer] = useState(28);
  const [target, setTarget] = useState(50);
  const [battery, setBattery] = useState(50);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(getBestScore);
  const [systems, setSystems] = useState({ oxygen: true, comms: false, rover: false });
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState("跟住目标窗");
  const [isDragging, setIsDragging] = useState(false);
  
  const trackingRef = useRef(null);
  const elapsedRef = useRef(0);
  const batteryRef = useRef(50);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const feedbackAtRef = useRef(0);
  
  const assetBase = `${import.meta.env.BASE_URL}assets/`;
  const config = ROUND_CONFIG[roundIndex];

  const eventActive = timeLeft <= config.eventAt;
  const alignment = clamp(Math.round(100 - Math.abs(player - target) * 2.35), 0, 100);
  const generation = Math.round(
    (18 + 62 * Math.pow(alignment / 100, 1.65)) *
      (eventActive ? config.eventFactor : 1),
  );
  const demand = SYSTEMS.reduce(
    (sum, system) => sum + (systems[system.id] ? system.watts : 0),
    0,
  );
  
  const surplus = generation - demand;
  const oxygenOnline = systems.oxygen && (surplus >= 0 || batteryRef.current > 0);
  const inWindow = alignment >= 78;

  const statusText = useMemo(() => {
    if (!oxygenOnline) return "氧气供应中断！";
    if (surplus < 0) return `透支电池中 (-${Math.abs(surplus)}W)`;
    if (alignment >= 94) return "完美追踪！正在充能";
    if (alignment >= 78) return "对准良好，正在充能";
    if (alignment >= 62) return "偏离目标，发电低";
    return "寻找最优光照窗";
  }, [alignment, surplus, oxygenOnline]);

  useEffect(() => {
    if (phase !== "playing") return undefined;

    let last = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.15);
      last = now;
      elapsedRef.current += delta;

      const eventSpeed = elapsedRef.current >= config.duration - config.eventAt ? 1.22 : 1;
      const wave =
        50 +
        29 * Math.sin(elapsedRef.current * config.speed * eventSpeed) +
        7 * Math.sin(elapsedRef.current * 0.43 + roundIndex);
      setTarget(clamp(wave, 10, 90));
      setTimeLeft(Math.max(0, config.duration - elapsedRef.current));

      // Battery Logic
      const chargeRate = surplus * 0.5; // 20W surplus = 10% per sec
      batteryRef.current = clamp(batteryRef.current + chargeRate * delta, 0, 100);
      setBattery(batteryRef.current);

      if (batteryRef.current <= 0 && surplus < 0) {
        setPhase("failed");
        triggerHaptic("error");
        logAnalytics("failed_oxygen", { roundIndex, score: scoreRef.current });
        return;
      }

      // Score Logic
      if (oxygenOnline) {
        let baseScore = (24 + alignment * 0.48);
        if (systems.comms) baseScore += 80;
        if (systems.rover) baseScore += 120;
        
        const nextCombo = Math.min(12, Math.floor(alignment / 10) + (systems.comms ? 2 : 0) + (systems.rover ? 3 : 0));
        comboRef.current = nextCombo;
        scoreRef.current += delta * baseScore * nextCombo;
        setCombo(nextCombo);
        setScore(Math.round(scoreRef.current));

        if (now - feedbackAtRef.current > 900) {
          setFeedback(statusText);
          feedbackAtRef.current = now;
          if (alignment >= 94 && soundOn) playTick();
        }
      }

      // Win Condition Logic
      if (elapsedRef.current >= config.duration) {
        if (scoreRef.current >= config.scoreGoal) {
          setPhase(roundIndex === ROUND_CONFIG.length - 1 ? "complete" : "round-won");
          if (soundOn) playSuccess();
          logAnalytics("round-won", { roundIndex, score: scoreRef.current });
        } else {
          setPhase("failed-score");
          triggerHaptic("error");
          logAnalytics("failed_score", { roundIndex, score: scoreRef.current });
        }
      }
    }, 80);

    return () => window.clearInterval(interval);
  }, [
    alignment,
    config,
    phase,
    roundIndex,
    soundOn,
    statusText,
    surplus,
    oxygenOnline,
    systems
  ]);

  useEffect(() => {
    if (phase !== "complete") return;
    const finalScore = Math.round(scoreRef.current);
    if (finalScore > best) {
      setBest(finalScore);
      try {
        localStorage.setItem("lunar-energy-best", String(finalScore));
      } catch {}
    }
  }, [best, phase]);

  const startRound = (index = roundIndex) => {
    const next = ROUND_CONFIG[index];
    setRoundIndex(index);
    setTimeLeft(next.duration);
    setPlayer(index === 0 ? 28 : 50);
    setTarget(50);
    setBattery(50);
    setCombo(0);
    setFeedback("跟住目标窗");
    setSystems({ oxygen: true, comms: false, rover: false });
    elapsedRef.current = 0;
    batteryRef.current = 50;
    comboRef.current = 0;
    feedbackAtRef.current = 0;
    
    if (index === 0) {
      scoreRef.current = 0;
      setScore(0);
    }
    setPhase("playing");
    logAnalytics("start", { roundIndex: index });
  };

  const nextRound = () => startRound(roundIndex + 1);

  const retryRound = () => {
    scoreRef.current = Math.max(0, scoreRef.current - 1500);
    setScore(Math.round(scoreRef.current));
    startRound(roundIndex);
  };

  const restartGame = () => {
    scoreRef.current = 0;
    setScore(0);
    startRound(0);
  };

  const toggleSystem = (id) => {
    if (phase !== "playing") return;
    triggerHaptic("tick");
    setSystems((current) => ({ ...current, [id]: !current[id] }));
  };

  const updatePlayerFromPointer = (clientX) => {
    if (phase !== "playing" || !trackingRef.current) return;
    const rect = trackingRef.current.getBoundingClientRect();
    setPlayer(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100));
  };

  const startTracking = (event) => {
    if (phase !== "playing") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setHasActed(true);
    updatePlayerFromPointer(event.clientX);
  };

  const handleTrackingKey = (event) => {
    if (phase !== "playing" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    setHasActed(true);
    setPlayer((current) => clamp(current + (event.key === "ArrowRight" ? 3 : -3), 0, 100));
  };

  const isDanger = battery <= 20 || (surplus < 0 && battery <= 35);
  const scoreProgress = clamp((score / config.scoreGoal) * 100, 0, 100);

  return (
    <main className={`game-shell ${isDanger ? 'shake-danger' : ''}`}>
      <section className="game-frame" aria-label="月球能源危机科学策略游戏">
        <img className="base-art" style={{ transform: `scale(1.08) rotate(${(player - 50) * 0.15}deg)` }} src={`${assetBase}lunar-base.png`} alt="" />
        <div className={`screen-shade ${isDanger ? 'danger-shade' : ''}`} />

        <header className="hud">
          <div className="hud-stat">
            <span>回合</span>
            <strong>{roundIndex + 1}/3</strong>
          </div>
          <div className="hud-stat timer">
            <Timer weight="bold" />
            <strong className={timeLeft <= 10 ? 'text-coral' : ''}>00:{String(Math.ceil(timeLeft)).padStart(2, "0")}</strong>
          </div>
          <div className="hud-stat">
            <span>得分</span>
            <strong>{score.toLocaleString()}</strong>
          </div>
          <div className="hud-stat combo">
            <span>倍率</span>
            <strong style={{color: combo > 5 ? 'var(--green)' : 'inherit'}}>x{combo}</strong>
          </div>
        </header>

        <div className="mastery" aria-label={`电池储量 ${Math.round(battery)}%`}>
          <span style={{ color: isDanger ? 'var(--coral)' : 'inherit' }}>
            {battery > 20 ? <BatteryFull weight="fill" /> : <BatteryWarning weight="fill" />} 
            电池储量 {Math.round(battery)}%
          </span>
          <div className="mastery-track">
            <div style={{ width: `${battery}%`, background: isDanger ? 'var(--coral)' : (surplus > 0 ? 'var(--green)' : 'var(--amber)') }} />
          </div>
        </div>

        <section className="mission-strip">
          <div className="mission-icon">
            <Trophy weight="fill" />
          </div>
          <div>
            <span>任务目标</span>
            <strong>{config.title} (目标 {config.scoreGoal.toLocaleString()} 分)</strong>
          </div>
          <b style={{color: scoreProgress >= 100 ? 'var(--green)' : 'inherit'}}>{Math.round(scoreProgress)}%</b>
        </section>

        <div className={`event-strip ${eventActive ? "is-active" : ""}`}>
          <Warning weight="fill" />
          <span>
            {eventActive
              ? config.event
              : `${config.event.split("：")[0]}将在 ${Math.max(1, Math.ceil(timeLeft - config.eventAt))} 秒后发生`}
          </span>
        </div>

        <section
          className={`tracking-zone ${isDragging ? "is-dragging" : ""}`}
          ref={trackingRef}
          role="slider"
          tabIndex="0"
          aria-label="调整太阳能板角度"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(player)}
          onPointerDown={startTracking}
          onPointerMove={(event) => isDragging && updatePlayerFromPointer(event.clientX)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          onClick={(event) => updatePlayerFromPointer(event.clientX)}
          onKeyDown={handleTrackingKey}
        >
          <div className="orbit-readout">
            <span>对准角度</span>
            <strong style={{color: inWindow ? 'var(--green)' : 'inherit'}}>{alignment}%</strong>
          </div>
          <div className="target-label" style={{ left: `${target}%` }}>
            最佳窗口
          </div>
          <div className="tracking-rail">
            <div
              className="target-window"
              style={{ left: `${target}%` }}
              aria-hidden="true"
            />
            <div
              className={`player-marker ${inWindow ? "is-aligned" : ""}`}
              style={{ left: `${player}%` }}
              aria-hidden="true"
            >
              <Crosshair weight="bold" />
            </div>
          </div>
          <div className={`feedback ${surplus > 0 && inWindow ? "is-good" : (surplus < 0 ? "is-danger" : "")}`}>
            {feedback}
          </div>
        </section>

        <section className="power-summary" style={{ position: 'relative' }}>
          {!hasActed && phase === "playing" && (
            <div className="affordance-pulse" style={{position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: 'var(--green)', border: '1px solid var(--green)', zIndex: 10, whiteSpace: 'nowrap'}}>
              👆 左右拖动滑块追踪光能
            </div>
          )}
          <div>
            <span>当前发电</span>
            <strong><Lightning weight="fill" /> {generation}W</strong>
          </div>
          <div className={surplus >= 0 ? "positive" : "negative"}>
            <span>{surplus >= 0 ? "电力盈余" : "电力缺口"}</span>
            <strong>{surplus >= 0 ? "+" : ""}{surplus}W</strong>
          </div>
          <div>
            <span>总需求</span>
            <strong>{demand}W</strong>
          </div>
        </section>

        <section className="controls">
          {SYSTEMS.map((sys) => {
            const Icon = sys.icon;
            const active = systems[sys.id];
            return (
              <button
                key={sys.id}
                type="button"
                className={`control-btn ${active ? "is-active" : ""}`}
                onClick={() => !sys.essential && toggleSystem(sys.id)}
                disabled={sys.essential || phase !== "playing"}
              >
                <div className="btn-icon">
                  <Icon weight={active ? "fill" : "regular"} />
                </div>
                <div className="btn-info">
                  <span>{sys.name}</span>
                  <small>{sys.watts}W {active && !sys.essential ? "(+分)" : ""}</small>
                </div>
              </button>
            );
          })}
        </section>

        <footer className="footer-bar">
          <button
            type="button"
            onClick={() => setSoundOn((value) => !value)}
            aria-label={soundOn ? "关闭声音" : "打开声音"}
          >
            {soundOn ? <SpeakerHigh weight="bold" /> : <SpeakerSlash weight="bold" />}
          </button>
          <button
            type="button"
            onClick={() => setPhase((current) => current === "paused" ? "playing" : "paused")}
            disabled={!["playing", "paused"].includes(phase)}
            aria-label={phase === "paused" ? "继续游戏" : "暂停游戏"}
          >
            {phase === "paused" ? <Play weight="fill" /> : <Pause weight="fill" />}
          </button>
        </footer>

        {phase === "ready" && (
          <Overlay>
            <div className="overlay-kicker">科学策略 · 追光挑战 (重制版)</div>
            <h1>月球能源危机</h1>
            <p>追踪光照进行充能！电力充沛时，<strong>开启通讯和探测车</strong>以获取高分。危急时刻关闭它们以保住氧气。</p>
            <div className="rules">
              <span><Crosshair weight="bold" /> 追踪光能</span>
              <span><BatteryFull weight="fill" /> 储电续航</span>
              <span><Trophy weight="fill" /> 风险高分</span>
            </div>
            <button className="primary-action" type="button" onClick={() => startRound(0)}>
              开始任务 <CaretRight weight="bold" />
            </button>
            <small>最佳得分 {best.toLocaleString()}</small>
          </Overlay>
        )}

        {phase === "paused" && (
          <Overlay compact>
            <Pause weight="fill" className="overlay-symbol" />
            <h2>任务已暂停</h2>
            <button className="primary-action" type="button" onClick={() => setPhase("playing")}>
              继续任务 <Play weight="fill" />
            </button>
          </Overlay>
        )}

        {phase === "round-won" && (
          <Overlay compact>
            <Trophy weight="fill" className="overlay-symbol success" />
            <div className="overlay-kicker">回合完成</div>
            <h2>目标达成！获得 {Math.round(score).toLocaleString()} 分</h2>
            <p>你熟练掌握了在盈余时开启设备赚取分数，在低电量时关闭设备求生的节奏。</p>
            <button className="primary-action" type="button" onClick={nextRound}>
              进入回合 {roundIndex + 2} <CaretRight weight="bold" />
            </button>
          </Overlay>
        )}

        {phase === "failed" && (
          <Overlay compact>
            <Warning weight="fill" className="overlay-symbol danger" />
            <div className="overlay-kicker">电池耗尽，氧气中断</div>
            <h2>任务失败</h2>
            <p>你透支了过多的电力。当面临光照不足的事件时，请果断关闭通讯和探测车，依靠电池残量撑过危机。</p>
            <button className="primary-action" type="button" onClick={retryRound}>
              重试本回合 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}

        {phase === "failed-score" && (
          <Overlay compact>
            <Warning weight="fill" className="overlay-symbol danger" />
            <div className="overlay-kicker">时间耗尽</div>
            <h2>分数不足 {config.scoreGoal.toLocaleString()}</h2>
            <p>虽然你活了下来，但得分不够。尝试在电量充足（或有电池余量）时，尽可能多地开启通讯与探测车来获得高额连击分数。</p>
            <button className="primary-action" type="button" onClick={retryRound}>
              重试本回合 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}

        {phase === "complete" && (
          <Overlay>
            <Trophy weight="fill" className="overlay-symbol success" />
            <div className="overlay-kicker">救援任务完成</div>
            <h1>{score.toLocaleString()} 分</h1>
            <p>出色的能源管理！你完美平衡了风险与收益，展现了高超的资源调配能力。</p>
            <div className="result-row">
              <span>最高连击</span><strong>x{Math.max(combo, comboRef.current)}</strong>
              <span>最佳纪录</span><strong>{Math.max(best, score).toLocaleString()}</strong>
            </div>
            <button className="primary-action" type="button" onClick={restartGame}>
              再挑战一次 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}
      </section>
    </main>
  );
}

function Overlay({ children, compact = false }) {
  return (
    <div className="overlay-backdrop">
      <section className={`overlay-panel ${compact ? "is-compact" : ""}`}>
        {children}
      </section>
    </div>
  );
}

function playTick() {
  triggerHaptic("tick");
  playNotes([660], 0.045);
}

function playSuccess() {
  triggerHaptic("success");
  playNotes([523, 659, 784], 0.09);
}

function playNotes(notes, volume) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.1;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.15);
    });
  } catch {
    // Audio feedback is optional.
  }
}
"""

with open('apps/moon-energy-crisis/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_jsx)

css_append = """
/* New specific Juice CSS for the redesign */
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

.shake-danger {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  animation-iteration-count: infinite;
}

.danger-shade {
  background: rgba(255, 60, 60, 0.15) !important;
  box-shadow: inset 0 0 50px rgba(255, 60, 60, 0.5);
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.text-coral {
  color: var(--coral) !important;
}

.is-danger {
  color: var(--coral) !important;
  font-weight: 800;
}
"""

with open('apps/moon-energy-crisis/src/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_append)

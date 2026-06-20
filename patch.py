import json
import re
import os

# 1. Patch App.jsx
app_jsx_path = 'apps/moon-energy-crisis/src/App.jsx'
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    app_jsx = f.read()

# Haptic trigger
haptic_code = """
const triggerHaptic = (type) => {
  try {
    if (!window.navigator.vibrate) return;
    if (type === 'tick') window.navigator.vibrate(10);
    else if (type === 'success') window.navigator.vibrate([30, 50, 30]);
    else if (type === 'error') window.navigator.vibrate([50, 50, 50]);
  } catch {}
};
"""

analytics_code = """
const logAnalytics = (event, data) => {
  try {
    const records = JSON.parse(localStorage.getItem("moon-energy-analytics") || "[]");
    records.push({ event, timestamp: Date.now(), viewport: `${window.innerWidth}x${window.innerHeight}`, ...data });
    localStorage.setItem("moon-energy-analytics", JSON.stringify(records));
  } catch {}
};
"""

app_jsx = app_jsx.replace('export function App() {', haptic_code + '\n' + analytics_code + '\nexport function App() {\n  const [hasActed, setHasActed] = useState(false);')

# Affordance state tracking
app_jsx = app_jsx.replace('const startTracking = (event) => {', 'const startTracking = (event) => {\n    setHasActed(true);')

app_jsx = app_jsx.replace('setPhase("playing");', 'setPhase("playing");\n    logAnalytics("start", { roundIndex: index });')
app_jsx = app_jsx.replace('setPhase(roundIndex === ROUND_CONFIG.length - 1 ? "complete" : "round-won");', 'setPhase(roundIndex === ROUND_CONFIG.length - 1 ? "complete" : "round-won");\n        logAnalytics("round-won", { roundIndex, stable: stableRef.current });')
app_jsx = app_jsx.replace('setPhase("failed");', 'setPhase("failed");\n        logAnalytics("failed", { roundIndex, surplus }); triggerHaptic("error");')

app_jsx = app_jsx.replace('function playTick() {', 'function playTick() {\n  triggerHaptic("tick");')
app_jsx = app_jsx.replace('function playSuccess() {', 'function playSuccess() {\n  triggerHaptic("success");')

# Visual transform
app_jsx = app_jsx.replace('<img className="base-art" src={`${assetBase}lunar-base.png`} alt="" />', 
'<img className="base-art" style={{ transform: `scale(1.08) rotate(${(player - 50) * 0.1}deg)` }} src={`${assetBase}lunar-base.png`} alt="" />')

# Affordance UI
app_jsx = app_jsx.replace('</section>\n\n        <section className="power-summary">', 
"""
          {!hasActed && phase === "playing" && (
            <div className="affordance-pulse" style={{position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
              👆 拖动或长按追踪光能
            </div>
          )}
        </section>

        <section className="power-summary">""")

with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(app_jsx)


# 2. Patch index.html
index_html_path = 'index.html'
with open(index_html_path, 'r', encoding='utf-8') as f:
    index_html = f.read()

project_html = """
        <article class="project-card">
          <div class="project-meta">
            <span class="project-year">2026</span>
            <h3>
              <a href="/play/" class="project-link" data-i18n="moonEnergyTitle">
                Moon Energy Crisis
              </a>
            </h3>
            <p data-i18n="moonEnergyDescription">
              A science strategy game built to validate a learning loop. Target audience: 10-15 years old. Track sunlight, manage power.
            </p>
            <div class="project-links">
              <a href="/play/" class="button outline">
                <span data-i18n="playGame">Play Game</span>
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M232.4,114.4l-144-88A15.9,15.9,0,0,0,64,40V216a15.9,15.9,0,0,0,24.4,13.6l144-88A15.9,15.9,0,0,0,232.4,114.4Z"></path>
                </svg>
              </a>
              <a href="https://github.com/clawbobot/clawbobot.github.io/tree/main/apps/moon-energy-crisis">
                <span data-i18n="readSource">View Source</span>
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,104a8,8,0,0,1-16,0V59.3L136.5,131.3a8,8,0,0,1-11.3-11.3L196.7,48H152a8,8,0,0,1,0-16h80a8,8,0,0,1,8,8Z"></path>
                  <path d="M216,152a8,8,0,0,1,8,8v48a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H96a8,8,0,0,1,0,16H48V208H208V160A8,8,0,0,1,216,152Z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div class="project-visual">
            <img src="/apps/moon-energy-crisis/artifacts/mobile-complete.png" alt="Moon Energy Crisis Gameplay" loading="lazy">
          </div>
        </article>
"""

# Insert project_html right after <div class="project-list">
index_html = index_html.replace('<div class="project-list">', '<div class="project-list">\n' + project_html)

# Add translations
index_html = index_html.replace(
    'codePuppyDescription: "A bilingual terminal AI',
    'moonEnergyTitle: "Moon Energy Crisis",\n        moonEnergyDescription: "A science strategy game built to validate a learning loop. Target audience: 10-15 years old. It features an optimal sunlight tracking and power allocation mechanic.",\n        playGame: "Play Game",\n        codePuppyDescription: "A bilingual terminal AI'
)

index_html = index_html.replace(
    'codePuppyDescription: "面向中文开发者优化的',
    'moonEnergyTitle: "月球能源危机",\n        moonEnergyDescription: "一款旨在验证科学学习机制的策略游戏。目标受众：10-15岁。你需要在追踪最优光照的同时合理分配电力。",\n        playGame: "开始游戏",\n        codePuppyDescription: "面向中文开发者优化的'
)

with open(index_html_path, 'w', encoding='utf-8') as f:
    f.write(index_html)

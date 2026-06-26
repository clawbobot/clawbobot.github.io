import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";

// ── THEME DATA ──────────────────────────────────────────────
const ITEMS = [
  { name: "语文书", emoji: "📚", color: "#ff6b6b" },
  { name: "数学书", emoji: "📗", color: "#4d9cff" },
  { name: "文具盒", emoji: "✏️", color: "#ffad32" },
  { name: "水壶",   emoji: "🥤", color: "#55d68b" },
  { name: "饭盒",   emoji: "🍱", color: "#a56bff" },
  { name: "直尺",   emoji: "📐", color: "#24c8d8" },
  { name: "体育服", emoji: "👕", color: "#f06fb5" },
  { name: "雨伞",   emoji: "☂️", color: "#c4dd45" },
  { name: "作业本", emoji: "📓", color: "#ff8058" },
];

const DIFFICULTY = {
  easy:   { label: "新手场", sub: "6–9岁",   icon: "🌱", timeLimit: 0,  desc: "没有倒计时，慢慢想" },
  medium: { label: "普通场", sub: "9–12岁",  icon: "⚡", timeLimit: 60, desc: "60 秒装完，你行吗？" },
  hard:   { label: "高手场", sub: "12岁以上", icon: "🔥", timeLimit: 45, desc: "45 秒极限挑战" },
};

// ── PUZZLE LAYOUTS (all verified: each letter set is a connected polyomino) ──
// Easy: 4×4 = 16 cells
// Medium: 4×5 = 20 cells
// Hard: 5×5 = 25 cells
const LAYOUTS = {
  easy: [
    [["A","A","B","B"],["A","A","B","B"],["C","C","C","D"],["E","E","E","D"]],
    [["A","A","A","B"],["C","A","D","B"],["C","C","D","B"],["E","E","D","D"]],
    [["A","A","B","C"],["A","D","B","C"],["D","D","B","C"],["E","E","E","C"]],
    [["A","B","B","C"],["A","A","B","C"],["A","D","D","C"],["E","E","D","C"]],
  ],
  medium: [
    [["A","A","A","B","B"],["C","C","A","B","D"],["C","E","E","E","D"],["C","C","F","F","D"]],
    [["A","A","B","B","C"],["A","D","D","B","C"],["D","D","E","E","C"],["F","F","F","E","C"]],
    [["A","B","B","B","B"],["A","C","C","C","C"],["A","D","D","E","E"],["A","D","D","E","E"]],
  ],
  hard: [
    [["A","A","B","B","B"],["A","C","C","B","D"],["A","C","E","E","D"],["F","C","E","G","D"],["F","F","G","G","G"]],
    [["A","A","B","B","C"],["A","D","D","B","C"],["A","D","E","B","C"],["F","D","E","E","G"],["F","F","G","G","G"]],
    [["A","A","B","C","C"],["A","D","B","B","C"],["A","D","D","E","C"],["F","F","D","E","E"],["F","G","G","G","E"]],
  ],
};

// ── PURE GAME FUNCTIONS ──────────────────────────────────────
function rng(seed) {
  let s = (Number(seed) || 1) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function seededShuffle(list, seed) {
  const rand = rng(seed);
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todaySeed() {
  const d = new Date();
  const str = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return (parseInt(str) % 89999) + 10000;
}

function todayNumber() {
  const start = new Date("2026-01-01T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / 86400000) + 178;
}

function shapeFromLayout(layout, id) {
  const cells = [];
  layout.forEach((row, r) => row.forEach((cell, c) => { if (cell === id) cells.push([r, c]); }));
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const maxR = Math.max(...cells.map(([r]) => r));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const shape = Array.from({ length: maxR - minR + 1 }, () => Array(maxC - minC + 1).fill(0));
  cells.forEach(([r, c]) => { shape[r - minR][c - minC] = 1; });
  return shape;
}

function rotateRight(shape) {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
}

function emptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function canPlace(grid, shape, row, col) {
  return shape.every((sr, r) =>
    sr.every((cell, c) => {
      if (!cell) return true;
      const tr = row + r, tc = col + c;
      return tr >= 0 && tr < grid.length && tc >= 0 && tc < grid[0].length && !grid[tr][tc];
    }),
  );
}

function placeOnGrid(grid, shape, data, row, col) {
  const next = grid.map((r) => [...r]);
  shape.forEach((sr, r) => sr.forEach((cell, c) => { if (cell) next[row + r][col + c] = data; }));
  return next;
}

function createPuzzle(diff, seed) {
  const layouts = LAYOUTS[diff];
  const layout = layouts[seed % layouts.length];
  const ids = [...new Set(layout.flat())];
  const ordered = seededShuffle(ids, seed);
  const pieces = ordered.map((id, i) => ({
    uid: id,
    ...ITEMS[i % ITEMS.length],
    shape: shapeFromLayout(layout, id),
  }));
  return { layout, pieces, rows: layout.length, cols: layout[0].length };
}

function encodeChallenge(payload) {
  return btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decodeChallenge(str) {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch { return null; }
}

// ── APP ──────────────────────────────────────────────────────
export function App() {
  const [screen, setScreen] = useState("home");
  const [diff, setDiff] = useState(null);
  const [seed, setSeed] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [selId, setSelId] = useState(null);
  const [selShape, setSelShape] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [phase, setPhase] = useState("playing");
  const [seedInput, setSeedInput] = useState("");
  const [shareAsset, setShareAsset] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("sp-name") || "同学");
  const [challenge, setChallenge] = useState(null);

  // Derived
  const placed = useMemo(() => {
    const set = new Set();
    grid.flat().forEach((cell) => { if (cell) set.add(cell.uid); });
    return set;
  }, [grid]);

  const selPiece = pieces.find((p) => p.uid === selId) ?? null;
  const fillCount = grid.flat().filter(Boolean).length;
  const totalCount = puzzle ? puzzle.rows * puzzle.cols : 1;
  const fillPct = Math.round((fillCount / totalCount) * 100);

  const ghostCells = useMemo(() => {
    if (!selShape || !cursor) return new Set();
    if (!canPlace(grid, selShape, cursor.row, cursor.col)) return new Set();
    const cells = new Set();
    selShape.forEach((sr, r) =>
      sr.forEach((cell, c) => { if (cell) cells.add(`${cursor.row + r},${cursor.col + c}`); }),
    );
    return cells;
  }, [selShape, cursor, grid]);

  const elapsedSec = endedAt && startedAt
    ? Math.round((endedAt - startedAt) / 1000)
    : startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

  const score = (() => {
    if (!puzzle) return 0;
    const cfg = DIFFICULTY[diff];
    if (!cfg?.timeLimit) return 1000;
    return Math.max(100, 1000 + timeLeft * 18);
  })();

  // Parse challenge from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("c");
    if (c) {
      const data = decodeChallenge(c);
      if (data?.d && data?.s) setChallenge(data);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (screen !== "game" || phase !== "playing") return;
    const cfg = DIFFICULTY[diff];
    if (!cfg?.timeLimit) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setPhase("failed"); setEndedAt(Date.now()); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [screen, phase, diff]);

  // Win check
  useEffect(() => {
    if (phase === "playing" && fillPct === 100) {
      setPhase("won");
      setEndedAt(Date.now());
      try { navigator.vibrate?.([30, 50, 30]); } catch {}
    }
  }, [fillPct, phase]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    setToastTimer(setTimeout(() => setToast(""), 1600));
  }

  function startGame(d, s) {
    const p = createPuzzle(d, s);
    setPuzzle(p);
    setGrid(emptyGrid(p.rows, p.cols));
    setPieces(p.pieces);
    setSelId(p.pieces[0]?.uid ?? null);
    setSelShape(p.pieces[0]?.shape ?? null);
    setCursor(null);
    setHistory([]);
    setTimeLeft(DIFFICULTY[d].timeLimit);
    setStartedAt(Date.now());
    setEndedAt(null);
    setPhase("playing");
    setDiff(d);
    setSeed(s);
    setScreen("game");
    setShareAsset(null);
  }

  function selectPiece(uid) {
    if (placed.has(uid)) return;
    const p = pieces.find((x) => x.uid === uid);
    if (!p) return;
    setSelId(uid);
    setSelShape(p.shape);
    setCursor(null);
  }

  function rotate(dir) {
    if (!selShape) return;
    const r = dir === "right" ? rotateRight(selShape) : rotateRight(rotateRight(rotateRight(selShape)));
    setSelShape(r);
  }

  function clickCell(row, col) {
    if (phase !== "playing" || !selShape || !selPiece) return;
    if (!canPlace(grid, selShape, row, col)) {
      showToast("放不下，换个位置或者转一转 🔄");
      return;
    }
    setHistory((h) => [...h, { grid, selId, selShape }]);
    const newGrid = placeOnGrid(
      grid, selShape,
      { uid: selPiece.uid, color: selPiece.color, emoji: selPiece.emoji },
      row, col,
    );
    setGrid(newGrid);
    // Auto-select next unplaced piece
    const nextPiece = pieces.find((p) => p.uid !== selPiece.uid && !placed.has(p.uid));
    if (nextPiece) { setSelId(nextPiece.uid); setSelShape(nextPiece.shape); }
    else { setSelId(null); setSelShape(null); }
    setCursor(null);
  }

  function undo() {
    if (!history.length) return;
    const last = history[history.length - 1];
    setGrid(last.grid);
    setSelId(last.selId);
    setSelShape(last.selShape);
    setHistory((h) => h.slice(0, -1));
    setCursor(null);
  }

  async function openShare() {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const payload = { d: diff, s: seed, n: playerName, sc: score, e: elapsedSec };
      const enc = encodeChallenge(payload);
      const url = `${window.location.origin}${window.location.pathname}?c=${enc}`;
      const qr = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: "#0f1923", light: "#ffffff" } });
      setShareAsset({ url, qr, payload });
    } catch { showToast("生成失败，请重试"); }
    finally { setShareBusy(false); }
  }

  async function copyShareText() {
    if (!shareAsset) return;
    const line = `我用 ${elapsedSec} 秒把书包装满了！🎒 题号 #${seed}，快来挑战我 → ${shareAsset.url}`;
    try { await navigator.clipboard.writeText(line); showToast("已复制，发给同学吧！"); }
    catch { showToast("请手动复制上方链接"); }
  }

  // ── HOME SCREEN ──────────────────────────────────────────
  if (screen === "home") {
    return (
      <div className="shell">
        <div className="home">
          <div className="home-header">
            <div className="home-badge">SCHOOL PACK</div>
            <h1 className="home-title">书包装满它！</h1>
            <p className="home-sub">旋转物品，填满书包，看谁装得最快 🎒</p>
          </div>

          {challenge && (
            <div className="challenge-banner">
              <div>
                <strong>{challenge.n || "好友"}</strong> 用 {challenge.e} 秒装完了
                <br /><small>{DIFFICULTY[challenge.d]?.label} · {challenge.sc} 分</small>
              </div>
              <button onClick={() => startGame(challenge.d, challenge.s)}>接受挑战</button>
            </div>
          )}

          <button className="daily-btn" onClick={() => startGame("medium", todaySeed())}>
            <div>
              <span className="daily-title">📅 今日挑战 #{todayNumber()}</span>
              <small>全国同一道题，比比谁更快</small>
            </div>
            <span className="daily-arrow">→</span>
          </button>

          <div className="section-label">选难度，随机一题</div>
          <div className="diff-grid">
            {Object.entries(DIFFICULTY).map(([key, cfg]) => (
              <button
                key={key}
                className={`diff-card diff-${key}`}
                onClick={() => startGame(key, Math.floor(Math.random() * 89999) + 10000)}
              >
                <span className="diff-icon">{cfg.icon}</span>
                <strong>{cfg.label}</strong>
                <span className="diff-sub">{cfg.sub}</span>
                <small>{cfg.desc}</small>
              </button>
            ))}
          </div>

          <div className="section-label">输入题号，和朋友比同一题</div>
          <div className="seed-row">
            <input
              className="seed-input"
              placeholder="5 位题号，如 47293"
              maxLength={5}
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter" && seedInput.length >= 4) startGame("medium", Number(seedInput)); }}
            />
            <button
              className="seed-go"
              disabled={seedInput.length < 4}
              onClick={() => startGame("medium", Number(seedInput))}
            >
              开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN ──────────────────────────────────────────
  if (screen === "game") {
    const cfg = DIFFICULTY[diff];

    return (
      <div className="shell">
        <div className="game">
          {/* Header */}
          <header className="game-header">
            <button className="btn-icon" onClick={() => setScreen("home")}>←</button>
            <div className="header-center">
              <span className="diff-tag">{cfg.icon} {cfg.label}</span>
              <span className="fill-tag">{fillPct}% 装入</span>
            </div>
            <div className="header-right">
              {cfg.timeLimit > 0 && (
                <span className={`timer ${timeLeft <= 10 ? "timer-danger" : ""}`}>{timeLeft}s</span>
              )}
              <button className="btn-icon" disabled={!history.length} onClick={undo} title="撤销">↩</button>
            </div>
          </header>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
          </div>

          {/* Grid */}
          <div className="grid-wrap">
            <div
              className="grid"
              style={{ "--cols": puzzle?.cols, "--rows": puzzle?.rows }}
              onMouseLeave={() => setCursor(null)}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = `${r},${c}`;
                  const isGhost = ghostCells.has(key);
                  return (
                    <div
                      key={key}
                      className={`cell${cell ? " filled" : ""}${isGhost ? " ghost" : ""}${!cell && selShape ? " hoverable" : ""}`}
                      style={{
                        background: cell ? cell.color : isGhost ? `${selPiece?.color}44` : undefined,
                        borderColor: cell ? `${cell.color}bb` : isGhost ? `${selPiece?.color}99` : undefined,
                      }}
                      onMouseEnter={() => setCursor({ row: r, col: c })}
                      onClick={() => clickCell(r, c)}
                    >
                      {cell && <span className="cell-emoji">{cell.emoji}</span>}
                      {isGhost && !cell && <span className="cell-emoji ghost-emoji">{selPiece?.emoji}</span>}
                    </div>
                  );
                }),
              )}
            </div>
          </div>

          {/* Rotate controls + selected piece hint */}
          <div className="controls">
            <button className="rotate-btn" onClick={() => rotate("left")}>↺ 左转</button>
            {selPiece ? (
              <div className="sel-hint">
                <span className="sel-emoji">{selPiece.emoji}</span>
                <span className="sel-name">{selPiece.name}</span>
              </div>
            ) : <div className="sel-hint"><span className="sel-name sel-done">全部装入！</span></div>}
            <button className="rotate-btn" onClick={() => rotate("right")}>右转 ↻</button>
          </div>

          {/* Shape preview of selected piece */}
          {selShape && (
            <div className="shape-preview-wrap">
              {selShape.map((row, r) => (
                <div key={r} className="shape-row">
                  {row.map((cell, c) => (
                    <div
                      key={c}
                      className="shape-cell"
                      style={{ background: cell ? selPiece?.color : "transparent", opacity: cell ? 1 : 0 }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Piece tray */}
          <div className="tray">
            <div className="tray-label">选一件 → 点格子放进去</div>
            <div className="tray-scroll">
              {pieces.map((p) => {
                const isDone = placed.has(p.uid);
                const isSel = selId === p.uid;
                return (
                  <button
                    key={p.uid}
                    className={`piece-btn${isSel ? " selected" : ""}${isDone ? " done" : ""}`}
                    style={{ "--piece-color": p.color }}
                    onClick={() => selectPiece(p.uid)}
                    disabled={isDone}
                  >
                    <span className="piece-emoji">{p.emoji}</span>
                    <span className="piece-name">{p.name}</span>
                    {isDone && <span className="piece-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="seed-display">题号 #{seed} · 告诉同学，一起比比谁更快</div>

          {/* Overlays */}
          {phase === "won" && (
            <div className="overlay">
              <div className="overlay-card won-card">
                <div className="overlay-big">🎉</div>
                <h2>装满了！</h2>
                <div className="stat-row">
                  <div><b>{elapsedSec}s</b><span>用时</span></div>
                  <div><b>{score}</b><span>得分</span></div>
                  <div><b>100%</b><span>完成</span></div>
                </div>
                <p className="seed-chip">📌 题号 #{seed}</p>

                {!shareAsset ? (
                  <button className="primary-btn" onClick={openShare} disabled={shareBusy}>
                    {shareBusy ? "生成中…" : "🔗 生成挑战链接"}
                  </button>
                ) : (
                  <div className="share-block">
                    <img src={shareAsset.qr} alt="扫码挑战" className="qr-img" />
                    <p className="share-hint">让同学扫码来挑战同一题 📱</p>
                    <button className="secondary-btn" onClick={copyShareText}>📋 复制挑战文案</button>
                  </div>
                )}

                <div className="overlay-actions">
                  <button className="secondary-btn" onClick={() => startGame(diff, Math.floor(Math.random() * 89999) + 10000)}>再来一题</button>
                  <button className="ghost-btn" onClick={() => setScreen("home")}>回首页</button>
                </div>
              </div>
            </div>
          )}

          {phase === "failed" && (
            <div className="overlay">
              <div className="overlay-card fail-card">
                <div className="overlay-big">⏰</div>
                <h2>时间到了！差一点</h2>
                <p>已经装进 {fillPct}%，再快一点就成了～</p>
                <div className="overlay-actions">
                  <button className="primary-btn" onClick={() => startGame(diff, seed)}>再试这道题</button>
                  <button className="secondary-btn" onClick={() => startGame("easy", seed)}>换新手场</button>
                  <button className="ghost-btn" onClick={() => setScreen("home")}>回首页</button>
                </div>
              </div>
            </div>
          )}

          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>
    );
  }

  return null;
}

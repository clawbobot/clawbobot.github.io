import {
  ArrowClockwise,
  ArrowCounterClockwise,
  CheckCircle,
  Lightbulb,
  Package,
  Pause,
  Play,
  Timer,
  Warning,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

const COLORS = ["#ff6b6b", "#ffad32", "#55d68b", "#4d9cff", "#a56bff", "#24c8d8", "#f06fb5", "#c4dd45", "#ff8058"];
const NAMES = ["易碎件", "长条盒", "收纳盒", "工具包", "文件箱", "水壶组", "服装袋", "配件盒", "应急包"];

const LEVELS = [
  {
    name: "基础装箱",
    difficulty: "简单",
    target: 100,
    time: 80,
    speed: "慢速",
    layout: [
      ["A", "A", "B", "B"],
      ["A", "A", "B", "B"],
      ["C", "C", "C", "D"],
      ["E", "E", "E", "D"],
    ],
  },
  {
    name: "转向练习",
    difficulty: "普通",
    target: 100,
    time: 72,
    speed: "中速",
    layout: [
      ["A", "A", "A", "B", "B"],
      ["C", "C", "A", "B", "D"],
      ["C", "E", "E", "E", "D"],
      ["C", "C", "F", "F", "D"],
    ],
  },
  {
    name: "错位拼合",
    difficulty: "进阶",
    target: 100,
    time: 64,
    speed: "中速",
    layout: [
      ["A", "A", "B", "B", "B"],
      ["A", "C", "C", "B", "D"],
      ["A", "C", "E", "E", "D"],
      ["F", "C", "E", "G", "D"],
      ["F", "F", "G", "G", "G"],
    ],
  },
  {
    name: "限时调度",
    difficulty: "困难",
    target: 100,
    time: 56,
    speed: "快速",
    layout: [
      ["A", "A", "A", "B", "B", "C"],
      ["A", "D", "B", "B", "C", "C"],
      ["A", "D", "D", "E", "E", "C"],
      ["F", "F", "D", "E", "G", "G"],
      ["F", "F", "H", "H", "H", "G"],
    ],
  },
  {
    name: "完美订单",
    difficulty: "专家",
    target: 100,
    time: 48,
    speed: "极速",
    layout: [
      ["A", "A", "B", "B", "B", "C"],
      ["A", "D", "D", "B", "C", "C"],
      ["A", "D", "E", "E", "E", "C"],
      ["F", "D", "E", "G", "G", "G"],
      ["F", "F", "H", "H", "G", "I"],
      ["F", "H", "H", "I", "I", "I"],
    ],
  },
];

function shapeFromLayout(layout, id) {
  const cells = [];
  layout.forEach((row, r) => row.forEach((cell, c) => cell === id && cells.push([r, c])));
  const minRow = Math.min(...cells.map(([r]) => r));
  const maxRow = Math.max(...cells.map(([r]) => r));
  const minCol = Math.min(...cells.map(([, c]) => c));
  const maxCol = Math.max(...cells.map(([, c]) => c));
  const shape = Array.from({ length: maxRow - minRow + 1 }, () =>
    Array(maxCol - minCol + 1).fill(0),
  );
  cells.forEach(([r, c]) => {
    shape[r - minRow][c - minCol] = 1;
  });
  return shape;
}

function createPieces(level) {
  const ids = [...new Set(level.layout.flat())];
  return ids.map((id, index) => ({
    uid: `${id}-${index}`,
    id,
    name: NAMES[index],
    color: COLORS[index],
    shape: shapeFromLayout(level.layout, id),
    order: index + 1,
  }));
}

function rotateRight(shape) {
  return shape[0].map((_, column) => shape.map((row) => row[column]).reverse());
}

function rotateLeft(shape) {
  return rotateRight(rotateRight(rotateRight(shape)));
}

function emptyGrid(level) {
  return Array.from({ length: level.layout.length }, () =>
    Array(level.layout[0].length).fill(null),
  );
}

function shapeSize(shape) {
  return shape.flat().filter(Boolean).length;
}

export function App() {
  const [phase, setPhase] = useState("ready");
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [grid, setGrid] = useState(() => emptyGrid(LEVELS[0]));
  const [pieces, setPieces] = useState(() => createPieces(LEVELS[0]));
  const [selectedId, setSelectedId] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [hintVisible, setHintVisible] = useState(false);
  const level = LEVELS[levelIndex];
  const selected = pieces.find((piece) => piece.uid === selectedId) ?? null;

  const filledCells = grid.flat().filter(Boolean).length;
  const totalCells = level.layout.length * level.layout[0].length;
  const fillRatio = filledCells / totalCells;
  const fillPercent = Math.round(fillRatio * 100);
  const placedIds = new Set(grid.flat().filter(Boolean).map((cell) => cell.uid));
  const remaining = pieces.filter((piece) => !placedIds.has(piece.uid));

  const resetLevel = (index = levelIndex, nextPhase = "ready") => {
    const nextLevel = LEVELS[index];
    setGrid(emptyGrid(nextLevel));
    setPieces(createPieces(nextLevel));
    setSelectedId(null);
    setCursor(null);
    setHistory([]);
    setTimeLeft(nextLevel.time);
    setHintVisible(false);
    setPhase(nextPhase);
  };

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setPhase("failed");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || fillPercent !== 100) return;
    const timeBonus = timeLeft * 18;
    const nextCombo = combo + 1;
    const levelPoints = 1000 + timeBonus + nextCombo * 250;
    setScore((current) => current + levelPoints);
    setCombo(nextCombo);
    setPhase("won");
    try {
      window.navigator.vibrate?.([25, 40, 25]);
    } catch {
      // Haptics are optional.
    }
  }, [combo, fillPercent, phase, timeLeft]);

  const canPlace = (piece, row, col) => {
    if (!piece) return false;
    return piece.shape.every((shapeRow, r) =>
      shapeRow.every((cell, c) => {
        if (!cell) return true;
        const targetRow = row + r;
        const targetCol = col + c;
        return (
          targetRow >= 0 &&
          targetRow < grid.length &&
          targetCol >= 0 &&
          targetCol < grid[0].length &&
          grid[targetRow][targetCol] === null
        );
      }),
    );
  };

  const rotateSelected = (direction) => {
    if (!selected || phase !== "playing") return;
    setPieces((current) =>
      current.map((piece) =>
        piece.uid === selected.uid
          ? { ...piece, shape: direction === "left" ? rotateLeft(piece.shape) : rotateRight(piece.shape) }
          : piece,
      ),
    );
    setCursor(null);
    try {
      window.navigator.vibrate?.(5);
    } catch {
      // Haptics are optional.
    }
  };

  const choosePiece = (uid) => {
    if (phase !== "playing") return;
    setSelectedId(uid);
    setCursor(null);
    setHintVisible(false);
  };

  const chooseCell = (row, col) => {
    if (phase !== "playing" || !selected) return;
    setCursor({ row, col });
  };

  const placeSelected = () => {
    if (!selected || !cursor || !canPlace(selected, cursor.row, cursor.col)) return;
    setHistory((current) => [...current, grid]);
    setGrid((current) => {
      const next = current.map((row) => [...row]);
      selected.shape.forEach((shapeRow, r) =>
        shapeRow.forEach((cell, c) => {
          if (cell) next[cursor.row + r][cursor.col + c] = selected;
        }),
      );
      return next;
    });
    setSelectedId(null);
    setCursor(null);
    try {
      window.navigator.vibrate?.(12);
    } catch {
      // Haptics are optional.
    }
  };

  const undo = () => {
    if (!history.length || phase !== "playing") return;
    const previous = history[history.length - 1];
    setGrid(previous);
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
    setCursor(null);
  };

  const previewCells = useMemo(() => {
    if (!selected || !cursor) return new Map();
    const valid = canPlace(selected, cursor.row, cursor.col);
    const cells = new Map();
    selected.shape.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell) cells.set(`${cursor.row + r}-${cursor.col + c}`, valid);
      }),
    );
    return cells;
  }, [cursor, grid, selected]);

  const start = () => resetLevel(levelIndex, "playing");
  const retry = () => {
    setCombo(0);
    resetLevel(levelIndex, "playing");
  };
  const nextLevel = () => {
    if (levelIndex === LEVELS.length - 1) {
      setPhase("complete");
      return;
    }
    const nextIndex = levelIndex + 1;
    setLevelIndex(nextIndex);
    resetLevel(nextIndex, "ready");
  };
  const restart = () => {
    setScore(0);
    setCombo(0);
    setLevelIndex(0);
    resetLevel(0, "ready");
  };

  return (
    <main className="game-shell">
      <section className="game-frame">
        <header className="topbar">
          <div className="level-readout">
            <span>关卡</span>
            <strong>{levelIndex + 1}</strong>
            <small>{level.difficulty}</small>
          </div>
          <div className="score-readout">
            <span>得分</span>
            <strong>{score.toLocaleString()}</strong>
          </div>
          <div className="fill-readout">
            <div><span>填充度</span><strong>{fillPercent}%</strong></div>
            <div className="fill-track"><i style={{ width: `${fillPercent}%` }} /></div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label={phase === "paused" ? "继续游戏" : "暂停游戏"}
            disabled={!["playing", "paused"].includes(phase)}
            onClick={() => setPhase((current) => current === "paused" ? "playing" : "paused")}
          >
            {phase === "paused" ? <Play weight="fill" /> : <Pause weight="fill" />}
          </button>
        </header>

        <section className="mission-panel" aria-label="本轮物品清单">
          <div className="mission-heading">
            <div>
              <span>订单 {levelIndex + 1}/{LEVELS.length}</span>
              <strong><CheckCircle weight="fill" /> 可完美装箱</strong>
            </div>
            <b>目标 {level.target}%</b>
          </div>
          <div className="piece-checklist">
            {pieces.map((piece) => (
              <div className={placedIds.has(piece.uid) ? "check-item is-done" : "check-item"} key={piece.uid}>
                <Shape piece={piece} scale="mini" />
                <span>{piece.order}</span>
              </div>
            ))}
          </div>
          <p>全部物品恰好填满箱子，组合已经过可解验证</p>
        </section>

        <section className="board-section">
          <div
            className="packing-board"
            style={{
              "--cols": level.layout[0].length,
              "--rows": level.layout.length,
            }}
            aria-label={`${level.layout[0].length}列${level.layout.length}行装箱网格`}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const preview = previewCells.get(`${r}-${c}`);
                const classNames = [
                  "grid-cell",
                  cell ? "is-filled" : "",
                  preview === true ? "is-preview-valid" : "",
                  preview === false ? "is-preview-invalid" : "",
                ].filter(Boolean).join(" ");
                return (
                  <button
                    type="button"
                    className={classNames}
                    key={`${r}-${c}`}
                    style={cell ? { "--piece-color": cell.color } : undefined}
                    aria-label={cell ? `${cell.name} 已放置` : `空位 ${r + 1}-${c + 1}`}
                    onClick={() => chooseCell(r, c)}
                  />
                );
              }),
            )}
          </div>
        </section>

        <section className="conveyor-panel">
          <div className="belt-meta">
            <div><span>传送带速度</span><strong>{level.speed}</strong></div>
            <div className="timer"><Timer weight="bold" /><span>剩余</span><strong>{timeLeft}s</strong></div>
          </div>
          <div className="conveyor-window">
            <div className="belt-items">
              {remaining.map((piece) => (
                <button
                  type="button"
                  className={selectedId === piece.uid ? "belt-item is-selected" : "belt-item"}
                  key={piece.uid}
                  aria-label={`选择${piece.name}`}
                  aria-pressed={selectedId === piece.uid}
                  onClick={() => choosePiece(piece.uid)}
                >
                  <Shape piece={piece} scale="belt" />
                  <span>{piece.name}</span>
                </button>
              ))}
              {!remaining.length && <div className="belt-empty">箱子已装满</div>}
            </div>
          </div>
          <p className="interaction-hint">
            {selected ? `已选择${selected.name}：点箱格定位，再调整方向并放入` : "点击传送带物品开始装箱"}
          </p>
        </section>

        <section className="controls">
          <button type="button" onClick={() => rotateSelected("left")} disabled={!selected || phase !== "playing"}>
            <ArrowCounterClockwise weight="bold" /><span>向左旋转</span>
          </button>
          <button type="button" onClick={() => rotateSelected("right")} disabled={!selected || phase !== "playing"}>
            <ArrowClockwise weight="bold" /><span>向右旋转</span>
          </button>
          <button
            type="button"
            className="place-button"
            onClick={placeSelected}
            disabled={!selected || !cursor || !canPlace(selected, cursor.row, cursor.col) || phase !== "playing"}
          >
            <Package weight="fill" /><span>放入箱子</span>
          </button>
        </section>

        <footer className="bottom-tools">
          <button type="button" onClick={undo} disabled={!history.length || phase !== "playing"}>撤销上一步</button>
          <button type="button" onClick={() => setHintVisible((current) => !current)} disabled={phase !== "playing"}>
            <Lightbulb weight="fill" />提示
          </button>
        </footer>

        <div className="next-preview">
          <span>下一关预告</span>
          <b>{levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1].name : "终极结算"}</b>
          <small>{levelIndex < LEVELS.length - 1 ? "箱子增大 · 组合更复杂 · 时间更短" : "完成全部五轮订单"}</small>
        </div>

        {hintVisible && phase === "playing" && (
          <div className="toast">提示：先处理面积最大的物品，边角留给 L 形和短条。</div>
        )}

        {phase === "ready" && (
          <Overlay>
            <div className="overlay-kicker">{level.difficulty} · 第 {levelIndex + 1} 关</div>
            <h1>{level.name}</h1>
            <p>本轮有 {pieces.length} 件不同形状的物品。点击选择，旋转后点箱格定位，再按“放入箱子”。</p>
            <div className="round-facts">
              <span>{level.layout[0].length}×{level.layout.length} 箱格</span>
              <span>{level.time} 秒</span>
              <span>可达 100%</span>
            </div>
            <button className="primary-action" type="button" onClick={start}>
              开始装箱 <Play weight="fill" />
            </button>
          </Overlay>
        )}

        {phase === "paused" && (
          <Overlay compact>
            <Pause className="overlay-symbol" weight="fill" />
            <h2>订单已暂停</h2>
            <button className="primary-action" type="button" onClick={() => setPhase("playing")}>
              继续装箱 <Play weight="fill" />
            </button>
          </Overlay>
        )}

        {phase === "failed" && (
          <Overlay compact>
            <Warning className="overlay-symbol danger" weight="fill" />
            <div className="overlay-kicker">传送带超时</div>
            <h2>还差 {100 - fillPercent}%</h2>
            <p>这组物品一定可以完整装入。换个放置顺序再试一次。</p>
            <button className="primary-action" type="button" onClick={retry}>
              重试本关 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}

        {phase === "won" && (
          <Overlay compact>
            <CheckCircle className="overlay-symbol success" weight="fill" />
            <div className="overlay-kicker">PERFECT PACK</div>
            <h2>100% 完美装箱</h2>
            <p>剩余 {timeLeft} 秒，连击提升至 x{combo}。</p>
            <button className="primary-action" type="button" onClick={nextLevel}>
              {levelIndex === LEVELS.length - 1 ? "查看成绩" : "进入下一关"} <Play weight="fill" />
            </button>
          </Overlay>
        )}

        {phase === "complete" && (
          <Overlay>
            <CheckCircle className="overlay-symbol success" weight="fill" />
            <div className="overlay-kicker">五轮订单完成</div>
            <h1>{score.toLocaleString()} 分</h1>
            <p>你完成了从基础装箱到专家订单的全部可解组合。</p>
            <button className="primary-action" type="button" onClick={restart}>
              再挑战一次 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}
      </section>
    </main>
  );
}

function Shape({ piece, scale }) {
  return (
    <span
      className={`piece-shape ${scale}`}
      style={{
        "--shape-cols": piece.shape[0].length,
        "--shape-rows": piece.shape.length,
        "--piece-color": piece.color,
      }}
      aria-hidden="true"
    >
      {piece.shape.flatMap((row, r) =>
        row.map((cell, c) => <i className={cell ? "is-block" : ""} key={`${r}-${c}`} />),
      )}
    </span>
  );
}

function Overlay({ children, compact = false }) {
  return (
    <div className="overlay-backdrop">
      <section className={`overlay-panel ${compact ? "is-compact" : ""}`}>{children}</section>
    </div>
  );
}

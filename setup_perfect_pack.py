import os
import json

base_dir = "/Users/bobot/Documents/bobot.is-a.dev/apps/perfect-pack"

# Update package.json
with open(f"{base_dir}/package.json", "r") as f:
    pkg = json.load(f)
pkg["name"] = "perfect-pack"
with open(f"{base_dir}/package.json", "w") as f:
    json.dump(pkg, f, indent=2)

# Create an empty App.jsx template
app_jsx = """import {
  Package,
  Warning,
  CheckCircle,
  Play,
  ArrowCounterClockwise
} from "@phosphor-icons/react";
import { useEffect, useState, useRef, useMemo } from "react";
import clsx from "clsx";

// ----------------- Data Structures -----------------

const SHAPES = {
  I2: [[1, 1]],
  I3: [[1, 1, 1]],
  L3: [[1, 0], [1, 1]],
  SQUARE: [[1, 1], [1, 1]],
  DOT: [[1]],
  T4: [[1, 1, 1], [0, 1, 0]],
  L4: [[1, 0], [1, 0], [1, 1]]
};

const ITEMS = [
  { id: 'umbrella', name: '折叠伞', shape: SHAPES.L3, color: '#FF6B6B' },
  { id: 'book', name: '精装书', shape: SHAPES.SQUARE, color: '#48D6B0' },
  { id: 'keyboard', name: '键盘', shape: SHAPES.I3, color: '#8B7CFF' },
  { id: 'apple', name: '苹果', shape: SHAPES.DOT, color: '#FF9E64' },
  { id: 'shoes', name: '运动鞋', shape: SHAPES.T4, color: '#54A0FF' },
  { id: 'bottle', name: '水壶', shape: SHAPES.I2, color: '#00D2FF' },
  { id: 'bag', name: '手提包', shape: SHAPES.L4, color: '#F368E0' },
];

const LEVELS = [
  { cols: 4, rows: 4, pool: ['umbrella', 'book', 'keyboard', 'apple', 'apple', 'bottle', 'shoes'], speed: 1.0, requiredToPass: 0.8 },
  { cols: 5, rows: 4, pool: ['umbrella', 'book', 'bag', 'keyboard', 'shoes', 'apple', 'bottle', 'bottle'], speed: 1.2, requiredToPass: 0.85 },
  { cols: 5, rows: 5, pool: ['book', 'book', 'bag', 'shoes', 'umbrella', 'umbrella', 'keyboard', 'apple', 'apple', 'bottle'], speed: 1.4, requiredToPass: 0.9 },
  { cols: 6, rows: 5, pool: ['bag', 'bag', 'shoes', 'shoes', 'keyboard', 'umbrella', 'book', 'bottle', 'bottle', 'apple', 'apple'], speed: 1.5, requiredToPass: 0.95 }
];

// ----------------- Helpers -----------------

function rotateShape(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const newShape = Array(cols).fill(0).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newShape[c][rows - 1 - r] = shape[r][c];
    }
  }
  return newShape;
}

function getRandomId() {
  return Math.random().toString(36).substring(2, 9);
}

// ----------------- Main Component -----------------

export function App() {
  const [phase, setPhase] = useState("ready"); // ready, playing, evaluating, complete
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [grid, setGrid] = useState([]);
  const [beltItems, setBeltItems] = useState([]);
  
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 }); // relative to viewport
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoverGridPos, setHoverGridPos] = useState(null);
  
  const boardRef = useRef(null);
  const beltRef = useRef(null);
  
  const level = LEVELS[levelIndex];
  
  useEffect(() => {
    if (phase === "ready") {
      const newGrid = Array(level.rows).fill(null).map(() => Array(level.cols).fill(null));
      setGrid(newGrid);
      
      const items = level.pool.map(type => {
        const template = ITEMS.find(i => i.id === type);
        return {
          uid: getRandomId(),
          ...template,
          currentShape: template.shape,
          xPos: 100 // % percentage on belt
        };
      });
      setBeltItems(items);
    }
  }, [level, phase]);

  // Belt movement
  useEffect(() => {
    if (phase !== "playing") return;
    
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      
      setBeltItems(items => {
        const next = items.map(item => {
          if (draggingItem && item.uid === draggingItem.uid) return item;
          return { ...item, xPos: item.xPos - delta * 15 * level.speed };
        });
        
        // If an item drops off the left edge (xPos < -20)
        if (next.some(item => item.xPos < -20)) {
          setPhase("evaluating");
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase, draggingItem, level.speed]);
  
  const canPlace = (shape, gridRow, gridCol) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const targetR = gridRow + r;
          const targetC = gridCol + c;
          if (targetR < 0 || targetR >= level.rows || targetC < 0 || targetC >= level.cols) return false;
          if (grid[targetR][targetC] !== null) return false;
        }
      }
    }
    return true;
  };

  const getHoverPos = (clientX, clientY) => {
    if (!boardRef.current || !draggingItem) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const cellWidth = rect.width / level.cols;
    const cellHeight = rect.height / level.rows;
    
    const dropX = clientX - rect.left - dragOffset.x;
    const dropY = clientY - rect.top - dragOffset.y;
    
    const col = Math.round(dropX / cellWidth);
    const row = Math.round(dropY / cellHeight);
    
    return { row, col };
  };

  const onPointerMove = (e) => {
    if (!draggingItem) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    setHoverGridPos(getHoverPos(e.clientX, e.clientY));
  };
  
  const onPointerUp = (e) => {
    if (!draggingItem) return;
    const hover = getHoverPos(e.clientX, e.clientY);
    
    if (hover && canPlace(draggingItem.currentShape, hover.row, hover.col)) {
      // Place it
      const newGrid = [...grid.map(row => [...row])];
      for (let r = 0; r < draggingItem.currentShape.length; r++) {
        for (let c = 0; c < draggingItem.currentShape[0].length; c++) {
          if (draggingItem.currentShape[r][c]) {
            newGrid[hover.row + r][hover.col + c] = draggingItem;
          }
        }
      }
      setGrid(newGrid);
      setBeltItems(items => items.filter(i => i.uid !== draggingItem.uid));
      try { if (window.navigator.vibrate) window.navigator.vibrate(10); } catch {}
    }
    
    setDraggingItem(null);
    setHoverGridPos(null);
  };
  
  const onPointerDownBeltItem = (e, item) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDraggingItem(item);
  };

  const rotateDraggingItem = () => {
    if (!draggingItem) return;
    setDraggingItem({
      ...draggingItem,
      currentShape: rotateShape(draggingItem.currentShape)
    });
    try { if (window.navigator.vibrate) window.navigator.vibrate(5); } catch {}
  };
  
  const handleShip = () => {
    setPhase("evaluating");
  };
  
  const gridCells = grid.flat();
  const filledCells = gridCells.filter(c => c !== null).length;
  const totalCells = level.rows * level.cols;
  const fillRatio = filledCells / totalCells;
  
  useEffect(() => {
    if (phase === "evaluating") {
      if (fillRatio >= level.requiredToPass) {
        // Success
        const isPerfect = fillRatio === 1.0;
        let points = isPerfect ? 1000 : 500;
        let newCombo = isPerfect ? combo + 1 : 0;
        
        points *= (1 + newCombo * 0.5);
        setScore(s => s + Math.round(points));
        setCombo(newCombo);
        
        if (isPerfect) {
          try { if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]); } catch {}
        }
        
        setTimeout(() => {
          if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(i => i + 1);
            setPhase("ready");
          } else {
            setPhase("complete");
          }
        }, 1500);
        
      } else {
        // Failed
        setCombo(0);
        try { if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]); } catch {}
      }
    }
  }, [phase]);

  const retryLevel = () => {
    setPhase("ready");
  };

  const restartGame = () => {
    setLevelIndex(0);
    setScore(0);
    setCombo(0);
    setPhase("ready");
  };

  // Render shapes
  const renderShape = (item, isDragging = false) => {
    const rows = item.currentShape.length;
    const cols = item.currentShape[0].length;
    return (
      <div 
        className="polyomino" 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2px',
          width: `${cols * 40}px`,
          height: `${rows * 40}px`,
          opacity: isDragging ? 0.8 : 1,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          pointerEvents: isDragging ? 'none' : 'auto'
        }}
      >
        {item.currentShape.map((row, r) => 
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`}
              style={{
                backgroundColor: cell ? item.color : 'transparent',
                borderRadius: '4px',
                boxShadow: cell ? 'inset 0 0 0 1px rgba(0,0,0,0.2)' : 'none'
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <main 
      className="game-shell" 
      onPointerMove={onPointerMove} 
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={e => { e.preventDefault(); rotateDraggingItem(); }}
    >
      <section className="game-frame perfect-pack">
        <header className="hud">
          <div className="hud-stat">
            <span>订单</span>
            <strong>{levelIndex + 1}/{LEVELS.length}</strong>
          </div>
          <div className="hud-stat">
            <span>填充度</span>
            <strong style={{color: fillRatio >= level.requiredToPass ? 'var(--green)' : 'inherit'}}>
              {Math.round(fillRatio * 100)}%
            </strong>
          </div>
          <div className="hud-stat">
            <span>得分</span>
            <strong>{score.toLocaleString()}</strong>
          </div>
          <div className="hud-stat combo">
            <span>连击</span>
            <strong style={{color: combo > 2 ? 'var(--purple)' : 'inherit'}}>x{combo}</strong>
          </div>
        </header>

        <div className="board-container">
          <div 
            ref={boardRef}
            className="packing-board"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${level.cols}, 40px)`,
              gridTemplateRows: `repeat(${level.rows}, 40px)`,
              gap: '2px',
              padding: '4px',
              backgroundColor: 'var(--surface-strong)',
              border: '2px solid var(--border)',
              borderRadius: '8px'
            }}
          >
            {grid.map((row, r) => 
              row.map((cell, c) => {
                const isHoverTarget = hoverGridPos && draggingItem && 
                  r >= hoverGridPos.row && r < hoverGridPos.row + draggingItem.currentShape.length &&
                  c >= hoverGridPos.col && c < hoverGridPos.col + draggingItem.currentShape[0].length &&
                  draggingItem.currentShape[r - hoverGridPos.row][c - hoverGridPos.col];
                
                let bgColor = 'var(--surface)';
                if (cell) bgColor = cell.color;
                else if (isHoverTarget) {
                  bgColor = canPlace(draggingItem.currentShape, hoverGridPos.row, hoverGridPos.col) 
                    ? 'rgba(72, 214, 176, 0.5)' // Green shadow
                    : 'rgba(255, 107, 107, 0.5)'; // Red shadow
                }
                
                return (
                  <div 
                    key={`${r}-${c}`}
                    className="grid-cell"
                    style={{ backgroundColor: bgColor }}
                  />
                );
              })
            )}
          </div>
          {phase === "playing" && (
             <div className="board-actions">
               <button 
                 className="button" 
                 onClick={handleShip}
                 disabled={fillRatio < level.requiredToPass}
               >
                 <Package weight="bold"/> 强行发货
               </button>
               {draggingItem && <div className="hint">👉 右键或多点触控以旋转</div>}
             </div>
          )}
        </div>

        <section className="belt-section">
          <div className="belt-track" ref={beltRef}>
            {beltItems.map(item => (
              <div 
                key={item.uid}
                className="belt-item"
                style={{
                  position: 'absolute',
                  left: `${item.xPos}%`,
                  bottom: '10px',
                  opacity: (draggingItem && draggingItem.uid === item.uid) ? 0 : 1,
                  touchAction: 'none'
                }}
                onPointerDown={e => onPointerDownBeltItem(e, item)}
              >
                {renderShape(item)}
              </div>
            ))}
            <div className="incinerator">🗑️</div>
          </div>
        </section>

        {draggingItem && (
          <div 
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              transform: `translate(${dragPos.x - dragOffset.x}px, ${dragPos.y - dragOffset.y}px)`,
              pointerEvents: 'none',
              zIndex: 100
            }}
          >
            {renderShape(draggingItem, true)}
          </div>
        )}

        {/* Overlays */}
        {phase === "ready" && (
          <Overlay>
            <div className="overlay-kicker">空间管理挑战</div>
            <h1>极速打包专家</h1>
            <p>将传送带上的物品拖入箱子，**右键点击旋转**。填满空隙即可发货，达到100%完美打包将获得超高分！</p>
            <button className="primary-action" type="button" onClick={() => setPhase("playing")}>
              开始打包 <Play weight="fill" />
            </button>
          </Overlay>
        )}

        {phase === "evaluating" && (
          <Overlay compact>
            {fillRatio === 1.0 ? (
              <div className="success-banner">
                <CheckCircle weight="fill" className="overlay-symbol success" />
                <h2>PERFECT PACK!</h2>
                <p>100% 完美利用，连击数 +1</p>
              </div>
            ) : fillRatio >= level.requiredToPass ? (
              <div>
                <h2>打包完成</h2>
                <p>填充率 {Math.round(fillRatio * 100)}%，符合发货标准。</p>
              </div>
            ) : (
              <div>
                <Warning weight="fill" className="overlay-symbol danger" />
                <h2>打包失败</h2>
                <p>由于关键物品掉落且填充率不足，订单被取消。</p>
                <button className="primary-action" type="button" onClick={retryLevel}>
                  重试本关 <ArrowCounterClockwise weight="bold" />
                </button>
              </div>
            )}
          </Overlay>
        )}
        
        {phase === "complete" && (
          <Overlay>
            <CheckCircle weight="fill" className="overlay-symbol success" />
            <div className="overlay-kicker">所有订单完成</div>
            <h1>最终得分: {score.toLocaleString()}</h1>
            <p>你的空间管理能力惊艳了所有人。最高连击: {combo}</p>
            <button className="primary-action" type="button" onClick={restartGame}>
              重新开始 <ArrowCounterClockwise weight="bold" />
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
"""
with open(f"{base_dir}/src/App.jsx", "w") as f:
    f.write(app_jsx)

css_append = """
.perfect-pack {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.board-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  gap: 1rem;
}

.grid-cell {
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
  transition: background-color 0.1s;
}

.belt-section {
  height: 120px;
  background: var(--surface-strong);
  border-top: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.belt-track {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 0;
  right: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
  background-size: 28px 28px;
  animation: beltMove 1s linear infinite;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

@keyframes beltMove {
  from { background-position: 0 0; }
  to { background-position: -28px 0; }
}

.belt-item {
  cursor: grab;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.belt-item:active {
  cursor: grabbing;
}

.incinerator {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 100%;
  background: rgba(255, 0, 0, 0.2);
  border-right: 2px dashed var(--coral);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.board-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hint {
  font-size: 12px;
  color: var(--muted);
}
"""

with open(f"{base_dir}/src/styles.css", "a") as f:
    f.write(css_append)

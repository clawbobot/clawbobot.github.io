import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowRight,
  CheckCircle,
  Copy,
  DownloadSimple,
  Lightbulb,
  Package,
  Pause,
  Play,
  QrCode,
  ShareNetwork,
  Timer,
  Warning,
} from "@phosphor-icons/react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";

const GAME_NAME = "这也能装？";
const DEFAULT_MOTTO = "没有装不下，只有没转对。";
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

function randomMark() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function getIdentity() {
  const fallback = { name: "神秘装箱师", mark: randomMark(), motto: "" };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem("pack-share-identity") || "{}") };
  } catch {
    return fallback;
  }
}

function encodeChallenge(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeChallenge(value) {
  if (!value) return null;
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!Number.isInteger(parsed.level) || !LEVELS[parsed.level]) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getInitialChallenge() {
  return decodeChallenge(new URLSearchParams(window.location.search).get("challenge"));
}

function isWeChatBrowser() {
  return (
    /MicroMessenger/i.test(navigator.userAgent) ||
    (import.meta.env.DEV && new URLSearchParams(window.location.search).get("wechat-preview") === "1")
  );
}

function upsertMeta(property, content) {
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for older embedded browsers.
    }
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const characters = [...text];
  let line = "";
  let lineCount = 0;
  for (const character of characters) {
    const test = line + character;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = character;
      lineCount += 1;
      if (lineCount === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  context.fillText(line, x, y + lineCount * lineHeight);
}

async function renderShareCard({ challengeUrl, identity, result }) {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  const level = LEVELS[result.levelIndex];
  const cardLayout = result.layout || level.layout;
  const ids = [...new Set(cardLayout.flat())];
  const colorById = Object.fromEntries(ids.map((id) => [id, COLORS[id.charCodeAt(0) - 65]]));

  const background = context.createLinearGradient(0, 0, 0, 1440);
  background.addColorStop(0, "#101e29");
  background.addColorStop(0.42, "#071018");
  background.addColorStop(1, "#03070b");
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1440);

  context.fillStyle = "rgba(50, 216, 223, 0.08)";
  context.beginPath();
  context.arc(920, 90, 260, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#32d8df";
  context.font = "800 42px 'Noto Sans SC', sans-serif";
  context.fillText("PERFECT PACK", 72, 88);
  context.fillStyle = "#eef7fb";
  context.font = "900 74px 'Noto Sans SC', sans-serif";
  context.fillText(GAME_NAME, 72, 170);
  context.fillStyle = "#8293a2";
  context.font = "600 30px 'Noto Sans SC', sans-serif";
  context.fillText(`${level.name} · ${level.difficulty}`, 74, 218);

  context.fillStyle = "#101b25";
  roundedRect(context, 66, 270, 948, 710, 34);
  context.strokeStyle = "#354a59";
  context.lineWidth = 4;
  context.strokeRect(84, 288, 912, 674);

  const boardSize = 620;
  const rows = cardLayout.length;
  const cols = cardLayout[0].length;
  const cell = Math.min(boardSize / cols, boardSize / rows);
  const gridWidth = cell * cols;
  const gridHeight = cell * rows;
  const gridX = 540 - gridWidth / 2;
  const gridY = 305 + (640 - gridHeight) / 2;
  cardLayout.forEach((row, r) => {
    row.forEach((id, c) => {
      const x = gridX + c * cell;
      const y = gridY + r * cell;
      context.fillStyle = colorById[id];
      context.beginPath();
      context.roundRect(x + 4, y + 4, cell - 8, cell - 8, 12);
      context.fill();
      context.fillStyle = "rgba(255,255,255,0.18)";
      context.fillRect(x + 12, y + 12, cell - 24, 5);
      context.strokeStyle = "rgba(4,10,15,0.42)";
      context.lineWidth = 4;
      context.stroke();
    });
  });

  context.fillStyle = "#65db72";
  context.font = "900 56px 'Noto Sans SC', sans-serif";
  context.fillText("100% 完美装箱", 72, 1055);

  context.fillStyle = "#eef7fb";
  context.font = "800 38px 'Noto Sans SC', sans-serif";
  context.fillText(`${identity.name} · #${identity.mark}`, 72, 1110);
  context.fillStyle = "#9fb0bc";
  context.font = "600 29px 'Noto Sans SC', sans-serif";
  wrapCanvasText(context, `“${identity.motto || DEFAULT_MOTTO}”`, 72, 1160, 650, 40);

  context.fillStyle = "#32d8df";
  context.font = "800 48px 'Chakra Petch', sans-serif";
  context.fillText(`${result.roundScore.toLocaleString()} 分`, 72, 1288);
  context.fillStyle = "#eef7fb";
  context.font = "700 29px 'Noto Sans SC', sans-serif";
  context.fillText(`用时 ${result.elapsed} 秒   ·   连击 x${result.combo}`, 72, 1332);

  const qrDataUrl = await QRCode.toDataURL(challengeUrl, {
    width: 244,
    margin: 2,
    color: { dark: "#071018", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  const qrImage = await loadImage(qrDataUrl);
  context.fillStyle = "#ffffff";
  roundedRect(context, 764, 1084, 252, 252, 18);
  context.drawImage(qrImage, 768, 1088, 244, 244);
  context.fillStyle = "#eef7fb";
  context.font = "700 25px 'Noto Sans SC', sans-serif";
  context.textAlign = "center";
  context.fillText("扫码挑战同一订单", 890, 1376);
  context.textAlign = "start";

  return {
    dataUrl: canvas.toDataURL("image/png"),
    blob: await new Promise((resolve) => canvas.toBlob(resolve, "image/png")),
    qrDataUrl,
  };
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
  const [identity, setIdentity] = useState(getIdentity);
  const [challenge, setChallenge] = useState(getInitialChallenge);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAsset, setShareAsset] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [imageFocusOpen, setImageFocusOpen] = useState(false);
  const [isWeChat] = useState(isWeChatBrowser);
  const shareEntryUrlRef = useRef(window.location.href);
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
    setLastResult(null);
    setShareOpen(false);
    setPhase(nextPhase);
  };

  useEffect(() => {
    document.title = challenge
      ? `${challenge.name || "好友"}用 ${challenge.elapsed} 秒装满了，你能更快吗？`
      : `${GAME_NAME} · 空间装箱挑战`;
    const description = challenge
      ? `同一箱子、同一组物品。挑战 ${challenge.name || "好友"} 的 ${challenge.roundScore} 分。`
      : "旋转物品，填满箱子。每一关都有唯一的空间挑战。";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    upsertMeta("og:title", document.title);
    upsertMeta("og:description", description);
    upsertMeta("og:type", "website");
  }, [challenge]);

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
    const elapsed = level.time - timeLeft;
    const timeBonus = timeLeft * 18;
    const nextCombo = combo + 1;
    const roundScore = 1000 + timeBonus + nextCombo * 250;
    const nextScore = score + roundScore;
    setScore(nextScore);
    setCombo(nextCombo);
    setLastResult({
      levelIndex,
      elapsed,
      remaining: timeLeft,
      roundScore,
      totalScore: nextScore,
      combo: nextCombo,
      layout: grid.map((row) => row.map((cell) => cell.id)),
    });
    setPhase("won");
    try {
      window.navigator.vibrate?.([25, 40, 25]);
    } catch {
      // Haptics are optional.
    }
  }, [combo, fillPercent, grid, level.time, levelIndex, phase, score, timeLeft]);

  useEffect(() => {
    if (!shareOpen || !lastResult) return;
    let active = true;
    setShareBusy(true);
    setShareNotice("");
    const payload = {
      v: 1,
      level: lastResult.levelIndex,
      name: identity.name.trim() || "神秘装箱师",
      mark: identity.mark,
      motto: identity.motto.trim(),
      roundScore: lastResult.roundScore,
      elapsed: lastResult.elapsed,
      combo: lastResult.combo,
    };
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("challenge", encodeChallenge(payload));
    renderShareCard({ challengeUrl: url.toString(), identity, result: lastResult })
      .then((asset) => {
        if (active) {
          setShareAsset({ ...asset, url: url.toString(), payload });
          if (isWeChat) window.history.replaceState({}, "", url);
        }
      })
      .finally(() => active && setShareBusy(false));
    try {
      localStorage.setItem("pack-share-identity", JSON.stringify(identity));
    } catch {
      // Identity persistence is optional.
    }
    return () => {
      active = false;
    };
  }, [identity, isWeChat, lastResult, shareOpen]);

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
    if (challengeAccepted) {
      setChallengeAccepted(false);
      setChallenge(null);
      window.history.replaceState({}, "", window.location.pathname);
    }
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
    setChallengeAccepted(false);
    setChallenge(null);
    window.history.replaceState({}, "", window.location.pathname);
    resetLevel(0, "ready");
  };
  const acceptChallenge = () => {
    const challengeLevel = challenge.level;
    setLevelIndex(challengeLevel);
    setScore(0);
    setCombo(0);
    setChallengeAccepted(true);
    resetLevel(challengeLevel, "playing");
  };

  const shareTitle = shareAsset
    ? `${shareAsset.payload.name}用 ${shareAsset.payload.elapsed} 秒装满了，你能更快吗？`
    : `${GAME_NAME}挑战`;
  const shareText = shareAsset
    ? `${shareAsset.payload.name}在《${GAME_NAME}》拿到 ${shareAsset.payload.roundScore.toLocaleString()} 分。打开挑战同一订单！`
    : `来挑战《${GAME_NAME}》`;

  const copyChallenge = async () => {
    if (!shareAsset) return;
    await copyText(`${shareTitle}\n${shareText}\n${shareAsset.url}`);
    setShareNotice("挑战文案和链接已复制");
  };

  const copyChallengeLink = async () => {
    if (!shareAsset) return;
    await copyText(shareAsset.url);
    setShareNotice("挑战链接已复制");
  };

  const openShareStudio = () => {
    shareEntryUrlRef.current = window.location.href;
    setShareOpen(true);
  };

  const closeShareStudio = () => {
    setImageFocusOpen(false);
    setShareOpen(false);
    if (isWeChat) window.history.replaceState({}, "", shareEntryUrlRef.current);
  };

  const showWeChatShareGuide = () => {
    setShareNotice("请点右上角 ···，选择“发送给朋友”或“分享到朋友圈”");
  };

  const shareLink = async () => {
    if (!shareAsset) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareAsset.url });
        setShareNotice("分享面板已打开");
      } else {
        await copyChallenge();
      }
    } catch (error) {
      if (error?.name !== "AbortError") await copyChallenge();
    }
  };

  const downloadCard = () => {
    if (!shareAsset) return;
    const anchor = document.createElement("a");
    anchor.href = shareAsset.dataUrl;
    anchor.download = `这也能装-${shareAsset.payload.name}-${LEVELS[lastResult.levelIndex].name}.png`;
    anchor.click();
    setShareNotice("战绩图片已保存");
  };

  const shareCard = async () => {
    if (!shareAsset) return;
    const file = new File([shareAsset.blob], "这也能装-完美装箱.png", { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] });
        setShareNotice("图片分享面板已打开");
      } else {
        downloadCard();
      }
    } catch (error) {
      if (error?.name !== "AbortError") downloadCard();
    }
  };

  const comparison = challenge && lastResult
    ? {
        faster: challenge.elapsed - lastResult.elapsed,
        scoreLead: lastResult.roundScore - challenge.roundScore,
      }
    : null;

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
              <span>{challengeAccepted ? `${challenge.name} 的挑战` : `订单 ${levelIndex + 1}/${LEVELS.length}`}</span>
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
            style={{ "--cols": level.layout[0].length, "--rows": level.layout.length }}
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
          <span>{GAME_NAME}</span>
          <b>{levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1].name : "终极结算"}</b>
          <small>{levelIndex < LEVELS.length - 1 ? "箱子增大 · 组合更复杂 · 时间更短" : "完成全部五轮订单"}</small>
        </div>

        {hintVisible && phase === "playing" && (
          <div className="toast">提示：先处理面积最大的物品，边角留给 L 形和短条。</div>
        )}

        {phase === "ready" && !challenge && (
          <Overlay>
            <div className="overlay-kicker">{GAME_NAME}</div>
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

        {challenge && !challengeAccepted && (
          <Overlay>
            <div className="challenge-mark">#{challenge.mark || "PACK"}</div>
            <div className="overlay-kicker">{challenge.name || "好友"} 的完美装箱挑战</div>
            <h1>{challenge.roundScore.toLocaleString()} 分</h1>
            <div className="challenge-stats">
              <span>100% 填充</span><span>{challenge.elapsed} 秒</span><span>连击 x{challenge.combo}</span>
            </div>
            <p>“{challenge.motto || DEFAULT_MOTTO}”</p>
            <button className="primary-action" type="button" onClick={acceptChallenge}>
              挑战同一订单 <ArrowRight weight="bold" />
            </button>
            <button className="text-action" type="button" onClick={restart}>先自己玩一局</button>
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

        {phase === "won" && lastResult && !shareOpen && (
          <Overlay compact>
            <CheckCircle className="overlay-symbol success" weight="fill" />
            <div className="overlay-kicker">这也能装！</div>
            <h2>100% 完美装箱</h2>
            {comparison ? (
              <div className="comparison-result">
                <strong>{comparison.faster > 0 ? `你快了 ${comparison.faster} 秒` : comparison.faster < 0 ? `慢了 ${Math.abs(comparison.faster)} 秒` : "用时打平"}</strong>
                <span>{comparison.scoreLead >= 0 ? `得分领先 ${comparison.scoreLead}` : `得分落后 ${Math.abs(comparison.scoreLead)}`}</span>
              </div>
            ) : (
              <p>用时 {lastResult.elapsed} 秒，获得 {lastResult.roundScore.toLocaleString()} 分，连击 x{lastResult.combo}。</p>
            )}
            <button className="primary-action share-cta" type="button" onClick={openShareStudio}>
              生成我的装箱战绩 <ShareNetwork weight="bold" />
            </button>
            <button className="text-action" type="button" onClick={nextLevel}>
              {challengeAccepted ? "继续普通关卡" : levelIndex === LEVELS.length - 1 ? "查看最终成绩" : "暂不分享，进入下一关"}
            </button>
          </Overlay>
        )}

        {phase === "complete" && (
          <Overlay>
            <CheckCircle className="overlay-symbol success" weight="fill" />
            <div className="overlay-kicker">{GAME_NAME}</div>
            <h1>{score.toLocaleString()} 分</h1>
            <p>你完成了从基础装箱到专家订单的全部可解组合。</p>
            <button className="primary-action" type="button" onClick={restart}>
              再挑战一次 <ArrowCounterClockwise weight="bold" />
            </button>
          </Overlay>
        )}

        {shareOpen && lastResult && (
          <div className="share-backdrop">
            <section className="share-studio" aria-label="装箱战绩分享">
              <header>
                <div>
                  <span>分享战绩</span>
                  <h2>让朋友挑战同一箱</h2>
                </div>
                <button type="button" onClick={closeShareStudio} aria-label="关闭分享">×</button>
              </header>

              <div className="share-card-preview">
                {shareBusy && <div className="share-loading">正在生成战绩图…</div>}
                {shareAsset && (
                  <button
                    className="share-preview-button"
                    type="button"
                    onClick={() => isWeChat && setImageFocusOpen(true)}
                    aria-label={isWeChat ? "打开高清战绩图" : "战绩图预览"}
                  >
                    <img src={shareAsset.dataUrl} alt="带二维码的完美装箱战绩卡" />
                  </button>
                )}
              </div>

              {isWeChat && (
                <div className="wechat-tip">
                  <strong>微信内分享</strong>
                  <span>打开大图后长按，可保存图片或直接发送给朋友。</span>
                </div>
              )}

              <div className="share-fields">
                <label>
                  <span>用户标记</span>
                  <div className="identity-row">
                    <input
                      value={identity.name}
                      maxLength={12}
                      onChange={(event) => setIdentity((current) => ({ ...current, name: event.target.value }))}
                      aria-label="用户昵称"
                    />
                    <b>#{identity.mark}</b>
                  </div>
                </label>
                <label>
                  <span>一句话宣言（可选）</span>
                  <input
                    value={identity.motto}
                    maxLength={24}
                    placeholder={DEFAULT_MOTTO}
                    onChange={(event) => setIdentity((current) => ({ ...current, motto: event.target.value.replace(/[\r\n]/g, "") }))}
                    aria-label="一句话宣言"
                  />
                </label>
              </div>

              <div className="share-actions">
                {isWeChat ? (
                  <>
                    <button className="share-primary" type="button" onClick={() => setImageFocusOpen(true)} disabled={!shareAsset}>
                      <QrCode weight="bold" /> 打开大图并长按
                    </button>
                    <button type="button" onClick={showWeChatShareGuide} disabled={!shareAsset}>
                      <ShareNetwork weight="bold" /> 右上角分享挑战
                    </button>
                  </>
                ) : (
                  <>
                    <button className="share-primary" type="button" onClick={shareCard} disabled={!shareAsset}>
                      <ShareNetwork weight="bold" /> 分享图片
                    </button>
                    <button type="button" onClick={shareLink} disabled={!shareAsset}>
                      <QrCode weight="bold" /> 分享挑战链接
                    </button>
                    <button type="button" onClick={downloadCard} disabled={!shareAsset}>
                      <DownloadSimple weight="bold" /> 保存图片
                    </button>
                  </>
                )}
                {isWeChat && (
                  <button type="button" onClick={copyChallengeLink} disabled={!shareAsset}>
                    <Copy weight="bold" /> 复制挑战链接
                  </button>
                )}
                <button type="button" onClick={copyChallenge} disabled={!shareAsset}>
                  <Copy weight="bold" /> 复制文案
                </button>
              </div>
              {shareNotice && <p className="share-notice">{shareNotice}</p>}
            </section>
          </div>
        )}

        {imageFocusOpen && shareAsset && (
          <div className="wechat-image-viewer">
            <header>
              <strong>长按图片保存或发送给朋友</strong>
              <button type="button" onClick={() => setImageFocusOpen(false)} aria-label="关闭高清图片">完成</button>
            </header>
            <div className="wechat-image-scroll">
              <img src={shareAsset.dataUrl} alt="高清完美装箱战绩卡，长按可保存或发送" />
            </div>
            <p>若长按菜单没有出现，请轻点图片后再长按。</p>
          </div>
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

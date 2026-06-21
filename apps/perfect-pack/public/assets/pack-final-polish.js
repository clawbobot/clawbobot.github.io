(() => {
  const TOTAL = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const PK_MOTTO_MARKER = "data-pack-pk-motto-applied";

  function injectStyle() {
    if (document.getElementById("pack-final-polish-style")) return;
    const style = document.createElement("style");
    style.id = "pack-final-polish-style";
    style.textContent = `
      .pack-pk-retry,
      button[data-pack-retry-polished="true"] {
        width: 100% !important;
        min-height: 66px !important;
        margin-top: 12px !important;
        border: 0 !important;
        border-radius: 22px !important;
        color: #17122b !important;
        font-weight: 1000 !important;
        font-size: clamp(18px, 4.4vw, 24px) !important;
        letter-spacing: .02em !important;
        background:
          radial-gradient(circle at 16% 18%, rgba(255,255,255,.72), transparent 25%),
          linear-gradient(135deg, #fff06a 0%, #ffb22e 45%, #ff5fc8 100%) !important;
        box-shadow:
          0 16px 34px rgba(255, 98, 188, .34),
          inset 0 -6px 0 rgba(97, 35, 0, .18),
          0 0 0 3px rgba(255, 238, 95, .18) !important;
        animation: packFinalRetryPulse 1.25s ease-in-out infinite !important;
      }
      .pack-pk-retry:active,
      button[data-pack-retry-polished="true"]:active {
        transform: translateY(2px) scale(.99) !important;
      }
      @keyframes packFinalRetryPulse {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-2px) scale(1.018); }
      }
    `;
    document.head.appendChild(style);
  }

  function decodeChallenge() {
    const value = new URLSearchParams(location.search).get("challenge");
    if (!value) return null;
    try {
      const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
      const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function seconds(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10);
  }

  function playerName() {
    const inputs = [...document.querySelectorAll(".share-studio input, .identity-row input")];
    const named = inputs.find((input) => input.closest(".identity-row") && input.value?.trim() && !input.value.trim().startsWith("#"));
    if (named) return named.value.trim();
    try {
      const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
      if (saved.name?.trim()) return saved.name.trim();
    } catch {}
    return "我";
  }

  function textPool() {
    const parts = [];
    document.querySelectorAll(".comparison-result, .challenge-result, .overlay-panel, .share-studio").forEach((node) => parts.push(node.textContent || ""));
    document.querySelectorAll(".share-studio input, .share-studio textarea").forEach((field) => {
      if (field.value) parts.push(field.value);
      if (field.placeholder) parts.push(field.placeholder);
    });
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function labels(me, ta) {
    const my = (me || "我").trim() || "我";
    const other = (ta || "TA").trim() || "TA";
    return my === other ? { me: "我", ta: "TA" } : { me: my, ta: other };
  }

  function readContext() {
    const challenge = decodeChallenge();
    if (!challenge) return null;
    const text = textPool();
    const faster = /(?:你快了|我更快|更快|反超|快了?|比[^，。]*快)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const slower = /(?:你慢了|更慢|慢了?|比[^，。]*慢|差一点)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const tie = /打平|平手|平局/.test(text);
    if (!faster && !slower && !tie) return null;
    const state = faster ? "faster" : slower ? "slower" : "tie";
    const delta = Number.parseFloat((faster || slower)?.[1] || "0");
    const context = {
      myName: playerName(),
      opponent: challenge.name || "TA",
      round: Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL) : 1,
      delta,
      state,
    };
    try { sessionStorage.setItem("pack-final-pk-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function storedContext() {
    return readContext() || (() => {
      try {
        const context = JSON.parse(sessionStorage.getItem("pack-final-pk-context") || "null");
        return context ? { ...context, myName: playerName() } : null;
      } catch { return null; }
    })();
  }

  function motto(context) {
    const { me, ta } = labels(context.myName, context.opponent);
    const delta = seconds(context.delta);
    if (context.state === "faster") return `${me}比${ta}快${delta}秒，轮到你追我。`;
    if (context.state === "slower") return `${me}比${ta}慢${delta}秒，再来一局追回来。`;
    return `${me}和${ta}打平了，再来一箱分胜负。`;
  }

  function isPkText(value = "") {
    return /\bPK\b|回击|反超|比.+(?:快|慢)\s*\d+(?:\.\d+)?\s*秒|快了?\s*\d+(?:\.\d+)?\s*秒|慢了?\s*\d+(?:\.\d+)?\s*秒|打平了/.test(value);
  }

  function nativeSet(field, value) {
    const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(field, value);
    else field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function findMottoField() {
    const fields = [...document.querySelectorAll(".share-studio input, .share-studio textarea, .share-fields input, .share-fields textarea")]
      .filter((field) => !field.disabled && !field.readOnly);
    const textFields = fields.filter((field) => !/^#/.test((field.value || "").trim()));
    if (!textFields.length) return null;
    const labeled = textFields.find((field) => {
      const wrapper = field.closest("label, div, p, section") || field.parentElement;
      const text = wrapper?.textContent || "";
      return text.includes("装箱口号") || text.includes("口号");
    });
    return labeled || textFields[textFields.length - 1];
  }

  function applyMotto() {
    const field = findMottoField();
    if (!field) return;
    const context = storedContext();
    if (context) {
      const next = motto(context);
      if (field.value !== next) nativeSet(field, next);
      field.placeholder = next;
      try {
        const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
        saved.motto = next;
        localStorage.setItem("pack-share-identity", JSON.stringify(saved));
      } catch {}
      return;
    }
    if (isPkText(field.value)) nativeSet(field, "");
    if (!field.placeholder || isPkText(field.placeholder)) field.placeholder = DEFAULT_MOTTO;
  }

  function polishRetryButtons() {
    document.querySelectorAll("button").forEach((button) => {
      const text = (button.textContent || "").replace(/\s+/g, "");
      if (/再挑战一次|重新挑战这一局|继续压秒/.test(text)) {
        button.dataset.packRetryPolished = "true";
      }
    });
  }

  function run() {
    injectStyle();
    polishRetryButtons();
    applyMotto();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button, a");
    if (!button) return;
    const text = (button.textContent || "").replace(/\s+/g, "");
    if (/我更快|发回去|晒战绩|分享图片|生成我的装箱战绩|分享挑战链接|打平了|追一次/.test(text)) {
      readContext();
      [0, 80, 180, 360, 720, 1200].forEach((delay) => setTimeout(run, delay));
    }
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  setInterval(run, 600);
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "value"],
  });
})();

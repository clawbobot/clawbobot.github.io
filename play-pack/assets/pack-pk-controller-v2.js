(() => {
  const TOTAL = 5;
  const DEFAULT_MOTTO = "没有装不下，只有没转对。";
  const PK_MOTTO_MARKER = "data-pack-pk-motto-applied";

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
    const field = document.querySelector(".identity-row input");
    if (field?.value?.trim()) return field.value.trim();
    try {
      const saved = JSON.parse(localStorage.getItem("pack-share-identity") || "{}");
      if (saved.name?.trim()) return saved.name.trim();
    } catch {}
    return "我";
  }

  function allText() {
    const parts = [];
    document.querySelectorAll(".comparison-result, .challenge-result, .result-card, .share-studio").forEach((node) => parts.push(node.textContent || ""));
    document.querySelectorAll(".share-fields input, .share-studio input, .share-studio textarea").forEach((field) => {
      if (field.value) parts.push(field.value);
      if (field.placeholder) parts.push(field.placeholder);
    });
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function safeNames(myName, opponent) {
    const me = (myName || "我").trim() || "我";
    const ta = (opponent || "TA").trim() || "TA";
    return me === ta ? { me: "我", ta: "TA" } : { me, ta };
  }

  function readPkContext() {
    const challenge = decodeChallenge();
    if (!challenge) return null;
    const text = allText();
    const faster = /(?:你快了|我更快|更快|反超|快了?|比[^，。]*快)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const slower = /(?:你慢了|更慢|慢了?|比[^，。]*慢|差一点)\D*?(\d+(?:\.\d+)?)\s*秒/.exec(text);
    const tie = /打平|平手|平局/.test(text);
    if (!faster && !slower && !tie) return null;
    const state = faster ? "faster" : slower ? "slower" : "tie";
    const delta = Number.parseFloat((faster || slower)?.[1] || "0");
    const targetElapsed = Number(challenge.elapsed) || 0;
    const myElapsed = state === "faster" ? Math.max(0, targetElapsed - delta) : state === "slower" ? targetElapsed + delta : targetElapsed;
    const round = Number.isInteger(challenge.level) ? Math.min(challenge.level + 1, TOTAL) : 1;
    const context = {
      myName: playerName(),
      opponent: challenge.name || "TA",
      round,
      targetElapsed,
      myElapsed,
      delta,
      state,
    };
    try { sessionStorage.setItem("pack-pk-motto-context", JSON.stringify(context)); } catch {}
    return context;
  }

  function currentContext() {
    const live = readPkContext();
    if (live) return live;
    try {
      const stored = JSON.parse(sessionStorage.getItem("pack-pk-motto-context") || "null");
      return stored ? { ...stored, myName: playerName() } : null;
    } catch {
      return null;
    }
  }

  function buildMotto(context) {
    const { me, ta } = safeNames(context.myName, context.opponent);
    const delta = seconds(context.delta);
    if (context.state === "faster") return `${me}比${ta}快${delta}秒，轮到你追我。`;
    if (context.state === "slower") return `${me}比${ta}慢${delta}秒，再来一局追回来。`;
    return `${me}和${ta}打平了，再来一箱分胜负。`;
  }

  function isPkMotto(text = "") {
    return /\bPK\b|回击|反超|比.+(?:快|慢)\s*\d+(?:\.\d+)?\s*秒|快了?\s*\d+(?:\.\d+)?\s*秒|慢了?\s*\d+(?:\.\d+)?\s*秒|打平了/.test(text);
  }

  function setNativeValue(input, value) {
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function mottoInput() {
    return [...document.querySelectorAll(".share-fields input, .share-studio input")].find((input) => !input.closest(".identity-row") && !/^#/.test(input.value || ""));
  }

  function applyPkMotto() {
    const input = mottoInput();
    if (!input) return;
    const context = currentContext();
    if (context) {
      const motto = buildMotto(context);
      if (input.value !== motto || input.dataset[PK_MOTTO_MARKER] !== "true") {
        setNativeValue(input, motto);
        input.dataset[PK_MOTTO_MARKER] = "true";
      }
      input.placeholder = motto;
      return;
    }
    if (input.dataset[PK_MOTTO_MARKER] === "true" || isPkMotto(input.value)) {
      setNativeValue(input, "");
      delete input.dataset[PK_MOTTO_MARKER];
    }
    if (!input.placeholder || isPkMotto(input.placeholder)) input.placeholder = DEFAULT_MOTTO;
  }

  function removeLegacyPkModals() {
    document.getElementById("pack-clean-pk-modal")?.remove();
    document.getElementById("pack-pk-duel-modal")?.remove();
  }

  function run() {
    removeLegacyPkModals();
    applyPkMotto();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button, a");
    if (!button) return;
    const label = (button.textContent || "").replace(/\s+/g, "");
    if (/我更快|发回去|打平了|喊TA|晒战绩|分享图片|生成我的装箱战绩|追一次|分享挑战链接/.test(label)) {
      setTimeout(run, 0);
      setTimeout(run, 80);
      setTimeout(run, 240);
    }
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  setInterval(run, 500);
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "value"],
  });

  window.__packPkControllerV2 = { mode: "ordinary-share-motto", readPkContext, buildMotto, applyPkMotto };
})();

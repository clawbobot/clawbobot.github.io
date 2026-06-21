(() => {
  function injectFilledCellFix() {
    if (document.getElementById("pack-filled-cell-hotfix-style")) return;
    const style = document.createElement("style");
    style.id = "pack-filled-cell-hotfix-style";
    style.textContent = `
      .grid-cell.is-filled {
        border-style: solid !important;
        border-color: color-mix(in srgb, var(--piece-color, #37e6f6), white 26%) !important;
        background:
          linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.05) 42%),
          var(--piece-color, #37e6f6) !important;
        box-shadow:
          inset 0 0 0 2px rgba(255,255,255,0.16),
          inset 0 -10px 18px rgba(0,0,0,0.22),
          0 3px 10px color-mix(in srgb, var(--piece-color, #37e6f6), transparent 56%) !important;
        animation: packPop 240ms cubic-bezier(.2,1.45,.3,1) !important;
      }
      .grid-cell.is-filled.is-preview-valid,
      .grid-cell.is-filled.is-preview-invalid {
        background:
          linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.05) 42%),
          var(--piece-color, #37e6f6) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function polishChallengeCta() {
    if (!document.body) return;
    document.querySelectorAll("button, a, .primary-action").forEach((node) => {
      const text = node.textContent?.trim();
      if (!text) return;
      if (
        text.includes("挑战同一第") ||
        text.includes("挑战同一箱") ||
        text.includes("挑战同一订单") ||
        text.includes("打开挑战同一第") ||
        text.includes("打开挑战同一箱")
      ) {
        const icon = node.querySelector("svg");
        node.textContent = "我要挑战";
        if (icon) node.appendChild(icon);
      }
    });
  }

  function runHotfix() {
    injectFilledCellFix();
    polishChallengeCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runHotfix, { once: true });
  } else {
    runHotfix();
  }

  new MutationObserver(() => requestAnimationFrame(runHotfix)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();

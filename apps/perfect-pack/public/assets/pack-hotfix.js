(() => {
  const FINAL_SHARE_TEXT = "我在《谁最能装？》全 5 关通关了！来比比谁更能装。";

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

  function injectCompletionBoostStyle() {
    if (document.getElementById("pack-completion-boost-style")) return;
    const style = document.createElement("style");
    style.id = "pack-completion-boost-style";
    style.textContent = `
      .overlay-panel.pack-complete-boost {
        position: relative !important;
        overflow: hidden !important;
        border: 3px solid rgba(255, 221, 69, 0.88) !important;
        box-shadow:
          0 0 0 5px rgba(255, 99, 195, 0.18),
          0 24px 70px rgba(0, 0, 0, 0.44),
          0 0 72px rgba(255, 209, 69, 0.28) !important;
        background:
          radial-gradient(circle at 18% 12%, rgba(255, 224, 69, 0.24), transparent 32%),
          radial-gradient(circle at 92% 18%, rgba(255, 86, 203, 0.22), transparent 36%),
          linear-gradient(155deg, rgba(47, 29, 128, 0.98), rgba(20, 12, 72, 0.98)) !important;
      }
      .pack-complete-boost::before {
        content: "";
        position: absolute;
        inset: -35%;
        background: conic-gradient(from 0deg, transparent, rgba(255,255,255,.16), transparent, rgba(255,225,71,.22), transparent);
        animation: packFinalShine 5s linear infinite;
        pointer-events: none;
      }
      .pack-complete-boost > * { position: relative; z-index: 1; }
      .pack-final-kicker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 16px;
        margin-bottom: 8px;
        border-radius: 999px;
        color: #211200;
        background: linear-gradient(135deg, #ffe66b, #ff9f1c 54%, #ff4ec8);
        font-weight: 1000;
        letter-spacing: .02em;
        box-shadow: 0 10px 26px rgba(255, 165, 32, .34);
      }
      .pack-achievement-badges {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin: 18px 0 14px;
      }
      .pack-achievement-badges span {
        padding: 10px 8px;
        border-radius: 18px;
        background: rgba(255, 255, 255, .13);
        border: 1px solid rgba(255, 255, 255, .18);
        color: #fff4b0;
        font-weight: 900;
        text-align: center;
      }
      .pack-final-share {
        width: 100%;
        margin-top: 10px;
        color: #1a1000 !important;
        background: linear-gradient(135deg, #fff06a, #ffb22e 48%, #ff4ec8) !important;
        border: 0 !important;
        box-shadow: 0 16px 34px rgba(255, 98, 188, .38) !important;
        animation: packSharePulse 1.35s ease-in-out infinite;
      }
      .pack-final-copy-tip {
        margin: 10px 0 0;
        color: #ffe66b;
        font-size: 14px;
        font-weight: 800;
        text-align: center;
      }
      .comparison-result.pack-pk-win,
      .comparison-result.pack-pk-loss,
      .comparison-result.pack-pk-tie {
        position: relative;
        overflow: hidden;
        border-radius: 22px !important;
        border: 2px solid rgba(255, 255, 255, .18) !important;
        box-shadow: 0 14px 30px rgba(0, 0, 0, .2) !important;
      }
      .comparison-result.pack-pk-win {
        background:
          radial-gradient(circle at 8% 18%, rgba(255, 239, 91, .35), transparent 36%),
          linear-gradient(135deg, rgba(41, 235, 255, .22), rgba(75, 255, 128, .18)) !important;
        border-color: rgba(105, 255, 126, .62) !important;
      }
      .comparison-result.pack-pk-loss {
        background:
          radial-gradient(circle at 12% 20%, rgba(255, 93, 200, .28), transparent 34%),
          linear-gradient(135deg, rgba(255, 182, 65, .16), rgba(166, 107, 255, .18)) !important;
        border-color: rgba(255, 213, 89, .55) !important;
      }
      .comparison-result.pack-pk-tie {
        background: linear-gradient(135deg, rgba(50, 230, 255, .18), rgba(255, 230, 107, .18)) !important;
        border-color: rgba(50, 230, 255, .55) !important;
      }
      .pack-pk-prompt {
        margin: 12px 0 2px;
        color: #fff6c7;
        font-size: 15px;
        font-weight: 900;
        line-height: 1.45;
        text-align: center;
      }
      .pack-pk-retry {
        width: 100%;
        margin-top: 10px;
        border: 2px solid rgba(50, 230, 255, .55) !important;
        color: #eefbff !important;
        background: rgba(14, 22, 62, .82) !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 10px 22px rgba(50,230,255,.12) !important;
      }
      .share-cta.pack-pk-share-win {
        color: #221000 !important;
        background: linear-gradient(135deg, #fff06a, #38f96f 54%, #32e6ff) !important;
        animation: packSharePulse 1.18s ease-in-out infinite;
      }
      .share-cta.pack-pk-share-loss {
        background: linear-gradient(135deg, #ffcf48, #ff6bc8 58%, #a66bff) !important;
      }
      .pack-confetti {
        position: absolute;
        top: -18px;
        width: 10px;
        height: 18px;
        border-radius: 6px;
        opacity: .9;
        animation: packConfettiFall 3.8s linear infinite;
        pointer-events: none;
      }
      .pack-confetti:nth-child(1) { left: 10%; background: #32e6ff; animation-delay: -.4s; }
      .pack-confetti:nth-child(2) { left: 22%; background: #ffe66b; animation-delay: -1.2s; }
      .pack-confetti:nth-child(3) { left: 38%; background: #ff5ac8; animation-delay: -.8s; }
      .pack-confetti:nth-child(4) { left: 57%; background: #6cff77; animation-delay: -1.8s; }
      .pack-confetti:nth-child(5) { left: 74%; background: #ff9f1c; animation-delay: -.2s; }
      .pack-confetti:nth-child(6) { left: 88%; background: #a66bff; animation-delay: -1.5s; }
      @keyframes packFinalShine { to { transform: rotate(360deg); } }
      @keyframes packSharePulse { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.03); } }
      @keyframes packConfettiFall { 0% { transform: translateY(-20px) rotate(0deg); } 100% { transform: translateY(520px) rotate(360deg); } }
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

  function shareCompletion(scoreText, button) {
    const url = new URL(window.location.href);
    url.search = "";
    const text = scoreText
      ? `我在《谁最能装？》全 5 关通关，拿到 ${scoreText}！来比比谁更能装。`
      : FINAL_SHARE_TEXT;
    if (navigator.share) {
      navigator.share({ title: "谁最能装？全关通关", text, url: url.toString() }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(`${text}\n${url.toString()}`).then(() => {
      button.textContent = "通关战绩已复制";
      let tip = button.parentElement?.querySelector(".pack-final-copy-tip");
      if (!tip) {
        tip = document.createElement("p");
        tip.className = "pack-final-copy-tip";
        button.insertAdjacentElement("afterend", tip);
      }
      tip.textContent = "发给朋友，让 TA 来挑战你的装箱王称号";
    });
  }

  function boostCompletionOverlay() {
    const panel = Array.from(document.querySelectorAll(".overlay-panel")).find((node) => {
      const text = node.textContent || "";
      return text.includes("你完成了从") || text.includes("全部可解组合") || text.includes("再挑战一次");
    });
    if (!panel || panel.dataset.packCompleteBoosted === "1") return;
    panel.dataset.packCompleteBoosted = "1";
    panel.classList.add("pack-complete-boost");

    const oldKicker = panel.querySelector(".overlay-kicker");
    if (oldKicker) oldKicker.remove();
    const title = panel.querySelector("h1");
    const scoreText = title?.textContent?.trim() || "";
    const kicker = document.createElement("div");
    kicker.className = "pack-final-kicker";
    kicker.textContent = "🏆 装箱王登场";
    panel.insertBefore(kicker, title || panel.firstChild);

    if (title) title.textContent = `全 5 关通关 · ${scoreText}`;
    const paragraph = panel.querySelector("p");
    if (paragraph) paragraph.textContent = "五个箱子全部满格！这不是刚好装下，这是你真的会装。";

    const badges = document.createElement("div");
    badges.className = "pack-achievement-badges";
    badges.innerHTML = "<span>5/5 全通关</span><span>100% 满格</span><span>装箱王</span>";
    const existingBadges = panel.querySelector(".pack-achievement-badges");
    if (!existingBadges) paragraph?.insertAdjacentElement("afterend", badges);

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.className = "primary-action pack-final-share";
    shareButton.textContent = "晒出我的通关战绩";
    shareButton.addEventListener("click", () => shareCompletion(scoreText, shareButton));
    const restartButton = Array.from(panel.querySelectorAll("button")).find((button) => button.textContent.includes("再挑战"));
    panel.insertBefore(shareButton, restartButton || null);

    for (let index = 0; index < 6; index += 1) {
      const confetti = document.createElement("i");
      confetti.className = "pack-confetti";
      panel.appendChild(confetti);
    }
  }

  function boostPkComparisonOverlay() {
    document.querySelectorAll(".overlay-panel").forEach((panel) => {
      const comparison = panel.querySelector(".comparison-result");
      if (!comparison || panel.dataset.packPkBoosted === "1") return;

      const comparisonText = comparison.textContent || "";
      const isFaster = comparisonText.includes("你快了");
      const isSlower = comparisonText.includes("慢了");
      const isTie = comparisonText.includes("打平");

      panel.dataset.packPkBoosted = "1";
      comparison.classList.add(isFaster ? "pack-pk-win" : isSlower ? "pack-pk-loss" : "pack-pk-tie");

      const prompt = document.createElement("p");
      prompt.className = "pack-pk-prompt";
      prompt.textContent = isFaster
        ? "反超成功！把战绩发回去，让 TA 下一局追你。"
        : isSlower
          ? "就差一点，重新挑战这一局，把秒数压下去。"
          : "完全打平！再来一次，抢下第一名。";
      comparison.insertAdjacentElement("afterend", prompt);

      const shareButton = panel.querySelector(".share-cta");
      if (shareButton) {
        shareButton.classList.add(isFaster ? "pack-pk-share-win" : "pack-pk-share-loss");
        const icon = shareButton.querySelector("svg");
        shareButton.textContent = isFaster ? "我更快，发回去" : isSlower ? "先晒战绩，再追一次" : "打平了，喊 TA 再战";
        if (icon) shareButton.appendChild(icon);
      }

      const retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.className = "pack-pk-retry";
      retryButton.textContent = isFaster ? "再挑战一次，继续压秒" : "重新挑战这一局";
      retryButton.addEventListener("click", () => window.location.reload());
      const nextAction = Array.from(panel.querySelectorAll("button")).find((button) => button.classList.contains("text-action"));
      panel.insertBefore(retryButton, nextAction || null);
    });
  }

  function polishFinalLevelWin() {
    document.querySelectorAll("button").forEach((button) => {
      const text = button.textContent?.trim() || "";
      if (text.includes("查看最终成绩")) button.textContent = "领取装箱王奖杯";
      if (text.includes("生成我的装箱战绩")) button.textContent = "先晒出这一关";
    });
  }

  function runHotfix() {
    injectFilledCellFix();
    injectCompletionBoostStyle();
    polishChallengeCta();
    polishFinalLevelWin();
    boostCompletionOverlay();
    boostPkComparisonOverlay();
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
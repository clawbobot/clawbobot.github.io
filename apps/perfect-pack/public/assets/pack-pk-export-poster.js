(() => {
  const W = 1080;
  const H = 1440;

  function hasChallengeMode() {
    return new URLSearchParams(window.location.search).has("challenge") || Boolean(document.querySelector(".comparison-result"));
  }

  function readContext() {
    if (window.__packDuelPoster?.readPkContext) return window.__packDuelPoster.readPkContext();
    return null;
  }

  function captureQr(canvas) {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      return ctx.getImageData(730, 1036, 310, 334);
    } catch {
      return null;
    }
  }

  function shouldReplaceCanvas(canvas) {
    return canvas?.width === W && canvas?.height === H && hasChallengeMode() && Boolean(readContext()) && Boolean(window.__packDuelPoster?.drawDuelPkPoster);
  }

  function ensurePkCanvas(canvas) {
    if (!shouldReplaceCanvas(canvas)) return;
    const context = readContext();
    if (!context) return;
    window.__packDuelPoster.drawDuelPkPoster(canvas, context, { qr: captureQr(canvas) });
  }

  function wrapCanvasExports() {
    const proto = HTMLCanvasElement.prototype;
    if (!proto || proto.__packPkDuelExportWrapped) return;
    const previousToBlob = proto.toBlob;
    const previousToDataURL = proto.toDataURL;
    proto.toBlob = function wrappedToBlob(...args) {
      ensurePkCanvas(this);
      return previousToBlob.apply(this, args);
    };
    proto.toDataURL = function wrappedToDataURL(...args) {
      ensurePkCanvas(this);
      return previousToDataURL.apply(this, args);
    };
    proto.__packPkDuelExportWrapped = true;
  }

  function run() {
    wrapCanvasExports();
    readContext();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
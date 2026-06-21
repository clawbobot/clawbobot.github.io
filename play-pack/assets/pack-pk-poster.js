(() => {
  if (window.__packPkLegacyShimLoaded) return;
  window.__packPkLegacyShimLoaded = true;
  function loadCleanController() {
    if (window.__packPkControllerV2 || document.querySelector('script[data-pack-pk-controller-v2="true"]')) return;
    const script = document.createElement('script');
    script.dataset.packPkControllerV2 = 'true';
    script.src = '/play-pack/assets/pack-pk-controller-v2.js?v=20260621d';
    script.async = false;
    document.head.appendChild(script);
  }
  if (document.head) loadCleanController();
  else document.addEventListener('DOMContentLoaded', loadCleanController, { once: true });
})();

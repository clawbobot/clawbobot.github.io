(() => {
  if (window.__packPkControllerV2) return;
  if (document.querySelector('script[src*="pack-pk-controller-v2.js"]')) return;
  const load = () => {
    if (window.__packPkControllerV2) return;
    const script = document.createElement('script');
    script.src = '/play-pack/assets/pack-pk-controller-v2.js?v=20260621d';
    script.async = false;
    document.head.appendChild(script);
  };
  if (document.head) load();
  else document.addEventListener('DOMContentLoaded', load, { once: true });
})();

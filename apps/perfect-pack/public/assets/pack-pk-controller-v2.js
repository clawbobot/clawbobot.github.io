(() => {
  // Source-side loader kept intentionally small so the app uses the same cleaned PK controller as production.
  // Production file: /play-pack/assets/pack-pk-controller-v2.js?v=20260621b
  const script = document.createElement('script');
  script.src = '/play-pack/assets/pack-pk-controller-v2.js?v=20260621b';
  script.defer = false;
  document.head.appendChild(script);
})();

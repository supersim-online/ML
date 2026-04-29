/**
 * Pixel TikTok (Utmify) — id deste funil. Evita carregar o script CDN duas vezes.
 */
(function () {
  'use strict';
  if (window.__utmifyTikTokPixelInjected) return;
  window.__utmifyTikTokPixelInjected = true;
  window.tikTokPixelId = '69e99ede305daf1b58d7036f';
  var a = document.createElement('script');
  a.setAttribute('async', '');
  a.setAttribute('defer', '');
  a.setAttribute('src', 'https://cdn.utmify.com.br/scripts/pixel/pixel-tiktok.js');
  document.head.appendChild(a);
})();

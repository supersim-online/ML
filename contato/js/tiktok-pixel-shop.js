/**
 * TikTok Ads (ttq) — BRL. Depende de utmify-pixel-tiktok.js.
 * Expõe ShopTikTokPixel + compat TikPro/Camisa + trackTikTokEvent (loja.js).
 */
(function () {
  'use strict';

  var CURRENCY = 'BRL';
  var CONTENT_NAME = 'Cartão Mercado Livre — Taxa de envio e adicionais';

  function trackTikTokEvent(name, data) {
    data = data || {};
    function trySend() {
      var q = window.ttq;
      if (q && typeof q.track === 'function') {
        try {
          q.track(name, data);
          return true;
        } catch (e) {}
      }
      return false;
    }
    if (trySend()) return;
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (trySend() || n >= 25) clearInterval(t);
    }, 400);
  }

  function trackViewContent(extra) {
    trackTikTokEvent('ViewContent', Object.assign({
      content_type: 'product',
      content_name: CONTENT_NAME,
      currency: CURRENCY
    }, extra || {}));
  }

  function trackAddToCart(valueReais) {
    trackTikTokEvent('AddToCart', {
      content_type: 'product',
      content_name: CONTENT_NAME,
      value: Number(valueReais) || 0,
      currency: CURRENCY,
      quantity: 1
    });
  }

  function trackInitiateCheckout(valueReais) {
    trackTikTokEvent('InitiateCheckout', {
      content_type: 'product',
      value: Number(valueReais) || 0,
      currency: CURRENCY,
      quantity: 1
    });
  }

  function trackPurchase(valueReais, txId) {
    trackTikTokEvent('Purchase', {
      content_type: 'product',
      content_name: CONTENT_NAME,
      value: Number(valueReais) || 0,
      currency: CURRENCY,
      quantity: 1,
      transaction_id: txId ? String(txId) : undefined
    });
    try {
      sessionStorage.setItem('shop_tt_purchase_sent', '1');
      sessionStorage.setItem('tikpro_tt_purchase_sent', '1');
      sessionStorage.setItem('camisa_tt_purchase_sent', '1');
    } catch (e) {}
  }

  function checkoutInitiateValue() {
    try {
      if (typeof window.getMlFunilTotalReais === 'function') {
        var mv = window.getMlFunilTotalReais();
        if (Number(mv) > 0) return Number(mv);
      }
      var cfg = window.CHECKOUT_CONFIG && window.CHECKOUT_CONFIG.priceReais;
      if (cfg != null && Number(cfg) > 0) return Number(cfg);
      var el = document.querySelector('.js-summary-total');
      var elTot = document.getElementById('totPag');
      var tSrc = (el && el.textContent) || (elTot && elTot.textContent) || '';
      var txt = tSrc.replace(/[^\d,.-]/g, '').replace(',', '.');
      var v = parseFloat(txt);
      return isNaN(v) ? 0 : v;
    } catch (e) {
      return 0;
    }
  }

  function initPageEvents() {
    var path = (window.location.pathname || '').toLowerCase();
    if (path.indexOf('checkout.html') !== -1 || path.indexOf('loja-checkout.html') !== -1) {
      trackInitiateCheckout(checkoutInitiateValue());
      return;
    }
    if (path.indexOf('loja.html') !== -1) {
      trackViewContent({});
      return;
    }
    if (path.indexOf('index.html') !== -1 || path === '/' || path.endsWith('/')) {
      trackViewContent({});
      return;
    }
    if (path.indexOf('pay.html') !== -1) {
      trackViewContent({});
      return;
    }
    if (path.indexOf('carrinho.htm') !== -1) {
      trackViewContent({});
      return;
    }
    if (path.indexOf('checkout.htm') !== -1) {
      try {
        var el = document.getElementById('checkout-total');
        var txt = el ? el.textContent.replace(/[^\d,.-]/g, '').replace(',', '.') : '';
        trackInitiateCheckout(parseFloat(txt) || 0);
      } catch (e) {
        trackInitiateCheckout(0);
      }
      return;
    }
    if (path.indexOf('sucesso') !== -1) {
      try {
        if (sessionStorage.getItem('shop_tt_purchase_sent') === '1') {
          sessionStorage.removeItem('shop_tt_purchase_sent');
          sessionStorage.removeItem('tikpro_tt_purchase_sent');
          sessionStorage.removeItem('camisa_tt_purchase_sent');
          return;
        }
        if (sessionStorage.getItem('tikpro_tt_purchase_sent') === '1') {
          sessionStorage.removeItem('tikpro_tt_purchase_sent');
          return;
        }
        if (sessionStorage.getItem('camisa_tt_purchase_sent') === '1') {
          sessionStorage.removeItem('camisa_tt_purchase_sent');
          return;
        }
        var vs = sessionStorage.getItem('shop_last_purchase_value');
        var ids = sessionStorage.getItem('shop_last_transaction_id');
        if (vs != null && String(vs).trim() !== '') {
          trackPurchase(parseFloat(vs) || 0, ids || '');
          sessionStorage.removeItem('shop_last_purchase_value');
          sessionStorage.removeItem('shop_last_transaction_id');
          return;
        }
        var vt = sessionStorage.getItem('tikpro_last_purchase_value');
        var tit = sessionStorage.getItem('tikpro_last_transaction_id');
        if (vt != null && String(vt).trim() !== '') {
          trackPurchase(parseFloat(vt) || 0, tit || '');
          sessionStorage.removeItem('tikpro_last_purchase_value');
          sessionStorage.removeItem('tikpro_last_transaction_id');
          return;
        }
        var v = sessionStorage.getItem('camisa_last_purchase_value');
        var tid = sessionStorage.getItem('camisa_last_transaction_id');
        if (v != null && String(v).trim() !== '') {
          trackPurchase(parseFloat(v) || 0, tid || '');
          sessionStorage.removeItem('camisa_last_purchase_value');
          sessionStorage.removeItem('camisa_last_transaction_id');
        }
      } catch (e2) {}
      return;
    }
    trackViewContent({});
  }

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  whenReady(function () {
    setTimeout(initPageEvents, 300);
  });

  var api = {
    track: trackTikTokEvent,
    trackViewContent: trackViewContent,
    trackAddToCart: trackAddToCart,
    trackInitiateCheckout: trackInitiateCheckout,
    trackPurchase: trackPurchase
  };

  window.ShopTikTokPixel = api;
  window.TikProTikTokPixel = api;
  window.CamisaTikTokPixel = api;

  window.trackTikTokEvent = function (eventName, eventData) {
    trackTikTokEvent(eventName, eventData || {});
  };
})();

/**
 * Utmify — parâmetros para pixel TikTok / checkout / API Pagou.
 * Mescla URL atual + localStorage (ttclid, UTMs, src, sck, click_id) como no fluxo paynew/utm-utils.
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'loja_utmify_params';
  var KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'src', 'sck', 'ttclid', 'click_id', 'callback'
  ];

  function parseStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
    } catch (e) {
      return {};
    }
  }

  function capture() {
    if (typeof window === 'undefined' || !window.location) return;
    var params = new URLSearchParams(window.location.search || '');
    var merged = parseStored();
    KEYS.forEach(function (key) {
      var val = params.get(key);
      if (val != null && String(val).trim() !== '') {
        merged[key] = String(val).trim();
      }
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}
    syncGlobalHelpers(merged);
  }

  /** URL atual + storage; a URL tem prioridade em chaves repetidas. */
  function getMergedData() {
    var merged = parseStored();
    try {
      var params = new URLSearchParams(window.location.search || '');
      KEYS.forEach(function (key) {
        var val = params.get(key);
        if (val != null && String(val).trim() !== '') {
          merged[key] = String(val).trim();
        }
      });
    } catch (e) {}
    return merged;
  }

  function getMergedSearchParams() {
    var params = new URLSearchParams(window.location.search || '');
    var stored = parseStored();
    KEYS.forEach(function (key) {
      if (params.has(key)) return;
      var v = stored[key];
      if (v != null && String(v).trim() !== '') {
        params.set(key, String(v).trim());
      }
    });
    return params;
  }

  function syncGlobalHelpers(merged) {
    try {
      var parts = [];
      KEYS.forEach(function (key) {
        var v = merged[key];
        if (v != null && String(v).trim() !== '') {
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v).trim()));
        }
      });
      window._utmifyParams = parts.join('&');
      window._utmifyUTMs = merged;
    } catch (e) {}
  }

  function getUrlWithUtm(url) {
    if (!url) return url;
    var paramsStr = '';
    if (window._utmifyParams && String(window._utmifyParams).trim() !== '') {
      paramsStr = String(window._utmifyParams).replace(/^\?/, '');
    } else {
      try {
        paramsStr = getMergedSearchParams().toString();
      } catch (e2) {}
    }
    if (!paramsStr) return url;
    var sep = url.indexOf('?') !== -1 ? '&' : '?';
    return url + sep + paramsStr;
  }

  function getTrackingParameters() {
    try {
      var data = getMergedData();
      syncGlobalHelpers(data);
      var clickRaw = (data.click_id != null && String(data.click_id).trim() !== '')
        ? String(data.click_id).trim()
        : null;
      var callbackRaw = (data.callback != null && String(data.callback).trim() !== '')
        ? String(data.callback).trim()
        : null;
      var clickUnified = clickRaw || callbackRaw || null;

      var out = {
        src: data.src || null,
        sck: data.sck || null,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_content: data.utm_content || null,
        utm_term: data.utm_term || null,
        ttclid: data.ttclid || null,
        click_id: clickUnified
      };

      var hasAny = Object.keys(out).some(function (k) {
        return out[k] != null && out[k] !== '';
      });
      return hasAny ? out : null;
    } catch (e) {
      return null;
    }
  }

  capture();

  window.LojaUtmify = {
    capture: capture,
    getTrackingParameters: getTrackingParameters,
    getMergedSearchParams: getMergedSearchParams,
    getMergedData: getMergedData,
    getUrlWithUtm: getUrlWithUtm
  };
})();

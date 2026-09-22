/* ===========================================================
   pplastic — language runtime
   Pages are pre-rendered per language: English at /, Greek at
   /el/. Nothing is translated in the browser any more, so this
   file only exposes pplasticT() for the handful of strings that
   scripts build at runtime (e.g. contact form status messages).
   The EN / ΕΛ switcher is now plain links, generated per page by
   tools/build-el.mjs, so search engines can follow it.
   =========================================================== */
(function () {
  "use strict";

  var I18N = window.pplasticI18N || { en: {}, el: {} };

  window.pplasticT = function (key) {
    var lang = document.documentElement.lang;
    var table = I18N[lang] || I18N.en || {};
    if (table[key] != null) return table[key];
    if (I18N.en && I18N.en[key] != null) return I18N.en[key];
    return key;
  };
})();

// ==UserScript==
// @name         Google Search: AI Mode on Question Mark
// @namespace    http://tampermonkey.net
// @version      2026.01
// @description  Redirects to AI Mode if the search query contains a question mark
// @author       You
// @match        *://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const isAIMode = urlParams.get('udm') === '50';

    // Check if query contains '?' and we aren't already in AI Mode
    if (query && query.includes('?') && !isAIMode) {
        urlParams.set('udm', '50');
        window.location.replace(window.location.origin + window.location.pathname + '?' + urlParams.toString());
    }
})();

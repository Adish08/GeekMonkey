// ==UserScript==
// @name         Google Smart AI Redirect (Minimal Strict)
// @namespace    http://tampermonkey.net
// @version      2026.4.0
// @description  Minimal, robust redirect to AI Mode. Respects all manual mode switches.
// @author       adish08
// @match        *://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const tbm = params.get('tbm');
    const udm = params.get('udm');
    const KEY_LAST_QUERY = 'sa_last_ai_query';

    // 1. If in AI Mode: Save query to memory, then stop.
    if (udm === '50') {
        if (query) sessionStorage.setItem(KEY_LAST_QUERY, query);
        return;
    }

    // 2. If in ANY specific tab (Images, News, Web, etc.), stop.
    // This protects against "udm=2" (Images) or "tbm=isch".
    if (udm || tbm) return;

    // 3. If in Standard Mode:
    // Check if this is the EXACT SAME query we just saw in AI mode.
    // If so, it means the user manually clicked "All". Respect it.
    if (query === sessionStorage.getItem(KEY_LAST_QUERY)) return;

    // 4. Trigger Logic (New Searches Only)
    // If we are here, it's a fresh search in Standard Mode.
    if (query && (query.length > 20 || query.includes('?'))) {
        params.set('udm', '50');
        window.location.replace(window.location.origin + window.location.pathname + '?' + params.toString());
    }

})();

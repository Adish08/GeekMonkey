// ==UserScript==
// @name         Google Search: AI Mode on Question Mark or Long String
// @namespace    http://tampermonkey.net
// @version      2026.03
// @description  Redirects to AI Mode if the query has a question mark OR exceeds a specific character length
// @author       Adish08
// @match        *://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const isAIMode = urlParams.get('udm') === '50';

    // CONFIGURATION
    // Set the minimum string length (number of characters) to trigger AI mode
    const minStringLength = 15;

    if (query && !isAIMode) {
        const hasQuestionMark = query.includes('?');
        const isLongString = query.length > minStringLength;

        // Trigger if Question Mark exists OR String Length is greater than threshold
        if (hasQuestionMark || isLongString) {
            urlParams.set('udm', '50');
            window.location.replace(window.location.origin + window.location.pathname + '?' + urlParams.toString());
        }
    }
})();

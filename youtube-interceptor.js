// ==UserScript==
// @name         YouTube: Native Cobalt Downloader (Interceptor)
// @namespace    https://github.com/adish08/youtube-cobalt-native
// @version      4.0.0
// @description  Intercepts the native YouTube download button and redirects to Cobalt. Keeps the exact native look and feel.
// @author       adish08
// @icon         
// @match        *://*.youtube.com/watch?*
// @match        *://*.youtu.be/*
// @match        *://*.youtube.com/shorts/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY_API = 'cobalt_tube_url';
    const STORAGE_KEY_CONSENT = 'cobalt_tube_consent';
    const DEFAULT_API = 'https://cobalt.clxxped.lol';

    // We use a WeakSet to mark buttons we've already hijacked so we don't attach listeners twice
    const hijackedButtons = new WeakSet();

    function init() {
        checkConsent();
        registerMenu();

        // Use a MutationObserver to watch for the download button appearing
        const observer = new MutationObserver((mutations) => {
            hijackNativeButton();
        });

        const appRoot = document.querySelector('ytd-app');
        if (appRoot) {
            observer.observe(appRoot, { childList: true, subtree: true });
        }

        // Also run on navigation events (SPA)
        window.addEventListener('yt-navigate-finish', () => {
             setTimeout(hijackNativeButton, 500);
             setTimeout(hijackNativeButton, 2000); // Retry for slow loads
        });

        // Initial run
        hijackNativeButton();
    }

    function hijackNativeButton() {
        // Find the native renderer
        const downloadRenderer = document.querySelector('ytd-download-button-renderer');

        if (!downloadRenderer) return;

        // Find the actual clickable button inside the renderer
        // YouTube nests the button deep inside: ytd-download-button-renderer -> yt-button-shape -> button
        const btn = downloadRenderer.querySelector('button');

        if (btn && !hijackedButtons.has(btn)) {

            // 1. Remove 'disabled' attribute if YouTube put it there (e.g., for non-premium users)
            btn.removeAttribute('disabled');

            // 2. Attach our listener with { capture: true }
            // This lets us catch the click BEFORE YouTube's own listeners see it.
            btn.addEventListener('click', (e) => {
                // STOP YouTube's native action (opening the Premium popup)
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                // Run our download logic
                handleDownload();
            }, { capture: true });

            // 3. Mark as done
            hijackedButtons.add(btn);

            // Optional: Update title to confirm it's working (subtle indicator)
            btn.title = "Download with Cobalt";

            // Log for debugging
            // console.log("Cobalt: Native button intercepted.");
        }
    }

    function handleDownload() {
        if (!GM_getValue(STORAGE_KEY_CONSENT, false)) {
            checkConsent();
            return;
        }

        let url = window.location.href;
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
            url = `https://www.youtube.com/watch?v=${videoId}`;
        }

        const base = getApiUrl();
        const finalLink = `${base}?u=${encodeURIComponent(url)}`;

        GM_openInTab(finalLink, { active: true });
    }

    // --- Standard Configuration Stuff ---

    function checkConsent() {
        if (!GM_getValue(STORAGE_KEY_CONSENT, false)) {
            const disclaimer = "YouTube Native Cobalt Downloader\n\n" +
                               "DISCLAIMER: This script redirects the native 'Download' button to Cobalt.\n" +
                               "You are responsible for the content you download.\n\n" +
                               "Click 'OK' to Enable.";
            if (window.confirm(disclaimer)) {
                GM_setValue(STORAGE_KEY_CONSENT, true);
            }
        }
    }

    function getApiUrl() {
        let url = GM_getValue(STORAGE_KEY_API, DEFAULT_API);
        return url.replace(/\/$/, '');
    }

    function configureApi() {
        const current = getApiUrl();
        const input = prompt("Cobalt Instance URL:", current);
        if (input && input.trim() !== "") {
            let cleanUrl = input.trim();
            if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
            GM_setValue(STORAGE_KEY_API, cleanUrl);
        }
    }

    function registerMenu() {
        GM_registerMenuCommand("⚙️ Change Cobalt Instance", configureApi);
    }

    init();

})();

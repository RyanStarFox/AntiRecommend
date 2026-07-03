// ==UserScript==
// @name         Anti-Recommend — Hide YouTube & Bilibili Video Recommendations
// @namespace    https://github.com/RyanStarFox/AntiRecommend
// @version      1.2.1
// @description  Remove sidebar/end-screen recommendations & disable autoplay on YouTube and Bilibili
// @author       shao
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ── CSS Injection (instant hiding, before any DOM is parsed) ──────────────
  const STYLE_ID = 'anti-recommend-style';

  const css = `
    /* ===== YouTube ===== */

    /* Always hide the recommendation/related-videos list */
    ytd-watch-next-secondary-results-renderer,
    /* Mobile sidebar recommendations */
    ytm-item-section-renderer#related {
      display: none !important;
    }

    /*
     * Collapse the entire #secondary column ONLY when it has recommendations
     * but does NOT contain a playlist or live chat (which should be preserved).
     * :has() is supported in Chrome 105+ and Safari 15.4+.
     */
    #secondary:has(ytd-watch-next-secondary-results-renderer):not(:has(ytd-playlist-panel-renderer)):not(:has(ytd-live-chat-frame)) {
      display: none !important;
    }

    /* End-screen overlay (the grid of thumbnails after a video ends) */
    .ytp-endscreen-content,
    .html5-endscreen,
    .ytp-ce-element,
    /* Pause overlay with suggestions */
    .ytp-pause-overlay,
    .ytp-pause-overlay-container {
      display: none !important;
    }

    /* Info cards that pop up during playback */
    .ytp-ce-covering-overlay,
    .ytp-cards-teaser,
    .ytp-cards-button {
      display: none !important;
    }

    /* Autoplay countdown overlay (the timer before next video) */
    .ytp-autonav-endscreen-countdown-container,
    .ytp-upnext,
    .ytp-upnext-header,
    .ytp-upnext-autoplay-icon,
    .ytp-upnext-cancel-button {
      display: none !important;
    }

    /* ===== Bilibili ===== */

    /* Sidebar recommendation panels */
    #reco_list,
    .recommend-list-v1,
    .video-page-special,
    .related-video,
    .rec-list,
    .rec-list-wrap,
    .video-sections,
    /* Right-side recommendation container */
    #right_panel_wrapper .related-video-panel,
    /* Sidebar in bangumi (anime) pages */
    .bangumi-page .recommend-list,
    .pl__part__list,
    /* "大家都在看" (what everyone is watching) section */
    .popular-video-container,
    #popular-video,
    /* Right column recommendation */
    .right-container .video-page-special,
    .right-container .pop-video,
    /* Tag / hot topic sidebar cards */
    .video-tag-container + .popular-video-container {
      display: none !important;
    }

    /* Autoplay countdown / next-video overlay */
    .bpx-player-ending-countdown,
    .bpx-player-upnext,
    .bpx-player-ending-overlay .ending-countdown,

    /* End-screen overlay (播放结束后的推荐) */
    .bpx-player-ending-content,
    .bpx-player-ending-related,
    .bpx-player-ending-panel,
    .bpx-player-ending-cover,
    /* Legacy player end-screen */
    .bilibili-player-ending-content,
    .bilibili-player-ending-related,
    .bilibili-player-ending-panel,
    /* End screen mask */
    .bpx-player-video-ended .bpx-player-ending-content {
      display: none !important;
    }
  `;

  // ── YouTube player Shadow DOM CSS ────────────────────────────────────────
  // YouTube's video player (#movie_player) uses Shadow DOM, so page-level CSS
  // and querySelectorAll() cannot reach these elements.  We inject this
  // stylesheet directly into the shadow root via JavaScript.
  const PLAYER_SHADOW_CSS = `
    /*
     * Use opacity+pointer-events instead of display:none.
     * display:none removes elements from layout, which can trip up YouTube's
     * player JavaScript when it tries to measure/animate end-screen elements,
     * causing the progress bar to freeze near the video's end.
     * opacity:0 keeps the element in layout flow but invisible and non-interactive.
     */
    .ytp-endscreen-content,
    .html5-endscreen,
    .ytp-ce-element,
    .ytp-pause-overlay,
    .ytp-pause-overlay-container,
    .ytp-ce-covering-overlay,
    .ytp-cards-teaser,
    .ytp-cards-button,
    .ytp-autonav-endscreen-countdown-container,
    .ytp-upnext,
    .ytp-upnext-header,
    .ytp-upnext-autoplay-icon,
    .ytp-upnext-cancel-button {
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

  const SHADOW_STYLE_ID = 'anti-recommend-shadow-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Fire at document-start so CSS is ready before first paint
  injectStyle();

  // ── MutationObserver (catches late-loaded / SPA-navigated elements) ───────

  function hideSelector(selector) {
    try {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    } catch (_) {
      // invalid selector — ignore
    }
  }

  function hideYouTubeRecommendations() {
    // Page-level DOM only (sidebar etc.) — Shadow DOM elements are handled
    // separately via injectYouTubePlayerStyles()
    hideSelector('ytd-watch-next-secondary-results-renderer');
    // Mobile sidebar
    hideSelector('ytm-item-section-renderer#related');
  }

  function hideBilibiliRecommendations() {
    hideSelector('#reco_list');
    hideSelector('.recommend-list-v1');
    hideSelector('.video-page-special');
    hideSelector('.related-video');
    hideSelector('.rec-list');
    hideSelector('.rec-list-wrap');
    hideSelector('.video-sections');
    hideSelector('#right_panel_wrapper .related-video-panel');
    hideSelector('.bpx-player-ending-content');
    hideSelector('.bpx-player-ending-related');
    hideSelector('.bpx-player-ending-panel');
    hideSelector('.bpx-player-ending-cover');
    hideSelector('.bilibili-player-ending-content');
    hideSelector('.bilibili-player-ending-related');
    hideSelector('.popular-video-container');
    hideSelector('#popular-video');
    hideSelector('.right-container .pop-video');
  }

  // ── Shadow DOM utilities ─────────────────────────────────────────────────

  function injectStyleIntoShadow(shadowRoot) {
    if (!shadowRoot || shadowRoot.getElementById(SHADOW_STYLE_ID)) return false;
    const style = document.createElement('style');
    style.id = SHADOW_STYLE_ID;
    style.textContent = PLAYER_SHADOW_CSS;
    shadowRoot.appendChild(style);
    return true;
  }

  /**
   * Search for elements matching a predicate inside a shadow root.
   */
  function queryShadowAll(shadowRoot, selector) {
    try { return shadowRoot.querySelectorAll(selector); } catch (_) { return []; }
  }

  // ── YouTube Shadow DOM injection ─────────────────────────────────────────

  /**
   * Inject anti-recommend CSS into every shadow root that might contain
   * YouTube player UI (.ytp-* elements).
   *
   * YouTube has several possible DOM layouts:
   *   A) #movie_player in page DOM   → its shadowRoot holds the UI
   *   B) #player in page DOM         → its shadowRoot holds the UI
   *   C) ytd-player in page DOM      → its shadowRoot holds #movie_player
   *                                       → #movie_player.shadowRoot holds UI
   *   D) ytd-player in page DOM      → its shadowRoot directly holds UI
   *                                      (no nested shadow on #movie_player)
   */
  function injectYouTubePlayerStyles() {
    let injected = false;

    // --- Case A/B: player host directly in the page DOM --------------------
    for (const id of ['#movie_player', '#player']) {
      const host = document.querySelector(id);
      if (host && host.shadowRoot) {
        injected = injectStyleIntoShadow(host.shadowRoot) || injected;
      }
    }

    // --- Case C/D: ytd-player custom element -------------------------------
    const ytd = document.querySelector('ytd-player');
    if (ytd && ytd.shadowRoot) {
      // Case D: .ytp-* elements might be directly inside ytd-player's shadow
      injected = injectStyleIntoShadow(ytd.shadowRoot) || injected;

      // Case C: a nested #movie_player / #player with its own shadow root
      for (const sel of ['#movie_player', '#player', '.html5-video-player']) {
        const inner = queryShadowAll(ytd.shadowRoot, sel)[0];
        if (inner && inner.shadowRoot) {
          injected = injectStyleIntoShadow(inner.shadowRoot) || injected;
        }
      }
    }

    return injected;
  }

  /**
   * YouTube's player is created asynchronously — retry until we find it.
   */
  function schedulePlayerShadowInjection() {
    if (injectYouTubePlayerStyles()) return;

    [500, 1500, 4000, 10000].forEach(delay => {
      setTimeout(() => {
        if (location.hostname.includes('youtube.com')) {
          injectYouTubePlayerStyles();
        }
      }, delay);
    });
  }

  // ── Autoplay prevention ─────────────────────────────────────────────────

  function isElementOn(el) {
    if (!el || el.disabled) return false;
    try {
      const cls = (typeof el.className === 'string') ? el.className : '';
      return (
        el.getAttribute('aria-pressed') === 'true' ||
        el.getAttribute('aria-checked') === 'true' ||
        el.hasAttribute('checked') ||
        el.hasAttribute('active') ||
        cls.includes('active') ||
        cls.includes('ytp-autonav-toggle-button--active') ||
        cls.includes('on') && !cls.includes('off') ||
        (el.tagName === 'INPUT' && el.type === 'checkbox' && el.checked)
      );
    } catch (_) { return false; }
  }

  function tryToggleOff(el) {
    if (isElementOn(el)) {
      try { el.click(); } catch (_) { /* ignore */ }
      return true;
    }
    return false;
  }

  /**
   * Search elements (page-DOM NodeList or array) for toggles to turn off.
   */
  function scanAndDisable(nodeList, keywordRegex) {
    let clicked = false;
    for (const el of nodeList) {
      // Match by keyword in aria-label / title / data-tooltip / textContent
      const haystack = [
        el.getAttribute('aria-label') || '',
        el.getAttribute('data-tooltip-text') || '',
        el.getAttribute('title') || '',
        el.getAttribute('data-name') || '',
        el.getAttribute('data-title') || '',
        (el.textContent || '').slice(0, 60)
      ].join(' ');
      if (keywordRegex.test(haystack)) {
        clicked = tryToggleOff(el) || clicked;
      }
    }
    return clicked;
  }

  const AUTOPLAY_RE = /autoplay|自动播放|自动连播|auto-play|auto_play/i;

  /**
   * Find YouTube's autoplay toggle and ensure it is OFF.
   */
  function disableYouTubeAutoplay() {
    let clicked = false;

    // --- Page-level DOM ----------------------------------------------------
    clicked = scanAndDisable(
      document.querySelectorAll(
        '.ytp-autonav-toggle-button, ' +
        'button[data-tooltip-text*="Autoplay" i], ' +
        'button[data-tooltip-text*="自动播放" i], ' +
        'button[aria-label*="Autoplay" i], ' +
        'button[aria-label*="自动播放" i], ' +
        'tp-yt-paper-toggle-button'
      ),
      AUTOPLAY_RE
    ) || clicked;

    // --- Shadow DOM: #movie_player / #player --------------------------------
    for (const id of ['#movie_player', '#player']) {
      const host = document.querySelector(id);
      if (host && host.shadowRoot) {
        clicked = scanAndDisable(
          queryShadowAll(host.shadowRoot, '.ytp-autonav-toggle-button, button'),
          AUTOPLAY_RE
        ) || clicked;
      }
    }

    // --- Shadow DOM: ytd-player (and nested) -------------------------------
    const ytd = document.querySelector('ytd-player');
    if (ytd && ytd.shadowRoot) {
      clicked = scanAndDisable(
        queryShadowAll(ytd.shadowRoot, '.ytp-autonav-toggle-button, button'),
        AUTOPLAY_RE
      ) || clicked;

      // Nested player inside ytd-player's shadow
      for (const sel of ['#movie_player', '#player', '.html5-video-player']) {
        const inner = queryShadowAll(ytd.shadowRoot, sel)[0];
        if (inner && inner.shadowRoot) {
          clicked = scanAndDisable(
            queryShadowAll(inner.shadowRoot, '.ytp-autonav-toggle-button, button'),
            AUTOPLAY_RE
          ) || clicked;
        }
      }
    }

    return clicked;
  }

  const BILI_AUTOPLAY_RE = /autoplay|自动播放|连播|auto.play|playmode|play_mode/i;

  /**
   * Disable Bilibili autoplay / playlist-auto-next.
   */
  function disableBilibiliAutoplay() {
    let clicked = false;

    // --- Specific Bpx player controls --------------------------------------
    clicked = scanAndDisable(
      document.querySelectorAll(
        '.bpx-player-ctrl-playmode, ' +
        '.bpx-player-ctrl-btn, ' +
        '.bpx-player-dpl-toggle, ' +
        '.bpx-player-ctrl-setting-item, ' +
        '.bpx-player-video-info-playmode, ' +
        'button[data-name*="autoplay" i], ' +
        'button[data-name*="playmode" i], ' +
        'button[data-name*="order" i], ' +
        'div[data-name*="autoplay" i]'
      ),
      BILI_AUTOPLAY_RE
    ) || clicked;

    // --- Broader scan: any button / toggle in the player area --------------
    clicked = scanAndDisable(
      document.querySelectorAll(
        '#bilibili-player button, ' +
        '#bilibili-player [role="switch"], ' +
        '#bilibili-player [role="button"], ' +
        '#playerWrap button, ' +
        '#playerWrap [role="switch"], ' +
        '.bpx-player-container button, ' +
        '.bpx-player-container [role="switch"], ' +
        '.bpx-player-primary-area button'
      ),
      BILI_AUTOPLAY_RE
    ) || clicked;

    // --- Playlist-panel autoplay controls -----------------------------------
    clicked = scanAndDisable(
      document.querySelectorAll(
        '.bpx-player-dpl-panel button, ' +
        '.bpx-player-dpl-panel [role="switch"], ' +
        '.player-auxiliary-playlist button, ' +
        '.base-player-auxiliary-playlist button, ' +
        '.bpx-player-video-info button, ' +
        '.bpx-player-ending-functions button'
      ),
      BILI_AUTOPLAY_RE
    ) || clicked;

    return clicked;
  }

  // ── Periodic retry (sites may re-enable autoplay on navigation) ──────────

  let lastAutoplayDisable = 0;
  const AUTOPLAY_RETRY_COOLDOWN = 2000; // throttle: don't hammer clicks

  function disableAutoplayIfNeeded() {
    const now = Date.now();
    if (now - lastAutoplayDisable < AUTOPLAY_RETRY_COOLDOWN) return;
    lastAutoplayDisable = now;

    const host = location.hostname;
    if (host.includes('youtube.com')) {
      disableYouTubeAutoplay();
    } else if (host.includes('bilibili.com')) {
      disableBilibiliAutoplay();
    }
  }

  // Try early and retry on video-end events
  function scheduleAutoplayDisable() {
    disableAutoplayIfNeeded();

    // Retry a few times with spacing (player controls load asynchronously)
    [1000, 3000, 8000].forEach(delay => {
      setTimeout(() => disableAutoplayIfNeeded(), delay);
    });
  }

  // Listen for the video-ended event to catch autoplay triggers
  document.addEventListener('ended', () => {
    // The player just finished — try to kill the autoplay countdown
    setTimeout(() => disableAutoplayIfNeeded(), 100);
  }, true); // capture phase to get it before the site's own handler

  // ── Bilibili video-ended interceptor ────────────────────────────────────
  // Bilibili's playlist/collection auto-advance is sometimes controlled by
  // a mechanism that our toggle-scan can't reach (e.g. inside a collapsed
  // panel or a different component).  As a last line of defence we intercept
  // the <video> ended event to prevent the player from loading the next video.

  let _hookedBilibiliVideo = null;

  function interceptBilibiliVideoEnded() {
    const video = document.querySelector('#bilibili-player video, .bpx-player-video-wrap video');
    if (!video || video === _hookedBilibiliVideo) return;
    _hookedBilibiliVideo = video;

    video.addEventListener('ended', function onEnded(e) {
      // Pause the video (just in case) and stop the event from reaching
      // Bilibili's own handler that would trigger the next video.
      try { video.pause(); } catch (_) { /* ignore */ }
      e.stopImmediatePropagation();
    }, true); // capture phase — fires before Bilibili's own listener
  }

  // Throttle to avoid excessive DOM queries during high-frequency mutations
  let lastMutationHandle = 0;
  const MUTATION_HANDLE_COOLDOWN = 300;

  function handleMutations() {
    const now = Date.now();
    if (now - lastMutationHandle < MUTATION_HANDLE_COOLDOWN) return;
    lastMutationHandle = now;

    const host = location.hostname;
    if (host.includes('youtube.com')) {
      hideYouTubeRecommendations();
      injectYouTubePlayerStyles();   // shadow DOM: end-screens, overlays, etc.
      disableYouTubeAutoplay();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliRecommendations();
      disableBilibiliAutoplay();
      interceptBilibiliVideoEnded();
    }
  }

  // ── Start observing once the body exists ───────────────────────────────────

  function startObserver() {
    // Run once immediately
    handleMutations();
    scheduleAutoplayDisable();
    schedulePlayerShadowInjection();

    const observer = new MutationObserver(() => {
      handleMutations();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Wait for body (it may not exist yet at document-start)
  if (document.body) {
    startObserver();
  } else {
    const bodyWatcher = new MutationObserver(() => {
      if (document.body) {
        bodyWatcher.disconnect();
        startObserver();
      }
    });
    bodyWatcher.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

// ==UserScript==
// @name         Anti-Recommend — Hide YouTube & Bilibili Video Recommendations
// @namespace    https://github.com/RyanStarFox/AntiRecommend
// @version      1.1.1
// @description  Remove sidebar recommendations, end-screen recommendations, and disable autoplay on YouTube and Bilibili
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
    /* End-screen recommendation grid */
    .ytp-endscreen-content,
    .html5-endscreen,
    .ytp-ce-element,

    /* Pause overlay with video suggestions */
    .ytp-pause-overlay,
    .ytp-pause-overlay-container,

    /* Info cards that pop up during playback */
    .ytp-ce-covering-overlay,
    .ytp-cards-teaser,
    .ytp-cards-button,

    /* Autoplay countdown ("Next video in 5…") */
    .ytp-autonav-endscreen-countdown-container,

    /* "Up next" panel in the player */
    .ytp-upnext,
    .ytp-upnext-header,
    .ytp-upnext-autoplay-icon,
    .ytp-upnext-cancel-button {
      display: none !important;
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

  // ── YouTube Shadow DOM injection ─────────────────────────────────────────
  // Tracks the last player element we injected into so we can re-inject
  // after SPA navigation replaces the player.
  let lastInjectedPlayer = null;

  /**
   * Inject the anti-recommend stylesheet into YouTube's player shadow root.
   * YouTube uses Shadow DOM for #movie_player, which isolates its internal
   * elements from page-level CSS.  We must inject directly into the shadow.
   */
  function injectYouTubePlayerStyles() {
    // Try direct #movie_player first (it's the shadow host in most layouts)
    const player = document.querySelector('#movie_player');
    if (player && player.shadowRoot) {
      if (player !== lastInjectedPlayer) {
        lastInjectedPlayer = player;
        // Remove old style if somehow still present (shouldn't happen)
        const old = player.shadowRoot.getElementById(SHADOW_STYLE_ID);
        if (old) old.remove();
      }
      if (!player.shadowRoot.getElementById(SHADOW_STYLE_ID)) {
        const style = document.createElement('style');
        style.id = SHADOW_STYLE_ID;
        style.textContent = PLAYER_SHADOW_CSS;
        player.shadowRoot.appendChild(style);
      }
      return true;
    }

    // Try ytd-player → shadowRoot → #movie_player (nested, older layout)
    const ytdPlayer = document.querySelector('ytd-player');
    if (ytdPlayer && ytdPlayer.shadowRoot) {
      const inner = ytdPlayer.shadowRoot.querySelector('#movie_player') ||
                    ytdPlayer.shadowRoot.querySelector('#player');
      if (inner && inner.shadowRoot) {
        if (inner !== lastInjectedPlayer) {
          lastInjectedPlayer = inner;
          const old = inner.shadowRoot.getElementById(SHADOW_STYLE_ID);
          if (old) old.remove();
        }
        if (!inner.shadowRoot.getElementById(SHADOW_STYLE_ID)) {
          const style = document.createElement('style');
          style.id = SHADOW_STYLE_ID;
          style.textContent = PLAYER_SHADOW_CSS;
          inner.shadowRoot.appendChild(style);
        }
        return true;
      }
    }

    return false;
  }

  /**
   * YouTube's player is created asynchronously — retry until we find it.
   */
  function schedulePlayerShadowInjection() {
    if (injectYouTubePlayerStyles()) return; // already done

    // Retry: player may not exist yet or shadowRoot may not be attached
    [500, 1500, 4000, 10000].forEach(delay => {
      setTimeout(() => {
        if (location.hostname.includes('youtube.com')) {
          injectYouTubePlayerStyles();
        }
      }, delay);
    });
  }

  // ── Autoplay prevention ─────────────────────────────────────────────────

  /**
   * Find an autoplay toggle on the page and ensure it is OFF.
   * Returns true if it performed a click.
   */
  function disableYouTubeAutoplay() {
    let clicked = false;

    const tryToggle = (el) => {
      if (!el || el.disabled) return;
      // aria-pressed="true" means autoplay is currently ON → click to turn off
      const pressed =
        el.getAttribute('aria-pressed') === 'true' ||
        el.getAttribute('aria-checked') === 'true' ||
        el.classList.contains('ytp-autonav-toggle-button--active') ||
        el.hasAttribute('checked') ||
        el.hasAttribute('active');
      if (pressed) {
        el.click();
        clicked = true;
      }
    };

    // Desktop player: the autoplay toggle switch in the control bar
    document.querySelectorAll(
      '.ytp-autonav-toggle-button, ' +
      'button[data-tooltip-text*="Autoplay" i], ' +
      'button[data-tooltip-text*="自动播放" i], ' +
      'button[aria-label*="Autoplay" i], ' +
      'button[aria-label*="自动播放" i], ' +
      'tp-yt-paper-toggle-button[aria-label*="autoplay" i], ' +
      'tp-yt-paper-toggle-button[aria-label*="自动播放" i]'
    ).forEach(tryToggle);

    // Also search broadly by text / tooltip in the page-level DOM
    document.querySelectorAll('.ytp-chrome-controls button, ytd-watch-flexy button')
      .forEach(btn => {
        const label = (btn.getAttribute('aria-label') || '') +
          (btn.getAttribute('data-tooltip-text') || '') +
          (btn.getAttribute('title') || '') +
          (btn.textContent || '');
        if (/autoplay|自动播放/i.test(label)) {
          tryToggle(btn);
        }
      });

    // YouTube's autoplay toggle is inside #movie_player's Shadow DOM
    const player = document.querySelector('#movie_player');
    if (player && player.shadowRoot) {
      player.shadowRoot.querySelectorAll(
        '.ytp-autonav-toggle-button, ' +
        'button[data-tooltip-text*="Autoplay" i], ' +
        'button[data-tooltip-text*="自动播放" i], ' +
        'button[aria-label*="Autoplay" i], ' +
        'button[aria-label*="自动播放" i], ' +
        'tp-yt-paper-toggle-button'
      ).forEach(tryToggle);
    }

    return clicked;
  }

  /**
   * Disable Bilibili autoplay / playlist-auto-next.
   */
  function disableBilibiliAutoplay() {
    let clicked = false;

    const tryToggle = (el) => {
      if (!el || el.disabled) return;
      // Check if it looks "active" (autoplay ON)
      const cls = el.className || '';
      const isOn =
        cls.includes('active') ||
        cls.includes('on') ||
        cls.includes('selected') ||
        el.getAttribute('aria-pressed') === 'true' ||
        el.getAttribute('aria-checked') === 'true';
      if (isOn) {
        el.click();
        clicked = true;
      }
    };

    // Bpx player play-mode / autoplay controls
    document.querySelectorAll(
      '.bpx-player-ctrl-playmode, ' +
      '.bpx-player-ctrl-btn[aria-label*="播" i], ' +
      '.bpx-player-ctrl-btn[aria-label*="自动" i], ' +
      '.bpx-player-ctrl-btn[data-name*="playmode" i], ' +
      '.bpx-player-ctrl-btn[data-name*="autoplay" i], ' +
      'button[aria-label*="自动播放" i], ' +
      'button[aria-label*="连播" i], ' +
      'button[aria-label*="autoplay" i], ' +
      '.bpx-player-ctrl-setting-item, ' +
      '.bpx-player-dpl-toggle'
    ).forEach(tryToggle);

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

  function handleMutations() {
    const host = location.hostname;
    if (host.includes('youtube.com')) {
      hideYouTubeRecommendations();
      injectYouTubePlayerStyles();   // shadow DOM: end-screens, overlays, etc.
      disableYouTubeAutoplay();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliRecommendations();
      disableBilibiliAutoplay();
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

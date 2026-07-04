// ==UserScript==
// @name         Anti-Recommend — Hide YouTube & Bilibili Video Recommendations
// @namespace    https://github.com/RyanStarFox/AntiRecommend
// @version      1.4.3
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

  // ── Page-level CSS injection ────────────────────────────────────────────

  const STYLE_ID = 'anti-recommend-style';

  const css = `
    /* ===== YouTube ===== */

    /* Sidebar: hide the recommendation list */
    ytd-watch-next-secondary-results-renderer,
    ytm-item-section-renderer#related {
      display: none !important;
    }

    /* Collapse #secondary when it only contains recommendations */
    #secondary:has(ytd-watch-next-secondary-results-renderer):not(:has(ytd-playlist-panel-renderer)):not(:has(ytd-live-chat-frame)) {
      display: none !important;
    }

    /*
     * End-screen — high-specificity selectors to beat YouTube's own !important
     * rules.  Only target the end-screen containers, NOT info-cards or other
     * player elements that might be needed for correct playback.
     */
    .html5-video-player .html5-endscreen,
    .html5-video-player .ytp-endscreen-content,
    #movie_player .html5-endscreen,
    #movie_player .ytp-endscreen-content,
    .html5-endscreen.videowall-endscreen {
      display: none !important;
    }

    /* Pause overlay (the "you might also like" thumbnails while paused) */
    .html5-video-player .ytp-pause-overlay,
    .html5-video-player .ytp-pause-overlay-container {
      display: none !important;
    }

    /* Autoplay countdown overlay + Up-Next panel (near-end recommendations) */
    .html5-video-player .ytp-autonav-endscreen-countdown-overlay,
    .html5-video-player .ytp-autonav-endscreen-countdown-container,
    .html5-video-player .ytp-upnext {
      display: none !important;
    }

    /*
     * Info cards (.ytp-ce-element) — these are the clickable cards that pop
     * up in the last ~20 s of a video.  Using visibility:hidden instead of
     * display:none avoids the progress-bar freeze bug because the elements
     * remain in layout (YouTube's JS can still measure them).
     */
    .html5-video-player .ytp-ce-element,
    .html5-video-player .ytp-ce-shadow,
    .html5-video-player .ytp-cards-teaser,
    .html5-video-player .ytp-cards-button {
      visibility: hidden !important;
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
    #right_panel_wrapper .related-video-panel,
    .bangumi-page .recommend-list,
    .pl__part__list,
    .popular-video-container,
    #popular-video,
    .right-container .video-page-special,
    .right-container .pop-video,
    .video-tag-container + .popular-video-container {
      display: none !important;
    }

    /* End-screen overlay */
    .bpx-player-ending-content,
    .bpx-player-ending-related,
    .bpx-player-ending-panel,
    .bpx-player-ending-cover,
    .bilibili-player-ending-content,
    .bilibili-player-ending-related,
    .bilibili-player-ending-panel,
    .bpx-player-video-ended .bpx-player-ending-content,
    .bpx-player-ending-countdown,
    .bpx-player-upnext,
    .bpx-player-ending-overlay .ending-countdown {
      display: none !important;
    }
  `;

  // ── YouTube Shadow DOM CSS (minimal set — only end-screen, not info-cards) ─
  // Info-card classes (.ytp-ce-*, .ytp-cards-*) are deliberately EXCLUDED —
  // hiding them was the likely cause of the progress bar freezing bug in
  // earlier versions.  They appear during normal playback; we only want to
  // hide the post-video end-screen and pause overlay.
  const PLAYER_SHADOW_CSS = `
    .html5-endscreen,
    .ytp-endscreen-content,
    .ytp-pause-overlay,
    .ytp-pause-overlay-container,
    /* Autoplay countdown overlay */
    .ytp-autonav-endscreen-countdown-overlay,
    .ytp-autonav-endscreen-countdown-container,
    .ytp-upnext,
    .ytp-upnext-header,
    .ytp-upnext-autoplay-icon,
    .ytp-upnext-cancel-button {
      display: none !important;
    }
    /*
     * Info cards — visibility:hidden keeps layout intact (no JS crash),
     * but renders cards invisible.
     */
    .ytp-ce-element,
    .ytp-ce-shadow,
    .ytp-cards-teaser,
    .ytp-cards-button {
      visibility: hidden !important;
    }
  `;

  const SHADOW_STYLE_ID = 'anti-recommend-shadow-style';

  function injectStyleIntoShadow(shadowRoot) {
    if (!shadowRoot || shadowRoot.getElementById(SHADOW_STYLE_ID)) return false;
    const style = document.createElement('style');
    style.id = SHADOW_STYLE_ID;
    style.textContent = PLAYER_SHADOW_CSS;
    shadowRoot.appendChild(style);
    return true;
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  injectStyle();

  // ── YouTube replay prevention ───────────────────────────────────────────

  let _ytVideoHooked = false;
  function preventYouTubeReplay() {
    if (_ytVideoHooked) return;
    const video = document.querySelector('#movie_player video');
    if (!video) return;
    _ytVideoHooked = true;

    // Ensure loop is off
    video.loop = false;

    // When the video ends, prevent auto-replay
    video.addEventListener('ended', () => {
      video.pause();
      video.loop = false;
      // Re-check: if YouTube's JS set loop back, remove it again
      video.removeAttribute('loop');
    }, true);

    // Intercept play() to block replay after the video has finished
    const origPlay = video.play.bind(video);
    video.play = function () {
      if (video.ended || video.currentTime >= video.duration - 0.5) {
        // Video already ended — block replay
        return Promise.reject(new DOMException('Replay blocked', 'AbortError'));
      }
      return origPlay();
    };
  }

  // ── DOM utilities ────────────────────────────────────────────────────────

  function hideSelector(selector) {
    try {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    } catch (_) { /* ignore invalid selectors */ }
  }

  // ── Periodic end-screen scanner ──────────────────────────────────────────

  // display:none  — for end-screen containers (safe because they appear post-video)
  const HIDE_DISPLAY_SELECTORS = [
    '.html5-endscreen', '.ytp-endscreen-content',
    '.ytp-pause-overlay', '.ytp-pause-overlay-container',
    '.ytp-autonav-endscreen-countdown-overlay',
    '.ytp-autonav-endscreen-countdown-container',
    '.ytp-upnext'
  ];

  // visibility:hidden — for info cards (keep layout to avoid JS crash / progress-bar freeze)
  const HIDE_VISIBILITY_SELECTORS = [
    '.ytp-ce-element', '.ytp-ce-shadow',
    '.ytp-cards-teaser', '.ytp-cards-button'
  ];

  function hideEndScreensInRoot(root) {
    for (const sel of HIDE_DISPLAY_SELECTORS) {
      try {
        root.querySelectorAll(sel).forEach(el => {
          el.style.setProperty('display', 'none', 'important');
        });
      } catch (_) { /* ignore */ }
    }
    for (const sel of HIDE_VISIBILITY_SELECTORS) {
      try {
        root.querySelectorAll(sel).forEach(el => {
          el.style.setProperty('visibility', 'hidden', 'important');
        });
      } catch (_) { /* ignore */ }
    }
  }

  let _lastTreeScan = 0;
  function scanAndHideEndScreens() {
    const now = Date.now();
    if (now - _lastTreeScan < 800) return; // every 800ms to fight inline !important
    _lastTreeScan = now;

    // Page-level DOM
    hideEndScreensInRoot(document);

    // Known shadow hosts — inject persistent CSS + direct DOM hiding
    for (const id of ['#movie_player', '#player']) {
      const host = document.querySelector(id);
      if (host && host.shadowRoot) {
        injectStyleIntoShadow(host.shadowRoot);
        hideEndScreensInRoot(host.shadowRoot);
      }
    }
    // ytd-player custom element (and any nested player inside it)
    const ytd = document.querySelector('ytd-player');
    if (ytd && ytd.shadowRoot) {
      injectStyleIntoShadow(ytd.shadowRoot);
      hideEndScreensInRoot(ytd.shadowRoot);
      for (const sel of ['#movie_player', '#player', '.html5-video-player']) {
        try {
          const inner = ytd.shadowRoot.querySelector(sel);
          if (inner && inner.shadowRoot) {
            injectStyleIntoShadow(inner.shadowRoot);
            hideEndScreensInRoot(inner.shadowRoot);
          }
        } catch (_) { /* ignore */ }
      }
    }

    // Set up a style-observer on the player to instantly re-hide end-screen
    // elements when YouTube sets an inline !important style to show them.
    _ensureEndscreenStyleObserver();
  }

  let _endscreenObserverInstalled = false;
  function _ensureEndscreenStyleObserver() {
    if (_endscreenObserverInstalled) return;
    const player = document.querySelector('#movie_player');
    if (!player) return;
    _endscreenObserverInstalled = true;

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) {
              const cls = node.className || '';
              if (/html5-endscreen|ytp-endscreen/.test(cls)) {
                node.style.setProperty('display', 'none', 'important');
              }
            }
          }
        } else if (m.type === 'attributes' && m.attributeName === 'style') {
          const el = m.target;
          const cls = el.className || '';
          if (/html5-endscreen|ytp-endscreen/.test(cls)) {
            el.style.setProperty('display', 'none', 'important');
          }
        }
      }
    });

    observer.observe(player, { childList: true, attributes: true, subtree: true, attributeFilter: ['style'] });
  }

  // ── Recommendation hiding (page-level DOM only) ─────────────────────────

  function hideYouTubeRecommendations() {
    hideSelector('ytd-watch-next-secondary-results-renderer');
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

  function scanAndDisable(nodeList, keywordRegex) {
    let clicked = false;
    for (const el of nodeList) {
      const haystack = [
        el.getAttribute('aria-label') || '',
        el.getAttribute('data-tooltip-text') || '',
        el.getAttribute('title') || '',
        el.getAttribute('data-name') || '',
        el.getAttribute('data-title') || '',
        (el.textContent || '').slice(0, 80)
      ].join(' ');
      if (keywordRegex.test(haystack)) {
        clicked = tryToggleOff(el) || clicked;
      }
    }
    return clicked;
  }

  const AUTOPLAY_RE = /autoplay|自动播放|自动连播|auto.play|auto_play/i;

  function disableYouTubeAutoplay() {
    let clicked = false;

    // Page + shadow DOM search
    const roots = [document];
    for (const id of ['#movie_player', '#player']) {
      const host = document.querySelector(id);
      if (host && host.shadowRoot) roots.push(host.shadowRoot);
    }
    const ytd = document.querySelector('ytd-player');
    if (ytd && ytd.shadowRoot) {
      roots.push(ytd.shadowRoot);
      for (const sel of ['#movie_player', '#player', '.html5-video-player']) {
        try {
          const inner = ytd.shadowRoot.querySelector(sel);
          if (inner && inner.shadowRoot) roots.push(inner.shadowRoot);
        } catch (_) { /* ignore */ }
      }
    }

    for (const root of roots) {
      try {
        clicked = scanAndDisable(
          root.querySelectorAll('.ytp-autonav-toggle-button, button, tp-yt-paper-toggle-button'),
          AUTOPLAY_RE
        ) || clicked;
      } catch (_) { /* ignore */ }
    }

    return clicked;
  }

  const BILI_AUTOPLAY_RE = /autoplay|自动播放|连播|auto.play|playmode|play_mode|order/i;

  function disableBilibiliAutoplay() {
    let clicked = false;

    const selectors = [
      // Player controls
      '.bpx-player-ctrl-playmode',
      '.bpx-player-ctrl-btn',
      '.bpx-player-dpl-toggle',
      '.bpx-player-ctrl-setting-item',
      '.bpx-player-video-info-playmode',
      'button[data-name*="autoplay" i]',
      'button[data-name*="playmode" i]',
      'button[data-name*="order" i]',
      'div[data-name*="autoplay" i]',
      // Player area — broad
      '#bilibili-player button',
      '#bilibili-player [role="switch"]',
      '#playerWrap button',
      '#playerWrap [role="switch"]',
      '.bpx-player-container button',
      '.bpx-player-container [role="switch"]',
      '.bpx-player-primary-area button',
      // Playlist / collection panel
      '.bpx-player-dpl-panel button',
      '.bpx-player-dpl-panel [role="switch"]',
      '.player-auxiliary-playlist button',
      '.base-player-auxiliary-playlist button',
      '.bpx-player-video-info button',
      '.bpx-player-ending-functions button',
      // Universal search
      '.bpx-player-video-info-title button',
      '#multi_page [role="switch"]',
      '.video-pods button',
      '.video-pods [role="switch"]',
    ];

    for (const sel of selectors) {
      try {
        clicked = scanAndDisable(document.querySelectorAll(sel), BILI_AUTOPLAY_RE) || clicked;
      } catch (_) { /* ignore */ }
    }

    return clicked;
  }

  // ── Bilibili autoplay toggle ────────────────────────────────────────────
  //
  // Bilibili has an "自动开播" (auto-play) checkbox inside the player's
  // settings menu.  The element always exists in the DOM (even when the
  // menu is closed), so we can directly uncheck it.
  // For collection videos there may also be a "自动连播" toggle; we target
  // all autoplay-related switches.

  function disableBilibiliAutoplayToggle() {
    let unchecked = false;

    // 1) "自动开播" checkbox inside the player settings menu
    const settingsCheckbox = document.querySelector(
      'input.bui-switch-input[aria-label*="自动开播"]'
    );
    if (settingsCheckbox && settingsCheckbox.checked) {
      settingsCheckbox.checked = false;
      settingsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      settingsCheckbox.dispatchEvent(new Event('input', { bubbles: true }));
      unchecked = true;
    }

    // 2) "自动连播" toggle in the right-side playlist/collection panel
    //    Structure: .auto-play > .continuous-btn > .switch-btn.on
    const switchBtn = document.querySelector('.auto-play .switch-btn.on');
    if (switchBtn) {
      // Click the parent .continuous-btn to toggle it off
      const btn = switchBtn.closest('.continuous-btn');
      if (btn) {
        btn.click();
        unchecked = true;
      }
    }

    return unchecked;
  }

  // ── Bilibili history.pushState interception (backup) ────────────────────
  // If the toggle approach above doesn't work, intercept page navigation.

  let _biliLastVideoEnded = 0;
  let _biliLastUserClick = 0;

  function _hookBiliVideoEvent() {
    const video = document.querySelector('#bilibili-player video, .bpx-player-video-wrap video');
    if (!video || video.dataset.antiRecHooked) return;
    video.dataset.antiRecHooked = '1';
    video.addEventListener('ended', () => {
      _biliLastVideoEnded = Date.now();
    }, true);
  }

  function _installClickTracker() {
    if (document.body.dataset.antiRecClickTracked) return;
    document.body.dataset.antiRecClickTracked = '1';
    document.addEventListener('click', () => { _biliLastUserClick = Date.now(); }, true);
    document.addEventListener('keydown', () => { _biliLastUserClick = Date.now(); }, true);
  }

  (function _interceptHistory() {
    const _push = history.pushState;
    function blockIfAutoAdvance(method) {
      return function (state, title, url) {
        if (location.hostname.includes('bilibili.com') && url) {
          const sinceEnded = Date.now() - _biliLastVideoEnded;
          const sinceClick = Date.now() - _biliLastUserClick;
          if (sinceEnded < 8000 && sinceClick > 2500) {
            _biliLastVideoEnded = 0;
            return;
          }
        }
        return method.apply(this, arguments);
      };
    }
    history.pushState = blockIfAutoAdvance(_push);
    history.replaceState = blockIfAutoAdvance(history.replaceState);
  })();

  // ── Scheduler ────────────────────────────────────────────────────────────

  let _lastAutoplayDisable = 0;
  const AUTOPLAY_COOLDOWN = 2000;

  function periodicTasks() {
    const now = Date.now();
    const host = location.hostname;
    const isYT = host.includes('youtube.com');
    const isBili = host.includes('bilibili.com');

    // End-screen scan (own throttle)
    if (isYT) { scanAndHideEndScreens(); preventYouTubeReplay(); }

    // Autoplay toggle
    if (now - _lastAutoplayDisable >= AUTOPLAY_COOLDOWN) {
      _lastAutoplayDisable = now;
      if (isYT) disableYouTubeAutoplay();
      if (isBili) {
        _installClickTracker();
        disableBilibiliAutoplayToggle();  // primary: uncheck "自动开播" checkbox
        disableBilibiliAutoplay();        // fallback: keyword scan
        _hookBiliVideoEvent();
      }
    }
  }

  function schedulePeriodic() {
    periodicTasks();

    // Early shadow-DOM injection attempts (unthrottled, before the 2s scan interval)
    [300, 800, 1600, 3000, 6000].forEach(delay => {
      setTimeout(() => {
        const host = location.hostname;
        if (host.includes('youtube.com')) scanAndHideEndScreens();
        if (host.includes('youtube.com') || host.includes('bilibili.com')) periodicTasks();
      }, delay);
    });
  }

  // ── MutationObserver ─────────────────────────────────────────────────────

  let _lastMutation = 0;

  function handleMutations() {
    const now = Date.now();
    if (now - _lastMutation < 250) return;
    _lastMutation = now;

    const host = location.hostname;
    if (host.includes('youtube.com')) {
      hideYouTubeRecommendations();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliRecommendations();
    }
  }

  // ── Boot ─────────────────────────────────────────────────────────────────

  function startObserver() {
    handleMutations();
    schedulePeriodic();

    const observer = new MutationObserver(() => { handleMutations(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

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

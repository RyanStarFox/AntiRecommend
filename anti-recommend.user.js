// ==UserScript==
// @name         Anti-Recommend — Hide YouTube & Bilibili Video Recommendations
// @namespace    https://github.com/RyanStarFox/AntiRecommend
// @version      1.0.0
// @description  Remove sidebar recommendations and end-screen recommendations on YouTube and Bilibili
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

    /* Sidebar: the entire "related videos" column */
    #secondary,
    #related,
    ytd-watch-next-secondary-results-renderer,
    /* Mobile sidebar */
    ytm-item-section-renderer#related {
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

    /* "More videos" / autoplay sidebar in theater mode */
    .ytd-watch-flexy[theater] #secondary {
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
    hideSelector('#secondary');
    hideSelector('#related');
    hideSelector('ytd-watch-next-secondary-results-renderer');
    hideSelector('.ytp-endscreen-content');
    hideSelector('.html5-endscreen');
    hideSelector('.ytp-ce-element');
    hideSelector('.ytp-pause-overlay');
    hideSelector('.ytp-pause-overlay-container');
    hideSelector('.ytp-ce-covering-overlay');
    hideSelector('.ytp-cards-teaser');
    // Mobile
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

  function handleMutations() {
    const host = location.hostname;
    if (host.includes('youtube.com')) {
      hideYouTubeRecommendations();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliRecommendations();
    }
  }

  // ── Start observing once the body exists ───────────────────────────────────

  function startObserver() {
    // Run once immediately
    handleMutations();

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

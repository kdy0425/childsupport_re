//디자인 셀렉트 (웹접근성: 숨긴 select 비포커스, ss-content aria-hidden·tabindex는 slimselect.js에서 처리. contentLocation은 body 유지해 포지셔닝 정상 동작)
(function () {
  document.querySelectorAll('select').forEach(function (selectEl) {
    const settings = {
      showSearch: false,
      allowDeselect: false,
    };
    new SlimSelect({
      select: selectEl,
      settings,
    });
  });
})();


//모바일 토글 검색용
(function () {
  document.querySelectorAll('.toggle_items').forEach(function (wrap) {
    const items = wrap.querySelector('.items');
    const btn = wrap.querySelector('.toggle_button');
    if (!items || !btn) return;

    const span = btn.querySelector('span');

    items.style.display = 'none';
    items.style.overflow = 'hidden';
    items.style.maxHeight = '0px';
    btn.classList.remove('active');
    if (span) span.textContent = '상세검색 열기';

    const open = () => {
      btn.classList.add('active');
      if (span) span.textContent = '상세검색 닫기';

      items.style.display = 'flex';
      items.style.overflow = 'hidden';
      items.style.maxHeight = '0px';

      requestAnimationFrame(() => {
        const h = items.scrollHeight;
        items.style.maxHeight = h + 'px';
      });

      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        items.style.maxHeight = 'none';
        items.style.overflow = 'visible';
        items.removeEventListener('transitionend', onEnd);
      };
      items.addEventListener('transitionend', onEnd);
    };

    const close = () => {
      btn.classList.remove('active');
      if (span) span.textContent = '상세검색 열기';

      items.style.overflow = 'hidden';
      items.style.maxHeight = items.scrollHeight + 'px';

      requestAnimationFrame(() => {
        items.style.maxHeight = '0px';
      });

      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        items.style.display = 'none';
        items.removeEventListener('transitionend', onEnd);
      };
      items.addEventListener('transitionend', onEnd);
    };

    btn.addEventListener('click', function () {
      const isOpen = btn.classList.contains('active');
      isOpen ? close() : open();
    });
  });
})();


// 영문 서브 공유 버튼 토글
(function () {
  document.querySelectorAll('.page_info').forEach(function (pageInfo) {
    var toggleBtn = pageInfo.querySelector('.action_toggle');
    var printShare = pageInfo.querySelector('.print_share');
    if (!toggleBtn || !printShare) return;

    function openShare() {
      toggleBtn.classList.add('open');
      printShare.style.display = 'flex';
    }

    function closeShare() {
      toggleBtn.classList.remove('open');
      printShare.style.display = '';
    }

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (toggleBtn.classList.contains('open')) {
        closeShare();
      } else {
        openShare();
      }
    });

    document.addEventListener('click', function (e) {
      if (pageInfo.contains(e.target)) return;
      closeShare();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeShare();
    });
  });
})();


// 헤더 화면 확대(#layout zoom) + 접근성
(function () {
  var layout = document.getElementById('layout');
  var zoomWraps = document.querySelectorAll('.hd_font_size');
  var nav = document.getElementById('nav');
  if (!layout || !zoomWraps.length) return;

  var zoomMap = {
    small: { scale: 0.9, label: '작게' },
    medium: { scale: 1, label: '보통' },
    slightly_large: { scale: 1.1, label: '조금 크게' },
    large: { scale: 1.3, label: '크게' },
    largest: { scale: 1.5, label: '가장 크게' },
  };
  var ZOOM_COOKIE_KEY = 'page_zoom_level';
  var ZOOM_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  function getSavedZoomValue() {
    var match = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + ZOOM_COOKIE_KEY + '=([^;]*)')
    );
    if (!match || !match[1]) return '';

    var value = '';
    try {
      value = decodeURIComponent(match[1]).trim();
    } catch (error) {
      value = '';
    }

    return zoomMap[value] ? value : '';
  }

  function saveZoomValue(value) {
    var normalized = zoomMap[value] ? value : 'medium';
    document.cookie = [
      ZOOM_COOKIE_KEY + '=' + encodeURIComponent(normalized),
      'path=/',
      'max-age=' + ZOOM_COOKIE_MAX_AGE,
      'SameSite=Lax',
    ].join('; ');
  }

  zoomWraps.forEach(function (wrap, idx) {
    var toggleBtn = wrap.querySelector('.font_size');
    var panel = wrap.querySelector('.hd_arrow_box');
    var labelEl = wrap.querySelector('.hd_font_size_label');
    var liveEl = wrap.querySelector('.hd_font_size_live');
    if (!toggleBtn || !panel) return;

    var optionButtons = Array.from(
      panel.querySelectorAll('button[data-value]:not([data-value="reset"])')
    );
    var resetBtn = panel.querySelector('button[data-value="reset"]');
    if (!optionButtons.length) return;

    if (!panel.id) {
      panel.id = 'hd_font_zoom_panel_' + (idx + 1);
    }

    toggleBtn.setAttribute('aria-controls', panel.id);
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    panel.setAttribute('aria-hidden', 'true');
    panel.hidden = true;

    function getCurrentValue() {
      var activeBtn = panel.querySelector(
        'button.active[data-value]:not([data-value="reset"])'
      );
      var value = activeBtn ? activeBtn.getAttribute('data-value') : 'medium';
      return zoomMap[value] ? value : 'medium';
    }

    function getCurrentLabel() {
      return zoomMap[getCurrentValue()].label;
    }

    function getMenuButtons() {
      return Array.from(panel.querySelectorAll('button:not([disabled])'));
    }

    function updateToggleLabel(open) {
      var text = getCurrentLabel() + ' 화면 확대 설정 ' + (open ? '닫기' : '열기');
      if (labelEl) {
        labelEl.textContent = text;
      } else {
        toggleBtn.setAttribute('aria-label', text);
      }
    }

    function announce(message) {
      if (!liveEl) return;
      liveEl.textContent = '';
      requestAnimationFrame(function () {
        liveEl.textContent = message;
      });
    }

    function updateActiveState(nextValue) {
      optionButtons.forEach(function (btn) {
        var active = btn.getAttribute('data-value') === nextValue;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function applyZoom(nextValue, shouldAnnounce, shouldPersist) {
      var isReset = nextValue === 'reset';
      var value = isReset ? 'medium' : nextValue;
      if (typeof shouldPersist === 'undefined') {
        shouldPersist = true;
      }
      if (!zoomMap[value]) {
        value = 'medium';
      }

      var scale = zoomMap[value].scale;
      var isExpanded = scale > 1;

      if (scale === 1) {
        layout.style.zoom = '';
      } else {
        layout.style.zoom = String(scale);
      }

      layout.setAttribute('data-zoom-level', value);
      layout.setAttribute('data-zoom-scale', String(scale));
      document.documentElement.style.setProperty('--page-zoom', String(scale));
      document.documentElement.classList.toggle('is-page-zoom-expand', isExpanded);
      document.documentElement.style.overflowX = isExpanded ? 'auto' : '';
      document.body.style.overflowX = isExpanded ? 'auto' : '';
      if (shouldPersist) {
        saveZoomValue(value);
      }
      window.dispatchEvent(
        new CustomEvent('pagezoomchange', {
          detail: {
            value: value,
            scale: scale,
            isExpanded: isExpanded,
          },
        })
      );

      updateActiveState(value);
      updateToggleLabel(!panel.hidden);

      if (shouldAnnounce) {
        announce(
          isReset
            ? '화면 확대가 초기화되었습니다.'
            : zoomMap[value].label + ' 크기로 화면 확대가 적용되었습니다.'
        );
      }
    }

    function focusActiveOption() {
      var target =
        panel.querySelector('button.active[data-value]:not([data-value="reset"])') ||
        getMenuButtons()[0];
      if (target) {
        target.focus();
      }
    }

    var openAfterSearchClosePending = false;

    function openPanelAfterSearchClose() {
      var searchLayer = document.getElementById('hd_search_layer');
      var searchCloseBtn = document.getElementById('btn_search_close');
      var searchToggleBtn = document.getElementById('btn_hd_search_open');

      if (!searchLayer || searchLayer.hasAttribute('hidden')) {
        openPanel();
        return;
      }

      if (openAfterSearchClosePending) return;
      openAfterSearchClosePending = true;

      var done = false;
      var observer = null;
      var timeoutId = 0;

      function finish() {
        if (done) return;
        done = true;
        openAfterSearchClosePending = false;
        if (observer) observer.disconnect();
        window.clearTimeout(timeoutId);
        openPanel();
      }

      if (typeof MutationObserver === 'function') {
        observer = new MutationObserver(function () {
          if (searchLayer.hasAttribute('hidden')) {
            finish();
          }
        });
        observer.observe(searchLayer, {
          attributes: true,
          attributeFilter: ['hidden'],
        });
      }

      timeoutId = window.setTimeout(finish, 450);

      if (!searchLayer.classList.contains('is-closing')) {
        if (searchCloseBtn) {
          searchCloseBtn.click();
        } else if (searchToggleBtn) {
          searchToggleBtn.click();
        } else {
          finish();
        }
      }
    }

    function openPanel() {
      if (!panel.hidden) return;
      wrap.classList.add('is-open');
      toggleBtn.classList.add('is-open');
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      updateToggleLabel(true);
      focusActiveOption();
    }

    function closePanel(restoreFocus) {
      if (panel.hidden) return;
      wrap.classList.remove('is-open');
      toggleBtn.classList.remove('is-open');
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      updateToggleLabel(false);
      if (restoreFocus) {
        toggleBtn.focus();
      }
    }

    function moveFocus(direction) {
      var buttons = getMenuButtons();
      var currentIndex = buttons.indexOf(document.activeElement);
      if (!buttons.length) return;

      if (direction === 'start') {
        buttons[0].focus();
        return;
      }
      if (direction === 'end') {
        buttons[buttons.length - 1].focus();
        return;
      }

      var nextIndex = currentIndex + direction;
      if (currentIndex < 0) {
        nextIndex = 0;
      }
      if (nextIndex < 0) {
        nextIndex = buttons.length - 1;
      }
      if (nextIndex >= buttons.length) {
        nextIndex = 0;
      }
      buttons[nextIndex].focus();
    }

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (panel.hidden) {
        openPanelAfterSearchClose();
      } else {
        closePanel(false);
      }
    });

    toggleBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (panel.hidden) {
          openPanelAfterSearchClose();
        } else {
          moveFocus(e.key === 'ArrowDown' ? 1 : -1);
        }
      }
      if (e.key === 'Escape' && !panel.hidden) {
        e.preventDefault();
        closePanel(true);
      }
    });

    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel(true);
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        moveFocus(1);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        moveFocus(-1);
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        moveFocus('start');
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        moveFocus('end');
      }
    });

    optionButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyZoom(btn.getAttribute('data-value'), true);
        closePanel(true);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        applyZoom('reset', true);
        closePanel(true);
      });
    }

    document.addEventListener('pointerdown', function (e) {
      if (panel.hidden) return;
      if (wrap.contains(e.target)) return;
      closePanel(false);
    });

    document.addEventListener('focusin', function (e) {
      if (panel.hidden) return;
      if (wrap.contains(e.target)) return;
      closePanel(false);
    });

    if (nav) {
      nav.addEventListener('mouseenter', function () {
        if (window.innerWidth <= 1240) return;
        closePanel(false);
      });
    }

    function syncZoomForViewport() {
      var savedZoomValue = getSavedZoomValue();
      var isMobileViewport = window.innerWidth <= 1240;
      var shouldResetForMobile =
        isMobileViewport &&
        (
          getCurrentValue() !== 'medium' ||
          !!layout.style.zoom ||
          document.documentElement.classList.contains('is-page-zoom-expand')
        );

      if (shouldResetForMobile) {
        applyZoom('reset', false, false);
        closePanel(false);
        return;
      }

      if (
        !isMobileViewport &&
        savedZoomValue &&
        layout.getAttribute('data-zoom-level') !== savedZoomValue
      ) {
        applyZoom(savedZoomValue, false, false);
      }
    }

    window.addEventListener('resize', syncZoomForViewport);

    applyZoom(
      window.innerWidth > 1240 ? getSavedZoomValue() || getCurrentValue() : getCurrentValue(),
      false,
      false
    );
    syncZoomForViewport();
    closePanel(false);
  });
})();


// 확대 상태 하단 고정 가로 스크롤바
(function () {
  function initPageZoomFixedScrollbar() {
    var htmlEl = document.documentElement;
    var bodyEl = document.body;
    var layout = document.getElementById('layout');
    var managedLayerEls = Array.from(
      document.querySelectorAll('#rn_header, .hd_layer')
    );
    var scrollingEl = document.scrollingElement || htmlEl;
    if (!bodyEl || !layout) return;

    var scrollBar = document.createElement('div');
    var scrollInner = document.createElement('div');
    var rafId = 0;
    var syncSource = '';

    scrollBar.className = 'page_zoom_fixed_scrollbar';
    scrollBar.setAttribute('aria-hidden', 'true');
    scrollBar.hidden = true;
    scrollInner.className = 'page_zoom_fixed_scrollbar_inner';
    scrollBar.appendChild(scrollInner);
    bodyEl.appendChild(scrollBar);

    function getPageScrollLeft() {
      return (
        scrollingEl.scrollLeft ||
        htmlEl.scrollLeft ||
        bodyEl.scrollLeft ||
        window.pageXOffset ||
        0
      );
    }

    function applyFixedLayerWidth(widthPx) {
      managedLayerEls.forEach(function (el) {
        if (!el) return;
        if (widthPx && window.getComputedStyle(el).position === 'fixed') {
          el.style.width = widthPx + 'px';
        } else {
          el.style.width = '';
        }
      });
    }

    function syncFixedLayerMetrics() {
      htmlEl.style.setProperty('--page-zoom-fixed-left', '0px');
      applyFixedLayerWidth(0);
    }

    function getScrollTop() {
      return window.pageYOffset || htmlEl.scrollTop || bodyEl.scrollTop || 0;
    }

    function getPageScrollWidth() {
      return Math.max(
        scrollingEl.scrollWidth,
        htmlEl.scrollWidth,
        bodyEl.scrollWidth
      );
    }

    function getVisualScrollWidth() {
      return Math.max(
        getPageScrollWidth(),
        Math.ceil(layout.getBoundingClientRect().width)
      );
    }

    function getPageMaxScrollLeft() {
      return Math.max(0, getPageScrollWidth() - htmlEl.clientWidth);
    }

    function getBarMaxScrollLeft() {
      return Math.max(0, scrollInner.offsetWidth - scrollBar.clientWidth);
    }

    function setPageScrollLeft(nextLeft) {
      var maxLeft = getPageMaxScrollLeft();
      var left = Math.max(0, Math.min(nextLeft, maxLeft));

      scrollingEl.scrollLeft = left;
      htmlEl.scrollLeft = left;
      bodyEl.scrollLeft = left;
      syncFixedLayerMetrics();
      window.scrollTo({
        left: left,
        top: getScrollTop(),
        behavior: 'auto',
      });
    }

    function isExpandedDesktop() {
      return (
        window.innerWidth > 1240 &&
        htmlEl.classList.contains('is-page-zoom-expand')
      );
    }

    function setVisible(visible) {
      scrollBar.hidden = !visible;
      htmlEl.classList.toggle('has-page-zoom-fixed-scrollbar', visible);
      if (!visible) {
        syncFixedLayerMetrics();
      }
    }

    function refresh() {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(function () {
        if (!isExpandedDesktop()) {
          setVisible(false);
          return;
        }

        var scrollWidth = getVisualScrollWidth();
        var clientWidth = htmlEl.clientWidth;
        var hasOverflow = scrollWidth > clientWidth + 1;

        setVisible(hasOverflow);
        if (!hasOverflow) return;

        scrollInner.style.width = scrollWidth + 'px';
        syncFixedLayerMetrics();
        if (syncSource !== 'bar') {
          var pageMaxLeft = getPageMaxScrollLeft();
          var barMaxLeft = getBarMaxScrollLeft();
          scrollBar.scrollLeft =
            pageMaxLeft > 0 && barMaxLeft > 0
              ? (getPageScrollLeft() / pageMaxLeft) * barMaxLeft
              : 0;
        }
      });
    }

    scrollBar.addEventListener('scroll', function () {
      if (syncSource === 'window') return;
      syncSource = 'bar';
      var pageMaxLeft = getPageMaxScrollLeft();
      var barMaxLeft = getBarMaxScrollLeft();
      var targetLeft =
        pageMaxLeft > 0 && barMaxLeft > 0
          ? (scrollBar.scrollLeft / barMaxLeft) * pageMaxLeft
          : 0;
      setPageScrollLeft(targetLeft);
      window.requestAnimationFrame(function () {
        if (syncSource === 'bar') {
          syncSource = '';
        }
      });
    });

    window.addEventListener(
      'scroll',
      function () {
        if (scrollBar.hidden || syncSource === 'bar') return;
        syncSource = 'window';
        syncFixedLayerMetrics();
        var pageMaxLeft = getPageMaxScrollLeft();
        var barMaxLeft = getBarMaxScrollLeft();
        scrollBar.scrollLeft =
          pageMaxLeft > 0 && barMaxLeft > 0
            ? (getPageScrollLeft() / pageMaxLeft) * barMaxLeft
            : 0;
        window.requestAnimationFrame(function () {
          if (syncSource === 'window') {
            syncSource = '';
          }
        });
      },
      { passive: true }
    );

    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    window.addEventListener('pagezoomchange', refresh);

    if (typeof ResizeObserver === 'function') {
      var resizeObserver = new ResizeObserver(function () {
        refresh();
      });
      resizeObserver.observe(layout);
    }

    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageZoomFixedScrollbar, {
      once: true,
    });
  } else {
    initPageZoomFixedScrollbar();
  }
})();


// 서브페이지 좌측 메뉴(#aside): 하위 ul 접기/펼치기 + 웹접근성(aria-controls, 접힘 시 하위 링크 탭 순서 제외, Space 키)
(function () {
  var aside = document.getElementById('aside');
  if (!aside) return;
  var root = aside.querySelector(':scope > nav > ul') || aside.querySelector(':scope > ul');
  if (!root) return;

  var subIdSeq = 0;
  function nextSubPanelId() {
    var id;
    do {
      subIdSeq += 1;
      id = 'aside_nav_sub_' + subIdSeq;
    } while (document.getElementById(id));
    return id;
  }

  function applyPanelState(a, subUl, expanded) {
    a.classList.toggle('open', expanded);
    a.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    subUl.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    subUl.querySelectorAll('a').forEach(function (innerA) {
      if (expanded) {
        innerA.removeAttribute('tabindex');
      } else {
        innerA.setAttribute('tabindex', '-1');
      }
    });
  }

  root.querySelectorAll(':scope > li').forEach(function (li) {
    var a = li.querySelector(':scope > a');
    var subUl = li.querySelector(':scope > ul');
    if (!a || !subUl) return;

    if (!subUl.id) {
      subUl.id = nextSubPanelId();
    }
    a.setAttribute('role', 'button');
    a.setAttribute('aria-controls', subUl.id);

    var open = a.classList.contains('open');
    applyPanelState(a, subUl, open);

    function onActivate(e) {
      var href = (a.getAttribute('href') || '').replace(/\s/g, '');
      if (href === 'javascript:;' || href.indexOf('javascript:') === 0) {
        e.preventDefault();
      }
      applyPanelState(a, subUl, !a.classList.contains('open'));
    }

    a.addEventListener('click', onActivate);

    a.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Spacebar') return;
      e.preventDefault();
      applyPanelState(a, subUl, !a.classList.contains('open'));
    });
  });
})();


///접근성 팝업
const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const htmlElForModal = document.documentElement;
let modalScrollLocked = false;
let modalSavedHtmlPaddingRight = '';

let lastTrigger = null;
let activeModal = null;
let mainToHide = null;

function lockBackground(modal) {
  const html = document.documentElement;
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  modalSavedHtmlPaddingRight = html.style.paddingRight;

  if (!modalScrollLocked) {
    modalScrollLocked = true;

    if (scrollbarWidth > 0) {
      html.style.paddingRight = scrollbarWidth + 'px';
    }
  }
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100%';
  document.documentElement.style.height = '100%';
  const main = document.querySelector('#content');
  if (main && !main.contains(modal)) {
    main.setAttribute('aria-hidden', 'true');
    mainToHide = main;
  }
}

function unlockBackground() {
  document.body.style.overflow = '';
  document.body.style.height = '';
  document.documentElement.style.height = '';
  if (modalScrollLocked && htmlElForModal) {
    htmlElForModal.style.paddingRight = modalSavedHtmlPaddingRight;
    modalScrollLocked = false;
  }

  if (mainToHide) {
    mainToHide.removeAttribute('aria-hidden');
    mainToHide = null;
  }
}


function getFocusEdges(container) {
  const list = Array.from(container.querySelectorAll(FOCUSABLE))
    .filter(el => el.offsetParent !== null || el === document.activeElement);
  return { first: list[0] || null, last: list[list.length - 1] || null };
}

function trapFocusWithin(e, container) {
  if (!container || e.key !== 'Tab') return false;
  const { first, last } = getFocusEdges(container);
  if (!first || !last) return false;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
    return true;
  }
  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

function focusFirstInContainer(container, preferredSelector, fallbackEl) {
  if (!container) return;
  const preferred = preferredSelector ? container.querySelector(preferredSelector) : null;
  const { first } = getFocusEdges(container);
  const target = preferred || first || fallbackEl || container;
  if (target && typeof target.focus === 'function') {
    target.focus();
  }
}

let isolatedLayerSiblings = [];
let isolatedLayerOwner = null;

function clearIsolatedLayerSiblings(owner) {
  if (owner && isolatedLayerOwner && owner !== isolatedLayerOwner) return;
  isolatedLayerSiblings.forEach(function (item) {
    if (!item.el) return;
    if (item.ariaHidden === null) item.el.removeAttribute('aria-hidden');
    else item.el.setAttribute('aria-hidden', item.ariaHidden);
    item.el.inert = item.inert;
  });
  isolatedLayerSiblings = [];
  isolatedLayerOwner = null;
}

function isolateLayerSiblings(activeLayer, options) {
  clearIsolatedLayerSiblings();
  const layout = document.getElementById('layout');
  if (!layout || !activeLayer) return;
  const excludedElements = Array.isArray(options?.excludedElements)
    ? options.excludedElements.filter(Boolean)
    : [];
  isolatedLayerOwner = activeLayer;
  Array.from(layout.children).forEach(function (child) {
    if (!child || child === activeLayer) return;
    if (excludedElements.indexOf(child) > -1) return;
    isolatedLayerSiblings.push({
      el: child,
      ariaHidden: child.getAttribute('aria-hidden'),
      inert: !!child.inert,
    });
    child.setAttribute('aria-hidden', 'true');
    child.inert = true;
  });
}

// 모달 열기
function openModal(modal) {
  if (!modal) return;
  activeModal = modal;
  modal.hidden = false;

  lockBackground(modal);

  const { first } = getFocusEdges(modal);
  const fallback = modal.querySelector('.modal__scroll') || modal.querySelector('.modal__dialog');
  (first || fallback).focus();

  modal.addEventListener('keydown', trapHandler);
  modal.addEventListener('click', backdropHandler);
}

// 모달 닫기
function closeModal(modal) {
  // 인자로 modal 안 오면 activeModal 사용
  const target = modal || activeModal;
  if (!target) return;

  target.hidden = true;
  target.removeEventListener('keydown', trapHandler);
  target.removeEventListener('click', backdropHandler);

  unlockBackground();

  // 포커스 복귀
  if (lastTrigger && document.contains(lastTrigger)) {
    lastTrigger.focus();
  }

  if (activeModal === target) {
    activeModal = null;
  }
}


// 탭 순환 & ESC 닫기
function trapHandler(e) {
  if (!activeModal) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal(activeModal);
    return;
  }

  if (e.key === 'Tab') {
    const dialog = activeModal.querySelector('.modal__dialog') || activeModal;
    const { first, last } = getFocusEdges(dialog);
    if (!first || !last) {
      // 포커스 대상이 없으면 기본 동작 허용
      return;
    }
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// 배경 클릭으로 닫기
function backdropHandler(e) {
  const target = e.target;
  if (target && (target.classList.contains('modal__backdrop') || target.dataset.close === 'true')) {
    closeModal(activeModal);
  }
}

// 열기 버튼
document.addEventListener('click', function (e) {
  const openBtn = e.target.closest('.js_modal_open');
  if (openBtn) {
    const sel = openBtn.getAttribute('data-target');
    const modal = document.querySelector(sel);
    if (!modal) return;
    lastTrigger = openBtn;
    openModal(modal);
    return;
  }

  const closeBtn = e.target.closest('.js_close_modal');
  if (closeBtn) {
    const modal = closeBtn.closest('[role="dialog"]');
    closeModal(modal || activeModal);
  }
});


// 헤더 검색/전체메뉴 접근성 제어
(function () {
  const header = document.querySelector('#rn_header');
  if (!header) return;

  const searchLayer = header.querySelector('.header_search');
  const navLayer = header.querySelector('.nav_all');
  const searchBg = header.querySelector('.search_bg');

  const searchToggleBtn = searchLayer?.closest('.item')?.querySelector('button');

  const nav = document.getElementById('nav');
  const navOpenBtn = document.getElementById('nav_all_open');
  const navCloseBtn = document.getElementById('nav_all_close');

  const searchCloseBtn = header.querySelector('#btn_search_close');

  if (!searchLayer && !navLayer) return;

  if (!header.hasAttribute('tabindex')) {
    header.setAttribute('tabindex', '-1');
  }

  let searchOrigin = null;
  let navOrigin = null;
  let isSearchOpen = false;
  let isNavOpen = false;
  let isNavScrollLocked = false;

  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  let savedHtmlPaddingRight = '';
  let savedBodyPaddingRight = '';
  let savedScrollTop = 0;

  if (searchLayer) {
    searchLayer.setAttribute('aria-hidden', 'true');
  }
  if (navLayer) {
    navLayer.setAttribute('aria-hidden', 'true');
  }
  if (searchToggleBtn) {
    searchToggleBtn.setAttribute('aria-expanded', 'false');
  }
  if (navOpenBtn) {
    navOpenBtn.setAttribute('aria-expanded', 'false');
    nav.classList.add('hide');
  }
  if (navCloseBtn) {
    navCloseBtn.setAttribute('aria-expanded', 'false');
    navCloseBtn.style.display = 'none';
    nav.classList.remove('hide');
  }

  const setFocusInsideHeader = () => {
    if (!header) return;
    const { first } = getFocusEdges(header);
    if (first) {
      first.focus();
    } else {
      header.focus();
    }
  };

  function closeSearch() {
      if (!searchLayer || !isSearchOpen) return;
      isSearchOpen = false;
      searchLayer.classList.remove('show');
      searchLayer.setAttribute('aria-hidden', 'true');
      searchToggleBtn?.setAttribute('aria-expanded', 'false');
      searchBg?.classList.remove('show');

      if (isNavScrollLocked && !isNavOpen) {
        htmlEl.style.overflow = '';
        bodyEl.style.overflow = '';

        htmlEl.style.paddingRight = savedHtmlPaddingRight;
        isNavScrollLocked = false;

        window.scrollTo({ top: savedScrollTop, behavior: 'auto' });
      }

      const target = searchOrigin;
      searchOrigin = null;
      if (target && document.contains(target)) {
        target.focus();
      } else {
        searchToggleBtn?.focus();
      }
    }


    function closeNav() {
    if (!navLayer || !isNavOpen) return;
    navLayer.classList.remove('show');
    navLayer.setAttribute('aria-hidden', 'true');

    navOpenBtn?.setAttribute('aria-expanded', 'false');
    navCloseBtn?.setAttribute('aria-expanded', 'false');
    if (navOpenBtn) navOpenBtn.style.display = 'flex';
    if (navCloseBtn) navCloseBtn.style.display = 'none';

    if (nav) {
      nav.classList.remove('nav_hide');
    }

    isNavOpen = false;

    if (isNavScrollLocked && !isSearchOpen) {
      htmlEl.style.overflow = '';
      bodyEl.style.overflow = '';
      htmlEl.style.paddingRight = savedHtmlPaddingRight;

      isNavScrollLocked = false;

      window.scrollTo({ top: savedScrollTop, behavior: 'auto' });
    }

    const target = navOrigin;
    navOrigin = null;
    if (target && document.contains(target)) {
      target.focus();
    }
  }



  function openSearch() {
      if (!searchLayer || isSearchOpen) return;
      closeNav();
      if (!isNavScrollLocked) {
        savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        savedHtmlPaddingRight = htmlEl.style.paddingRight;
        if (scrollbarWidth > 0) {
          htmlEl.style.paddingRight = scrollbarWidth + 'px';
        }

        htmlEl.style.overflow = 'hidden';
        bodyEl.style.overflow = 'hidden';
        isNavScrollLocked = true;
      }
      window.scrollTo({ top: 0, behavior: 'auto' });

      searchOrigin = document.activeElement;
      isSearchOpen = true;
      searchLayer.classList.add('show');
      searchLayer.setAttribute('aria-hidden', 'false');
      searchToggleBtn?.setAttribute('aria-expanded', 'true');
      searchBg?.classList.add('show');

      const firstField = searchLayer.querySelector(FOCUSABLE);
      (firstField || header).focus();
    }


    function openNav() {
    if (!navLayer || isNavOpen) return;
    closeSearch();
    navOrigin = document.activeElement;

    navLayer.classList.add('show');
    navLayer.setAttribute('aria-hidden', 'false');

    navOpenBtn?.setAttribute('aria-expanded', 'true');
    navCloseBtn?.setAttribute('aria-expanded', 'true');
    if (navOpenBtn) navOpenBtn.style.display = 'none';
    if (navCloseBtn) navCloseBtn.style.display = 'flex';

    if (nav) {
      nav.classList.add('nav_hide');
    }

    isNavOpen = true;

    if (!isNavScrollLocked) {
      savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      savedHtmlPaddingRight = htmlEl.style.paddingRight;

      if (scrollbarWidth > 0) {
        htmlEl.style.paddingRight = scrollbarWidth + 'px';
      }

      htmlEl.style.overflow = 'hidden';
      bodyEl.style.overflow = 'hidden';
      isNavScrollLocked = true;

      window.scrollTo({ top: savedScrollTop, behavior: 'auto' });
    }
  }


  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      if (isSearchOpen) {
        e.preventDefault();
        closeSearch();
        return;
      }
      if (isNavOpen) {
        e.preventDefault();
        closeNav();
        return;
      }
    }

    if (!isSearchOpen || e.key !== 'Tab') return;
    const { first, last } = getFocusEdges(header);
    if (!first || !last) return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onFocusIn = (e) => {
    const target = e.target;
    if (isSearchOpen && header && !header.contains(target)) {
      setFocusInsideHeader();
    }
    if (isNavOpen && header && !header.contains(target)) {
      closeNav();
    }
  };

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focusin', onFocusIn);

  searchToggleBtn?.addEventListener('click', function () {
    if (isSearchOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  searchCloseBtn?.addEventListener('click', closeSearch);
  searchBg?.addEventListener('click', closeSearch);

  navOpenBtn?.addEventListener('click', function () {
    if (isNavOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  navCloseBtn?.addEventListener('click', function () {
    closeNav();
  });
})();


// 모바일 전체메뉴 아코디언
(function () {
  const MOBILE_MAX_WIDTH = 1100;
  const navRoot = document.querySelector('.nav_all .all_inner > ul');
  if (!navRoot) return;

  const triggers = Array.from(navRoot.querySelectorAll(':scope > li > a'));
  let activeLink = null;

  const closeSubmenu = (link) => {
    if (!link) return;
    link.classList.remove('active');
    const submenu = link.nextElementSibling;
    if (submenu && submenu instanceof HTMLElement) {
      submenu.style.maxHeight = '0px';
    }
  };

  const openSubmenu = (link) => {
    const submenu = link.nextElementSibling;
    if (!submenu || !(submenu instanceof HTMLElement)) return;
    link.classList.add('active');
    submenu.style.maxHeight = `${submenu.scrollHeight + 30}px`;
  };

  const resetMenus = () => {
    activeLink = null;
    triggers.forEach((link) => {
      link.classList.remove('active');
      const submenu = link.nextElementSibling;
      if (submenu && submenu instanceof HTMLElement) {
        submenu.style.maxHeight = '';
      }
    });
  };

  const handleClick = (e) => {
    if (window.innerWidth > MOBILE_MAX_WIDTH) return;
    e.preventDefault();
    const link = e.currentTarget;
    if (!(link instanceof HTMLElement)) return;

    if (link === activeLink) {
      closeSubmenu(link);
      activeLink = null;
      return;
    }

    closeSubmenu(activeLink);
    openSubmenu(link);
    activeLink = link;
  };

  triggers.forEach((link) => {
    link.addEventListener('click', handleClick);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_MAX_WIDTH) {
      resetMenus();
    }
  });
})();



//alert 팝업
function alert_popup(type, options) {
  const modal = document.getElementById('alert_modal');
  if (!modal) return;

  const iconAlert = modal.querySelector('.icon_alert');
  const iconComp = modal.querySelector('.icon_comp');
  const textBox = modal.querySelector('.alert_text');
  const descEl = modal.querySelector('.alert_desc');

  const okBtn = modal.querySelector('[data-role="ok"]');
  const cancelBtn = modal.querySelector('[data-role="cancel"]');

  if (iconAlert) {
    iconAlert.style.display = (type === 'alert') ? 'block' : 'none';
  }
  if (iconComp) {
    iconComp.style.display = (type === 'comp') ? 'block' : 'none';
  }
  if (type !== 'alert' && type !== 'comp') {
    if (iconAlert) iconAlert.style.display = 'none';
    if (iconComp)  iconComp.style.display  = 'none';
  }

  const opts = (options && typeof options === 'object')
    ? options
    : { message: options };

  const desc   = opts.desc   || '알림';
  const message = opts.message || '';
  const buttons = opts.buttons || 'ok';

  const onOk     = typeof opts.onOk === 'function' ? opts.onOk : null;
  const onCancel = typeof opts.onCancel === 'function' ? opts.onCancel : null;

  if (descEl) {
    descEl.textContent = desc;

    if (opts.desc) {
      descEl.classList.remove('sound_only');
    } else {
      descEl.classList.add('sound_only');
    }
  }

  if (textBox) {
    if (Array.isArray(message)) {
      const html = message
        .map(line => String(line))
        .join('<br>');
      textBox.innerHTML = html;
    } else {
      textBox.textContent = String(message);
    }
  }

  if (okBtn) {
    okBtn.style.display = 'inline-flex';
  }
  if (cancelBtn) {
    cancelBtn.style.display = (buttons === 'okcancel') ? 'inline-flex' : 'none';
  }

  if (okBtn)     okBtn.onclick     = null;
  if (cancelBtn) cancelBtn.onclick = null;

  function closeAndCallback(cb) {
    if (typeof closeModal === 'function') {
      closeModal(modal);
    } else {
      modal.hidden = true;
    }
    if (cb) cb();
  }

  if (okBtn) {
    okBtn.onclick = function () {
      closeAndCallback(onOk);
    };
  }
  if (cancelBtn && buttons === 'okcancel') {
    cancelBtn.onclick = function () {
      closeAndCallback(onCancel);
    };
  }

  if (typeof openModal === 'function') {
    openModal(modal);
  } else {
    modal.hidden = false;
  }
}



// 헤더 통합검색·GNB 레이어
(function () {
  var headerEl = document.getElementById('rn_header') || document.getElementById('header');
  var searchLayer = document.getElementById('hd_search_layer');
  var searchBtn = document.getElementById('btn_hd_search_open');
  var searchCloseBtn = document.getElementById('btn_search_close');
  var subLayer = document.getElementById('hd_sub_menu_layer');
  var nav = document.getElementById('nav');
  var searchOpen = false;
  var gnbOpen = false;
  var htmlEl = document.documentElement;
  var bodyEl = document.body;
  var layoutEl = document.getElementById('layout');

  function getLayoutZoomScale() {
    if (!layoutEl) return 1;
    var scale = parseFloat(layoutEl.getAttribute('data-zoom-scale') || '1');
    return !isNaN(scale) && scale > 0 ? scale : 1;
  }

  function syncHeaderLayerMetrics() {
    if (!headerEl) return;

    var isExpandedDesktop =
      window.innerWidth > 1240 &&
      htmlEl.classList.contains('is-page-zoom-expand');

    if (!isExpandedDesktop) {
      htmlEl.style.removeProperty('--hd-layer-left');
      htmlEl.style.removeProperty('--hd-layer-top');
      htmlEl.style.removeProperty('--hd-layer-height');
      htmlEl.style.removeProperty('--hd-layer-width');
      return;
    }

    var bodyScrollLeft = document.body ? document.body.scrollLeft : 0;
    var bodyScrollTop = document.body ? document.body.scrollTop : 0;
    var scrollLeft = window.pageXOffset || htmlEl.scrollLeft || bodyScrollLeft || 0;
    var scrollY = window.pageYOffset || htmlEl.scrollTop || bodyScrollTop || 0;
    var scale = getLayoutZoomScale();
    var layerLeft = scrollLeft / scale;
    var layerTop = scrollY / scale + headerEl.offsetHeight;
    var viewportHeight = window.innerHeight || htmlEl.clientHeight || 0;
    var viewportWidth = window.innerWidth || htmlEl.clientWidth || 0;
    var layerHeight = Math.max(0, viewportHeight / scale - headerEl.offsetHeight);
    var layerWidth = Math.max(0, viewportWidth / scale);

    htmlEl.style.setProperty('--hd-layer-left', layerLeft + 'px');
    htmlEl.style.setProperty('--hd-layer-top', layerTop + 'px');
    htmlEl.style.setProperty('--hd-layer-height', layerHeight + 'px');
    htmlEl.style.setProperty('--hd-layer-width', layerWidth + 'px');
  }

  function syncHeaderHeight() {
    if (!headerEl) return;
    var layoutHeight = headerEl.offsetHeight;
    var visualHeight = headerEl.getBoundingClientRect().height || layoutHeight;

    htmlEl.style.setProperty('--header-layout-height', layoutHeight + 'px');
    htmlEl.style.setProperty('--header-height', visualHeight + 'px');
    syncHeaderLayerMetrics();
  }

  if (headerEl) {
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    window.addEventListener('pagezoomchange', syncHeaderHeight);
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncHeaderHeight).observe(headerEl);
    }
    window.addEventListener('load', syncHeaderHeight);
  }

  if (!searchLayer && !subLayer) return;

  if (nav) {
    nav.removeAttribute('role');
    nav.querySelectorAll('[role="none"]').forEach(function (item) {
      item.removeAttribute('role');
    });
  }

  var gnbLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('.gnb_menu_link')) : [];
  var gnbPanels = subLayer
    ? Array.prototype.slice.call(subLayer.querySelectorAll('[data-gnb-panel]'))
    : [];
  var gnbSubMenuInner = subLayer ? subLayer.querySelector('.hd_sub_menu_inner') : null;

  gnbLinks.forEach(function (link) {
    var href = (link.getAttribute('href') || '').replace(/\s/g, '');
    if (href === 'javascript:;' || href.indexOf('javascript:') === 0) {
      link.setAttribute('role', 'button');
    }
    link.setAttribute('aria-haspopup', 'true');
  });

  function gnbPointerStayZone(el) {
    if (!el || !(el instanceof Element)) return false;
    if (nav && nav.contains(el)) return true;
    if (gnbSubMenuInner && gnbSubMenuInner.contains(el)) return true;
    return false;
  }

  function gnbDesktop() {
    return window.matchMedia('(min-width: 1201px)').matches;
  }

  var gnbCloseTimer = null;
  var gnbAnimationToken = 0;
  var searchTriggerEl = null;
  var gnbTriggerEl = null;
  var savedScrollY = 0;
  var savedBodyPaddingRight = '';

  function lockScroll() {
    savedScrollY = window.pageYOffset || htmlEl.scrollTop || 0;
    var sw = window.innerWidth - htmlEl.clientWidth;
    savedBodyPaddingRight = bodyEl ? bodyEl.style.paddingRight || '' : '';
    if (bodyEl && sw > 0) bodyEl.style.paddingRight = sw + 'px';
    htmlEl.style.overflow = 'hidden';
    if (bodyEl) bodyEl.style.overflow = 'hidden';
  }

  function unlockScroll() {
    htmlEl.style.overflow = '';
    if (bodyEl) {
      bodyEl.style.overflow = '';
      bodyEl.style.paddingRight = savedBodyPaddingRight;
    }
    window.scrollTo(0, savedScrollY);
  }

  function onLayerFadeEnd(layer, cb) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      layer.removeEventListener('transitionend', onEnd);
      clearTimeout(tid);
      cb();
    }
    var tid = setTimeout(finish, 400);
    function onEnd(e) {
      if (e.target !== layer) return;
      if (e.propertyName !== 'opacity') return;
      finish();
    }
    layer.addEventListener('transitionend', onEnd);
  }

  function setGnbPanel(idx) {
    gnbPanels.forEach(function (panel) {
      var pIdx = parseInt(panel.getAttribute('data-gnb-panel'), 10);
      var on = pIdx === idx;
      panel.classList.toggle('is-active', on);
      panel.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
  }

  function focusGnbTrigger() {
    if (gnbTriggerEl && document.contains(gnbTriggerEl)) {
      gnbTriggerEl.focus();
    }
  }

  function killGnbInstant(restoreFocus) {
    clearTimeout(gnbCloseTimer);
    gnbCloseTimer = null;
    if (!subLayer) return;
    gnbAnimationToken += 1;
    subLayer.classList.remove('is-open', 'is-closing');
    subLayer.setAttribute('hidden', '');
    gnbOpen = false;
    gnbLinks.forEach(function (a) {
      a.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus) focusGnbTrigger();
  }

  function closeGnb(restoreFocus) {
    clearTimeout(gnbCloseTimer);
    gnbCloseTimer = null;
    if (!subLayer || !gnbOpen) return;
    var animationToken = ++gnbAnimationToken;
    gnbOpen = false;
    gnbLinks.forEach(function (a) {
      a.setAttribute('aria-expanded', 'false');
    });
    subLayer.classList.remove('is-open');
    subLayer.classList.add('is-closing');
    onLayerFadeEnd(subLayer, function () {
      if (animationToken !== gnbAnimationToken || gnbOpen || !subLayer.classList.contains('is-closing')) {
        return;
      }
      subLayer.classList.remove('is-closing');
      subLayer.setAttribute('hidden', '');
      if (restoreFocus) focusGnbTrigger();
    });
  }

  function scheduleCloseGnb() {
    clearTimeout(gnbCloseTimer);
    gnbCloseTimer = setTimeout(closeGnb, 180);
  }

  function openGnb(idx) {
    if (!subLayer || !gnbDesktop()) return;
    if (searchOpen) return;
    syncHeaderLayerMetrics();
    clearTimeout(gnbCloseTimer);
    gnbCloseTimer = null;
    setGnbPanel(idx);
    gnbTriggerEl = gnbLinks[idx] || null;
    gnbLinks.forEach(function (a, i) {
      a.setAttribute('aria-expanded', i === idx ? 'true' : 'false');
    });
    if (!gnbOpen) {
      var animationToken = ++gnbAnimationToken;
      gnbOpen = true;
      subLayer.removeAttribute('hidden');
      subLayer.classList.remove('is-closing');
      void subLayer.offsetWidth;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (animationToken !== gnbAnimationToken || !gnbOpen) return;
          if (!subLayer || subLayer.hasAttribute('hidden')) return;
          subLayer.classList.add('is-open');
        });
      });
    }
  }

  function closeSearch(options) {
    options = options || {};
    var immediate = !!options.immediate;
    var skipFocusRestore = !!options.skipFocusRestore;
    var onAfterClose =
      typeof options.onAfterClose === 'function' ? options.onAfterClose : null;
    if (!searchLayer || !searchOpen) return;
    searchOpen = false;
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
    searchLayer.classList.remove('is-open');
    if (immediate) {
      searchLayer.classList.remove('is-closing');
      searchLayer.setAttribute('hidden', '');
      unlockScroll();
      clearIsolatedLayerSiblings(searchLayer);
      var instantTarget = searchTriggerEl;
      searchTriggerEl = null;
      if (!skipFocusRestore) {
        if (instantTarget && document.contains(instantTarget)) instantTarget.focus();
        else if (searchBtn) searchBtn.focus();
      }
      if (onAfterClose) onAfterClose();
      return;
    }
    searchLayer.classList.add('is-closing');
    onLayerFadeEnd(searchLayer, function () {
      searchLayer.classList.remove('is-closing');
      searchLayer.setAttribute('hidden', '');
      unlockScroll();
      clearIsolatedLayerSiblings(searchLayer);
      var t = searchTriggerEl;
      searchTriggerEl = null;
      if (!skipFocusRestore) {
        if (t && document.contains(t)) t.focus();
        else if (searchBtn) searchBtn.focus();
      }
      if (onAfterClose) onAfterClose();
    });
  }

  function openSearch() {
    if (!searchLayer || searchOpen) return;
    var mmBtnEarly = document.getElementById('btn_hd_mobile_menu');
    var mmLayerEarly = document.getElementById('hd_mobile_menu_layer');
    if (mmBtnEarly && mmLayerEarly && mmLayerEarly.classList.contains('is-open')) {
      mmBtnEarly.click();
    }
    killGnbInstant();
    syncHeaderLayerMetrics();
    lockScroll();
    window.scrollTo({ top: 0, behavior: 'auto' });
    searchOpen = true;
    searchTriggerEl = document.activeElement;
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    searchLayer.removeAttribute('hidden');
    searchLayer.classList.remove('is-closing');
    isolateLayerSiblings(searchLayer, {
      excludedElements: [headerEl],
    });
    void searchLayer.offsetWidth;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        searchLayer.classList.add('is-open');
        ensureHeaderFavoritKeywordSwiper();
        window.setTimeout(function () {
          ensureHeaderFavoritKeywordSwiper();
        }, 400);
      });
    });
    var input = document.getElementById('hd_search_input');
    window.setTimeout(function () {
      if (input) input.focus();
    }, 50);
  }

  function searchTabTrap(e) {
    if (!searchOpen || !searchLayer) return;
    trapFocusWithin(e, searchLayer);
  }

  function gnbArrowNav(e, link) {
    if (!gnbDesktop() || !nav) return;
    var i = gnbLinks.indexOf(link);
    if (i < 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      var next = gnbLinks[(i + 1) % gnbLinks.length];
      if (next) next.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      var prev = gnbLinks[(i - 1 + gnbLinks.length) % gnbLinks.length];
      if (prev) prev.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      var idx = parseInt(link.getAttribute('data-gnb-index'), 10);
      if (isNaN(idx)) return;
      openGnb(idx);
      var panel = document.getElementById('gnb_panel_' + idx);
      if (!panel) return;
      var first = panel.querySelector(FOCUSABLE);
      if (first) first.focus();
    }
  }

  if (searchBtn && searchLayer) {
    searchBtn.addEventListener('click', function () {
      if (searchOpen) closeSearch();
      else openSearch();
    });
  }
  if (searchCloseBtn && searchLayer) {
    searchCloseBtn.addEventListener('click', closeSearch);
  }
  if (searchLayer) {
    searchLayer.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('hd_layer_bg')) closeSearch();
    });
  }

  if (subLayer && nav) {
    nav.querySelectorAll('li').forEach(function (li, index) {
      li.addEventListener('mouseenter', function () {
        if (!gnbDesktop()) return;
        if (searchOpen) {
          closeSearch({
            immediate: true,
            skipFocusRestore: true,
          });
        }
        openGnb(index);
      });
    });
    nav.addEventListener('mouseenter', function () {
      if (!gnbDesktop()) return;
      clearTimeout(gnbCloseTimer);
      gnbCloseTimer = null;
    });
    nav.addEventListener('mouseleave', function (e) {
      if (!gnbDesktop()) return;
      if (gnbPointerStayZone(e.relatedTarget)) return;
      scheduleCloseGnb();
    });
    if (gnbSubMenuInner) {
      gnbSubMenuInner.addEventListener('mouseenter', function () {
        if (!gnbDesktop()) return;
        clearTimeout(gnbCloseTimer);
        gnbCloseTimer = null;
      });
      gnbSubMenuInner.addEventListener('mouseleave', function (e) {
        if (!gnbDesktop()) return;
        if (gnbPointerStayZone(e.relatedTarget)) return;
        scheduleCloseGnb();
      });
    }
    subLayer.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('hd_layer_bg')) closeGnb(true);
    });
  }

  gnbLinks.forEach(function (link) {
    link.addEventListener('focus', function () {
      if (!gnbDesktop()) return;
      if (searchOpen) return;
      var idx = parseInt(link.getAttribute('data-gnb-index'), 10);
      if (!isNaN(idx)) openGnb(idx);
    });
    link.addEventListener('keydown', function (e) {
      gnbArrowNav(e, link);
    });
  });

  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t || !(t instanceof Node)) return;
    if (searchOpen && searchLayer && !searchLayer.contains(t)) {
      if (headerEl && headerEl.contains(t)) return;
      requestAnimationFrame(function () {
        if (!searchOpen || !searchLayer) return;
        var edges = getFocusEdges(searchLayer);
        if (edges.first) edges.first.focus();
      });
      return;
    }
    if (!gnbDesktop() || !subLayer || !gnbOpen || searchOpen) return;
    if (gnbPointerStayZone(t)) return;
    closeGnb(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var mmLayerEsc = document.getElementById('hd_mobile_menu_layer');
      var mmBtnEsc = document.getElementById('btn_hd_mobile_menu');
      if (mmLayerEsc && mmBtnEsc && mmLayerEsc.classList.contains('is-open')) {
        e.preventDefault();
        mmBtnEsc.click();
        return;
      }
      if (searchOpen) {
        e.preventDefault();
        closeSearch();
        return;
      }
      if (gnbOpen) {
        e.preventDefault();
        closeGnb(true);
      }
    }
    searchTabTrap(e);
  });

  window.addEventListener('resize', function () {
    if (!gnbDesktop() && gnbOpen) {
      closeGnb(
        !!(subLayer && document.activeElement && subLayer.contains(document.activeElement))
      );
    }
  });
})();


// 모바일 전체메뉴 레이어 + 좌측 탭 + 2depth 아코디언
(function () {
  var mq = window.matchMedia('(max-width: 1240px)');
  var layer = document.getElementById('hd_mobile_menu_layer');
  var toggleBtn = document.getElementById('btn_hd_mobile_menu');
  var headerEl = document.getElementById('rn_header') || document.getElementById('header');
  if (!layer || !toggleBtn) return;

  var triggerEl = null;
  var htmlEl = document.documentElement;
  var savedScrollY = 0;
  var savedPaddingRight = '';

  function lockMmScroll() {
    savedScrollY = window.pageYOffset || htmlEl.scrollTop || 0;
    var sw = window.innerWidth - htmlEl.clientWidth;
    savedPaddingRight = htmlEl.style.paddingRight || '';
    if (sw > 0) htmlEl.style.paddingRight = sw + 'px';
    htmlEl.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockMmScroll() {
    htmlEl.style.overflow = '';
    document.body.style.overflow = '';
    htmlEl.style.paddingRight = savedPaddingRight;
    window.scrollTo(0, savedScrollY);
  }

  function onMmLayerFadeEnd(layerEl, cb) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      layerEl.removeEventListener('transitionend', onEnd);
      clearTimeout(tid);
      cb();
    }
    var tid = setTimeout(finish, 400);
    function onEnd(e) {
      if (e.target !== layerEl) return;
      if (e.propertyName !== 'opacity') return;
      finish();
    }
    layerEl.addEventListener('transitionend', onEnd);
  }

  function closeSearchIfOpen() {
    var sl = document.getElementById('hd_search_layer');
    var sc = document.getElementById('btn_search_close');
    if (sl && sc && sl.classList.contains('is-open')) sc.click();
  }

  function setToggleUi(open) {
    toggleBtn.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = toggleBtn.querySelector('.hd_btn_allmenu__label');
    if (label) label.textContent = open ? '전체메뉴 닫기' : '전체메뉴 열기';
  }

  function openMmMenu() {
    if (!mq.matches) return;
    if (layer.classList.contains('is-open')) return;
    closeSearchIfOpen();
    setToggleUi(true);
    triggerEl = document.activeElement;
    layer.removeAttribute('hidden');
    layer.classList.remove('is-closing');
    isolateLayerSiblings(layer, {
      excludedElements: [headerEl],
    });
    void layer.offsetWidth;
    lockMmScroll();
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        layer.classList.add('is-open');
        focusFirstInContainer(
          layer,
          '.mm_gnb_tabs [role="tab"][aria-selected="true"]',
          toggleBtn
        );
      });
    });
  }

  function closeMmMenu() {
    if (!layer.classList.contains('is-open')) return;
    setToggleUi(false);
    layer.classList.remove('is-open');
    layer.classList.add('is-closing');
    onMmLayerFadeEnd(layer, function () {
      layer.classList.remove('is-closing');
      layer.setAttribute('hidden', '');
      var handedOffToAnotherLayer =
        isolatedLayerOwner && isolatedLayerOwner !== layer;
      if (!handedOffToAnotherLayer) {
        unlockMmScroll();
        clearIsolatedLayerSiblings(layer);
      }
      var t = triggerEl;
      triggerEl = null;
      if (handedOffToAnotherLayer) return;
      if (t && document.contains(t)) t.focus();
      else toggleBtn.focus();
    });
  }

  toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!mq.matches) return;
    if (layer.classList.contains('is-open')) closeMmMenu();
    else openMmMenu();
  });

  var bg = layer.querySelector('.hd_layer_bg');
  if (bg) {
    bg.addEventListener('click', closeMmMenu);
  }

  layer.addEventListener('keydown', function (e) {
    if (!layer.classList.contains('is-open')) return;
    trapFocusWithin(e, layer);
  });

  document.addEventListener('focusin', function (e) {
    if (!layer.classList.contains('is-open')) return;
    if (layer.contains(e.target)) return;
    if (headerEl && headerEl.contains(e.target)) return;
    requestAnimationFrame(function () {
      if (!layer.classList.contains('is-open')) return;
      focusFirstInContainer(
        layer,
        '.mm_gnb_tabs [role="tab"][aria-selected="true"]',
        toggleBtn
      );
    });
  });

  window.addEventListener('resize', function () {
    if (!mq.matches && layer.classList.contains('is-open')) {
      setToggleUi(false);
      layer.classList.remove('is-open', 'is-closing');
      layer.setAttribute('hidden', '');
      unlockMmScroll();
      clearIsolatedLayerSiblings(layer);
      toggleBtn.focus();
    }
  });

  var mmNavRoot = layer.querySelector('.mm_nav');

  var tablist = layer.querySelector('.mm_gnb_tabs');
  if (tablist && mmNavRoot) {
    tablist.setAttribute('aria-orientation', 'vertical');
    var tabs = tablist.querySelectorAll('[data-mm-gnb-index]');
    var panels = layer.querySelectorAll('[data-mm-gnb-panel]');
    function closeAllMmAccordions() {
      if (!mmNavRoot) return;
      mmNavRoot.querySelectorAll('.sub_menu_box .ul_wrap > ul > li.has_child > a, .sub_menu_box .ul_wrap > ul > li.has_child > button').forEach(function (trigger) {
        if (!trigger.classList.contains('open')) return;
        var li = trigger.closest('li');
        var subUl = li ? li.querySelector(':scope > ul') : null;
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        if (subUl) {
          subUl.setAttribute('aria-hidden', 'true');
          subUl.querySelectorAll('a').forEach(function (innerA) {
            innerA.setAttribute('tabindex', '-1');
          });
        }
      });
    }

    function mmSelectPanel(idx) {
      tabs.forEach(function (a) {
        var i = parseInt(a.getAttribute('data-mm-gnb-index'), 10);
        var on = i === idx;
        a.classList.toggle('is-active', on);
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        a.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (p) {
        var pi = parseInt(p.getAttribute('data-mm-gnb-panel'), 10);
        var on = pi === idx;
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
      closeAllMmAccordions();
    }
    function focusAndSelectMmTab(nextIdx) {
      mmSelectPanel(nextIdx);
      tabs.forEach(function (tab) {
        var idx = parseInt(tab.getAttribute('data-mm-gnb-index'), 10);
        if (idx === nextIdx) tab.focus();
      });
    }
    tabs.forEach(function (a) {
      var idx = parseInt(a.getAttribute('data-mm-gnb-index'), 10);
      var panel = !isNaN(idx)
        ? layer.querySelector('#mm_gnb_panel_' + idx)
        : null;
      if (panel) {
        a.setAttribute('aria-controls', panel.id);
      }
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (!isNaN(idx)) mmSelectPanel(idx);
      });
      a.addEventListener('keydown', function (e) {
        if (isNaN(idx)) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          focusAndSelectMmTab((idx + 1) % tabs.length);
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          focusAndSelectMmTab((idx - 1 + tabs.length) % tabs.length);
          return;
        }
        if (e.key === 'Home') {
          e.preventDefault();
          focusAndSelectMmTab(0);
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          focusAndSelectMmTab(tabs.length - 1);
          return;
        }
        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
          e.preventDefault();
          mmSelectPanel(idx);
        }
      });
    });
  }

  if (mmNavRoot) {
    var subIdSeq = 0;
    function nextMmSubId() {
      var id;
      do {
        subIdSeq += 1;
        id = 'mm_nav_sub_' + subIdSeq;
      } while (document.getElementById(id));
      return id;
    }
    mmNavRoot.querySelectorAll('.sub_menu_box .ul_wrap > ul > li').forEach(function (li) {
      var a = li.querySelector(':scope > a, :scope > button');
      var subUl = li.querySelector(':scope > ul');
      if (!a || !subUl) return;
      li.classList.add('has_child');
      if (!subUl.id) subUl.id = nextMmSubId();
      a.setAttribute('role', 'button');
      a.setAttribute('aria-controls', subUl.id);
      var expanded = false;
      function applyMmAccordion(on) {
        a.classList.toggle('open', on);
        a.setAttribute('aria-expanded', on ? 'true' : 'false');
        subUl.setAttribute('aria-hidden', on ? 'false' : 'true');
        subUl.querySelectorAll('a').forEach(function (innerA) {
          if (on) innerA.removeAttribute('tabindex');
          else innerA.setAttribute('tabindex', '-1');
        });
      }
      applyMmAccordion(expanded);
      a.addEventListener('click', function (e) {
        var href = (a.getAttribute('href') || '').replace(/\s/g, '');
        if (href === 'javascript:;' || href.indexOf('javascript:') === 0) {
          e.preventDefault();
        }
        applyMmAccordion(!a.classList.contains('open'));
      });
      a.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();
        applyMmAccordion(!a.classList.contains('open'));
      });
    });
  }
})();


function favoritKeywordEdgeFade(swiper) {
  if (!swiper || !swiper.el || typeof jQuery === 'undefined') return;
  var $cont = jQuery(swiper.el);
  var minT = swiper.minTranslate();
  var maxT = swiper.maxTranslate();
  var t = swiper.translate;
  var eps = 2;
  $cont.toggleClass('start', t >= minT - eps);
  $cont.toggleClass('end', t <= maxT + eps);
}

/** 인기 검색어 가로 슬라이드 (메인 .main_content / 헤더 #hd_search_layer 공통) */
function favoritKeywordSwiperCreate(rootSelector) {
  if (typeof jQuery === 'undefined' || typeof Swiper === 'undefined') return null;
  var $ = jQuery;
  var containerSel = rootSelector + ' .favorit_keyword .swiper-container';
  var $c = $(containerSel);
  if (!$c.length) return null;
  var $root = $c.closest('.favorit_keyword');
  var el = $c[0];
  if (el.swiper) return el.swiper;
  var prevBtn = $root.find('.slide_control_prev').get(0);
  var nextBtn = $root.find('.slide_control_next').get(0);
  if (prevBtn) prevBtn.setAttribute('aria-label', '인기 검색어 이전');
  if (nextBtn) nextBtn.setAttribute('aria-label', '인기 검색어 다음');

  return new Swiper(containerSel, {
    slidesPerView: 'auto',
    spaceBetween: 8,
    freeMode: true,
    grabCursor: true,
    simulateTouch: true,
    resistanceRatio: 0,
    watchOverflow: true,
    navigation: {
      prevEl: rootSelector + ' .favorit_keyword .slide_control_prev',
      nextEl: rootSelector + ' .favorit_keyword .slide_control_next',
    },
    on: {
      afterInit: function (swiper) {
        swiper.update();
        favoritKeywordEdgeFade(swiper);
      },
      transitionEnd: function (swiper) {
        favoritKeywordEdgeFade(swiper);
      },
      setTranslate: function (swiper) {
        favoritKeywordEdgeFade(swiper);
      },
      touchEnd: function (swiper) {
        favoritKeywordEdgeFade(swiper);
      },
    },
  });
}

function favoritKeywordSwiperInit() {
  favoritKeywordSwiperCreate('.main_content');
}

var headerFavoritKeywordSwiper = null;

function ensureHeaderFavoritKeywordSwiper() {
  if (typeof jQuery === 'undefined' || typeof Swiper === 'undefined') return;
  if (!document.getElementById('hd_search_layer')) return;
  if (headerFavoritKeywordSwiper) {
    headerFavoritKeywordSwiper.update();
    favoritKeywordEdgeFade(headerFavoritKeywordSwiper);
    return;
  }
  headerFavoritKeywordSwiper = favoritKeywordSwiperCreate('#hd_search_layer');
}

/** 푸터 관련사이트(PC) 슬라이드 */
function ftFamilySwiperInit() {
  if (typeof jQuery === 'undefined' || typeof Swiper === 'undefined') return;
  var $ = jQuery;
  var containerSel = '#rn_footer .ft_top .ft_family .swiper-container';
  var $c = $(containerSel);
  if (!$c.length) return;

  var $root = $c.closest('.ft_family');
  var swiper = new Swiper(containerSel, {
    slidesPerView: 'auto',
    spaceBetween: 10,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      prevEl: '#rn_footer .ft_top .ft_family .slide_control_prev',
      nextEl: '#rn_footer .ft_top .ft_family .slide_control_next',
    },
  });

  var $pause = $root.find('.slide_control_pause');
  var $play = $root.find('.slide_control_play');
  var prevBtn = $root.find('.slide_control_prev').get(0);
  var nextBtn = $root.find('.slide_control_next').get(0);
  var pauseBtn = $pause.get(0);
  var playBtn = $play.get(0);
  if (prevBtn) prevBtn.setAttribute('aria-label', '관련 사이트 이전');
  if (nextBtn) nextBtn.setAttribute('aria-label', '관련 사이트 다음');
  if (pauseBtn) pauseBtn.setAttribute('aria-label', '관련 사이트 자동재생 일시정지');
  if (playBtn) playBtn.setAttribute('aria-label', '관련 사이트 자동재생 시작');
  $play.hide();

  $pause.on('click', function () {
    if (swiper.autoplay) swiper.autoplay.stop();
    $pause.hide();
    $play.show();
  });
  $play.on('click', function () {
    if (swiper.autoplay) swiper.autoplay.start();
    $play.hide();
    $pause.show();
  });
}

(function () {
  function isPlaceholderHref(href) {
    var normalized = (href || '').replace(/\s/g, '');
    return normalized === 'javascript:;' || normalized.indexOf('javascript:') === 0;
  }

  function getMainHref() {
    return /\/html\/main\//.test(window.location.pathname)
      ? 'main.html'
      : '../main/main.html';
  }

  function bind() {
    var mainHref = getMainHref();
    var logoLink = document.querySelector('#header_h1 a');
    if (logoLink && isPlaceholderHref(logoLink.getAttribute('href'))) {
      logoLink.setAttribute('href', mainHref);
    }

    document.querySelectorAll('.page_location .home').forEach(function (link) {
      if (isPlaceholderHref(link.getAttribute('href'))) {
        link.setAttribute('href', mainHref);
      }
    });

    var sitemapContent = document.querySelector('.sitemap_content');
    if (sitemapContent) {
      sitemapContent.querySelectorAll('a[href]').forEach(function (link) {
        if (isPlaceholderHref(link.getAttribute('href'))) {
          link.setAttribute('href', '../sub/sub.html');
        }
      });
    }

    var mobileSearchCloseBtn = document.getElementById('btn_search_close');
    if (mobileSearchCloseBtn && !mobileSearchCloseBtn.getAttribute('aria-label')) {
      mobileSearchCloseBtn.setAttribute('aria-label', '통합검색 닫기');
    }

    var mobileFamilySubmit = document.querySelector('.ft_family.family_select .select_submit button');
    if (mobileFamilySubmit && !mobileFamilySubmit.getAttribute('aria-label')) {
      mobileFamilySubmit.setAttribute('aria-label', '관련 사이트 이동');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();

/** 푸터 관련사이트(모바일): 선택 후 이동 — 새 창 */
(function () {
  var footer = document.getElementById('rn_footer');
  if (!footer) return;
  footer.addEventListener('click', function (e) {
    var btn = e.target.closest('.ft_family.family_select .select_submit button');
    if (!btn || !footer.contains(btn)) return;
    var wrap = btn.closest('.ft_family.family_select');
    var sel = wrap && wrap.querySelector('select');
    if (!sel) return;
    var url = (sel.value || '').trim();
    if (!url || !/^https?:\/\//i.test(url)) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();

if (typeof jQuery !== 'undefined') {
  jQuery(function () {
    favoritKeywordSwiperInit();
    ftFamilySwiperInit();
  });
}

(function () {
  var favoritKeywordResizeTimer;
  function favoritKeywordSwipersUpdate() {
    document.querySelectorAll('.favorit_keyword .swiper-container').forEach(function (el) {
      if (el.swiper) {
        el.swiper.update();
        favoritKeywordEdgeFade(el.swiper);
      }
    });
  }
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(favoritKeywordResizeTimer);
      favoritKeywordResizeTimer = setTimeout(favoritKeywordSwipersUpdate, 150);
    },
    { passive: true }
  );
})();

// 상단으로
(function () {
  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
  function bind() {
    var el = document.getElementById('ToTop');
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


//datepicker
document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('.datepicker').forEach(function(pickerField) {
		var picker = new Pikaday({
			field: pickerField,
			onSelect: function() {
				var date = picker.getDate();
				var year = date.getFullYear();
				var month = (date.getMonth() + 1).toString().padStart(2, '0');
				var day = date.getDate().toString().padStart(2, '0');
				var formattedDate = `${year}-${month}-${day}`;
				pickerField.value = formattedDate;
			},
			showMonthAfterYear : true
			//firstDay: 1,  // 1-> 시작날짜 월요일 0-> 일요일
			//minDate: new Date(), //선택 최소날짜
			//maxDate: new Date(2020, 11, 31), //선택 최대날짜
			//yearRange: [2000, 2020] //표시년도
		});
	});
});
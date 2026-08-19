/*!
* Start Bootstrap - Stylish Portfolio v6.0.5 (https://startbootstrap.com/theme/stylish-portfolio)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-stylish-portfolio/blob/master/LICENSE)
*/
window.addEventListener('DOMContentLoaded', event => {

    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    let scrollToTopVisible = false;
    const menuToggle = document.body.querySelector('.menu-toggle');

    if (menuToggle && sidebarWrapper) {
        menuToggle.addEventListener('click', event => {
            event.preventDefault();
            sidebarWrapper.classList.toggle('active');
            _toggleMenuIcon();
            menuToggle.classList.toggle('active');
        });
    }

    var scrollTriggerList = [].slice.call(document.querySelectorAll('#sidebar-wrapper .js-scroll-trigger'));
    scrollTriggerList.map(scrollTrigger => {
        scrollTrigger.addEventListener('click', () => {
            if (sidebarWrapper) {
                sidebarWrapper.classList.remove('active');
            }
            if (menuToggle) {
                menuToggle.classList.remove('active');
            }
            _toggleMenuIcon();
        });
    });

    let isScrolling = false;
    const sidebarNav = document.querySelector('.sidebar-nav');

    if (sidebarNav) {
        sidebarNav.addEventListener('scroll', () => {
            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        });
    }

    let isZoomPanelOpen = false;

    function toggleZoomPanelState(forceOpen) {
        isZoomPanelOpen = typeof forceOpen === 'boolean' ? forceOpen : !isZoomPanelOpen;
        if (!mobileZoomPanel || !mobileZoomHandle) return;

        mobileZoomPanel.classList.toggle('is-open', isZoomPanelOpen);
        mobileZoomPanel.setAttribute('aria-hidden', String(!isZoomPanelOpen));
        mobileZoomHandle.setAttribute('aria-expanded', String(isZoomPanelOpen));
    }

    function openMobileZoomPanel() {
        toggleZoomPanelState(true);
    }

    function closeMobileZoomPanel() {
        toggleZoomPanelState(false);
    }

    document.addEventListener('click', event => {
        const target = event.target;
        const isClickInsideSidebar = sidebarWrapper ? sidebarWrapper.contains(target) : false;
        const isClickOnMenuToggle = menuToggle ? menuToggle.contains(target) : false;
        const isMenuOpen = sidebarWrapper ? sidebarWrapper.classList.contains('active') : false;

        if (isMenuOpen && !isClickInsideSidebar && !isClickOnMenuToggle && !isScrolling) {
            sidebarWrapper.classList.remove('active');
            menuToggle.classList.remove('active');
            _toggleMenuIcon();
        }

        const mobileZoomHandle = document.getElementById('mobileZoomHandle');
        const mobileZoomPanel = document.getElementById('mobileZoomPanel');
        const isClickInsideZoomPanel = mobileZoomPanel ? mobileZoomPanel.contains(target) : false;
        const isClickOnZoomHandle = mobileZoomHandle ? mobileZoomHandle.contains(target) : false;

        if (mobileZoomPanel && mobileZoomHandle && !isClickInsideZoomPanel && !isClickOnZoomHandle && isZoomPanelOpen) {
            closeMobileZoomPanel();
        }
    });

    function _toggleMenuIcon() {
        const menuToggleBars = document.body.querySelector('.menu-toggle > .fa-bars');
        const menuToggleTimes = document.body.querySelector('.menu-toggle > .fa-xmark');
        if (menuToggleBars) {
            menuToggleBars.classList.remove('fa-bars');
            menuToggleBars.classList.add('fa-xmark');
        }
        if (menuToggleTimes) {
            menuToggleTimes.classList.remove('fa-xmark');
            menuToggleTimes.classList.add('fa-bars');
        }
    }

    document.addEventListener('scroll', () => {
        const scrollToTop = document.body.querySelector('.scroll-to-top');
        if (!scrollToTop) return;

        if (document.documentElement.scrollTop > 100) {
            if (!scrollToTopVisible) {
                fadeIn(scrollToTop);
                scrollToTopVisible = true;
            }
        } else if (scrollToTopVisible) {
            fadeOut(scrollToTop);
            scrollToTopVisible = false;
        }
    });

    const ZOOM_MIN = 70;
    const ZOOM_MAX = 180;
    const ZOOM_STEP = 10;
    const STORAGE_KEY = 'adiba_zoom_level';
    const LEGACY_STORAGE_KEY = 'adiba_zoom';
    const zoomButtons = document.querySelectorAll('[data-zoom-action]');
    const zoomPercentEls = document.querySelectorAll('[data-zoom-percent]');
    const mobileZoomHandle = document.getElementById('mobileZoomHandle');
    const mobileZoomPanel = document.getElementById('mobileZoomPanel');
    function getTextTargets() {
        return Array.from(document.querySelectorAll('.font_isi, .font_label, .font_latin, .font_terjemahan'));
    }

    function safeGetStoredZoom() {
        try {
            const storedValue = window.localStorage.getItem(STORAGE_KEY);
            const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
            const rawValue = storedValue !== null ? storedValue : legacyValue;
            const numeric = Number.parseInt(rawValue, 10);
            if (Number.isFinite(numeric) && numeric >= ZOOM_MIN && numeric <= ZOOM_MAX) {
                return numeric;
            }
        } catch (error) {
            return 100;
        }
        return 100;
    }

    function getBaseFontSize(element) {
        if (!element) return 16;
        const saved = Number.parseFloat(element.dataset.baseFontSize || '');
        if (Number.isFinite(saved)) {
            return saved;
        }

        const computed = Number.parseFloat(window.getComputedStyle(element).fontSize);
        if (Number.isFinite(computed)) {
            element.dataset.baseFontSize = String(computed);
            return computed;
        }

        return 16;
    }

    function initializeBaseFontSizes() {
        getTextTargets().forEach((element) => {
            if (!element) return;
            getBaseFontSize(element);
        });
    }

    let zoomLevel = safeGetStoredZoom();
    initializeBaseFontSizes();

    function applyZoom() {
        getTextTargets().forEach((element) => {
            if (!element) return;

            const baseFontSize = getBaseFontSize(element);
            const newFontSize = baseFontSize * (zoomLevel / 100);
            element.style.fontSize = `${newFontSize}px`;
        });

        zoomPercentEls.forEach(element => {
            if (element) {
                element.textContent = zoomLevel + '%';
            }
        });

        document.documentElement.style.setProperty('--adiba-zoom-scale', (zoomLevel / 100).toFixed(2));

        try {
            window.localStorage.setItem(STORAGE_KEY, String(zoomLevel));
            window.localStorage.setItem(LEGACY_STORAGE_KEY, String(zoomLevel));
        } catch (error) {
            // Ignore storage limitations.
        }
    }

    function setZoomLevel(nextZoom) {
        const clampedZoom = Math.min(Math.max(nextZoom, ZOOM_MIN), ZOOM_MAX);
        zoomLevel = clampedZoom;
        applyZoom();
    }

    function handleZoomChange(action) {
        if (action === 'in') {
            setZoomLevel(Math.min(zoomLevel + ZOOM_STEP, ZOOM_MAX));
            return;
        }

        if (action === 'out') {
            setZoomLevel(Math.max(zoomLevel - ZOOM_STEP, ZOOM_MIN));
            return;
        }

        if (action === 'reset') {
            setZoomLevel(100);
        }
    }

    zoomButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.zoomAction;
            if (!action) return;
            handleZoomChange(action);
        });
    });

    if (mobileZoomHandle) {
        mobileZoomHandle.addEventListener('click', () => {
            toggleZoomPanelState();
        });

        mobileZoomHandle.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                mobileZoomHandle.click();
            }
        });
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let lastPinchDistance = 0;

    document.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            return;
        }

        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            lastPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        }
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            const diff = currentDistance - lastPinchDistance;

            if (Math.abs(diff) > 12) {
                event.preventDefault();
                if (diff > 0) {
                    handleZoomChange('in');
                } else {
                    handleZoomChange('out');
                }
                lastPinchDistance = currentDistance;
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', (event) => {
        if (event.changedTouches.length === 0) return;

        if (window.innerWidth > 767) return;

        const endTouch = event.changedTouches[0];
        const deltaX = endTouch.clientX - touchStartX;
        const deltaY = endTouch.clientY - touchStartY;

        if (Math.abs(deltaY) > 40) return;

        if (touchStartX < 60 && deltaX > 30) {
            openMobileZoomPanel();
        } else if (touchStartX < 60 && deltaX < -30) {
            closeMobileZoomPanel();
        }
    }, { passive: true });

    document.addEventListener('wheel', (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.deltaY < 0) {
                handleZoomChange('in');
            } else {
                handleZoomChange('out');
            }
        }
    }, { passive: false });

    document.addEventListener('keydown', (event) => {
        const tagName = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : '';
        const isTypingTarget = ['input', 'textarea', 'select'].includes(tagName);

        if (isTypingTarget) return;

        if (event.key === '+' || event.key === '=' || event.key === 'Add') {
            event.preventDefault();
            handleZoomChange('in');
        } else if (event.key === '-' || event.key === 'Subtract') {
            event.preventDefault();
            handleZoomChange('out');
        } else if (event.key === '0') {
            event.preventDefault();
            handleZoomChange('reset');
        }
    });

    setZoomLevel(zoomLevel);
    toggleZoomPanelState(false);
});

function fadeOut(el) {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || "block";
    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

/*!
* Start Bootstrap - Stylish Portfolio v6.0.5 (https://startbootstrap.com/theme/stylish-portfolio)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-stylish-portfolio/blob/master/LICENSE)
*/
window.addEventListener('DOMContentLoaded', event => {

    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    let scrollToTopVisible = false;
    // Closes the sidebar menu
    const menuToggle = document.body.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', event => {
        event.preventDefault();
        sidebarWrapper.classList.toggle('active');
        _toggleMenuIcon();
        menuToggle.classList.toggle('active');
    })

    // Closes responsive menu when a scroll trigger link is clicked
    var scrollTriggerList = [].slice.call(document.querySelectorAll('#sidebar-wrapper .js-scroll-trigger'));
    scrollTriggerList.map(scrollTrigger => {
        scrollTrigger.addEventListener('click', () => {
            sidebarWrapper.classList.remove('active');
            menuToggle.classList.remove('active');
            _toggleMenuIcon();
        })
    });

    // Closes menu when clicking outside of it
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

    document.addEventListener('click', event => {
        const isClickInsideSidebar = sidebarWrapper.contains(event.target);
        const isClickOnMenuToggle = menuToggle.contains(event.target);
        const isMenuOpen = sidebarWrapper.classList.contains('active');

        if (isMenuOpen && !isClickInsideSidebar && !isClickOnMenuToggle && !isScrolling) {
            sidebarWrapper.classList.remove('active');
            menuToggle.classList.remove('active');
            _toggleMenuIcon();
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

    // Scroll to top button appear
    document.addEventListener('scroll', () => {
        const scrollToTop = document.body.querySelector('.scroll-to-top');
        if (document.documentElement.scrollTop > 100) {
            if (!scrollToTopVisible) {
                fadeIn(scrollToTop);
                scrollToTopVisible = true;
            }
        } else {
            if (scrollToTopVisible) {
                fadeOut(scrollToTop);
                scrollToTopVisible = false;
            }
        }
    })

    // Pinch to zoom gesture
    let lastDistance = 0;
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            lastDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    });

    document.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) {
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            const diff = currentDistance - lastDistance;

            if (Math.abs(diff) > 10) {
                if (diff > 0) {
                    // Zoom in
                    _handleZoomIn();
                } else {
                    // Zoom out
                    _handleZoomOut();
                }
                lastDistance = currentDistance;
            }
        }
    });

    function _handleZoomIn() {
        const zoomInBtn = document.getElementById('zoomIn');
        if (zoomInBtn) {
            zoomInBtn.click();
        }
    }

    function _handleZoomOut() {
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomOutBtn) {
            zoomOutBtn.click();
        }
    }

    // Wheel zoom support for desktop (Ctrl + Scroll)
    document.addEventListener('wheel', (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();

            if (event.deltaY < 0) {
                // Scroll up = zoom in
                _handleZoomIn();
            } else {
                // Scroll down = zoom out
                _handleZoomOut();
            }
        }
    }, { passive: false });

    // Gesture support for trackpad (Safari and Chrome on macOS)
    let lastGestureScale = 1;
    document.addEventListener('gesturestart', (event) => {
        lastGestureScale = event.scale;
    });

    document.addEventListener('gesturechange', (event) => {
        event.preventDefault();

        if (event.scale > lastGestureScale) {
            // Zoom in (fingers moving apart)
            _handleZoomIn();
        } else if (event.scale < lastGestureScale) {
            // Zoom out (fingers moving together)
            _handleZoomOut();
        }
        lastGestureScale = event.scale;
    });
})

function fadeOut(el) {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
};

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
};

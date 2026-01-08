/* Global function to initialize navbar logic.
   This allows re-initialization after page transitions. */
window.initNavbar = function () {
    // 1. Cleanup existing listeners to prevent duplicates
    if (window.navbarScrollHandler) {
        window.removeEventListener('scroll', window.navbarScrollHandler);
    }

    // 2. Select Elements
    const navbar = document.querySelector('.navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Only proceed if navbar exists in the new DOM
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    // 3. Define Scroll Handler
    window.navbarScrollHandler = () => {
        const currentScrollY = window.scrollY;

        // Transparency / Scrolled State
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Auto-Hide Logic
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('hidden');
            // Close mobile menu if open
            if (navLinks && navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            }
        } else {
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    };

    // 4. Attach Scroll Listener
    window.addEventListener('scroll', window.navbarScrollHandler, { passive: true });

    // Initial state check
    window.navbarScrollHandler();


    /* =========================================
       Mobile Menu Toggle
       ========================================= */
    if (mobileBtn && navLinks) {
        // Clone button to remove old event listeners (safest way without named functions)
        const newMobileBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newMobileBtn, mobileBtn);

        newMobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = navLinks.style.display === 'none' || navLinks.style.display === '';

            if (isHidden) {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            } else {
                navLinks.style.display = 'none';
            }
        });

        // Document click close handler
        // Remove old if exists (we can attach to window.closeMenuHandler for cleanup)
        if (window.closeMenuHandler) document.removeEventListener('click', window.closeMenuHandler);

        window.closeMenuHandler = (e) => {
            if (navLinks.style.display === 'flex' && !navbar.contains(e.target)) {
                navLinks.style.display = 'none';
            }
        };
        document.addEventListener('click', window.closeMenuHandler);
    }
};

// Auto-run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initNavbar);
} else {
    window.initNavbar();
}

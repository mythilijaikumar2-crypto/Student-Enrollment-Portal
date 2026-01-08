document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // If the entry is a counter, start counting
                if (entry.target.classList.contains('counter') || entry.target.querySelector('.counter')) {
                    const counters = entry.target.classList.contains('counter')
                        ? [entry.target]
                        : entry.target.querySelectorAll('.counter');

                    counters.forEach(startCounter);
                }

                // Stop observing once visible (optional, remove if you want re-trigger)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with .observe class
    document.querySelectorAll('.observe').forEach(el => {
        observer.observe(el);
    });

    // Observe stats section for counters
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Counter Animation Logic
    function startCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps

        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    }

    // Navbar Logic moved to js/navbar.js

});



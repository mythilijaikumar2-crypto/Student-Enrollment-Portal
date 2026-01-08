const progressBar = document.createElement('div');
progressBar.className = 'transition-progress-bar';
document.body.appendChild(progressBar);

document.addEventListener('DOMContentLoaded', () => {
    // Initial load animation
    document.body.classList.add('page-transition');
    setupLinks();
});

function setupLinks() {
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"])');
    links.forEach(link => {
        // Remove old listeners to avoid duplicates if re-running
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        newLink.addEventListener('click', (e) => {
            const href = newLink.getAttribute('href');
            if (href && !href.startsWith('#') && !href.includes('mailto:') && !href.includes('tel:')) {
                e.preventDefault();
                handleNavigation(href);
            }
        });
    });
}

function handleNavigation(url) {
    // 1. Start Exit Animation
    document.body.classList.add('page-transition-exit');

    // 2. Show Progress Bar
    progressBar.style.width = '50%';
    progressBar.style.opacity = '1';

    // 3. Wait for animation then force Reload
    setTimeout(() => {
        progressBar.style.width = '100%';
        window.location.href = url;
    }, 300);
}

// Modern Portfolio TypeScript Application

/**
 * Initialize the hamburger menu functionality
 */
function initHamburgerMenu(): void {
    const hamburger = document.querySelector('.hamburger') as HTMLElement;
    const nav = document.querySelector('nav') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;
    const navLinks = document.querySelectorAll('nav a');

    if (!hamburger || !nav || !overlay) {
        console.error('Required elements not found');
        return;
    }

    // Toggle menu function
    const toggleMenu = (): void => {
        const isActive = nav.classList.contains('active');
        
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Update ARIA attributes
        hamburger.setAttribute('aria-expanded', (!isActive).toString());
        overlay.setAttribute('aria-hidden', isActive.toString());
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isActive ? '' : 'hidden';
    };

    // Close menu function
    const closeMenu = (): void => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Event listeners
    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll(): void {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e: Event) => {
            e.preventDefault();
            const target = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
            
            if (target && target !== '#') {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Initialize all functionality when DOM is loaded
 */
function init(): void {
    initHamburgerMenu();
    initSmoothScroll();
    
    console.log('Portfolio initialized successfully');
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

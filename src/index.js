"use strict";
// Modern Portfolio Page - Interactive Components
/**
 * Initialize hamburger menu functionality
 */
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.overlay');
    const navLinks = document.querySelectorAll('nav a');
    if (!hamburger || !nav || !overlay) {
        return;
    }
    // Toggle menu function
    const toggleMenu = (isOpen) => {
        const shouldOpen = isOpen !== undefined ? isOpen : !nav.classList.contains('active');
        hamburger.classList.toggle('active', shouldOpen);
        nav.classList.toggle('active', shouldOpen);
        overlay.classList.toggle('active', shouldOpen);
        hamburger.setAttribute('aria-expanded', shouldOpen.toString());
        // Prevent body scroll when menu is open
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
    };
    // Hamburger button click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    // Overlay click to close menu
    overlay.addEventListener('click', () => {
        toggleMenu(false);
    });
    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });
    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}
/**
 * Smooth scroll functionality for navigation links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('nav a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.getAttribute('href');
            if (target) {
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
 * Add entrance animations
 */
function initAnimations() {
    const hero = document.querySelector('.hero');
    if (hero) {
        // Add fade-in animation
        setTimeout(() => {
            hero.style.opacity = '0';
            hero.style.transform = 'translateY(20px)';
            hero.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            requestAnimationFrame(() => {
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            });
        }, 100);
    }
}
/**
 * Initialize all interactive components
 */
function init() {
    initHamburgerMenu();
    initSmoothScroll();
    initAnimations();
}
// Run when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
}
else {
    init();
}

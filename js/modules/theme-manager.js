/**
 * Theme Manager
 * Shared dark/light theme management for all pages
 */

import { THEME_CONFIG, EVENT_NAMES } from './config.js';

let currentTheme = null;
let isInitialized = false;

/**
 * Initialize theme system
 * Loads saved theme and sets up toggle button
 */
export function initTheme() {
    if (isInitialized) {
        updateToggleButton(getTheme());
        return;
    }

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    setupToggleButton();
    isInitialized = true;
}

/**
 * Get the current active theme
 * @returns {string} 'dark' or 'light'
 */
export function getTheme() {
    return document.documentElement.getAttribute('data-theme') || THEME_CONFIG.LIGHT;
}

/**
 * Set theme programmatically
 * @param {string} theme - 'dark' or 'light'
 */
export function setTheme(theme) {
    if (theme !== THEME_CONFIG.DARK && theme !== THEME_CONFIG.LIGHT) {
        console.error(`Invalid theme: ${theme}`);
        return;
    }
    
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
    applyTheme(theme);
    
    // Dispatch event for other modules to listen
    const event = new CustomEvent(EVENT_NAMES.THEME_CHANGED, { 
        detail: { theme } 
    });
    document.dispatchEvent(event);
}

/**
 * Register a callback for theme changes
 * @param {Function} callback - Called with { theme } when theme changes
 * @returns {Function} Cleanup function to remove listener
 */
export function onThemeChange(callback) {
    const handler = (event) => callback(event.detail);
    document.addEventListener(EVENT_NAMES.THEME_CHANGED, handler);
    
    // Return cleanup function
    return () => document.removeEventListener(EVENT_NAMES.THEME_CHANGED, handler);
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme() {
    const current = getTheme();
    const newTheme = current === THEME_CONFIG.DARK ? THEME_CONFIG.LIGHT : THEME_CONFIG.DARK;
    setTheme(newTheme);
}

/**
 * Get saved theme from localStorage or default
 * @returns {string} The saved theme or default light
 */
function getSavedTheme() {
    return localStorage.getItem(THEME_CONFIG.STORAGE_KEY) || THEME_CONFIG.LIGHT;
}

/**
 * Apply theme to document
 * @param {string} theme - The theme to apply
 */
function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
}

/**
 * Update toggle button appearance and ARIA attributes
 * @param {string} theme - Current theme
 */
function updateToggleButton(theme) {
    const toggleBtn = document.getElementById(THEME_CONFIG.BUTTON_ID);
    if (!toggleBtn) return;

    const isDark = theme === THEME_CONFIG.DARK;
    
    toggleBtn.textContent = isDark ? THEME_CONFIG.EMOJIS.DARK : THEME_CONFIG.EMOJIS.LIGHT;
    toggleBtn.setAttribute('aria-label', isDark ? THEME_CONFIG.ARIA_LABELS.DARK : THEME_CONFIG.ARIA_LABELS.LIGHT);
    toggleBtn.setAttribute('title', isDark ? THEME_CONFIG.TITLES.DARK : THEME_CONFIG.TITLES.LIGHT);
}

/**
 * Setup toggle button event listeners
 */
function setupToggleButton() {
    const toggleBtn = document.getElementById(THEME_CONFIG.BUTTON_ID);
    if (!toggleBtn) {
        console.warn('Theme toggle button not found');
        return;
    }

    // Click handler
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Keyboard support (Enter and Space)
    toggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Auto-initialize when module loads (if DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

/**
 * Configuration and Constants
 * Centralized hardcoded values and configuration
 */

// ============================================================================
// API & PATHS
// ============================================================================
// Detect context (desktop o mobile) según la ruta
function detectJsonUrl() {
    const path = window.location.pathname;
    if (path.includes('mobile.html')) {
        return './pkgs/mobile-pkgs.json';
    } else if (path.includes('desktop.html')) {
        return './pkgs/desktop-pkgs.json';
    }
    // Fallback (por compatibilidad)
    return './pkgs/desktop-pkgs.json';
}

export const CONFIG = {
    JSON_URL: detectJsonUrl(),
    IMAGE_PATH: './img/apps/',
    FAV_PACKAGES_URL: './pkgs/list/fav-packages.json',
    EXPORT_FILENAME: 'toolbox-exported-packages.json',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    FILE_EXTENSION: '.json',
};

// ============================================================================
// PACKAGE DATA
// ============================================================================
export const NON_FOSS_PACKAGES = [
    'affinity-studio',
    'anydesk',
    'audiorelay',
    'balabolka',
    'bitwig-studio',
    'davinci-resolve',
    'discord',
    'dropbox',
    'google-earth',
    'guitar-pro',
    'mega',
    'musicbee',
    'notion',
    'obsidian',
    'ocenaudio',
    'opera',
    'plex',
    'reaper',
    'spotify',
    'steam',
    'sublime-text-4',
    'teamviewer',
    'unity',
    'vivaldi',
    'vmware',
    'whatsapp',
    'windscribe',
    'xnview',
    'zoom',
];

// ============================================================================
// CATEGORY EMOJIS
// ============================================================================
export const CATEGORY_EMOJIS = {
    'File Management': '📁',
    'Internet & Communication': '🌐',
    'System': '⚙️',
    'Utility': '🔧',
    'Virtualization': '📦',
    'Audio': '🎵',
    'Image': '🖼️',
    'Video': '🎬',
    'Development': '💻',
    'Gaming': '🎮',
    'Office': '📄',
    'Reading': '📚',
    'Science': '🔬',
};

// ============================================================================
// DISTRO COMMAND PREFIXES
// ============================================================================
export const DISTRO_PREFIXES = {
    linux_arch_pacman: 'sudo pacman -S',
    linux_debian_apt: 'sudo apt install',
    linux_fedora_rpm: 'sudo dnf install',
    linux_gentoo_emerge: 'sudo emerge',
    unix_nix_env: 'sudo nix-env -iA',
    linux_flatpak: 'flatpak install',
    linux_snap: 'sudo snap install',
    freebsd_pkg: 'sudo pkg install',
    macos_brew: 'brew install',
    windows_winget: 'winget install',
    android_pkg: 'adb install',
    ios_pkg: 'apt install',
};

// ============================================================================
// DOM SELECTORS - CLASS NAMES
// ============================================================================
export const CLASS_NAMES = {
    // Buttons
    OS_BTN: 'os-btn',
    DISTRO_BTN: 'distro-btn',
    ACTIVE: 'active',
    COLLAPSED: 'collapsed',
    COPIED: 'copied',
    
    // Checkboxes
    PACKAGE_CHECKBOX: 'package-checkbox',
    CATEGORY_CHECKBOX: 'category-checkbox',
    FOSS_HIDDEN: 'foss-hidden',
    
    // Layout
    COLUMN: 'column',
    CATEGORY: 'category',
    CATEGORY_HEADER: 'category-header',
    CATEGORY_CONTENT: 'category-content',
    CATEGORY_EMOJI: 'category-emoji',
    CATEGORY_BADGE: 'category-badge',
    TOGGLE_ARROW: 'toggle-arrow',
    SUBCATEGORY: 'subcategory',
    
    // Other
    HIDDEN: 'hidden',
    SHOW: 'show',
};

// ============================================================================
// DOM SELECTORS - ATTRIBUTE NAMES
// ============================================================================
export const ATTR_NAMES = {
    CATEGORY: 'data-category',
    DISTRO: 'data-distro',
    OS: 'data-os',
    PACKAGE_NAME: 'data-package-name',
    ROLE: 'role',
    TABINDEX: 'tabindex',
    ARIA_EXPANDED: 'aria-expanded',
    ARIA_CHECKED: 'aria-checked',
    ARIA_LABEL: 'aria-label',
};

// ============================================================================
// DOM ELEMENT IDs
// ============================================================================
export const ELEMENT_IDS = {
    // Containers
    OUTPUT: 'output',
    PACKAGE_CONTAINER: 'packageContainer',
    LOADING_SPINNER: 'loadingSpinner',
    COMMAND_WARNINGS: 'commandWarnings',
    
    // Buttons
    COPY_COMMAND_BTN: 'copyCommandBtn',
    TOGGLE_ALL_BTN: 'toggleAllBtn',
    FOSS_TOGGLE_BTN: 'fossToggleBtn',
    
    // Labels
    SELECT_ALL_LABEL: 'selectAllLabel',
    TOGGLE_ALL_LABEL: 'toggleAllLabel',
    
    // Checkboxes
    SELECT_ALL_CHECKBOX: 'selectAllCheckbox',
    
    // Selectors
    OS_SELECTOR: 'osSelector',
    LINUX_DISTRO_SELECTOR: 'linuxDistroSelector',
    OPTIONS_SELECT: 'optionsSelect',
    
    // Command display
    INSTALLATION_COMMAND: 'installation-command',
    PACKAGES_NOT_FOUND: 'packages-not-found',
    
    // File input
    FILE_INPUT: 'fileInput',
};

// ============================================================================
// EVENT NAMES
// ============================================================================
export const EVENT_NAMES = {
    PACKAGES_LOADED: 'packagesLoaded',
    SELECTION_CHANGED: 'selectionChanged',
    FILTER_CHANGED: 'filterChanged',
    OS_CHANGED: 'osChanged',
    THEME_CHANGED: 'themeChanged',
    OS_COMPAT_TABLE_LOADED: 'osCompatTableLoaded',
    OS_COMPAT_SORT_CHANGED: 'osCompatSortChanged',
    OS_COMPAT_FILTER_CHANGED: 'osCompatFilterChanged',
    OS_COMPAT_SEARCH_CHANGED: 'osCompatSearchChanged',
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================
export const THEME_CONFIG = {
    STORAGE_KEY: 'theme-preference',
    DARK: 'dark',
    LIGHT: 'light',
    BUTTON_ID: 'themeToggle',
    EMOJIS: {
        DARK: '☀️',  // Sun icon for dark mode (to switch to light)
        LIGHT: '🌙', // Moon icon for light mode (to switch to dark)
    },
    ARIA_LABELS: {
        DARK: 'Switch to light mode',
        LIGHT: 'Switch to dark mode',
    },
    TITLES: {
        DARK: 'Light mode',
        LIGHT: 'Dark mode',
    },
};

// ============================================================================
// OS COMPATIBILITY CONFIGURATION
// ============================================================================
function detectCompatJsonUrl() {
    const path = window.location.pathname;
    if (path.includes('mobile')) {
        return './pkgs/mobile-pkgs.json';
    } else if (path.includes('desktop')) {
        return './pkgs/desktop-pkgs.json';
    }
    return './pkgs/desktop-pkgs.json';
}

export const OS_COMPAT_CONFIG = {
    // Data source
    JSON_URL: detectCompatJsonUrl(),
    IMAGE_PATH: './img/apps/', // Same as CONFIG.IMAGE_PATH
    // Windows packages that don't use winget
    WINDOWS_NON_WINGET: [
        { id: 'ardour', name: 'Ardour' },
        { id: 'davinci-resolve', name: 'DaVinci Resolve' },
        { id: 'eaglemode', name: 'Eagle-Mode' },
        { id: 'freefilesync', name: 'FreeFileSync' },
        { id: 'mediawiki', name: 'MediaWiki' },
        { id: 'moodle', name: 'Moodle' },
        { id: 'stability-matrix', name: 'StabilityMatrix' },
        { id: 'strawberry', name: 'Strawberry' },
        { id: 'vmware', name: 'VMware' },
    ],
    
    // Operating systems
    OS_LIST: ['windows', 'macos', 'linux', 'freebsd'],
    
    // Windows status values
    WINDOW_STATUSES: {
        WINGET: 'winget',
        NON_WINGET: 'non-winget',
        NONE: 'none',
    },
    
    // Status icons
    STATUS_ICONS: {
        AVAILABLE: '✅',
        WARNING: '⚠️',
        NOT_AVAILABLE: '❌',
    },
    
    // Element IDs
    ELEMENT_IDS: {
        TABLE_BODY: 'tableBody',
        SEARCH_INPUT: 'searchInput',
        CLEAR_SEARCH: 'clearSearch',
        RESET_FILTERS: 'resetFilters',
        EXPORT_BTN: 'exportBtn',
        STATS_CONTAINER: 'statsContainer',
        RESULT_COUNT: 'resultCount',
        COLUMN_TOGGLES: 'columnToggles',
    },
    
    // CSS Selectors
    SELECTORS: {
        TABLE_BODY: '#tableBody',
        FILTER_BTN: '.filter-chip',
        SORTABLE_TH: 'th.sortable',
    },
    
    // Icons for compatibility status
    ICONS: {
        AVAILABLE: '✅',
        NON_WINGET: '⚠️',
        NOT_AVAILABLE: '❌',
        WINGET: '✅',
    },
    
    // Data attributes
    DATA_ATTRS: {
        SORT: 'data-column',
        FILTER: 'data-os',
        OS: 'data-os',
    },
    
    // Default sort
    DEFAULT_SORT: {
        COLUMN: 'name',
        DIRECTION: 'asc',
    },
    
    // Default filter
    DEFAULT_FILTER: 'all',
};

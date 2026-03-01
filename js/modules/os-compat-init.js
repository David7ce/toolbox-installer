/**
 * OS Compatibility Application Initialization
 * Entry point for os-compatibility.html
 */

import { OS_COMPAT_CONFIG } from './config.js';
import { initTheme } from './theme-manager.js';
import { loadCompatibilityData } from './os-compat-data.js';
import * as state from './os-compat-state.js';
import * as table from './os-compat-table.js';
import * as interactions from './os-compat-interactions.js';
import { onDOMReady } from './dom-utils.js';

/**
 * Initialize the OS Compatibility application
 */
async function init() {
    try {
        // Initialize theme first (synchronous)
        initTheme();
        
        // Show loading state
        table.showLoading('Loading package data...');
        
        // Load data
        const packages = await loadCompatibilityData();
        
        // Initialize state with loaded packages
        state.setPackages(packages);
        
        // Apply default filters and sorting
        state.applyFilters();
        
        // Get filtered packages
        const filtered = state.getFilteredPackages();
        
        // Setup all interactions (event listeners)
        interactions.setupInteractions();
        
        // Initial render
        table.renderTable(filtered);
        table.updateStats(state.getStatistics());
        table.updateFilterChips(state.getOsFilters());
        table.updateSortArrows(state.getSortState());
        
        // Log success for debugging
        console.info(`✓ OS Compatibility loaded: ${packages.length} packages`);
        
    } catch (error) {
        console.error('Failed to initialize OS Compatibility:', error);
        table.showError('Failed to load package data. Please refresh the page.');
    }
}

// Auto-initialize when DOM is ready
onDOMReady(init);

// Export for testing or manual initialization
export { init };

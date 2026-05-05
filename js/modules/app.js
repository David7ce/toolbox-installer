/**
 * Toolbox Installer - Main Application
 * Entry point for initializing all modules and functionality
 */

import { createCommandFooter } from './command-footer.js';
import { loadPackages, getPackagesData } from './data-manager.js';
import { generatePackages } from './ui-builder.js';
import {
    setupCategoryCheckboxes,
    setupSelectAllCheckbox,
} from './checkbox-manager.js';
import { setupFossToggle } from './foss-filter.js';
import {
    setupOSSelector,
    setupSearchInput,
    setupToggleAllButton,
    setupCopyButton,
    setupAutoCommandGeneration,
} from './interaction-manager.js';
import {
    setupOptionsSelect,
    setupFileInput,
} from './import-export.js';

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Inject shared sticky footer
        createCommandFooter({
            ariaLabel: 'Installation command',
            commandLabel: 'Installation command:',
            hasLangId: true,
            initialText: 'Select packages and OS to generate command...',
        });

        // Load packages data
        console.log('Loading packages...');
        const packagesData = await loadPackages();
        
        // Generate UI
        console.log('Generating packages UI...');
        generatePackages(packagesData);
        
        // Setup all event handlers
        console.log('Setting up event handlers...');
        setupSelectAllCheckbox();
        setupCategoryCheckboxes();
        setupFossToggle();
        
        // Setup interactions
        setupOSSelector();
        setupSearchInput();
        setupToggleAllButton();
        setupCopyButton();
        setupAutoCommandGeneration();
        
        // Setup import/export
        setupOptionsSelect();
        setupFileInput();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

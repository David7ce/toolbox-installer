/**
 * Interaction Manager
 * Handles user interactions: OS selection, button toggles, copy, command generation
 */

import { CLASS_NAMES, EVENT_NAMES } from './config.js';
import {
    getActiveOS,
    getActiveDistro,
    getElement,
    updateActiveButton,
    getSelectedPackageIds,
} from './dom-utils.js';
import {
    buildCommand,
} from './command-builder.js';
import {
    getPackagesData,
} from './data-manager.js';

/**
 * Setup OS selector buttons and distro visibility
 */
export function setupOSSelector() {
    const osBtns = document.querySelectorAll(`.${CLASS_NAMES.OS_BTN}`);
    const linuxSelector = getElement('LINUX_DISTRO_SELECTOR');
    const distroBtns = document.querySelectorAll(`.${CLASS_NAMES.DISTRO_BTN}`);

    osBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            updateActiveButton(CLASS_NAMES.OS_BTN, this, true);

            // Show/hide Linux distro selector SOLO si existe (desktop)
            const os = this.dataset.os;
            if (linuxSelector) {
                if (os === 'linux') {
                    linuxSelector.classList.remove('hidden');
                } else {
                    linuxSelector.classList.add('hidden');
                }
            }

            // Auto-generate command with new OS
            autoGenerateCommand();

            // Notify OS change
            document.dispatchEvent(new CustomEvent(EVENT_NAMES.OS_CHANGED));
        });
    });

    // Activar el primer SO por defecto si ninguno está activo (mobile)
    if (osBtns.length && !document.querySelector(`.${CLASS_NAMES.OS_BTN}.${CLASS_NAMES.ACTIVE}`)) {
        osBtns[0].classList.add(CLASS_NAMES.ACTIVE);
        autoGenerateCommand();
    }

    // Setup distro button listeners SOLO si existen (desktop)
    if (distroBtns.length) {
        distroBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                updateActiveButton(CLASS_NAMES.DISTRO_BTN, this, false);
                autoGenerateCommand();
            });

            // Keyboard support
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
}

/**
 * Setup toggle all categories button
 */
export function setupToggleAllButton() {
    const toggleAllBtn = getElement('TOGGLE_ALL_BTN');
    const toggleAllLabel = getElement('TOGGLE_ALL_LABEL');
    
    if (!toggleAllBtn) return;
    
    let allCollapsed = false;
    
    toggleAllBtn.addEventListener('click', function() {
        const categories = document.querySelectorAll(`.${CLASS_NAMES.CATEGORY}`);
        
        if (allCollapsed) {
            // Expand all
            categories.forEach(cat => cat.classList.remove(CLASS_NAMES.COLLAPSED));
            if (toggleAllLabel) toggleAllLabel.textContent = 'Collapse';
            toggleAllBtn.classList.remove(CLASS_NAMES.COLLAPSED);
            allCollapsed = false;
        } else {
            // Collapse all
            categories.forEach(cat => cat.classList.add(CLASS_NAMES.COLLAPSED));
            if (toggleAllLabel) toggleAllLabel.textContent = 'Expand';
            toggleAllBtn.classList.add(CLASS_NAMES.COLLAPSED);
            allCollapsed = true;
        }
    });
}

/**
 * Setup copy command button
 */
export function setupCopyButton() {
    const copyBtn = getElement('COPY_COMMAND_BTN');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async function() {
        const commandElement = getElement('INSTALLATION_COMMAND');
        if (!commandElement) return;
        
        const commandText = commandElement.textContent;
        
        if (commandText && !isPlaceholderText(commandText)) {
            try {
                await navigator.clipboard.writeText(commandText);
                
                // Visual feedback
                copyBtn.textContent = '✓ Copied!';
                copyBtn.classList.add(CLASS_NAMES.COPIED);
                
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy';
                    copyBtn.classList.remove(CLASS_NAMES.COPIED);
                }, 2000);
            } catch (error) {
                console.error('Failed to copy:', error);
                alert('Failed to copy to clipboard');
            }
        }
    });
}

/**
 * Setup auto-generation of command on selection changes
 */
export function setupAutoCommandGeneration() {
    // Trigger on package checkbox change
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.classList.contains(CLASS_NAMES.PACKAGE_CHECKBOX)) {
            autoGenerateCommand();
        }
    });
    
    // Trigger on selection or filter changes
    document.addEventListener(EVENT_NAMES.SELECTION_CHANGED, autoGenerateCommand);
    document.addEventListener(EVENT_NAMES.FILTER_CHANGED, autoGenerateCommand);
    document.addEventListener(EVENT_NAMES.OS_CHANGED, autoGenerateCommand);
}

/**
 * Auto-generate installation command based on current selections
 */
export function autoGenerateCommand() {
    try {
        const activeOS = getActiveOS();
        
        if (!activeOS) {
            const commandElement = getElement('INSTALLATION_COMMAND');
            if (commandElement) {
                commandElement.textContent = 'Please select an operating system';
            }
            return;
        }

        // Map OS to distro key
        let selectedDistro = getDistroFromOS(activeOS);
        
        if (!selectedDistro) {
            const commandElement = getElement('INSTALLATION_COMMAND');
            if (commandElement) {
                commandElement.textContent = 'Please select an operating system';
            }
            return;
        }

        const selectedPackageIds = getSelectedPackageIds();

        if (selectedPackageIds.length === 0) {
            const commandElement = getElement('INSTALLATION_COMMAND');
            const warningsElement = getElement('COMMAND_WARNINGS');
            if (commandElement) {
                commandElement.textContent = 'Select packages to generate installation command...';
            }
            if (warningsElement) {
                warningsElement.classList.remove(CLASS_NAMES.SHOW);
            }
            return;
        }

        // Get packages data
        const packagesData = getPackagesData();
        if (!packagesData) {
            console.error('Packages data not available');
            return;
        }

        // Build the command
        const result = buildCommand(selectedDistro, selectedPackageIds, packagesData);

        // Display command
        const commandElement = getElement('INSTALLATION_COMMAND');
        if (commandElement) {
            if (result.resultCommand) {
                commandElement.textContent = result.resultCommand;
            } else {
                commandElement.textContent = 'No compatible packages selected for this OS';
            }
        }

        // Show warnings if any
        const warningsElement = getElement('COMMAND_WARNINGS');
        if (warningsElement) {
            if (result.nonInstallablePackages.length) {
                warningsElement.innerHTML = `<strong>⚠️ Not available for this OS:</strong> <span class="not-available-packages">${result.nonInstallablePackages.join(', ')}</span>`;
                warningsElement.classList.add(CLASS_NAMES.SHOW);
            } else {
                warningsElement.classList.remove(CLASS_NAMES.SHOW);
            }
        }
    } catch (error) {
        console.error('Error generating command:', error);
    }
}

/**
 * Get distro key based on selected OS
 * @param {string} activeOS - The active OS
 * @returns {string|null} The distro key or null
 */
function getDistroFromOS(activeOS) {
    switch(activeOS) {
        case 'linux':
            return getActiveDistro() || 'linux_arch_pacman';
        case 'windows':
            return 'windows_winget';
        case 'macos':
            return 'macos_brew';
        case 'freebsd':
            return 'freebsd_pkg';
        case 'android':
            return 'android_pkg';
        case 'ios':
            return 'ios_pkg';
        default:
            return null;
    }
}

/**
 * Check if text is a placeholder message
 * @param {string} text - The text to check
 * @returns {boolean} True if text is placeholder
 */
function isPlaceholderText(text) {
    return text === 'Select packages to generate installation command...' ||
           text === 'Please select an operating system' ||
           text === 'No compatible packages selected for this OS';
}

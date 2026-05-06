/**
 * Checkbox Manager
 * Manages checkbox state, three-state logic, and visibility filtering
 */

import { CLASS_NAMES, EVENT_NAMES } from './config';
import {
    getVisibleCheckboxes,
    getPackageCheckboxesByCategory,
    getCategoryCheckbox,
    getElement,
    toggleClass,
} from './dom-utils';

/**
 * Setup all checkbox-related functionality
 * Attach event listeners and initialize states
 */
export function setupCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll(`.${CLASS_NAMES.CATEGORY_CHECKBOX}`);
    
    categoryCheckboxes.forEach(categoryCheckbox => {
        const category = categoryCheckbox.dataset.category;
        
        // Handle category checkbox click
        categoryCheckbox.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const packageCheckboxes = getPackageCheckboxesByCategory(category);
            const newState = this.checked;
            
            // Batch DOM updates
            requestAnimationFrame(() => {
                // Only toggle visible packages (not hidden by FOSS filter)
                packageCheckboxes.forEach(cb => {
                    const label = cb.closest('label');
                    if (
                        label
                        && !label.classList.contains(CLASS_NAMES.FOSS_HIDDEN)
                        && !label.classList.contains(CLASS_NAMES.SEARCH_HIDDEN)
                    ) {
                        cb.checked = newState;
                    }
                });
                
                this.indeterminate = false;
                
                // Notify state changes
                updateSelectAllState();
                document.dispatchEvent(new CustomEvent(EVENT_NAMES.SELECTION_CHANGED));
            });
        });
        
        // Update category state when package checkboxes change
        const packageCheckboxes = getPackageCheckboxesByCategory(category);
        packageCheckboxes.forEach(pkgCheckbox => {
            pkgCheckbox.addEventListener('change', function() {
                updateCategoryCheckbox(category);
            });
        });
        
        // Initialize state
        updateCategoryCheckbox(category);
    });
}

/**
 * Update a category checkbox to reflect its packages' state (checked/unchecked/indeterminate)
 * @param {string} category - The category name
 */
export function updateCategoryCheckbox(category) {
    const categoryCheckbox = getCategoryCheckbox(category);
    const packageCheckboxes = getPackageCheckboxesByCategory(category);
    
    if (!categoryCheckbox) return;
    
    // Only count visible packages (not hidden by FOSS filter)
    const visibleCheckboxes = Array.from(packageCheckboxes).filter(cb => {
        const label = cb.closest('label');
        return label
            && !label.classList.contains(CLASS_NAMES.FOSS_HIDDEN)
            && !label.classList.contains(CLASS_NAMES.SEARCH_HIDDEN);
    });
    
    const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;
    const totalCount = visibleCheckboxes.length;
    
    if (checkedCount === 0) {
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = false;
    } else if (checkedCount === totalCount) {
        categoryCheckbox.checked = true;
        categoryCheckbox.indeterminate = false;
    } else {
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = true;
    }
}

/**
 * Setup the select all / deselect all checkbox
 */
export function setupSelectAllCheckbox() {
    const selectAllCheckbox = getElement('SELECT_ALL_CHECKBOX');
    
    if (!selectAllCheckbox) return;
    
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        const visibleCheckboxes = getVisibleCheckboxes();
        
        // Set all visible package checkboxes to match select all state
        visibleCheckboxes.forEach(cb => cb.checked = isChecked);
        
        // Update category checkboxes and notify
        updateAllCategoryCheckboxes();
        updateSelectAllState();
        document.dispatchEvent(new CustomEvent(EVENT_NAMES.SELECTION_CHANGED));
    });
}

/**
 * Update the select all checkbox state based on current selections
 */
export function updateSelectAllState() {
    const selectAllCheckbox = getElement('SELECT_ALL_CHECKBOX');
    const selectAllLabel = getElement('SELECT_ALL_LABEL');
    
    if (!selectAllCheckbox || !selectAllLabel) return;
    
    const visibleCheckboxes = getVisibleCheckboxes();
    const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;
    const totalCount = visibleCheckboxes.length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
        selectAllLabel.textContent = 'Select';
    } else if (checkedCount === totalCount) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
        selectAllLabel.textContent = 'Deselect';
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllLabel.textContent = 'Selected';
    }
}

/**
 * Update all category checkboxes to reflect current package states
 */
export function updateAllCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll(`.${CLASS_NAMES.CATEGORY_CHECKBOX}`);
    categoryCheckboxes.forEach(cb => {
        const category = cb.dataset.category;
        updateCategoryCheckbox(category);
    });
}

/**
 * Perform an action on all visible checkboxes
 * @param {Function} callback - Function to call on each visible checkbox
 */
export function forEachVisibleCheckbox(callback) {
    const visibleCheckboxes = getVisibleCheckboxes();
    visibleCheckboxes.forEach(callback);
}

/**
 * Get the count of checked visible checkboxes
 * @returns {number} Count of checked visible packages
 */
export function getCheckedVisibleCount() {
    const visibleCheckboxes = getVisibleCheckboxes();
    return visibleCheckboxes.filter(cb => cb.checked).length;
}

/**
 * Get the count of total visible checkboxes
 * @returns {number} Count of total visible packages
 */
export function getTotalVisibleCount() {
    return getVisibleCheckboxes().length;
}

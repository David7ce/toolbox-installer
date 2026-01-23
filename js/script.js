/**
 * Package Installer Generator
 * Main application logic for package selection and command generation
 */

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
const jsonUrl = './pkgs/packages-info.json';
const imageUrl = './img/';
let packagesData; // Variable to store JSON data

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

// Function to load and process the JSON
function loadPackages() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const packageContainer = document.getElementById('packageContainer');
    
    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load packages data: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            packagesData = data;
            if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
            }
            generatePackages(packagesData);
            
            // Dispatch event when packages are loaded
            const event = new CustomEvent('packagesLoaded');
            document.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Error loading packages data: ', error);
            if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
            }
            if (packageContainer) {
                packageContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Failed to Load Packages</h3>
                        <p>There was an error loading the package data. Please check your connection and try again.</p>
                        <button onclick="location.reload()">Reload Page</button>
                    </div>
                `;
            }
        });
}

// Function to generate the content of packages in the form
function generatePackages(packagesData) {
    const packageContainer = document.getElementById('packageContainer');
    packageContainer.innerHTML = ''; // Clear container before adding new content

    // Define categories by column with emojis
    const columnCategories = [
        ["Science"],
        ["Reading"],
        ["Utility"],
        ["Gaming"],
        ["Virtualization"],
        ["File Man"],
        ["Office"],
        ["Audio"],
        ["Video"],
        ["Image"],
        ["System"],
        ["Internet & Communication"],
        ["Development"],
    ];

    // Category emoji mapping
    const categoryEmojis = {
        "File Man": "📁",
        "Internet & Communication": "🌐",
        "System": "⚙️",
        "Utility": "🔧",
        "Virtualization": "📦",
        "Audio": "🎵",
        "Image": "🖼️",
        "Video": "🎬",
        "Development": "💻",
        "Gaming": "🎮",
        "Office": "📄",
        "Reading": "📚",
        "Science": "🔬"
    };

    // Create columns
    columnCategories.forEach(categoryList => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        packageContainer.appendChild(columnDiv);

            categoryList.forEach(category => {
            const categoryDiv = document.createElement('div');
            // Create CSS-safe class name by replacing spaces with hyphens
            const categoryClass = category.replace(/\s+/g, '-').toLowerCase();
            categoryDiv.classList.add('category', categoryClass);
            columnDiv.appendChild(categoryDiv);

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.setAttribute('role', 'button');
            categoryHeader.setAttribute('tabindex', '0');
            categoryHeader.setAttribute('aria-expanded', 'true');
            categoryHeader.setAttribute('aria-label', `${category} category, click to collapse or expand`);
            categoryDiv.appendChild(categoryHeader);

            const categoryCheckbox = document.createElement('input');
            categoryCheckbox.type = 'checkbox';
            categoryCheckbox.classList.add('category-checkbox');
            categoryCheckbox.dataset.category = category;
            categoryHeader.appendChild(categoryCheckbox);

            const categoryEmoji = document.createElement('span');
            categoryEmoji.classList.add('category-emoji');
            categoryEmoji.textContent = categoryEmojis[category] || '📦';
            categoryHeader.appendChild(categoryEmoji);

            const categoryHeading = document.createElement('h4');
            categoryHeading.textContent = category;
            categoryHeader.appendChild(categoryHeading);

            const toggleArrow = document.createElement('span');
            toggleArrow.classList.add('toggle-arrow');
            toggleArrow.textContent = '▼';
            categoryHeader.appendChild(toggleArrow);

            const categoryContent = document.createElement('div');
            categoryContent.classList.add('category-content');
            categoryDiv.appendChild(categoryContent);

            // Add click event to toggle category
            categoryHeader.addEventListener('click', function(e) {
                if (!e.target.classList.contains('category-checkbox')) {
                    categoryDiv.classList.toggle('collapsed');
                    const isExpanded = !categoryDiv.classList.contains('collapsed');
                    categoryHeader.setAttribute('aria-expanded', isExpanded);
                }
            });
            
            // Add keyboard support for category toggle
            categoryHeader.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!e.target.classList.contains('category-checkbox')) {
                        categoryDiv.classList.toggle('collapsed');
                        const isExpanded = !categoryDiv.classList.contains('collapsed');
                        categoryHeader.setAttribute('aria-expanded', isExpanded);
                    }
                }
            });

            const subcategories = {};

            // First pass: collect all packages by subcategory
            Object.entries(packagesData.packages).forEach(([pkgKey, pkgInfo]) => {
                if (pkgInfo.category === category) {
                    const subcategory = pkgInfo.subcategory;
                    
                    if (!subcategories[subcategory]) {
                        subcategories[subcategory] = [];
                    }
                    subcategories[subcategory].push({ key: pkgKey, info: pkgInfo });
                }
            });

            // Second pass: create subcategory divs in alphabetical order
            Object.keys(subcategories)
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .forEach(subcategory => {
                    const subcategoryDiv = document.createElement('div');
                    // Create CSS-safe class name by replacing spaces with hyphens
                    const subcategoryClass = subcategory.replace(/\s+/g, '-').toLowerCase();
                    subcategoryDiv.classList.add('subcategory', subcategoryClass);
                    categoryContent.appendChild(subcategoryDiv);

                    const subcategoryHeading = document.createElement('h5');
                    subcategoryHeading.textContent = subcategory;
                    subcategoryDiv.appendChild(subcategoryHeading);

                    // Sort packages alphabetically by package key
                    subcategories[subcategory]
                        .sort((a, b) => a.key.localeCompare(b.key))
                        .forEach(({ key: pkgKey, info: pkgInfo }) => {
                        const packageLabel = document.createElement('label');
                        const packageCheckbox = document.createElement('input');
                        packageCheckbox.type = 'checkbox';
                        packageCheckbox.name = 'pkg';
                        packageCheckbox.value = pkgKey; // Use package key as value
                        packageCheckbox.id = pkgKey;
                        packageCheckbox.dataset.packageName = pkgInfo.name; // Store package name as data attribute
                        packageCheckbox.classList.add('package-checkbox');
                        packageCheckbox.dataset.category = category;

                        const packageImg = document.createElement('img');
                        packageImg.src = `${imageUrl}${pkgKey}.svg`;
                        packageImg.width = 30;

                        packageLabel.appendChild(packageCheckbox);
                        packageLabel.appendChild(packageImg);
                        packageLabel.appendChild(document.createTextNode(` ${pkgInfo.name}`));

                        subcategoryDiv.appendChild(packageLabel);
                    });
                });
        });
    });

    // Add event listeners for category checkboxes
    setupCategoryCheckboxes();
    
    // Initialize select all state
    updateSelectAllState();
}

// Function to setup three-state category checkboxes
function setupCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    
    categoryCheckboxes.forEach(categoryCheckbox => {
        const category = categoryCheckbox.dataset.category;
        
        // Handle category checkbox click with event delegation
        categoryCheckbox.addEventListener('click', function(e) {
            e.stopPropagation();
            const packageCheckboxes = document.querySelectorAll(`.package-checkbox[data-category="${category}"]`);
            const newState = this.checked;
            
            // Use requestAnimationFrame to batch DOM updates
            requestAnimationFrame(() => {
                packageCheckboxes.forEach(cb => {
                    cb.checked = newState;
                });
                
                this.indeterminate = false;
                
                // Update select all state
                updateSelectAllState();
                
                // Trigger command generation
                autoGenerateCommand();
            });
        });
        
        // Update category checkbox state when package checkboxes change
        const packageCheckboxes = document.querySelectorAll(`.package-checkbox[data-category="${category}"]`);
        packageCheckboxes.forEach(pkgCheckbox => {
            pkgCheckbox.addEventListener('change', function() {
                updateCategoryCheckbox(category);
            });
        });
        
        // Initialize state
        updateCategoryCheckbox(category);
    });
}

// Function to update category checkbox state (checked/unchecked/indeterminate)
function updateCategoryCheckbox(category) {
    const categoryCheckbox = document.querySelector(`.category-checkbox[data-category="${category}"]`);
    const packageCheckboxes = document.querySelectorAll(`.package-checkbox[data-category="${category}"]`);
    
    const checkedCount = Array.from(packageCheckboxes).filter(cb => cb.checked).length;
    const totalCount = packageCheckboxes.length;
    
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

// Function to generate the installation command based on the selected distribution
async function generateCommand() {
    console.log('Generate command button clicked');
    try {
        // Get selected distro from either dropdown or radio button
        let selectedDistro;
        const activeOS = document.querySelector('.os-btn.active')?.dataset.os;
        
        switch(activeOS) {
            case 'linux':
                const activeDistroBtn = document.querySelector('.distro-btn.active');
                selectedDistro = activeDistroBtn?.dataset.distro || 'linux_arch_pacman';
                break;
            case 'windows':
                selectedDistro = 'windows_winget';
                break;
            case 'macos':
                selectedDistro = 'macos_brew';
                break;
            case 'bsd':
                selectedDistro = 'freebsd_pkg';
                break;
            default:
                // Fallback to old radio button method
                const radioDistro = document.querySelector('input[name="distro"]:checked');
                if (radioDistro) {
                    selectedDistro = radioDistro.value;
                } else {
                    throw new Error('Please select an operating system');
                }
        }

        const selectedPackages = Array.from(document.querySelectorAll('input[name="pkg"]:checked'))
            .map(checkbox => checkbox.value);

        const installationCommands = [];
        const aurPackages = [];
        const nonInstallablePackages = [];

        // Iterate through each selected package
        selectedPackages.forEach(pkg => {
            const pkgInfo = packagesData.packages[pkg];
            if (pkgInfo.package_manager[selectedDistro]) {
                installationCommands.push(pkgInfo.package_manager[selectedDistro]);
            } else if (selectedDistro === 'linux_arch_pacman' && pkgInfo.package_manager['linux_arch_aur']) {
                aurPackages.push(pkgInfo.package_manager['linux_arch_aur']);
            } else {
                nonInstallablePackages.push(pkgInfo.name);
            }
        });

        let commandPrefix;

        switch (selectedDistro) {
            case 'linux_arch_pacman':
                commandPrefix = 'sudo pacman -S';
                break;
            case 'linux_debian_apt':
                commandPrefix = 'sudo apt install';
                break;
            case 'linux_fedora_rpm':
                commandPrefix = 'sudo dnf install';
                break;
            case 'linux_gentoo_emerge':
                commandPrefix = 'sudo emerge';
                break;
            case 'unix_nix_env':
                commandPrefix = 'sudo nix-env -iA';
                break;
            case 'linux_void_xbps':
                commandPrefix = 'sudo xbps-install -S';
                break;
            case 'linux_flatpak':
                commandPrefix = 'flatpak install';
                break;
            case 'linux_snap':
                commandPrefix = 'sudo snap install';
                break;
            case 'freebsd_pkg':
                commandPrefix = 'sudo pkg install';
                break;
            case 'macos_brew':
                commandPrefix = 'brew install';
                break;
            case 'windows_winget':
                commandPrefix = 'winget install';
                break;
            default:
                throw new Error('Unsupported distribution');
        }

        const finalCommand = installationCommands.length
            ? `${commandPrefix} ${installationCommands.join(' ')}`
            : '';

        const aurCommand = aurPackages.length
            ? `yay -S ${aurPackages.join(' ')}`
            : '';

        const resultCommand = [finalCommand, aurCommand].filter(cmd => cmd).join(' && ');

        if (!resultCommand) {
            throw new Error('No installation commands generated. Please select at least one package.');
        }

        // Clear any existing content
        const outputElement = document.getElementById("output");
        outputElement.innerHTML = '';

        // Create and append the installation command element
        const installationCodeElement = document.createElement('code');
        installationCodeElement.id = 'installation-command';
        installationCodeElement.textContent = resultCommand;
        outputElement.appendChild(installationCodeElement);

        // Create and append the non-installable packages element if needed
        if (nonInstallablePackages.length) {
            const nonInstallablePackagesElement = document.createElement('code');
            nonInstallablePackagesElement.id = 'packages-not-found';
            nonInstallablePackagesElement.innerHTML = `<strong>Packages not found:</strong> ${nonInstallablePackages.join(', ')}`;
            outputElement.appendChild(nonInstallablePackagesElement);
        }
    } catch (error) {
        alert(`There was an error generating the installation command: ${error.message}`);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing application');
    
    // Load packages data
    loadPackages();
    
    // Setup two-tier OS selection
    setupOSSelector();
    
    // Setup select all checkbox when packages are loaded
    document.addEventListener('packagesLoaded', function() {
        setupSelectAllCheckbox();
    });
    
    // Setup auto-generation of command
    setupAutoCommandGeneration();
    
    // Setup copy button
    setupCopyButton();

    // Setup toggle all categories button
    setupToggleAllButton();

    // Setup options select
    const optionsSelect = document.getElementById('optionsSelect');
    
    if (optionsSelect) {
        optionsSelect.addEventListener('change', function(e) {
            const action = e.target.value;
            if (action === 'loadFavorites') {
                loadFavorites();
            } else if (action === 'importPackages') {
                importPackages();
            } else if (action === 'exportPackages') {
                exportPackages();
            }
            // Reset select to default option
            e.target.value = '';
        });
    }
});

// Function to setup auto command generation
function setupAutoCommandGeneration() {
    // Trigger on any checkbox change
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.classList.contains('package-checkbox')) {
            autoGenerateCommand();
            updateSelectAllState();
        }
    });
    
    // Trigger on OS selection change
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('os-btn')) {
            setTimeout(autoGenerateCommand, 100);
        }
        // Trigger on distro button click
        if (e.target.classList.contains('distro-btn')) {
            autoGenerateCommand();
        }
    });
}

// Function to auto-generate command
function autoGenerateCommand() {
    try {
        // Get selected distro
        let selectedDistro;
        const activeOS = document.querySelector('.os-btn.active')?.dataset.os;
        
        if (!activeOS) {
            const commandElement = document.getElementById('installation-command');
            commandElement.textContent = 'Please select an operating system';
            return;
        }
        
        switch(activeOS) {
            case 'linux':
                const activeDistroBtn = document.querySelector('.distro-btn.active');
                selectedDistro = activeDistroBtn?.dataset.distro || 'linux_arch_pacman';
                break;
            case 'windows':
                selectedDistro = 'windows_winget';
                break;
            case 'macos':
                selectedDistro = 'macos_brew';
                break;
            case 'bsd':
                selectedDistro = 'freebsd_pkg';
                break;
            default:
                const commandElement = document.getElementById('installation-command');
                commandElement.textContent = 'Please select an operating system';
                return;
        }

        const selectedPackages = Array.from(document.querySelectorAll('input[name="pkg"]:checked'))
            .map(checkbox => checkbox.value);

        if (selectedPackages.length === 0) {
            const commandElement = document.getElementById('installation-command');
            commandElement.textContent = 'Select packages to generate installation command...';
            document.getElementById('commandWarnings').classList.remove('show');
            return;
        }

        const installationCommands = [];
        const aurPackages = [];
        const nonInstallablePackages = [];

        // Process each selected package
        selectedPackages.forEach(pkg => {
            const pkgInfo = packagesData.packages[pkg];
            if (pkgInfo.package_manager[selectedDistro]) {
                installationCommands.push(pkgInfo.package_manager[selectedDistro]);
            } else if (selectedDistro === 'linux_arch_pacman' && pkgInfo.package_manager['linux_arch_aur']) {
                aurPackages.push(pkgInfo.package_manager['linux_arch_aur']);
            } else {
                nonInstallablePackages.push(pkgInfo.name);
            }
        });

        let commandPrefix = getCommandPrefix(selectedDistro);

        const finalCommand = installationCommands.length
            ? `${commandPrefix} ${installationCommands.join(' ')}`
            : '';

        const aurCommand = aurPackages.length
            ? `yay -S ${aurPackages.join(' ')}`
            : '';

        const resultCommand = [finalCommand, aurCommand].filter(cmd => cmd).join(' && ');

        const commandElement = document.getElementById('installation-command');
        const warningsElement = document.getElementById('commandWarnings');
        
        if (resultCommand) {
            commandElement.textContent = resultCommand;
        } else {
            commandElement.textContent = 'No compatible packages selected for this OS';
        }

        // Show warnings if any
        if (nonInstallablePackages.length) {
            warningsElement.innerHTML = `<strong>⚠️ Not available for this OS:</strong> ${nonInstallablePackages.join(', ')}`;
            warningsElement.classList.add('show');
        } else {
            warningsElement.classList.remove('show');
        }
    } catch (error) {
        console.error('Error generating command:', error);
    }
}

// Helper function to get command prefix
function getCommandPrefix(selectedDistro) {
    switch (selectedDistro) {
        case 'linux_arch_pacman':
            return 'sudo pacman -S';
        case 'linux_debian_apt':
            return 'sudo apt install';
        case 'linux_fedora_rpm':
            return 'sudo dnf install';
        case 'linux_gentoo_emerge':
            return 'sudo emerge';
        case 'unix_nix_env':
            return 'sudo nix-env -iA';
        case 'linux_void_xbps':
            return 'sudo xbps-install -S';
        case 'linux_flatpak':
            return 'flatpak install';
        case 'linux_snap':
            return 'sudo snap install';
        case 'freebsd_pkg':
            return 'sudo pkg install';
        case 'macos_brew':
            return 'brew install';
        case 'windows_winget':
            return 'winget install';
        default:
            return '';
    }
}

// Function to setup copy button
function setupCopyButton() {
    const copyBtn = document.getElementById('copyCommandBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async function() {
            const commandText = document.getElementById('installation-command').textContent;
            
            if (commandText && commandText !== 'Select packages to generate installation command...' && commandText !== 'Please select an operating system') {
                try {
                    await navigator.clipboard.writeText(commandText);
                    
                    // Visual feedback
                    copyBtn.textContent = '✓ Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (error) {
                    console.error('Failed to copy:', error);
                    alert('Failed to copy to clipboard');
                }
            }
        });
    }
}

// Function to setup two-tier OS selector
function setupOSSelector() {
    const osBtns = document.querySelectorAll('.os-btn');
    const linuxSelector = document.getElementById('linuxDistroSelector');
    const distroBtns = document.querySelectorAll('.distro-btn');
    
    osBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and update ARIA
            osBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            
            // Add active class to clicked button and update ARIA
            this.classList.add('active');
            this.setAttribute('aria-checked', 'true');
            
            // Show/hide Linux distro selector
            const os = this.dataset.os;
            if (os === 'linux') {
                linuxSelector.classList.remove('hidden');
            } else {
                linuxSelector.classList.add('hidden');
            }
            
            // Trigger command generation
            autoGenerateCommand();
        });
    });
    
    // Setup distro button listeners
    distroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all distro buttons
            distroBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Trigger command generation
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

// Function to setup three-state select all checkbox
function setupSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const selectAllLabel = document.getElementById('selectAllLabel');
    
    if (!selectAllCheckbox || !selectAllLabel) {
        console.warn('Select all elements not found');
        return;
    }
    
    console.log('Setting up select all checkbox');
    
    // Handle select all checkbox change
    selectAllCheckbox.addEventListener('change', function() {
        const packageCheckboxes = document.querySelectorAll('.package-checkbox');
        const isChecked = this.checked;
        
        console.log('Select all clicked, found', packageCheckboxes.length, 'package checkboxes');
        
        // Set all package checkboxes to match the select all state
        packageCheckboxes.forEach(cb => cb.checked = isChecked);
        
        // Update category checkboxes
        updateAllCategoryCheckboxes();
        
        // Trigger command generation
        autoGenerateCommand();
    });
}

// Function to setup toggle all categories button
function setupToggleAllButton() {
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const toggleAllLabel = document.getElementById('toggleAllLabel');
    const toggleAllIcon = document.getElementById('toggleAllIcon');
    
    if (!toggleAllBtn) return;
    
    let allCollapsed = false;
    
    toggleAllBtn.addEventListener('click', function() {
        const categories = document.querySelectorAll('.category');
        
        if (allCollapsed) {
            // Expand all
            categories.forEach(cat => cat.classList.remove('collapsed'));
            toggleAllLabel.textContent = 'Collapse All';
            toggleAllBtn.classList.remove('collapsed');
            allCollapsed = false;
        } else {
            // Collapse all
            categories.forEach(cat => cat.classList.add('collapsed'));
            toggleAllLabel.textContent = 'Expand All';
            toggleAllBtn.classList.add('collapsed');
            allCollapsed = true;
        }
    });
}

// Function to update select all checkbox state based on package selections
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const selectAllLabel = document.getElementById('selectAllLabel');
    
    if (!selectAllCheckbox || !selectAllLabel) return;
    
    const packageCheckboxes = document.querySelectorAll('.package-checkbox');
    const checkedCount = Array.from(packageCheckboxes).filter(cb => cb.checked).length;
    const totalCount = packageCheckboxes.length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
        selectAllLabel.textContent = 'Select All';
    } else if (checkedCount === totalCount) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
        selectAllLabel.textContent = 'Deselect All';
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllLabel.textContent = 'Selected';
    }
}

// Function to update all category checkboxes
function updateAllCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(cb => {
        const category = cb.dataset.category;
        updateCategoryCheckbox(category);
    });
}

// Function to export selected packages (mocking data)
function exportPackages() {
    const categories = document.querySelectorAll('.category');
    const selectedPackages = [];

    categories.forEach(category => {
        const subcategories = category.querySelectorAll('.subcategory');
        subcategories.forEach(subcategory => {
            const checkboxes = subcategory.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                selectedPackages.push(checkbox.value);
            });
        });
    });

    const jsonData = JSON.stringify(selectedPackages, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'toolbox-exported-packages.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    alert('Selected packages exported successfully!');
}

// Function to trigger file input click
function importPackages() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = ''; // Reset input to allow re-importing same file
        fileInput.click();
    }
}

const fileInput = document.getElementById('fileInput');
if (fileInput) {
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Maximum size is 5MB.');
                return;
            }
            // Validate file type
            if (!file.name.endsWith('.json')) {
                alert('Please select a valid JSON file.');
                return;
            }
            importPackagesFromFile(file);
        }
    });
}

async function importPackagesFromFile(file) {
    if (!file) return;
    
    const reader = new FileReader();

    reader.onload = async function (event) {
        try {
            const contents = event.target.result;
            const importedPackages = JSON.parse(contents);
            
            // Validate that it's an array
            if (!Array.isArray(importedPackages)) {
                throw new Error('Invalid format: expected an array of package IDs');
            }
            
            console.log('Importing packages:', importedPackages);

            // Wait for packages to be loaded
            if (!packagesData) {
                await new Promise(resolve => {
                    document.addEventListener('packagesLoaded', resolve, { once: true });
                });
            }

            let importedCount = 0;
            let notFoundCount = 0;
            
            importedPackages.forEach(pkgId => {
                const checkbox = document.getElementById(pkgId);
                if (checkbox) {
                    checkbox.checked = true;
                    importedCount++;
                } else {
                    console.warn(`Checkbox with ID ${pkgId} not found.`);
                    notFoundCount++;
                }
            });
            
            // Update category checkboxes and command
            updateAllCategoryCheckboxes();
            updateSelectAllState();
            autoGenerateCommand();

            alert(`Packages imported successfully!\n${importedCount} packages selected${notFoundCount > 0 ? `\n${notFoundCount} packages not found` : ''}`);
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert(`Error importing packages: ${error.message}\n\nPlease check that the file is a valid JSON array of package IDs.`);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
}

async function loadFavorites() {
    try {
        const response = await fetch('pkgs/list/fav-packages.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load favorites: ${response.statusText}`);
        }
        
        const data = await response.json();
        const favorites = data.favorites || data;
        
        if (!Array.isArray(favorites)) {
            throw new Error('Invalid favorites format');
        }
        
        // Wait for packages to be loaded
        if (!packagesData) {
            await new Promise(resolve => {
                document.addEventListener('packagesLoaded', resolve, { once: true });
            });
        }
        
        // Deselect all first
        const checkboxes = document.querySelectorAll('.package-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        
        // Select favorites
        let loadedCount = 0;
        favorites.forEach(pkgId => {
            const checkbox = document.getElementById(pkgId);
            if (checkbox) {
                checkbox.checked = true;
                loadedCount++;
            } else {
                console.warn(`Checkbox with ID ${pkgId} not found.`);
            }
        });
        
        // Update category checkboxes and command
        updateAllCategoryCheckboxes();
        updateSelectAllState();
        autoGenerateCommand();
        
        alert(`${loadedCount} favorite packages loaded successfully!`);
    } catch (error) {
        console.error('Error loading favorites:', error);
        alert(`Error loading favorites: ${error.message}`);
    }
}

// URL of the JSON file
const jsonUrl = './pkgs/packages-info.json';
const imageUrl = './img/';
let packagesData; // Variable to store JSON data
let allSelected = false; // Variable to keep track of the toggle state

// Function to load and process the JSON
function loadPackages() {
    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load packages data: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            packagesData = data; // Assign JSON data to packagesData
            generatePackages(packagesData); // Call function to generate packages
        })
        .catch(error => {
            console.error('Error loading packages data: ', error);
        });
}

// Function to generate the content of packages in the form
function generatePackages(packagesData) {
    const packageContainer = document.getElementById('packageContainer');
    packageContainer.innerHTML = ''; // Clear container before adding new content

    // Define categories by column
    const columnCategories = [
        ["File Man"],
        ["Internet & Communication"],
        ["System"],
        ["Utility"],
        ["Virtualization"],
        ["Audio"],
        ["Image"],
        ["Video"],
        ["Development"],
        ["Gaming"],
        ["Office"],
        ["Reading"],
        ["Science"],
    ];

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

            const categoryHeading = document.createElement('h4');
            categoryHeading.textContent = category;
            categoryDiv.appendChild(categoryHeading);

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
                    categoryDiv.appendChild(subcategoryDiv);

                    const subcategoryHeading = document.createElement('h5');
                    subcategoryHeading.textContent = subcategory;
                    subcategoryDiv.appendChild(subcategoryHeading);

                    // Add packages to this subcategory (already sorted by the JSON sorter)
                    subcategories[subcategory].forEach(({ key: pkgKey, info: pkgInfo }) => {
                        const packageLabel = document.createElement('label');
                        const packageCheckbox = document.createElement('input');
                        packageCheckbox.type = 'checkbox';
                        packageCheckbox.name = 'pkg';
                        packageCheckbox.value = pkgKey; // Use package key as value
                        packageCheckbox.id = pkgKey;
                        packageCheckbox.dataset.packageName = pkgInfo.name; // Store package name as data attribute

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
}

// Function to generate the installation command based on the selected distribution
async function generateCommand() {
    console.log('Generate command button clicked');
    try {
        const selectedDistro = document.querySelector('input[name="distro"]:checked').value;

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

// Call the function to load JSON and generate packages on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPackages();
    
    // Add event listeners for OS selection highlighting
    document.querySelectorAll('input[name="distro"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove highlight from all OS groups
            document.querySelectorAll('.os-group').forEach(group => {
                group.classList.remove('selected');
            });
            
            // Add highlight to selected OS group
            const selectedGroup = this.closest('.os-group');
            if (selectedGroup) {
                selectedGroup.classList.add('selected');
            }
        });
    });
});

// Function to select or deselect all packages
function toggleSelectAllPackages() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = !allSelected;
    });
    // Toggle the state
    allSelected = !allSelected;
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

document.getElementById('fileInput').addEventListener('change', function (e) {
    importPackages(e.target.files[0]);
});

async function importPackages(file) {
    const reader = new FileReader();

    reader.onload = async function (event) {
        try {
            const contents = event.target.result;
            const importedPackages = JSON.parse(contents);
            console.log(importedPackages);

            // Simulate fetching data and processing checkboxes after a short delay
            await new Promise(resolve => setTimeout(resolve, 500));

            importedPackages.forEach(pkgId => {
                const checkbox = document.getElementById(pkgId);
                if (checkbox) {
                    checkbox.checked = true;
                } else {
                    console.warn(`Checkbox with ID ${pkgId} not found.`);
                }
            });

            alert('Packages imported successfully!');
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert('Error importing packages. Please check the JSON file format.');
        }
    };

    reader.readAsText(file);
}

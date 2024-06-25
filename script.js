// URL of the JSON file
const jsonUrl = './pkgs/packages-info.json';
const imageUrl = './img/';

let packagesData; // Variable to store JSON data

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

// Function to toggle select/deselect all packages
function toggleSelectAllPackages() {
    const checkboxes = document.querySelectorAll('input[name="pkg"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkbox.checked;
    });
}

// Function to generate the content of packages in the form
function generatePackages(packagesData) {
    const packageContainer = document.getElementById('packageContainer');
    packageContainer.innerHTML = ''; // Clear container before adding new content

    // Define categories by column
    const columnCategories = [
        ["File-Man", "File-Sharing", "Downloader"],
        ["Finance", "Science", "Utility"],
        ["Virtualization"],
        ["Web"],
        ["Audio"],
        ["Book", "Office"],
        ["Development"],
        ["Gaming"],
        ["Image"],
        ["Video"]
    ];

    // Create columns
    columnCategories.forEach(categoryList => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        packageContainer.appendChild(columnDiv);

        categoryList.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category', category);
            columnDiv.appendChild(categoryDiv);

            const categoryHeading = document.createElement('h4');
            categoryHeading.textContent = category;
            categoryDiv.appendChild(categoryHeading);

            const subcategories = {};

            Object.entries(packagesData.packages).forEach(([pkgKey, pkgInfo]) => {
                if (pkgInfo.category === category) {
                    const subcategory = pkgInfo.subcategory;
                    let subcategoryDiv = subcategories[subcategory];

                    if (!subcategoryDiv) {
                        subcategoryDiv = document.createElement('div');
                        subcategoryDiv.classList.add('subcategory', subcategory);
                        categoryDiv.appendChild(subcategoryDiv);

                        const subcategoryHeading = document.createElement('h5');
                        subcategoryHeading.textContent = subcategory;
                        subcategoryDiv.appendChild(subcategoryHeading);

                        subcategories[subcategory] = subcategoryDiv;
                    }

                    const packageLabel = document.createElement('label');
                    const packageCheckbox = document.createElement('input');
                    packageCheckbox.type = 'checkbox';
                    packageCheckbox.name = 'pkg';
                    packageCheckbox.value = pkgKey; // Use package key as value
                    packageCheckbox.dataset.packageName = pkgInfo.name; // Store package name as data attribute

                    const packageImg = document.createElement('img');
                    packageImg.src = `${imageUrl}${pkgKey}.svg`;
                    packageImg.width = 30;

                    packageLabel.appendChild(packageCheckbox);
                    packageLabel.appendChild(packageImg);
                    packageLabel.appendChild(document.createTextNode(` ${pkgInfo.name}`));

                    subcategoryDiv.appendChild(packageLabel);
                }
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
            } else if (selectedDistro === 'arch_pacman' && pkgInfo.package_manager['arch_aur']) {
                aurPackages.push(pkgInfo.package_manager['arch_aur']);
            } else {
                nonInstallablePackages.push(pkgInfo.name);
            }
        });

        let commandPrefix;

        switch (selectedDistro) {
            case 'arch_pacman':
                commandPrefix = 'sudo pacman -S';
                break;
            case 'debian_apt':
                commandPrefix = 'sudo apt install';
                break;
            case 'fedora_rpm':
                commandPrefix = 'sudo dnf install';
                break;
            case 'gentoo_emerge':
                commandPrefix = 'sudo emerge';
                break;
            case 'nixos_nix-env':
                commandPrefix = 'sudo nix-env -iA';
                break;
            case 'void_xbps':
                commandPrefix = 'sudo xbps-install -S';
                break;
            case 'linux_flatpak':
                commandPrefix = 'flatpak install';
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
document.addEventListener('DOMContentLoaded', loadPackages);

// URL del archivo JSON
const jsonUrl = './pkgs/packages-info.json';
const imageUrl = './img/';

let packagesData; // Variable para almacenar los datos del JSON

// Función para cargar y procesar el JSON
function loadPackages() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', jsonUrl, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            packagesData = JSON.parse(xhr.responseText); // Asignar los datos del JSON a packagesData
            generatePackages(packagesData); // Llamar a la función para generar los paquetes
        } else {
            console.error('Failed to load packages data: ', xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Network error while trying to load packages data.');
    };
    xhr.send();
}

// Función para seleccionar/deseleccionar todos los paquetes
function toggleSelectAllPackages() {
    const checkboxes = document.querySelectorAll('input[name="pkg"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkbox.checked;
    });
}

// Función para generar el contenido de los paquetes en el formulario
function generatePackages(packagesData) {
    const packageContainer = document.getElementById('packageContainer');
    packageContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevo contenido

    // Definir las categorías por columna
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

    // Crear columnas
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
                    packageCheckbox.value = pkgKey; // Usar el key del paquete como valor
                    packageCheckbox.dataset.packageName = pkgInfo.name; // Almacenar nombre del paquete como atributo de datos

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

// Función para obtener el tipo de paquete según la distribución
function getPackageType(distro) {
    switch (distro) {
        case 'arch':
            return 'arch_pacman';
        case 'debian':
            return 'debian_apt';
        case 'fedora':
            return 'fedora_rpm';
        case 'gentoo':
            return 'gentoo_emerge';
        case 'nixos':
            return 'nixos_nix-env';
        case 'void':
            return 'void_xbps';
        case 'flatpak':
            return 'linux_flatpak';
        case 'freebsd':
            return 'freebsd_pkg';
        case 'brew':
            return 'macos_brew';
        case 'winget':
            return 'windows_winget';
        default:
            return '';
    }
}

// Función para generar el comando de instalación según la distribución seleccionada
async function generateCommand() {
    console.log('Generate command button clicked');
    try {
        const selectedDistro = document.querySelector('input[name="distro"]:checked').value;

        const selectedPackages = Array.from(document.querySelectorAll('input[name="pkg"]:checked'))
            .map(checkbox => checkbox.value);

        const response = await fetch(jsonUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const packagesData = await response.json();

        const installationCommands = [];
        const aurPackages = [];
        const nonInstallablePackages = [];

        selectedPackages.forEach(pkg => {
            const packageInfo = packagesData.packages[pkg];
            if (!packageInfo) {
                nonInstallablePackages.push(pkg);
            } else {
                const packageDistroName = packageInfo.package_manager[getPackageType(selectedDistro)];
                if (packageDistroName) {
                    if (selectedDistro === 'arch' && packageDistroName.startsWith('aur_')) {
                        aurPackages.push(packageDistroName.substr(4)); // Remove 'aur_' prefix
                    } else {
                        installationCommands.push(packageDistroName);
                    }
                } else {
                    nonInstallablePackages.push(pkg);
                }
            }
        });

        let commandPrefix;
        switch (selectedDistro) {
            case 'arch':
                commandPrefix = 'sudo pacman -S';
                break;
            case 'debian':
                commandPrefix = 'sudo apt install';
                break;
            case 'fedora':
                commandPrefix = 'sudo dnf install';
                break;
            case 'gentoo':
                commandPrefix = 'sudo emerge';
                break;
            case 'nixos':
                commandPrefix = 'sudo nix-env -iA';
                break;
            case 'void':
                commandPrefix = 'sudo xbps-install -S';
                break;
            case 'flatpak':
                commandPrefix = 'flatpak install';
                break;
            case 'freebsd':
                commandPrefix = 'sudo pkg install';
                break;
            case 'brew':
                commandPrefix = 'brew install';
                break;
            case 'winget':
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
            nonInstallablePackagesElement.id = 'not-installable-packages';
            nonInstallablePackagesElement.innerHTML = `<strong>Packages not found:</strong> ${nonInstallablePackages.join(', ')}`;
            outputElement.appendChild(nonInstallablePackagesElement);
        }
    } catch (error) {
        alert(`There was an error generating the installation command: ${error.message}`);
    }
}


// Llamar a la función para cargar el JSON y generar los paquetes al cargar la página
loadPackages();



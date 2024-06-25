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
                    packageCheckbox.value = pkgInfo.name;

                    const packageImg = document.createElement('img');
                    packageImg.src = `${imageUrl}${pkgKey}.svg`;
                    packageImg.width = 20;

                    packageLabel.appendChild(packageCheckbox);
                    packageLabel.appendChild(packageImg);
                    packageLabel.appendChild(document.createTextNode(` ${pkgInfo.name}`));

                    subcategoryDiv.appendChild(packageLabel);
                }
            });
        });
    });
}

// Función para generar el comando de instalación según la distribución seleccionada
function generateCommand() {
    const form = document.getElementById('packageForm');
    const selectedPackages = form.querySelectorAll('input[name="pkg"]:checked');
    const selectedDistro = form.querySelector('input[name="distro"]:checked');

    if (!selectedDistro) {
        alert('Please select a distribution!');
        return;
    }

    const distroValue = selectedDistro.value;

    // Objeto para almacenar los nombres de los paquetes según la distribución seleccionada
    const packageNames = [];

    // Iterar sobre los paquetes seleccionados y agregar sus nombres al arreglo
    selectedPackages.forEach(packageCheckbox => {
        const packageName = packageCheckbox.value;
        packageNames.push(packageName);
    });

    // Construir el comando de instalación
    let command = 'Installation command:\n\n';

    switch (distroValue) {
        case 'arch':
            command += 'pacman -S ';
            break;
        case 'debian':
            command += 'apt install ';
            break;
        case 'fedora':
            command += 'dnf install ';
            break;
        case 'flatpak':
            command += 'flatpak install ';
            break;
        case 'brew':
            command += 'brew install ';
            break;
        case 'winget':
            command += 'winget install ';
            break;
        default:
            break;
    }

    // Agregar la lista de paquetes seleccionados al comando
    command += packageNames.join(' ');

    // Mostrar el comando generado dentro del elemento con ID 'installation-command'
    const installationCommandElement = document.getElementById('installation-command');
    installationCommandElement.textContent = command;
}

// Función para seleccionar/deseleccionar todos los paquetes
function toggleSelectAllPackages() {
    const checkboxes = document.querySelectorAll('input[name="pkg"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkbox.checked;
    });
}

// Llamar a la función para cargar el JSON y generar los paquetes al cargar la página
loadPackages();

// Módulo para renderizar la tabla de paquetes (desktop y mobile)
export function getPackagesJsonUrl() {
    const path = window.location.pathname;
    if (path.includes('mobile')) {
        return './pkgs/mobile-pkgs.json';
    } else if (path.includes('desktop')) {
        return './pkgs/desktop-pkgs.json';
    }
    return './pkgs/desktop-pkgs.json';
}

export function getVscodeExtensionsJsonUrl() {
    return './pkgs/vscode-extensions-pkgs.json';
}

function buildPlayStoreUrl(androidPackageName) {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(androidPackageName)}`;
}

function buildAppleStoreUrl(iosPackageName) {
    return `https://apps.apple.com/app/${iosPackageName}`;
}

function createLinkCell(url, label, iconText) {
    const cell = document.createElement('td');
    if (!url || url.trim() === '') {
        cell.textContent = '-';
        return cell;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('store-link');
    const icon = document.createElement('span');
    icon.classList.add('store-icon');
    icon.textContent = iconText;
    const text = document.createElement('span');
    text.textContent = label;
    link.appendChild(icon);
    link.appendChild(text);
    cell.appendChild(link);
    return cell;
}

export function renderPackagesTable(data) {
    const tbody = document.querySelector('#packagesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const packageEntries = Object.entries(data?.packages || {});
    packageEntries
        .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
        .forEach(([, pkgInfo]) => {
            const packageName = pkgInfo?.name || '-';
            const androidPackageName = pkgInfo?.package_manager?.android_pkg?.trim() || '';
            const iosPackageName = pkgInfo?.package_manager?.ios_pkg?.trim() || '';
            const row = document.createElement('tr');
            const packageNameCell = document.createElement('td');
            packageNameCell.textContent = packageName;
            const androidPackageCell = document.createElement('td');
            androidPackageCell.textContent = androidPackageName || '-';
            const iosPackageCell = document.createElement('td');
            iosPackageCell.textContent = iosPackageName || '-';
            const androidUrl = androidPackageName ? buildPlayStoreUrl(androidPackageName) : '';
            const iosUrl = iosPackageName ? buildAppleStoreUrl(iosPackageName) : '';
            const androidLinkCell = createLinkCell(androidUrl, 'Play Store', '▶');
            const iosLinkCell = createLinkCell(iosUrl, 'App Store', '');
            row.appendChild(packageNameCell);
            row.appendChild(androidPackageCell);
            row.appendChild(iosPackageCell);
            row.appendChild(androidLinkCell);
            row.appendChild(iosLinkCell);
            tbody.appendChild(row);
        });
}

export async function loadPackagesTable() {
    const tbody = document.querySelector('#packagesTable tbody');
    try {
        const response = await fetch(getPackagesJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load packages data: ${response.statusText}`);
        }
        const data = await response.json();
        renderPackagesTable(data);
    } catch (error) {
        console.error('Error loading table data:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5">Could not load package table.</td></tr>';
    }
}

function getExtensionIconPath(extensionId) {
    const fileName = extensionId.replace(/\./g, '-');
    return `./img/vscode-extensions/${fileName}.svg`;
}

function groupByCategory(items) {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
}

function getVscodeExtensionsFromData(data) {
    if (!data || !Array.isArray(data.extensions)) {
        return [];
    }
    return data.extensions;
}

function renderVscodeGenerator(items) {
    const container = document.getElementById('extensionsCategories');
    const commandTarget = document.getElementById('installation-command');
    const selectAll = document.getElementById('selectAllExtensions');
    const searchInput = document.getElementById('extensionsSearch');
    const copyBtn = document.getElementById('copyCommandBtn');

    if (!container || !commandTarget || !selectAll || !searchInput || !copyBtn) {
        return;
    }

    const state = {
        selected: new Set(),
    };

    const grouped = groupByCategory(items);
    const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    container.innerHTML = '';

    categories.forEach((category) => {
        const section = document.createElement('section');
        section.className = 'ext-category';

        const title = document.createElement('h3');
        title.textContent = category;
        section.appendChild(title);

        grouped[category]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((ext) => {
                const label = document.createElement('label');
                label.className = 'ext-item';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = ext.id;

                const icon = document.createElement('img');
                icon.className = 'ext-icon';
                icon.width = 18;
                icon.height = 18;
                icon.alt = `${ext.name} icon`;
                icon.src = getExtensionIconPath(ext.id);
                icon.addEventListener('error', () => {
                    icon.style.visibility = 'hidden';
                });

                const text = document.createElement('span');
                text.textContent = ext.name;

                input.addEventListener('change', () => {
                    if (input.checked) {
                        state.selected.add(ext.id);
                    } else {
                        state.selected.delete(ext.id);
                    }
                    updateCommand();
                    updateSelectAllState();
                });

                label.appendChild(input);
                label.appendChild(icon);
                label.appendChild(text);
                section.appendChild(label);
            });

        container.appendChild(section);
    });

    function getSortedSelectedExtensions() {
        return Array.from(state.selected).sort((a, b) => a.localeCompare(b));
    }

    function updateCommand() {
        const selected = getSortedSelectedExtensions();
        if (selected.length === 0) {
            commandTarget.textContent = 'Select extensions to generate command...';
            return;
        }

        commandTarget.textContent = `code --install-extension ${selected.join(' ')}`;
    }

    function updateSelectAllState() {
        const allBoxes = document.querySelectorAll('.ext-item input[type="checkbox"]');
        const checkedCount = Array.from(allBoxes).filter((el) => el.checked).length;

        selectAll.checked = checkedCount > 0 && checkedCount === allBoxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < allBoxes.length;
    }

    selectAll.addEventListener('change', () => {
        const allBoxes = document.querySelectorAll('.ext-item input[type="checkbox"]');
        state.selected.clear();

        allBoxes.forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
            if (selectAll.checked) {
                state.selected.add(checkbox.value);
            }
        });

        updateCommand();
        updateSelectAllState();
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const labels = document.querySelectorAll('.ext-item');
        labels.forEach((label) => {
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(query) ? '' : 'none';
        });
    });

    copyBtn.addEventListener('click', async () => {
        const command = commandTarget.textContent;
        if (!command || command.startsWith('Select extensions')) {
            return;
        }

        try {
            await navigator.clipboard.writeText(command);
            const original = copyBtn.textContent;
            copyBtn.textContent = 'Copied';
            setTimeout(() => {
                copyBtn.textContent = original;
            }, 1200);
        } catch (error) {
            console.error('Unable to copy command:', error);
        }
    });

    updateCommand();
}

function renderVscodeExtensionsTable(items) {
    const tbody = document.getElementById('extensionsTableBody');
    const countEl = document.getElementById('extensionsCount');
    if (!tbody || !countEl) {
        return;
    }

    tbody.innerHTML = '';

    items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((ext) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ext.name}</td>
                <td><code>${ext.id}</code></td>
                <td>${ext.category}</td>
            `;
            tbody.appendChild(row);
        });

    countEl.textContent = String(items.length);
}

export async function loadVscodeExtensionsGenerator() {
    try {
        const response = await fetch(getVscodeExtensionsJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load VS Code extensions data: ${response.statusText}`);
        }
        const data = await response.json();
        const items = getVscodeExtensionsFromData(data);
        renderVscodeGenerator(items);
    } catch (error) {
        console.error('Error loading VS Code generator data:', error);
    }
}

export async function loadVscodeExtensionsTable() {
    const input = document.getElementById('tableSearch');
    try {
        const response = await fetch(getVscodeExtensionsJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load VS Code extensions data: ${response.statusText}`);
        }
        const data = await response.json();
        const items = getVscodeExtensionsFromData(data);

        renderVscodeExtensionsTable(items);

        if (input) {
            input.addEventListener('input', () => {
                const query = input.value.trim().toLowerCase();
                const filtered = items.filter((ext) => (
                    ext.name.toLowerCase().includes(query)
                    || ext.id.toLowerCase().includes(query)
                    || ext.category.toLowerCase().includes(query)
                ));
                renderVscodeExtensionsTable(filtered);
            });
        }
    } catch (error) {
        console.error('Error loading VS Code table data:', error);
    }
}

function initSharedPages() {
    if (document.getElementById('extensionsCategories')) {
        loadVscodeExtensionsGenerator();
    }
    if (document.getElementById('extensionsTableBody')) {
        loadVscodeExtensionsTable();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSharedPages);
} else {
    initSharedPages();
}

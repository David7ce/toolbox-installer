// Módulo para renderizar la tabla de paquetes (desktop y mobile)
import { createCommandFooter } from './command-footer.js';

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

export function getBrowserExtensionsJsonUrl() {
    return './pkgs/browser-extensions-pkgs.json';
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
            const iosLinkCell = createLinkCell(iosUrl, 'App Store', 'Ó');
            row.appendChild(packageNameCell);
            row.appendChild(androidPackageCell);
            row.appendChild(iosPackageCell);
            row.appendChild(androidLinkCell);
            row.appendChild(iosLinkCell);
            tbody.appendChild(row);
        });
}

function getMobileTableItems(data) {
    const packageEntries = Object.entries(data?.packages || {});
    return packageEntries.map(([, pkgInfo]) => ({
        name: pkgInfo?.name || '-',
        androidPackageName: pkgInfo?.package_manager?.android_pkg?.trim() || '',
        iosPackageName: pkgInfo?.package_manager?.ios_pkg?.trim() || '',
    }));
}

function renderMobilePackagesRows(items) {
    const tbody = document.querySelector('#packagesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((item) => {
            const row = document.createElement('tr');
            const packageNameCell = document.createElement('td');
            packageNameCell.textContent = item.name;

            const androidPackageCell = document.createElement('td');
            androidPackageCell.textContent = item.androidPackageName || '-';

            const iosPackageCell = document.createElement('td');
            iosPackageCell.textContent = item.iosPackageName || '-';

            const androidUrl = item.androidPackageName ? buildPlayStoreUrl(item.androidPackageName) : '';
            const iosUrl = item.iosPackageName ? buildAppleStoreUrl(item.iosPackageName) : '';

            row.appendChild(packageNameCell);
            row.appendChild(androidPackageCell);
            row.appendChild(iosPackageCell);
            row.appendChild(createLinkCell(androidUrl, 'Play Store', '▶'));
            row.appendChild(createLinkCell(iosUrl, 'App Store', '◉'));
            tbody.appendChild(row);
        });
}

export async function loadPackagesTable() {
    const tbody = document.querySelector('#packagesTable tbody');
    const input = document.getElementById('searchInput');
    try {
        const response = await fetch(getPackagesJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load packages data: ${response.statusText}`);
        }
        const data = await response.json();

        if (window.location.pathname.includes('mobile-os-compatibility')) {
            const items = getMobileTableItems(data);
            renderMobilePackagesRows(items);

            if (input) {
                input.addEventListener('input', () => {
                    const query = input.value.trim().toLowerCase();
                    const filtered = items.filter((item) => (
                        item.name.toLowerCase().includes(query)
                        || item.androidPackageName.toLowerCase().includes(query)
                        || item.iosPackageName.toLowerCase().includes(query)
                    ));
                    renderMobilePackagesRows(filtered);
                });
            }
        } else {
            renderPackagesTable(data);
        }
    } catch (error) {
        console.error('Error loading table data:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5">Could not load package table.</td></tr>';
    }
}

function getExtensionIconPath(extensionId) {
    const fileName = extensionId.replace(/\./g, '-');
    return `./img/vscode-extensions/${fileName}.svg`;
}

function getBrowserExtensionIconPath(id) {
    return `./img/browser-extensions/${id}.png`;
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
    if (!data || !data.extensions || typeof data.extensions !== 'object' || Array.isArray(data.extensions)) {
        return [];
    }
    return Object.entries(data.extensions).map(([id, ext]) => ({ id, ...ext }));
}

const NON_FOSS_VSCODE_EXTENSIONS = new Set([
    'bmewburn.vscode-intelephense-client',
    'github.copilot-chat',
    'ms-python.vscode-pylance',
]);

const FAVORITE_VSCODE_EXTENSIONS = [
    'dbaeumer.vscode-eslint',
    'esbenp.prettier-vscode',
    'github.copilot-chat',
];

function renderVscodeGenerator(items) {
    const container = document.getElementById('extensionsCategories');
    const commandFooter = document.getElementById('commandFooter');
    const commandTarget = document.getElementById('installation-command');
    const selectAll = document.getElementById('selectAllCheckbox');
    const selectAllLabel = document.getElementById('selectAllLabel');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const toggleAllLabel = document.getElementById('toggleAllLabel');
    const fossToggleBtn = document.getElementById('fossToggleBtn');
    const optionsSelect = document.getElementById('optionsSelect');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput');
    const copyBtn = document.getElementById('copyCommandBtn');

    if (
        !container || !commandTarget || !selectAll || !selectAllLabel
        || !toggleAllBtn || !toggleAllLabel || !fossToggleBtn
        || !optionsSelect || !fileInput || !searchInput || !copyBtn
    ) {
        return;
    }

    const state = {
        selected: new Set(),
        searchQuery: '',
        fossOnly: false,
        allCollapsed: false,
    };

    const normalizedItems = items.map((item) => ({
        ...item,
        isFoss: !NON_FOSS_VSCODE_EXTENSIONS.has(item.id),
    }));

    const grouped = groupByCategory(normalizedItems);
    const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    container.innerHTML = '';

    categories.forEach((category) => {
        const section = document.createElement('section');
        section.className = 'column category';
        section.dataset.category = category;

        const header = document.createElement('div');
        header.className = 'category-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'true');

        const title = document.createElement('h4');
        title.textContent = category;

        const arrow = document.createElement('span');
        arrow.className = 'toggle-arrow';
        arrow.textContent = '▼';

        header.appendChild(title);
        header.appendChild(arrow);
        section.appendChild(header);

        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';

        grouped[category]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((ext) => {
                const label = document.createElement('label');
                label.className = 'ext-item';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = ext.id;
                input.dataset.extensionId = ext.id;

                const icon = document.createElement('img');
                icon.className = 'ext-icon';
                icon.width = 18;
                icon.height = 18;
                icon.alt = `${ext.name} icon`;
                icon.src = getExtensionIconPath(ext.id);
                icon.addEventListener('error', () => {
                    if (icon.src.endsWith('.svg')) {
                        icon.src = icon.src.replace('.svg', '.png');
                    } else {
                        icon.style.visibility = 'hidden';
                    }
                });

                const text = document.createElement('span');
                text.textContent = ext.name;

                label.dataset.search = `${ext.name} ${ext.id}`.toLowerCase();
                label.dataset.isFoss = ext.isFoss ? 'true' : 'false';

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
                categoryContent.appendChild(label);
            });

        const toggleCategory = () => {
            const collapsed = section.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!collapsed));
            updateGlobalCollapseState();
        };

        header.addEventListener('click', toggleCategory);
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleCategory();
            }
        });

        section.appendChild(categoryContent);
        container.appendChild(section);
    });

    function getAllExtensionCheckboxes() {
        return Array.from(container.querySelectorAll('.ext-item input[type="checkbox"]'));
    }

    function getVisibleExtensionCheckboxes() {
        return getAllExtensionCheckboxes().filter((checkbox) => {
            const label = checkbox.closest('.ext-item');
            return label && label.style.display !== 'none' && !label.classList.contains('foss-hidden');
        });
    }

    function getSortedSelectedExtensions() {
        return Array.from(state.selected).sort((a, b) => a.localeCompare(b));
    }

    function updateCommand() {
        const selected = getSortedSelectedExtensions();
        if (selected.length === 0) {
            commandTarget.textContent = 'Select extensions to generate command...';
            if (commandFooter) commandFooter.hidden = true;
            return;
        }

        commandTarget.textContent = `code --install-extension ${selected.join(' ')}`;
        if (commandFooter) commandFooter.hidden = false;
    }

    function applyFilters() {
        const labels = container.querySelectorAll('.ext-item');
        labels.forEach((label) => {
            const matchesSearch = label.dataset.search.includes(state.searchQuery);
            const isFoss = label.dataset.isFoss === 'true';
            const passesFoss = !state.fossOnly || isFoss;
            label.classList.toggle('foss-hidden', !passesFoss);
            label.style.display = matchesSearch && passesFoss ? '' : 'none';
        });
    }

    function updateSelectAllState() {
        const visibleBoxes = getVisibleExtensionCheckboxes();
        const checkedCount = visibleBoxes.filter((el) => el.checked).length;
        const totalCount = visibleBoxes.length;

        if (totalCount === 0 || checkedCount === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            selectAllLabel.textContent = 'Select';
            return;
        }

        if (checkedCount === totalCount) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
            selectAllLabel.textContent = 'Deselect';
            return;
        }

        selectAll.checked = false;
        selectAll.indeterminate = true;
        selectAllLabel.textContent = 'Selected';
    }

    function updateGlobalCollapseState() {
        const sections = Array.from(container.querySelectorAll('.category'));
        const collapsedCount = sections.filter((section) => section.classList.contains('collapsed')).length;

        state.allCollapsed = sections.length > 0 && collapsedCount === sections.length;
        toggleAllBtn.classList.toggle('collapsed', state.allCollapsed);
        toggleAllLabel.textContent = state.allCollapsed ? 'Expand' : 'Collapse';
    }

    function setAllCategoriesCollapsed(shouldCollapse) {
        const sections = container.querySelectorAll('.category');
        sections.forEach((section) => {
            section.classList.toggle('collapsed', shouldCollapse);
            const header = section.querySelector('.category-header');
            if (header) {
                header.setAttribute('aria-expanded', String(!shouldCollapse));
            }
        });
        updateGlobalCollapseState();
    }

    function setSelectionByIds(ids) {
        const targetIds = new Set(ids);
        state.selected.clear();

        getAllExtensionCheckboxes().forEach((checkbox) => {
            const shouldSelect = targetIds.has(checkbox.value);
            checkbox.checked = shouldSelect;
            if (shouldSelect) {
                state.selected.add(checkbox.value);
            }
        });

        updateCommand();
        updateSelectAllState();
    }

    selectAll.addEventListener('change', () => {
        const allBoxes = getVisibleExtensionCheckboxes();
        state.selected.clear();

        getAllExtensionCheckboxes().forEach((checkbox) => {
            checkbox.checked = false;
        });

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
        state.searchQuery = searchInput.value.trim().toLowerCase();
        applyFilters();
        updateSelectAllState();
    });

    toggleAllBtn.addEventListener('click', () => {
        setAllCategoriesCollapsed(!state.allCollapsed);
    });

    fossToggleBtn.addEventListener('click', () => {
        state.fossOnly = !state.fossOnly;
        fossToggleBtn.classList.toggle('active', state.fossOnly);
        applyFilters();
        updateSelectAllState();
    });

    optionsSelect.addEventListener('change', () => {
        const action = optionsSelect.value;
        if (!action) {
            return;
        }

        if (action === 'loadFavorites') {
            setSelectionByIds(FAVORITE_VSCODE_EXTENSIONS);
        }

        if (action === 'importPackages') {
            fileInput.value = '';
            fileInput.click();
        }

        if (action === 'exportPackages') {
            const payload = {
                extensions: getSortedSelectedExtensions(),
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'toolbox-vscode-extensions.json';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        optionsSelect.value = '';
    });

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const imported = Array.isArray(parsed)
                ? parsed
                : (Array.isArray(parsed.extensions) ? parsed.extensions : []);

            if (imported.length > 0) {
                setSelectionByIds(imported);
            }
        } catch (error) {
            console.error('Unable to import extensions JSON:', error);
        }
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

    applyFilters();
    setAllCategoriesCollapsed(false);
    updateCommand();
    updateSelectAllState();
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

function getBrowserExtensionsFromData(data) {
    if (!data || !data.extensions || typeof data.extensions !== 'object' || Array.isArray(data.extensions)) {
        return [];
    }
    return Object.entries(data.extensions).map(([id, ext]) => ({ id, ...ext }));
}

function buildFirefoxAddonUrl(slug) {
    if (!slug) return null;
    return `https://addons.mozilla.org/en-US/firefox/addon/${encodeURIComponent(slug)}/`;
}

function buildChromiumExtensionUrl(chromiumId) {
    if (!chromiumId) return null;
    return `https://chromewebstore.google.com/detail/${encodeURIComponent(chromiumId)}`;
}

function renderBrowserExtensionsGenerator(items) {
    const container = document.getElementById('browserExtensionsCategories');
    const commandFooter = document.getElementById('commandFooter');
    const commandTarget = document.getElementById('installation-command');
    const selectAll = document.getElementById('selectAllCheckbox');
    const selectAllLabel = document.getElementById('selectAllLabel');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const toggleAllLabel = document.getElementById('toggleAllLabel');
    const browserSelect = document.getElementById('browserSelect');
    const optionsSelect = document.getElementById('optionsSelect');
    const searchInput = document.getElementById('searchInput');
    const copyBtn = document.getElementById('copyCommandBtn');

    if (
        !container || !commandTarget || !selectAll || !selectAllLabel
        || !toggleAllBtn || !toggleAllLabel || !browserSelect
        || !optionsSelect || !searchInput || !copyBtn
    ) {
        return;
    }

    const state = {
        selected: new Set(),
        searchQuery: '',
        allCollapsed: false,
        browser: 'both',
    };

    const grouped = groupByCategory(items);
    const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    container.innerHTML = '';

    categories.forEach((category) => {
        const section = document.createElement('section');
        section.className = 'column category';
        section.dataset.category = category;

        const header = document.createElement('div');
        header.className = 'category-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'true');

        const title = document.createElement('h4');
        title.textContent = category;

        const arrow = document.createElement('span');
        arrow.className = 'toggle-arrow';
        arrow.textContent = '▼';

        header.appendChild(title);
        header.appendChild(arrow);
        section.appendChild(header);

        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';

        grouped[category]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((ext) => {
                const label = document.createElement('label');
                label.className = 'ext-item';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = ext.id;
                input.dataset.extensionId = ext.id;

                const text = document.createElement('span');
                text.textContent = ext.name;

                const icon = document.createElement('img');
                icon.className = 'ext-icon';
                icon.width = 18;
                icon.height = 18;
                icon.alt = `${ext.name} icon`;
                icon.src = getBrowserExtensionIconPath(ext.id);
                icon.addEventListener('error', () => {
                    icon.style.visibility = 'hidden';
                });

                label.dataset.search = `${ext.name} ${ext.id}`.toLowerCase();
                label.dataset.firefoxSlug = ext.firefox_slug || '';
                label.dataset.chromiumId = ext.chromium_id || '';

                input.addEventListener('change', () => {
                    if (input.checked) {
                        state.selected.add(ext.id);
                    } else {
                        state.selected.delete(ext.id);
                    }
                    updateLinks();
                    updateSelectAllState();
                });

                label.appendChild(input);
                label.appendChild(icon);
                label.appendChild(text);
                categoryContent.appendChild(label);
            });

        const toggleCategory = () => {
            const collapsed = section.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!collapsed));
            updateGlobalCollapseState();
        };

        header.addEventListener('click', toggleCategory);
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleCategory();
            }
        });

        section.appendChild(categoryContent);
        container.appendChild(section);
    });

    function getAllExtensionCheckboxes() {
        return Array.from(container.querySelectorAll('.ext-item input[type="checkbox"]'));
    }

    function getVisibleExtensionCheckboxes() {
        return getAllExtensionCheckboxes().filter((checkbox) => {
            const label = checkbox.closest('.ext-item');
            return label && label.style.display !== 'none';
        });
    }

    function updateLinks() {
        const selectedIds = Array.from(state.selected).sort((a, b) => a.localeCompare(b));
        if (selectedIds.length === 0) {
            commandTarget.textContent = 'Select extensions to generate install links...';
            if (commandFooter) commandFooter.hidden = true;
            return;
        }

        const selectedItems = items.filter((ext) => state.selected.has(ext.id));
        const lines = [];

        selectedItems
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((ext) => {
                const browser = state.browser;
                if (browser === 'firefox' || browser === 'both') {
                    const url = buildFirefoxAddonUrl(ext.firefox_slug);
                    if (url) lines.push(`[Firefox] ${ext.name}: ${url}`);
                }
                if (browser === 'chromium' || browser === 'both') {
                    const url = buildChromiumExtensionUrl(ext.chromium_id);
                    if (url) lines.push(`[Chromium] ${ext.name}: ${url}`);
                }
            });

        commandTarget.textContent = lines.length > 0
            ? lines.join('\n')
            : 'No store links available for selected browser.';
        if (commandFooter) commandFooter.hidden = false;
    }

    function applyFilters() {
        const labels = container.querySelectorAll('.ext-item');
        labels.forEach((label) => {
            const matchesSearch = label.dataset.search.includes(state.searchQuery);
            const browser = state.browser;
            let matchesBrowser = true;
            if (browser === 'firefox') {
                matchesBrowser = label.dataset.firefoxSlug !== '';
            } else if (browser === 'chromium') {
                matchesBrowser = label.dataset.chromiumId !== '';
            }
            label.style.display = matchesSearch && matchesBrowser ? '' : 'none';
        });
    }

    function updateSelectAllState() {
        const visibleBoxes = getVisibleExtensionCheckboxes();
        const checkedCount = visibleBoxes.filter((el) => el.checked).length;
        const totalCount = visibleBoxes.length;

        if (totalCount === 0 || checkedCount === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            selectAllLabel.textContent = 'Select';
            return;
        }

        if (checkedCount === totalCount) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
            selectAllLabel.textContent = 'Deselect';
            return;
        }

        selectAll.checked = false;
        selectAll.indeterminate = true;
        selectAllLabel.textContent = 'Selected';
    }

    function updateGlobalCollapseState() {
        const sections = Array.from(container.querySelectorAll('.category'));
        const collapsedCount = sections.filter((section) => section.classList.contains('collapsed')).length;

        state.allCollapsed = sections.length > 0 && collapsedCount === sections.length;
        toggleAllBtn.classList.toggle('collapsed', state.allCollapsed);
        toggleAllLabel.textContent = state.allCollapsed ? 'Expand' : 'Collapse';
    }

    function setAllCategoriesCollapsed(shouldCollapse) {
        const sections = container.querySelectorAll('.category');
        sections.forEach((section) => {
            section.classList.toggle('collapsed', shouldCollapse);
            const header = section.querySelector('.category-header');
            if (header) {
                header.setAttribute('aria-expanded', String(!shouldCollapse));
            }
        });
        updateGlobalCollapseState();
    }

    selectAll.addEventListener('change', () => {
        const allBoxes = getVisibleExtensionCheckboxes();
        state.selected.clear();

        getAllExtensionCheckboxes().forEach((checkbox) => {
            checkbox.checked = false;
        });

        allBoxes.forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
            if (selectAll.checked) {
                state.selected.add(checkbox.value);
            }
        });

        updateLinks();
        updateSelectAllState();
    });

    searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value.trim().toLowerCase();
        applyFilters();
        updateSelectAllState();
    });

    toggleAllBtn.addEventListener('click', () => {
        setAllCategoriesCollapsed(!state.allCollapsed);
    });

    browserSelect.addEventListener('change', () => {
        state.browser = browserSelect.value;
        applyFilters();
        updateLinks();
        updateSelectAllState();
    });

    optionsSelect.addEventListener('change', () => {
        const action = optionsSelect.value;
        if (!action) return;

        if (action === 'exportPackages') {
            const selectedSorted = Array.from(state.selected).sort((a, b) => a.localeCompare(b));
            const payload = { extensions: selectedSorted };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'toolbox-browser-extensions.json';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        optionsSelect.value = '';
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
            console.error('Unable to copy links:', error);
        }
    });

    applyFilters();
    setAllCategoriesCollapsed(false);
    updateLinks();
    updateSelectAllState();
}

export async function loadBrowserExtensionsGenerator() {
    try {
        const response = await fetch(getBrowserExtensionsJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load browser extensions data: ${response.statusText}`);
        }
        const data = await response.json();
        const items = getBrowserExtensionsFromData(data);
        renderBrowserExtensionsGenerator(items);
    } catch (error) {
        console.error('Error loading browser extensions generator data:', error);
    }
}

function initSharedPages() {
    if (document.getElementById('extensionsCategories')) {
        createCommandFooter({
            ariaLabel: 'Extension installation command',
            commandLabel: 'Install command:',
            initialText: 'Select extensions to generate command...',
        });
        loadVscodeExtensionsGenerator();
    }
    if (document.getElementById('extensionsTableBody')) {
        loadVscodeExtensionsTable();
    }
    if (document.getElementById('browserExtensionsCategories')) {
        createCommandFooter({
            ariaLabel: 'Extension install links',
            commandLabel: 'Install links:',
            initialText: 'Select extensions to generate install links...',
        });
        loadBrowserExtensionsGenerator();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSharedPages);
} else {
    initSharedPages();
}

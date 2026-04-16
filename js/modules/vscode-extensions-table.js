import { VSCODE_EXTENSIONS } from './vscode-extensions-data.js';

function renderTable(items) {
    const tbody = document.getElementById('extensionsTableBody');
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

    document.getElementById('extensionsCount').textContent = String(items.length);
}

function setupSearch() {
    const input = document.getElementById('tableSearch');

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();

        const filtered = VSCODE_EXTENSIONS.filter((ext) => {
            return (
                ext.name.toLowerCase().includes(query) ||
                ext.id.toLowerCase().includes(query) ||
                ext.category.toLowerCase().includes(query)
            );
        });

        renderTable(filtered);
    });
}

function init() {
    renderTable(VSCODE_EXTENSIONS);
    setupSearch();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

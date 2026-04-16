import { VSCODE_EXTENSIONS } from './vscode-extensions-data.js';

const state = {
    selected: new Set()
};

function groupByCategory(items) {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
}

function renderCategories() {
    const container = document.getElementById('extensionsCategories');
    const grouped = groupByCategory(VSCODE_EXTENSIONS);
    const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    container.innerHTML = '';

    categories.forEach((category) => {
        const section = document.createElement('section');
        section.className = 'ext-category';

        const title = document.createElement('h3');
        title.textContent = category;
        section.appendChild(title);

        grouped[category]
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((ext) => {
                const label = document.createElement('label');
                label.className = 'ext-item';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = ext.id;
                input.dataset.name = ext.name;
                input.addEventListener('change', () => {
                    if (input.checked) {
                        state.selected.add(ext.id);
                    } else {
                        state.selected.delete(ext.id);
                    }
                    updateCommand();
                    updateSelectAllState();
                });

                const text = document.createElement('span');
                text.textContent = ext.name;

                label.appendChild(input);
                label.appendChild(text);
                section.appendChild(label);
            });

        container.appendChild(section);
    });
}

function getSortedSelectedExtensions() {
    return Array.from(state.selected).sort((a, b) => a.localeCompare(b));
}

function updateCommand() {
    const target = document.getElementById('installation-command');
    const selected = getSortedSelectedExtensions();

    if (selected.length === 0) {
        target.textContent = 'Select extensions to generate command...';
        return;
    }

    const command = `code --install-extension ${selected.join(' ')}`;

    target.textContent = command;
}

function updateSelectAllState() {
    const allBoxes = document.querySelectorAll('.ext-item input[type="checkbox"]');
    const checkedCount = Array.from(allBoxes).filter((el) => el.checked).length;
    const selectAll = document.getElementById('selectAllExtensions');

    selectAll.checked = checkedCount > 0 && checkedCount === allBoxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < allBoxes.length;
}

function setupSelectAll() {
    const selectAll = document.getElementById('selectAllExtensions');

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
}

function setupSearch() {
    const search = document.getElementById('extensionsSearch');

    search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        const labels = document.querySelectorAll('.ext-item');

        labels.forEach((label) => {
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

function setupCopyButton() {
    const btn = document.getElementById('copyCommandBtn');

    btn.addEventListener('click', async () => {
        const command = document.getElementById('installation-command').textContent;
        if (!command || command.startsWith('Select extensions')) {
            return;
        }

        try {
            await navigator.clipboard.writeText(command);
            const original = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(() => {
                btn.textContent = original;
            }, 1200);
        } catch (error) {
            console.error('Unable to copy command:', error);
        }
    });
}

function init() {
    renderCategories();
    setupSelectAll();
    setupSearch();
    setupCopyButton();
    updateCommand();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * Library Installer
 * Select libraries by language/category and generate install command.
 */

// ============================================================================
// DATA
// ============================================================================

const CATEGORY_EMOJIS = {
    'Backend Framework': '🖥️',
    'HTTP Client': '🌐',
    'ORM / Database': '🗄️',
    'Testing': '🧪',
    'Logging': '📋',
    'Validation': '✅',
    'Auth / Security': '🔐',
};

const LIB_ICONS = {
    // JavaScript
    'express': '⚡',
    'fastify': '🚀',
    'hono': '🔥',
    'axios': '📡',
    'prisma': '🔮',
    'jest': '✅',
    'vitest': '⚡',
    'pino': '📝',
    'winston': '📝',
    'zod': '🛡️',
    'passport': '🔑',
    
    // Python
    'fastapi': '⚡',
    'flask': '🍶',
    'django': '🌍',
    'sqlalchemy': '🗄️',
    'pytest': '✅',
    'pydantic': '🛡️',
    
    // Java
    'spring-boot': '🍃',
    'spring': '🍃',
    'quarkus': '🚀',
    'hibernate': '🗄️',
    'junit': '✅',
    
    // C#
    'carter': '🚀',
    'efcore': '🗄️',
    'xunit': '✅',
    'moq': '🎭',
    
    // Go
    'gin': '🍸',
    'fiber': '⚡',
    'gorm': '🗄️',
    'testify': '✅',
    
    // Rust
    'axum': '⚡',
    'rocket': '🚀',
    'sqlx': '🗄️',
    'serde': '📦',
    
    // PHP
    'laravel': '🚀',
    'symfony': '🎭',
    'eloquent': '🗄️',
    'phpunit': '✅',
};

function getLibIcon(libName: string): string {
    const normalized = libName.toLowerCase().replace(/[^a-z0-9-]/g, '').split('-')[0];
    return LIB_ICONS[normalized] || '📦';
}

type LibEntry = { name: string; display?: string; badges: string[] };
type LangEntry = {
    label: string;
    emoji: string;
    manager: { name: string; cmd: string };
    categories: Record<string, LibEntry[]>;
};
type LangDataType = Record<string, LangEntry>;

let LANG_DATA: LangDataType = {};
// ============================================================================
// STATE
// ============================================================================

let selectedLang: string = 'javascript';
let selectedTool = 'maven';
let selectedLibs = new Set<string>();

// ============================================================================
// RENDER
// ============================================================================

function renderLangButtons() {
    const container = document.getElementById('langSelector');
    if (!container) return;
    container.innerHTML = '';
    for (const [key, lang] of Object.entries(LANG_DATA)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `os-btn${key === selectedLang ? ' active' : ''}`;
        btn.dataset.lang = key;
        btn.textContent = `${lang.emoji} ${lang.label}`;
        btn.addEventListener('click', () => selectLang(key));
        container.appendChild(btn);
    }
}

function renderJavaToolSelector() {
    const selector = document.getElementById('javaToolSelector');
    if (!selector) return;
    selector.style.display = selectedLang === 'java' ? 'flex' : 'none';
    const btns = selector.querySelectorAll('.distro-btn');
    btns.forEach(btn => btn.classList.toggle('active', (btn as HTMLElement).dataset.tool === selectedTool));
}

function renderCategories() {
    const container = document.getElementById('libContainer');
    if (!container) return;
    const langData = LANG_DATA[selectedLang];
    container.innerHTML = '';

    for (const [catName, libs] of Object.entries(langData.categories)) {
        const column = document.createElement('div');
        column.className = 'column';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'true');
        header.innerHTML = `
            <span class="category-emoji">${CATEGORY_EMOJIS[catName] ?? '📦'}</span>
            <h4>${catName}</h4>
            <span class="toggle-arrow">▼</span>
        `;
        const toggleCollapse = () => {
            const collapsed = column.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!collapsed));
        };
        header.addEventListener('click', toggleCollapse);
        header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapse(); } });
        column.appendChild(header);

        const content = document.createElement('div');
        content.className = 'category-content';

        for (const lib of libs) {
            const label = document.createElement('label');
            label.className = 'lib-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = lib.name;
            checkbox.checked = selectedLibs.has(lib.name);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) selectedLibs.add(lib.name);
                else selectedLibs.delete(lib.name);
                updateSelectAllState();
                updateCommand();
            });

            const nameSpan = document.createElement('span');
            nameSpan.className = 'lib-name';
            const icon = getLibIcon((lib as { name: string; badges: string[]; display?: string }).display ?? lib.name);
            nameSpan.textContent = `${icon} ${(lib as { name: string; badges: string[]; display?: string }).display ?? lib.name}`;

            const badgesDiv = document.createElement('div');
            badgesDiv.className = 'lib-badges';
            for (const badge of lib.badges) {
                const badgeSpan = document.createElement('span');
                badgeSpan.className = `badge badge-${badge}`;
                badgeSpan.textContent = badge;
                badgesDiv.appendChild(badgeSpan);
            }

            label.appendChild(checkbox);
            label.appendChild(nameSpan);
            label.appendChild(badgesDiv);
            content.appendChild(label);
        }

        column.appendChild(content);
        container.appendChild(column);
    }
}

function updateCommand() {
    const langData = LANG_DATA[selectedLang];
    const libs = Array.from(selectedLibs);
    const cmdEl = document.getElementById('installation-command');
    const langEl = document.getElementById('commandLanguage');
    const commandFooter = document.getElementById('commandFooter');
    if (!cmdEl || !langEl) return;

    if (libs.length === 0) {
        langEl.textContent = 'Install command:';
        cmdEl.textContent = 'Select libraries to generate install command...';
        if (commandFooter) commandFooter.hidden = true;
        return;
    }

    let managerLabel, cmd;

    if (selectedLang === 'java') {
        if (selectedTool === 'maven') {
            managerLabel = 'Java — Maven (pom.xml)';
            const deps = libs.map(lib => {
                const parts = lib.split(':');
                const groupId = parts[0];
                const artifactId = parts[1] ?? parts[0];
                return `<dependency>\n    <groupId>${groupId}</groupId>\n    <artifactId>${artifactId}</artifactId>\n</dependency>`;
            });
            cmd = `<!-- Add inside <dependencies> in pom.xml -->\n${deps.join('\n')}`;
        } else {
            managerLabel = 'Java — Gradle (build.gradle)';
            const deps = libs.map(lib => {
                const parts = lib.split(':');
                const groupId = parts[0];
                const artifactId = parts[1] ?? parts[0];
                return `implementation '${groupId}:${artifactId}'`;
            });
            cmd = `// Add inside dependencies { } in build.gradle\n${deps.join('\n')}`;
        }
    } else if (selectedLang === 'csharp') {
        managerLabel = 'C# — dotnet';
        cmd = libs.map(l => `dotnet add package ${l}`).join('\n');
    } else if (selectedLang === 'go') {
        managerLabel = 'Go — go get';
        cmd = `go get ${libs.map(l => `${l}@latest`).join(' ')}`;
    } else {
        managerLabel = `${langData.label} — ${langData.manager.name}`;
        cmd = `${langData.manager.cmd} ${libs.join(' ')}`;
    }

    langEl.textContent = managerLabel;
    cmdEl.textContent = cmd;
    if (commandFooter) commandFooter.hidden = false;
}

// ============================================================================
// ACTIONS
// ============================================================================

function selectLang(lang) {
    selectedLang = lang;
    selectedLibs.clear();
    const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
    if (searchInput) searchInput.value = '';
    renderLangButtons();
    renderJavaToolSelector();
    renderCategories();
    updateSelectAllState();
    updateCommand();
}

function selectTool(tool) {
    selectedTool = tool;
    renderJavaToolSelector();
    updateCommand();
}

function setupSearch() {
    const input = document.getElementById('searchInput') as HTMLInputElement | null;
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        document.querySelectorAll('.lib-item').forEach(label => {
            const name = label.querySelector('.lib-name')?.textContent?.toLowerCase() ?? '';
            label.classList.toggle('search-hidden', q !== '' && !name.includes(q));
        });
        updateSelectAllState();
    });
}

function setupSelectAll() {
    const checkbox = document.getElementById('selectAllCheckbox') as HTMLInputElement | null;
    const labelSpan = document.getElementById('selectAllLabel');
    if (!checkbox) return;
    checkbox.addEventListener('change', () => {
        const visible = getVisibleLibCheckboxes();
        visible.forEach(cb => {
            cb.checked = checkbox.checked;
            if (cb.checked) selectedLibs.add(cb.value);
            else selectedLibs.delete(cb.value);
        });
        if (labelSpan) labelSpan.textContent = checkbox.checked ? 'Deselect' : 'Select';
        updateCommand();
    });
}

function updateSelectAllState() {
    const checkbox = document.getElementById('selectAllCheckbox') as HTMLInputElement | null;
    const labelSpan = document.getElementById('selectAllLabel');
    if (!checkbox) return;
    const visible = getVisibleLibCheckboxes();
    const allChecked = visible.length > 0 && visible.every(cb => cb.checked);
    checkbox.checked = allChecked;
    checkbox.indeterminate = !allChecked && visible.some(cb => cb.checked);
    if (labelSpan) labelSpan.textContent = allChecked ? 'Deselect' : 'Select';
}

function getVisibleLibCheckboxes(): HTMLInputElement[] {
    return Array.from(document.querySelectorAll<HTMLInputElement>('.lib-item:not(.search-hidden) input[type="checkbox"]'));
}

function setupToggleAll() {
    const btn = document.getElementById('toggleAllBtn');
    const icon = document.getElementById('toggleAllIcon');
    const label = document.getElementById('toggleAllLabel');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const columns = document.querySelectorAll('#libContainer .column');
        const anyExpanded = Array.from(columns).some(col => !col.classList.contains('collapsed'));
        columns.forEach(col => col.classList.toggle('collapsed', anyExpanded));
        if (icon) icon.style.transform = anyExpanded ? 'rotate(-90deg)' : '';
        if (label) label.textContent = anyExpanded ? 'Expand' : 'Collapse';
    });
}

function setupOptionsSelect() {
    const sel = document.getElementById('optionsSelect') as HTMLSelectElement | null;
    if (!sel) return;
    sel.addEventListener('change', () => {
        const val = sel.value;
        sel.value = '';
        if (val === 'exportPackages') exportLibraries();
    });
}

function exportLibraries() {
    const data = { language: selectedLang, libraries: Array.from(selectedLibs) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedLang}-libraries.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function setupCopyButton() {
    const btn = document.getElementById('copyCommandBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const text = document.getElementById('installation-command')?.textContent?.trim() ?? '';
        if (!text || text.startsWith('Select')) return;
        const doFeedback = () => {
            btn.textContent = '✅ Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(doFeedback).catch(() => fallbackCopy(text, doFeedback));
        } else {
            fallbackCopy(text, doFeedback);
        }
    });
}

function fallbackCopy(text, callback) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); callback(); } catch (_) { /* noop */ }
    document.body.removeChild(ta);
}

function setupJavaToolButtons() {
    document.querySelectorAll('#javaToolSelector .distro-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTool((btn as HTMLElement).dataset.tool ?? ''));
    });
}

// ============================================================================
// INIT
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
    const res = await fetch(`${base}pkgs/lib-pkgs.json`);
    LANG_DATA = await res.json();
    renderLangButtons();
    renderJavaToolSelector();
    renderCategories();
    updateCommand();
    setupCopyButton();
    setupJavaToolButtons();
    setupSearch();
    setupSelectAll();
    setupToggleAll();
    setupOptionsSelect();
});
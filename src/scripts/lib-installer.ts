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

const LANG_DATA = {
    javascript: {
        label: 'JavaScript',
        emoji: '🟨',
        manager: { name: 'npm', cmd: 'npm install' },
        categories: {
            'Backend Framework': [
                { name: 'express', badges: ['popular'] },
                { name: 'fastify', badges: ['modern', 'lightweight'] },
                { name: 'hono', badges: ['modern', 'lightweight'] },
            ],
            'HTTP Client': [
                { name: 'axios', badges: ['popular'] },
                { name: 'ky', badges: ['modern', 'lightweight'] },
                { name: 'got', badges: ['modern'] },
            ],
            'ORM / Database': [
                { name: 'prisma', badges: ['popular', 'modern'] },
                { name: 'drizzle-orm', badges: ['modern', 'lightweight'] },
                { name: 'typeorm', badges: ['popular'] },
            ],
            'Testing': [
                { name: 'vitest', badges: ['modern', 'lightweight'] },
                { name: 'jest', badges: ['popular'] },
                { name: 'mocha', badges: ['popular'] },
            ],
            'Logging': [
                { name: 'pino', badges: ['modern', 'lightweight'] },
                { name: 'winston', badges: ['popular'] },
            ],
            'Validation': [
                { name: 'zod', badges: ['popular', 'modern'] },
                { name: 'yup', badges: ['popular'] },
                { name: 'valibot', badges: ['modern', 'lightweight'] },
            ],
            'Auth / Security': [
                { name: 'passport', badges: ['popular'] },
                { name: 'jose', badges: ['modern', 'lightweight'] },
                { name: 'better-auth', badges: ['modern'] },
            ],
        },
    },
    python: {
        label: 'Python',
        emoji: '🐍',
        manager: { name: 'pip', cmd: 'pip install' },
        categories: {
            'Backend Framework': [
                { name: 'fastapi', badges: ['popular', 'modern'] },
                { name: 'flask', badges: ['popular', 'lightweight'] },
                { name: 'django', badges: ['popular'] },
            ],
            'HTTP Client': [
                { name: 'httpx', badges: ['modern'] },
                { name: 'requests', badges: ['popular'] },
                { name: 'aiohttp', badges: ['popular'] },
            ],
            'ORM / Database': [
                { name: 'sqlalchemy', badges: ['popular'] },
                { name: 'tortoise-orm', badges: ['modern'] },
                { name: 'peewee', badges: ['lightweight'] },
            ],
            'Testing': [
                { name: 'pytest', badges: ['popular'] },
                { name: 'hypothesis', badges: ['modern'] },
                { name: 'factory-boy', badges: ['popular'] },
            ],
            'Logging': [
                { name: 'loguru', badges: ['popular', 'modern'] },
                { name: 'structlog', badges: ['modern'] },
            ],
            'Validation': [
                { name: 'pydantic', badges: ['popular', 'modern'] },
                { name: 'marshmallow', badges: ['popular'] },
                { name: 'cerberus', badges: ['lightweight'] },
            ],
            'Auth / Security': [
                { name: 'python-jose', badges: ['popular'] },
                { name: 'authlib', badges: ['modern'] },
                { name: 'passlib', badges: ['popular'] },
            ],
        },
    },
    java: {
        label: 'Java',
        emoji: '☕',
        manager: { name: 'Maven', cmd: 'maven' },
        categories: {
            'Backend Framework': [
                { name: 'org.springframework.boot:spring-boot-starter-web', display: 'Spring Boot Web', badges: ['popular'] },
                { name: 'io.quarkus:quarkus-resteasy-reactive', display: 'Quarkus RESTEasy', badges: ['modern'] },
                { name: 'io.micronaut:micronaut-http-server-netty', display: 'Micronaut HTTP', badges: ['modern', 'lightweight'] },
            ],
            'HTTP Client': [
                { name: 'com.squareup.okhttp3:okhttp', display: 'OkHttp', badges: ['popular'] },
                { name: 'com.squareup.retrofit2:retrofit', display: 'Retrofit', badges: ['popular'] },
                { name: 'io.github.openfeign:feign-core', display: 'Feign', badges: ['lightweight'] },
            ],
            'ORM / Database': [
                { name: 'org.hibernate.orm:hibernate-core', display: 'Hibernate ORM', badges: ['popular'] },
                { name: 'org.jooq:jooq', display: 'jOOQ', badges: ['popular', 'modern'] },
                { name: 'org.mybatis:mybatis', display: 'MyBatis', badges: ['popular'] },
            ],
            'Testing': [
                { name: 'org.junit.jupiter:junit-jupiter', display: 'JUnit 5', badges: ['popular'] },
                { name: 'org.mockito:mockito-core', display: 'Mockito', badges: ['popular'] },
                { name: 'org.assertj:assertj-core', display: 'AssertJ', badges: ['popular', 'modern'] },
            ],
            'Logging': [
                { name: 'ch.qos.logback:logback-classic', display: 'Logback', badges: ['popular'] },
                { name: 'org.apache.logging.log4j:log4j-core', display: 'Log4j 2', badges: ['popular'] },
            ],
            'Validation': [
                { name: 'org.hibernate.validator:hibernate-validator', display: 'Hibernate Validator', badges: ['popular'] },
                { name: 'jakarta.validation:jakarta.validation-api', display: 'Jakarta Validation', badges: ['popular'] },
            ],
            'Auth / Security': [
                { name: 'org.springframework.security:spring-security-core', display: 'Spring Security', badges: ['popular'] },
                { name: 'com.auth0:java-jwt', display: 'java-jwt', badges: ['popular'] },
                { name: 'com.nimbusds:nimbus-jose-jwt', display: 'nimbus-jose-jwt', badges: ['popular'] },
            ],
        },
    },
    csharp: {
        label: 'C#',
        emoji: '🔷',
        manager: { name: 'dotnet', cmd: 'dotnet add package' },
        categories: {
            'Backend Framework': [
                { name: 'Carter', badges: ['lightweight', 'modern'] },
                { name: 'FastEndpoints', badges: ['modern'] },
                { name: 'ServiceStack', badges: ['popular'] },
            ],
            'HTTP Client': [
                { name: 'Refit', badges: ['popular', 'modern'] },
                { name: 'RestSharp', badges: ['popular'] },
                { name: 'Flurl.Http', badges: ['lightweight'] },
            ],
            'ORM / Database': [
                { name: 'Microsoft.EntityFrameworkCore', badges: ['popular'] },
                { name: 'Dapper', badges: ['popular', 'lightweight'] },
                { name: 'NHibernate', badges: ['popular'] },
            ],
            'Testing': [
                { name: 'xunit', badges: ['popular', 'modern'] },
                { name: 'Moq', badges: ['popular'] },
                { name: 'FluentAssertions', badges: ['popular', 'modern'] },
            ],
            'Logging': [
                { name: 'Serilog', badges: ['popular', 'modern'] },
                { name: 'NLog', badges: ['popular'] },
            ],
            'Validation': [
                { name: 'FluentValidation', badges: ['popular', 'modern'] },
                { name: 'GuardClauses', badges: ['lightweight'] },
            ],
            'Auth / Security': [
                { name: 'Microsoft.AspNetCore.Authentication.JwtBearer', badges: ['popular'] },
                { name: 'BCrypt.Net-Next', badges: ['popular'] },
                { name: 'IdentityModel', badges: ['popular'] },
            ],
        },
    },
    go: {
        label: 'Go',
        emoji: '🐹',
        manager: { name: 'go get', cmd: 'go get' },
        categories: {
            'Backend Framework': [
                { name: 'github.com/gin-gonic/gin', display: 'Gin', badges: ['popular'] },
                { name: 'github.com/gofiber/fiber/v2', display: 'Fiber', badges: ['modern', 'lightweight'] },
                { name: 'github.com/labstack/echo/v4', display: 'Echo', badges: ['popular', 'lightweight'] },
            ],
            'HTTP Client': [
                { name: 'github.com/go-resty/resty/v2', display: 'Resty', badges: ['popular'] },
                { name: 'github.com/imroc/req/v3', display: 'req', badges: ['modern'] },
            ],
            'ORM / Database': [
                { name: 'gorm.io/gorm', display: 'GORM', badges: ['popular'] },
                { name: 'github.com/uptrace/bun', display: 'Bun', badges: ['modern', 'lightweight'] },
                { name: 'github.com/jmoiron/sqlx', display: 'sqlx', badges: ['popular', 'lightweight'] },
            ],
            'Testing': [
                { name: 'github.com/stretchr/testify', display: 'testify', badges: ['popular'] },
                { name: 'github.com/onsi/ginkgo/v2', display: 'Ginkgo', badges: ['popular'] },
                { name: 'github.com/vektra/mockery/v2', display: 'mockery', badges: ['popular'] },
            ],
            'Logging': [
                { name: 'go.uber.org/zap', display: 'Zap', badges: ['popular', 'modern'] },
                { name: 'github.com/rs/zerolog', display: 'zerolog', badges: ['modern', 'lightweight'] },
                { name: 'github.com/sirupsen/logrus', display: 'logrus', badges: ['popular'] },
            ],
            'Validation': [
                { name: 'github.com/go-playground/validator/v10', display: 'validator', badges: ['popular'] },
                { name: 'github.com/asaskevich/govalidator', display: 'govalidator', badges: ['popular'] },
            ],
            'Auth / Security': [
                { name: 'github.com/golang-jwt/jwt/v5', display: 'golang-jwt', badges: ['popular'] },
                { name: 'golang.org/x/oauth2', display: 'oauth2', badges: ['popular'] },
            ],
        },
    },
    rust: {
        label: 'Rust',
        emoji: '🦀',
        manager: { name: 'cargo add', cmd: 'cargo add' },
        categories: {
            'Backend Framework': [
                { name: 'axum', badges: ['popular', 'modern'] },
                { name: 'actix-web', badges: ['popular'] },
                { name: 'rocket', badges: ['popular'] },
            ],
            'HTTP Client': [
                { name: 'reqwest', badges: ['popular'] },
                { name: 'ureq', badges: ['lightweight'] },
                { name: 'hyper', badges: ['popular'] },
            ],
            'ORM / Database': [
                { name: 'sqlx', badges: ['popular', 'modern'] },
                { name: 'diesel', badges: ['popular'] },
                { name: 'sea-orm', badges: ['modern'] },
            ],
            'Testing': [
                { name: 'mockall', badges: ['popular'] },
                { name: 'rstest', badges: ['modern', 'lightweight'] },
                { name: 'proptest', badges: ['modern'] },
            ],
            'Logging': [
                { name: 'tracing', badges: ['popular', 'modern'] },
                { name: 'log', badges: ['popular', 'lightweight'] },
                { name: 'env_logger', badges: ['popular', 'lightweight'] },
            ],
            'Validation': [
                { name: 'validator', badges: ['popular'] },
                { name: 'garde', badges: ['modern'] },
            ],
            'Auth / Security': [
                { name: 'jsonwebtoken', badges: ['popular'] },
                { name: 'argon2', badges: ['popular', 'modern'] },
                { name: 'bcrypt', badges: ['popular'] },
            ],
        },
    },
    php: {
        label: 'PHP',
        emoji: '🐘',
        manager: { name: 'Composer', cmd: 'composer require' },
        categories: {
            'Backend Framework': [
                { name: 'laravel/framework', display: 'Laravel', badges: ['popular'] },
                { name: 'symfony/symfony', display: 'Symfony', badges: ['popular'] },
                { name: 'slim/slim', display: 'Slim', badges: ['lightweight'] },
            ],
            'HTTP Client': [
                { name: 'guzzlehttp/guzzle', display: 'Guzzle', badges: ['popular'] },
                { name: 'symfony/http-client', display: 'Symfony HTTP Client', badges: ['modern'] },
            ],
            'ORM / Database': [
                { name: 'doctrine/orm', display: 'Doctrine ORM', badges: ['popular'] },
                { name: 'illuminate/database', display: 'Eloquent', badges: ['popular'] },
                { name: 'cycle/orm', display: 'Cycle ORM', badges: ['modern'] },
            ],
            'Testing': [
                { name: 'phpunit/phpunit', display: 'PHPUnit', badges: ['popular'] },
                { name: 'pestphp/pest', display: 'Pest', badges: ['modern'] },
                { name: 'mockery/mockery', display: 'Mockery', badges: ['popular'] },
            ],
            'Logging': [
                { name: 'monolog/monolog', display: 'Monolog', badges: ['popular'] },
            ],
            'Validation': [
                { name: 'respect/validation', display: 'Respect Validation', badges: ['popular'] },
                { name: 'illuminate/validation', display: 'Laravel Validator', badges: ['popular'] },
                { name: 'rakit/validation', display: 'Rakit Validation', badges: ['lightweight'] },
            ],
            'Auth / Security': [
                { name: 'firebase/php-jwt', display: 'firebase/php-jwt', badges: ['popular'] },
                { name: 'lcobucci/jwt', display: 'lcobucci/jwt', badges: ['modern'] },
                { name: 'defuse/php-encryption', display: 'defuse/php-encryption', badges: ['popular'] },
            ],
        },
    },
};

// ============================================================================
// STATE
// ============================================================================

let selectedLang = 'javascript';
let selectedTool = 'maven';
let selectedLibs = new Set();

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
    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === selectedTool));
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
            nameSpan.textContent = lib.display ?? lib.name;

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
    const searchInput = document.getElementById('searchInput');
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
    const input = document.getElementById('searchInput');
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
    const checkbox = document.getElementById('selectAllCheckbox');
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
    const checkbox = document.getElementById('selectAllCheckbox');
    const labelSpan = document.getElementById('selectAllLabel');
    if (!checkbox) return;
    const visible = getVisibleLibCheckboxes();
    const allChecked = visible.length > 0 && visible.every(cb => cb.checked);
    checkbox.checked = allChecked;
    checkbox.indeterminate = !allChecked && visible.some(cb => cb.checked);
    if (labelSpan) labelSpan.textContent = allChecked ? 'Deselect' : 'Select';
}

function getVisibleLibCheckboxes() {
    return Array.from(document.querySelectorAll('.lib-item:not(.search-hidden) input[type="checkbox"]'));
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
    const sel = document.getElementById('optionsSelect');
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
        btn.addEventListener('click', () => selectTool(btn.dataset.tool));
    });
}

// ============================================================================
// INIT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
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

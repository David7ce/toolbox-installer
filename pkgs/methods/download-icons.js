const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..', '..');

const CONFIG = {
    timeoutMs: 15000,
    simpleIconsUrl: 'https://cdn.simpleicons.org/',
    apps: {
        targets: {
            mobile: path.join(__dirname, '..', 'packages-info-mobile.json'),
            desktop: path.join(__dirname, '..', 'packages-info-desktop.json')
        },
        outputDir: path.join(ROOT, 'img', 'apps')
    },
    vscode: {
        dataFile: path.join(ROOT, 'js', 'modules', 'vscode-extensions-data.js'),
        appsDir: path.join(ROOT, 'img', 'apps'),
        outputDir: path.join(ROOT, 'img', 'vscode-extensions')
    }
};

const APP_SLUG_OVERRIDES = {
    'authenticator': ['googleauthenticator', 'authy'],
    'bitwarden': ['bitwarden'],
    'bring': ['bring'],
    'chatgpt': ['openai', 'chatgpt'],
    'chrome': ['googlechrome', 'chrome'],
    'cpu-info': ['android', 'cpu'],
    'deepl': ['deepl'],
    'firefox': ['firefoxbrowser', 'firefox'],
    'fitotrack': ['fitbit'],
    'github': ['github'],
    'gmail': ['gmail'],
    'google-calendar': ['googlecalendar'],
    'google-drive': ['googledrive'],
    'google-maps': ['googlemaps'],
    'google-photos': ['googlephotos'],
    'google-translate': ['googletranslate'],
    'instagram': ['instagram'],
    'keepassxd': ['keepassxc'],
    'linkedin': ['linkedin'],
    'localsend': ['localsend'],
    'material-files': ['android'],
    'mega': ['mega'],
    'mullvad': ['mullvad'],
    'musicolet': ['musicbrainz'],
    'obsidian': ['obsidian'],
    'outlook': ['microsoftoutlook', 'outlook'],
    'pcacpdroid': ['wireshark'],
    'protonmail': ['protonmail', 'proton'],
    'raindrop': ['raindropdotio'],
    'sd-maid-2': ['android'],
    'spotify': ['spotify'],
    'steam': ['steam'],
    'stellarium': ['stellarium'],
    'stremio': ['stremio'],
    'tiktok': ['tiktok'],
    'trakt': ['trakt'],
    'vlc': ['vlcmediaplayer', 'vlc'],
    'weawow': ['weather'],
    'wikiloc': ['wikiloc'],
    'wikipedia': ['wikipedia'],
    'x': ['x', 'twitter'],
    'youtube': ['youtube'],
    'youtube-music': ['youtubemusic'],
    'zepp': ['amazfit']
};

const VSCODE_MAPPING = {
    'github.copilot-chat': { local: ['github.svg'] },
    'github.vscode-pull-request-github': { local: ['github.svg'] },
    'github.vscode-github-actions': { local: ['github.svg'] },
    'continue.continue': { slugs: ['openai', 'huggingface'] },

    'ms-python.python': { local: ['python.svg'] },
    'ms-python.vscode-pylance': { local: ['python.svg'] },
    'ms-python.debugpy': { local: ['python.svg'] },
    'ms-vscode.powershell': { local: ['putty.svg'], slugs: ['powershell'] },
    'bmewburn.vscode-intelephense-client': { slugs: ['php'] },
    'xdebug.php-debug': { slugs: ['php'] },
    'zobo.php-intellisense': { slugs: ['php'] },
    'redhat.vscode-xml': { slugs: ['redhat'] },
    'redhat.vscode-yaml': { slugs: ['redhat'] },
    'vue.volar': { slugs: ['vuedotjs'] },
    'rodrigovallades.es7-react-js-snippets': { slugs: ['react'] },

    'dbaeumer.vscode-eslint': { slugs: ['eslint'] },
    'esbenp.prettier-vscode': { slugs: ['prettier'] },
    'editorconfig.editorconfig': { slugs: ['editorconfig'] },
    'standard.vscode-standard': { slugs: ['javascript'] },

    'davidanson.vscode-markdownlint': { slugs: ['markdown'] },
    'bierner.markdown-mermaid': { slugs: ['mermaid'] },
    'yzane.markdown-pdf': { local: ['pandoc.svg'], slugs: ['adobeacrobatreader'] },
    'foam.foam-vscode': { slugs: ['markdown'] },

    'ms-vscode.live-server': { slugs: ['nginx'] },
    'ecmel.vscode-html-css': { slugs: ['html5'] },
    'dotjoshjohnson.xml': { local: ['files.svg'], slugs: ['w3c'] },

    'ms-azuretools.vscode-docker': { local: ['docker.svg'] },
    'ms-azuretools.vscode-containers': { local: ['docker.svg'] },
    'ms-kubernetes-tools.vscode-kubernetes-tools': { local: ['kubectl.svg'], slugs: ['kubernetes'] },

    'ms-vscode-remote.remote-ssh': { local: ['putty.svg'], slugs: ['openssh'] },
    'ms-vscode-remote.remote-wsl': { slugs: ['linux'] },
    'ms-vscode-remote.remote-containers': { local: ['docker.svg'] },
    'ms-vscode.remote-explorer': { local: ['tree.svg'], slugs: ['microsoft'] },

    'mtxr.sqltools': { local: ['postgresql.svg'] },
    'mtxr.sqltools-driver-mysql': { local: ['mariadb.svg'] },
    'cweijan.vscode-database-client2': { local: ['postgresql.svg'] },

    'ms-vscode.hexeditor': { local: ['files.svg'] },
    'gruntfuggly.todo-tree': { local: ['taskwarrior.svg'] },
    'dracula-theme.theme-dracula': { local: ['obsidian.svg'], slugs: ['dracula'] },
    'mechatroner.rainbow-csv': { local: ['files.svg'] },
    'firefox-devtools.vscode-firefox-debug': { local: ['firefox.svg'] }
};

function toSlug(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildCandidateSlugs(key, name, overrides = {}) {
    const candidates = new Set();
    const keySlug = toSlug(key);
    const nameSlug = toSlug(name || key);

    const add = (slug) => {
        if (!slug) return;
        const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (clean) candidates.add(clean);
    };

    if (overrides[key]) {
        overrides[key].forEach(add);
    }

    add(keySlug);
    add(keySlug.replace(/-/g, ''));
    add(nameSlug);
    add(nameSlug.replace(/-/g, ''));

    return Array.from(candidates);
}

function fetchText(url, timeoutMs = CONFIG.timeoutMs) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                resolve(fetchText(res.headers.location, timeoutMs));
                return;
            }

            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => resolve(data));
        });

        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error('Request timeout'));
        });

        req.on('error', reject);
    });
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function tryLocal(localNames, srcDir, outFile) {
    if (!localNames || localNames.length === 0) {
        return { ok: false };
    }

    for (const localName of localNames) {
        const src = path.join(srcDir, localName);
        try {
            await fs.copyFile(src, outFile);
            return { ok: true, source: `local:${localName}` };
        } catch (_) {
            // continue
        }
    }

    return { ok: false };
}

async function trySimpleIcons(slugs, outFile) {
    if (!slugs || slugs.length === 0) {
        return { ok: false };
    }

    for (const slug of slugs) {
        const url = `${CONFIG.simpleIconsUrl}${encodeURIComponent(slug)}`;
        try {
            const svg = await fetchText(url);
            if (!svg.includes('<svg')) {
                continue;
            }
            await fs.writeFile(outFile, svg, 'utf8');
            return { ok: true, source: `simpleicons:${slug}` };
        } catch (_) {
            // continue
        }
    }

    return { ok: false };
}

async function optimizeDir(dir) {
    const { spawnSync } = require('child_process');
    const result = spawnSync('npx', ['--yes', 'svgo', '-f', dir, '--multipass'], {
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });

    if (result.status !== 0) {
        throw new Error(`SVGO failed for ${dir}`);
    }
}

async function runApps(target) {
    const targets = target === 'all' ? ['mobile', 'desktop'] : [target];

    for (const t of targets) {
        const jsonPath = CONFIG.apps.targets[t];
        if (!jsonPath) {
            throw new Error('Invalid apps target. Use: mobile | desktop | all');
        }

        await ensureDir(CONFIG.apps.outputDir);

        const jsonRaw = await fs.readFile(jsonPath, 'utf8');
        const data = JSON.parse(jsonRaw);
        const packages = data.packages || {};

        const imageFiles = await fs.readdir(CONFIG.apps.outputDir);
        const imageSet = new Set(imageFiles.map((f) => f.toLowerCase()));

        const missing = Object.entries(packages)
            .filter(([key]) => !imageSet.has(`${key}.svg`.toLowerCase()))
            .map(([key, pkg]) => ({ key, name: pkg.name || key }));

        console.log(`Target: ${t}`);
        console.log(`Missing icons: ${missing.length}`);

        let downloaded = 0;
        const failed = [];

        for (const { key, name } of missing) {
            const outFile = path.join(CONFIG.apps.outputDir, `${key}.svg`);
            const slugs = buildCandidateSlugs(key, name, APP_SLUG_OVERRIDES);
            process.stdout.write(`Trying ${key}... `);
            const result = await trySimpleIcons(slugs, outFile);
            if (result.ok) {
                downloaded += 1;
                console.log(`OK (${result.source.replace('simpleicons:', '')})`);
            } else {
                failed.push(key);
                console.log('FAILED');
            }
        }

        console.log('\nSummary');
        console.log(`Downloaded: ${downloaded}`);
        console.log(`Failed: ${failed.length}`);
        if (failed.length > 0) {
            console.log('Missing keys:');
            failed.forEach((key) => console.log(`- ${key}`));
        }

        console.log('Optimizing app icons with SVGO...');
        await optimizeDir(CONFIG.apps.outputDir);
    }
}

function outVscodeName(id) {
    return `${id.replace(/\./g, '-')}.svg`;
}

function getVscodeIds(content) {
    return [...content.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
}

async function runVscode() {
    await ensureDir(CONFIG.vscode.outputDir);

    const content = await fs.readFile(CONFIG.vscode.dataFile, 'utf8');
    const ids = getVscodeIds(content);

    const failed = [];

    for (const id of ids) {
        const map = VSCODE_MAPPING[id] || {};
        const outFile = path.join(CONFIG.vscode.outputDir, outVscodeName(id));

        let result = await tryLocal(map.local, CONFIG.vscode.appsDir, outFile);

        if (!result.ok) {
            result = await trySimpleIcons(map.slugs, outFile);
        }

        if (!result.ok) {
            failed.push(id);
            console.log(`FAILED: ${id}`);
        } else {
            console.log(`OK: ${id} <- ${result.source}`);
        }
    }

    console.log(`\nGenerated: ${ids.length - failed.length}/${ids.length}`);
    if (failed.length > 0) {
        console.log('Still missing:');
        failed.forEach((id) => console.log(`- ${id}`));
    }

    console.log('Optimizing VS Code extension icons with SVGO...');
    await optimizeDir(CONFIG.vscode.outputDir);

    if (failed.length > 0) {
        process.exitCode = 1;
    }
}

async function main() {
    const mode = (process.argv[2] || 'apps').toLowerCase();

    if (mode === 'apps') {
        const target = (process.argv[3] || 'mobile').toLowerCase();
        await runApps(target);
        return;
    }

    if (mode === 'vscode') {
        await runVscode();
        return;
    }

    if (mode === 'all') {
        await runApps('all');
        await runVscode();
        return;
    }

    console.error('Invalid mode. Use:');
    console.error('  node pkgs/methods/download-icons.js apps mobile');
    console.error('  node pkgs/methods/download-icons.js apps desktop');
    console.error('  node pkgs/methods/download-icons.js apps all');
    console.error('  node pkgs/methods/download-icons.js vscode');
    console.error('  node pkgs/methods/download-icons.js all');
    process.exitCode = 1;
}

main().catch((error) => {
    console.error('Unexpected error:', error.message);
    process.exitCode = 1;
});

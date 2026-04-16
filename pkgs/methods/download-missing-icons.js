const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const CONFIG = {
    targets: {
        mobile: path.join(__dirname, '..', 'packages-info-mobile.json'),
        desktop: path.join(__dirname, '..', 'packages-info-desktop.json')
    },
    imageDir: path.join(__dirname, '..', '..', 'img', 'apps'),
    timeoutMs: 15000,
    simpleIconsUrl: 'https://cdn.simpleicons.org/'
};

const SLUG_OVERRIDES = {
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

function toSlug(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildCandidateSlugs(key, name) {
    const candidates = new Set();
    const keySlug = toSlug(key);
    const nameSlug = toSlug(name || key);

    const add = (slug) => {
        if (!slug) return;
        const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (clean) candidates.add(clean);
    };

    if (SLUG_OVERRIDES[key]) {
        SLUG_OVERRIDES[key].forEach(add);
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
                return resolve(fetchText(res.headers.location, timeoutMs));
            }

            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode}`));
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

async function downloadIconForKey(key, name, outputPath) {
    const slugs = buildCandidateSlugs(key, name);

    for (const slug of slugs) {
        const url = `${CONFIG.simpleIconsUrl}${encodeURIComponent(slug)}`;
        try {
            const svg = await fetchText(url);
            if (!svg.includes('<svg')) {
                continue;
            }
            await fs.writeFile(outputPath, svg, 'utf8');
            return { ok: true, slug, url };
        } catch (_) {
            // try next slug
        }
    }

    return { ok: false, slug: null, url: null };
}

async function getMissingPackages(jsonPath, imageDir) {
    const jsonRaw = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(jsonRaw);
    const packages = data.packages || {};

    const imageFiles = await fs.readdir(imageDir);
    const imageSet = new Set(imageFiles.map((f) => f.toLowerCase()));

    return Object.entries(packages)
        .filter(([key]) => !imageSet.has(`${key}.svg`.toLowerCase()))
        .map(([key, pkg]) => ({ key, name: pkg.name || key }));
}

async function main() {
    const target = (process.argv[2] || 'mobile').toLowerCase();

    if (!CONFIG.targets[target]) {
        console.error('Invalid target. Use: mobile | desktop');
        process.exitCode = 1;
        return;
    }

    const jsonPath = CONFIG.targets[target];
    const missing = await getMissingPackages(jsonPath, CONFIG.imageDir);

    console.log(`Target: ${target}`);
    console.log(`Missing icons: ${missing.length}`);

    let downloaded = 0;
    const failed = [];

    for (const { key, name } of missing) {
        const outFile = path.join(CONFIG.imageDir, `${key}.svg`);
        process.stdout.write(`Trying ${key}... `);
        const result = await downloadIconForKey(key, name, outFile);
        if (result.ok) {
            downloaded += 1;
            console.log(`OK (${result.slug})`);
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
}

main().catch((error) => {
    console.error('Unexpected error:', error.message);
    process.exitCode = 1;
});

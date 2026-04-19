const fs = require('fs').promises;
const fss = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');
const { CONFIG } = require('./constants');
const { toSlug } = require('./normalize');

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

function buildIconSlugCandidates(id, name, preferredSlug) {
    const slugs = new Set();

    const add = (slug) => {
        const clean = toSlug(slug).replace(/-/g, '');
        if (clean) {
            slugs.add(clean);
        }
        const dashed = toSlug(slug);
        if (dashed) {
            slugs.add(dashed);
        }
    };

    if (preferredSlug) {
        add(preferredSlug);
    }

    add(id);
    add(name);
    return Array.from(slugs);
}

function minifySvgText(svg) {
    return String(svg || '')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n|\r|\t/g, '')
        .trim();
}

function optimizeSvgFile(svgPath) {
    const result = spawnSync('npx', ['--yes', 'svgo', svgPath, '-o', svgPath, '--multipass'], {
        stdio: 'pipe',
        shell: process.platform === 'win32',
        encoding: 'utf8',
    });

    if (result.status === 0) {
        console.log(`SVG optimized with SVGO: ${path.relative(CONFIG.root, svgPath)}`);
        return;
    }

    const current = fss.readFileSync(svgPath, CONFIG.encoding);
    const minified = minifySvgText(current);
    fss.writeFileSync(svgPath, minified, CONFIG.encoding);
    console.log(`SVG optimized with fallback minifier: ${path.relative(CONFIG.root, svgPath)}`);
}

async function ensureIconForPackage(id, name, preferredSlug) {
    await fs.mkdir(CONFIG.iconOutputDir, { recursive: true });

    const outFile = path.join(CONFIG.iconOutputDir, `${id}.svg`);
    if (fss.existsSync(outFile)) {
        console.log(`Icon already exists: ${path.relative(CONFIG.root, outFile)}`);
        optimizeSvgFile(outFile);
        return;
    }

    const slugs = buildIconSlugCandidates(id, name, preferredSlug);
    for (const slug of slugs) {
        const url = `${CONFIG.simpleIconsUrl}${encodeURIComponent(slug)}`;
        try {
            const svg = await fetchText(url);
            if (svg.includes('<svg')) {
                await fs.writeFile(outFile, svg, CONFIG.encoding);
                console.log(`Icon downloaded using slug: ${slug}`);
                optimizeSvgFile(outFile);
                return;
            }
        } catch (_) {
            // Try next slug.
        }
    }

    if (fss.existsSync(CONFIG.fallbackIcon)) {
        await fs.copyFile(CONFIG.fallbackIcon, outFile);
        console.log('Icon fallback applied from files.svg');
        optimizeSvgFile(outFile);
        return;
    }

    throw new Error('Could not resolve an SVG icon and fallback icon is missing.');
}

module.exports = {
    ensureIconForPackage,
};

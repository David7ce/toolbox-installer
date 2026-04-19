const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
    encoding: 'utf8',
    indentation: 2,
};

function sortObjectByKey(input) {
    return Object.keys(input)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .reduce((acc, key) => {
            acc[key] = input[key];
            return acc;
        }, {});
}

function sortJsonData(data) {
    if (data && typeof data === 'object' && data.packages && typeof data.packages === 'object' && !Array.isArray(data.packages)) {
        return {
            sorted: { ...data, packages: sortObjectByKey(data.packages) },
            summary: `packages: ${Object.keys(data.packages).length}`,
        };
    }

    if (data && typeof data === 'object' && data.extensions && typeof data.extensions === 'object' && !Array.isArray(data.extensions)) {
        return {
            sorted: { ...data, extensions: sortObjectByKey(data.extensions) },
            summary: `extensions: ${Object.keys(data.extensions).length}`,
        };
    }

    return {
        sorted: data,
        summary: 'unsupported schema (skipped)',
        skipped: true,
    };
}

async function sortFile(filePath) {
    const resolved = path.resolve(filePath);
    const raw = await fs.readFile(resolved, CONFIG.encoding);
    const parsed = JSON.parse(raw);
    const { sorted, summary, skipped } = sortJsonData(parsed);

    if (skipped) {
        console.log(`Skipped ${path.basename(resolved)} -> ${summary}`);
        return;
    }

    await fs.writeFile(resolved, JSON.stringify(sorted, null, CONFIG.indentation), CONFIG.encoding);
    console.log(`Sorted ${path.basename(resolved)} -> ${summary}`);
}

async function main() {
    const args = process.argv.slice(2).filter(Boolean);

    if (args.length === 0) {
        console.error('Usage: sort-pkgs-az.js <file1.json> [file2.json ...]');
        process.exitCode = 1;
        return;
    }

    for (const filePath of args) {
        await sortFile(filePath);
    }
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
});
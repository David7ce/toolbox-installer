const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
    const inputs = [];
    let output = null;

    for (let i = 0; i < argv.length; i++) {
        if ((argv[i] === '--input' || argv[i] === '-i') && argv[i + 1]) {
            inputs.push(path.resolve(argv[++i]));
        } else if ((argv[i] === '--output' || argv[i] === '-o') && argv[i + 1]) {
            output = path.resolve(argv[++i]);
        } else if (!argv[i].startsWith('-')) {
            inputs.push(path.resolve(argv[i]));
        }
    }

    return { inputs, output };
}

function printUsage() {
    console.error('Usage: extract-pkgs.js --input <file.json> [--input <file2.json> ...] --output <out.json>');
    console.error('       extract-pkgs.js <file1.json> [file2.json ...] --output <out.json>');
}

function readPackages(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: file not found, skipping: ${filePath}`);
        return [];
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Object.entries(data.packages || {}).map(([key, pkg]) => {
        if (pkg && typeof pkg.name === 'string' && pkg.name.trim()) {
            return pkg.name.trim();
        }
        return key;
    });
}

const { inputs, output } = parseArgs(process.argv.slice(2));

if (inputs.length === 0 || !output) {
    printUsage();
    process.exitCode = 1;
} else {
    const names = Array.from(new Set(inputs.flatMap(readPackages)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(output, JSON.stringify({ packages: names }, null, 2), 'utf8');
    console.log(`Generated ${path.relative(process.cwd(), output)} with ${names.length} entries.`);
}

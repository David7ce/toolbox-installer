const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '..', 'packages-info.json');
const outputFile = path.resolve(__dirname, '..', 'list', 'list-packages.json');

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const entries = Object.entries(data.packages || {});

const names = entries
	.map(([key, pkg]) => (pkg && typeof pkg.name === 'string' && pkg.name.trim() ? pkg.name.trim() : key))
	.filter(Boolean);

const output = {
	packages: names
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');

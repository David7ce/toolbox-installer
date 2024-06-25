const fs = require('fs');

const inputFile = '../packages-info.json';

const outputFile = '../list/list-pkgs.txt';

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const names = Object.values(data.packages).map(pkg => pkg.name);

fs.writeFileSync(outputFile, names.join('\n'));

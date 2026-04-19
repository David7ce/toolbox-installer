const path = require('path');
const { spawnSync } = require('child_process');
const { CONFIG } = require('./constants');

const PKGS_DIR = path.join(CONFIG.root, 'pkgs');

function resolveTargetFiles(targetArg) {
    if (targetArg === 'all') {
        return ['desktop', 'mobile'].map((t) => path.join(PKGS_DIR, `${t}-pkgs.json`));
    }
    return [path.join(PKGS_DIR, `${targetArg}-pkgs.json`)];
}

function runSort(targetArg) {
    const sortScript = path.join(__dirname, '..', 'sort-pkgs-az.js');
    const targetFiles = resolveTargetFiles(targetArg);

    const result = spawnSync(process.execPath, [sortScript, ...targetFiles], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

    if (result.status !== 0) {
        throw new Error('Sorting failed.');
    }
}

module.exports = {
    runSort,
};

const path = require('path');
const { spawnSync } = require('child_process');
const { CONFIG } = require('./constants');

const PKGS_DIR = path.join(CONFIG.root, 'pkgs');

function runListExtraction() {
    const extractScript = path.join(__dirname, '..', 'extract-pkgs.js');
    const desktopFile = path.join(PKGS_DIR, 'desktop-pkgs.json');
    const mobileFile = path.join(PKGS_DIR, 'mobile-pkgs.json');
    const outputFile = path.join(PKGS_DIR, 'list', 'list-packages.json');

    const result = spawnSync(
        process.execPath,
        [extractScript, desktopFile, mobileFile, '--output', outputFile],
        { stdio: 'inherit', shell: process.platform === 'win32' },
    );

    if (result.status !== 0) {
        throw new Error('List extraction failed.');
    }
}

module.exports = {
    runListExtraction,
};

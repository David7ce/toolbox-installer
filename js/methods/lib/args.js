const { DESKTOP_PM_KEYS, MOBILE_PM_KEYS } = require('./constants');

function parseArgs(argv) {
    const args = {};

    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith('--')) {
            args[key] = true;
            continue;
        }

        args[key] = next;
        i += 1;
    }

    return args;
}

function printUsage() {
    console.log('Usage:');
    console.log('  node js/methods/add-package.js --target <desktop|mobile|all> --id <id> --name <name> --category <category> --subcategory <subcategory> [package manager fields] [--icon-slug <slug>] [--force]');
    console.log('');
    console.log('Desktop package manager fields:');
    console.log(`  ${DESKTOP_PM_KEYS.map((key) => `--${key} <value>`).join(' ')}`);
    console.log('Mobile package manager fields:');
    console.log(`  ${MOBILE_PM_KEYS.map((key) => `--${key} <value>`).join(' ')}`);
    console.log('');
    console.log('Examples:');
    console.log('  node js/methods/add-package.js --target desktop --id fxsound --name "FxSound" --category Audio --subcategory "Audio Processing" --windows_winget FxSoundLLC.FxSound');
    console.log('  node js/methods/add-package.js --target mobile --id fxsound --name "FxSound" --category Audio --subcategory "Audio Processing" --android_pkg com.fxsound.app --ios_pkg fxsound/id1234567890');
}

module.exports = {
    parseArgs,
    printUsage,
};

const fs = require('fs').promises;
const path = require('path');
const { CONFIG } = require('./constants');
const { buildPackageManager } = require('./normalize');

async function readJson(filePath) {
    const raw = await fs.readFile(filePath, CONFIG.encoding);
    return JSON.parse(raw);
}

async function writeJson(filePath, data) {
    const content = JSON.stringify(data, null, CONFIG.indentation);
    await fs.writeFile(filePath, content, CONFIG.encoding);
}

function getFileByTarget(target) {
    return target === 'desktop' ? CONFIG.desktopFile : CONFIG.mobileFile;
}

async function upsertPackage(target, basePackage, force) {
    const filePath = getFileByTarget(target);
    const data = await readJson(filePath);

    if (!data.packages || typeof data.packages !== 'object') {
        throw new Error(`Invalid JSON structure in ${path.basename(filePath)}: missing packages object.`);
    }

    if (data.packages[basePackage.id] && !force) {
        throw new Error(`Package ${basePackage.id} already exists in ${path.basename(filePath)}. Use --force to overwrite.`);
    }

    data.packages[basePackage.id] = {
        name: basePackage.name,
        category: basePackage.category,
        subcategory: basePackage.subcategory,
        package_manager: buildPackageManager(target, basePackage.rawArgs),
    };

    await writeJson(filePath, data);
    console.log(`Updated ${path.relative(CONFIG.root, filePath)} with package: ${basePackage.id}`);
}

module.exports = {
    upsertPackage,
};

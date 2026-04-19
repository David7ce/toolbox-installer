const { DESKTOP_PM_KEYS, MOBILE_PM_KEYS } = require('./constants');

function normalizeId(id) {
    return String(id || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toSlug(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parseDesktopValue(value) {
    if (value === undefined) {
        return null;
    }

    const trimmed = String(value).trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null') {
        return null;
    }

    return trimmed;
}

function parseMobileValue(value) {
    if (value === undefined) {
        return '';
    }
    return String(value).trim();
}

function buildPackageManager(target, args) {
    if (target === 'desktop') {
        return DESKTOP_PM_KEYS.reduce((acc, key) => {
            acc[key] = parseDesktopValue(args[key]);
            return acc;
        }, {});
    }

    return MOBILE_PM_KEYS.reduce((acc, key) => {
        acc[key] = parseMobileValue(args[key]);
        return acc;
    }, {});
}

function buildBasePackage(args) {
    const id = normalizeId(args.id);
    return {
        id,
        name: String(args.name || '').trim(),
        category: String(args.category || '').trim(),
        subcategory: String(args.subcategory || '').trim(),
        rawArgs: args,
    };
}

module.exports = {
    normalizeId,
    toSlug,
    buildPackageManager,
    buildBasePackage,
};

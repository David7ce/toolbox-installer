function ensureRequiredFields(args) {
    const required = ['target', 'id', 'name', 'category', 'subcategory'];
    const missing = required.filter((field) => !args[field] || String(args[field]).trim() === '');

    if (missing.length > 0) {
        throw new Error(`Missing required args: ${missing.join(', ')}`);
    }
}

function getTargets(targetArg) {
    const target = String(targetArg || '').toLowerCase();

    if (target === 'all') {
        return ['desktop', 'mobile'];
    }

    if (target === 'desktop' || target === 'mobile') {
        return [target];
    }

    throw new Error('Invalid --target. Use desktop, mobile, or all.');
}

function ensureValidPackage(basePackage) {
    if (!basePackage.id) {
        throw new Error('Invalid --id after normalization.');
    }
}

module.exports = {
    ensureRequiredFields,
    getTargets,
    ensureValidPackage,
};

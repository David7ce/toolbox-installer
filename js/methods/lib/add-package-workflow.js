const { ensureRequiredFields, getTargets, ensureValidPackage } = require('./validate');
const { buildBasePackage } = require('./normalize');
const { upsertPackage } = require('./repository');
const { ensureIconForPackage } = require('./icon-service');
const { runSort } = require('./sort-runner');
const { runListExtraction } = require('./list-runner');

async function runAddPackageWorkflow(args) {
    ensureRequiredFields(args);

    const basePackage = buildBasePackage(args);
    ensureValidPackage(basePackage);

    const targets = getTargets(args.target);
    const force = Boolean(args.force);

    for (const target of targets) {
        await upsertPackage(target, basePackage, force);
    }

    await ensureIconForPackage(basePackage.id, basePackage.name, args['icon-slug']);

    const sortTarget = targets.length === 2 ? 'all' : targets[0];
    runSort(sortTarget);
    runListExtraction();
}

module.exports = {
    runAddPackageWorkflow,
};

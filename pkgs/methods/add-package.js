const { parseArgs, printUsage } = require('./lib/args');
const { runAddPackageWorkflow } = require('./lib/add-package-workflow');

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help || args.h) {
        printUsage();
        return;
    }

    await runAddPackageWorkflow(args);
    console.log('Done. Package added with metadata, icon, and A-Z sorting.');
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    printUsage();
    process.exitCode = 1;
});

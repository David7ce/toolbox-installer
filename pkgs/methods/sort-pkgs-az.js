const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    jsonFile: path.join(__dirname, '..', 'packages-info.json'),
    encoding: 'utf8',
    indentation: 2
};

/**
 * Enhanced package sorting utility
 * Sorts packages alphabetically and validates data structure
 */
class PackageSorter {
    constructor(filePath) {
        this.filePath = filePath;
        this.stats = {
            totalPackages: 0,
            categories: new Set(),
            subcategories: new Set()
        };
    }

    /**
     * Main sorting function - simplified and async
     */
    async sortPackages() {
        try {
            console.log(`📁 Reading: ${path.resolve(this.filePath)}`);
            
            // Read and parse JSON
            const data = await fs.readFile(this.filePath, CONFIG.encoding);
            const packagesData = JSON.parse(data);

            if (!packagesData.packages) {
                throw new Error('Invalid JSON structure: missing "packages" property');
            }

            // Sort packages alphabetically
            const sortedPackages = this.createSortedPackages(packagesData.packages);
            
            // Create final JSON structure
            const sortedJSON = { packages: sortedPackages };
            
            // Write back to file
            const jsonString = JSON.stringify(sortedJSON, null, CONFIG.indentation);
            await fs.writeFile(this.filePath, jsonString, CONFIG.encoding);
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            if (error.code === 'ENOENT') {
                console.error(`📂 Expected file location: ${path.resolve(this.filePath)}`);
            }
        }
    }

    /**
     * Sort packages and collect statistics
     */
    createSortedPackages(packages) {
        const sortedPackages = {};
        
        // Sort package keys alphabetically and process each package
        Object.keys(packages)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .forEach(key => {
                const pkg = packages[key];
                sortedPackages[key] = pkg;
                
                // Collect statistics
                this.stats.totalPackages++;
                if (pkg.category) this.stats.categories.add(pkg.category);
                if (pkg.subcategory) this.stats.subcategories.add(pkg.subcategory);
            });

        return sortedPackages;
    }

    /**
     * Display sorting results and statistics
     */
    displayResults() {
        console.log('\n✅ Packages sorted successfully!');
        console.log(`📦 Total packages: ${this.stats.totalPackages}`);
        console.log(`📂 Categories: ${this.stats.categories.size}`);
        console.log(`🏷️  Subcategories: ${this.stats.subcategories.size}`);
        console.log(`💾 File saved: ${path.resolve(this.filePath)}`);
        
        // Optional: Show category breakdown
        if (this.stats.categories.size > 0) {
            console.log('\n📋 Categories found:');
            Array.from(this.stats.categories).sort().forEach(cat => {
                console.log(`   • ${cat}`);
            });
        }
    }
}

/**
 * Initialize and run the sorter
 */
async function main() {
    console.log('🔄 Package Sorter - Enhanced Version');
    console.log(`📍 Working directory: ${process.cwd()}`);
    
    const sorter = new PackageSorter(CONFIG.jsonFile);
    await sorter.sortPackages();
}

// Run the script
main().catch(console.error);
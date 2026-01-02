const fs = require('fs').promises;
const path = require('path');

async function auditImages(directory) {
    console.log(`🔍 Auditing images in: ${directory}\n`);
    
    try {
        const files = await fs.readdir(directory, { withFileTypes: true });
        const results = {
            total: 0,
            oversized: [],
            unoptimized: [],
            missingWebP: [],
            totalSize: 0
        };
        
        for (const file of files) {
            if (file.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
                const filePath = path.join(directory, file.name);
                const stats = await fs.stat(filePath);
                const sizeKB = stats.size / 1024;
                
                results.total++;
                results.totalSize += stats.size;
                
                // Check if oversized (> 200KB)
                if (sizeKB > 200) {
                    results.oversized.push({
                        name: file.name,
                        size: sizeKB.toFixed(2)
                    });
                }
                
                // Check for WebP version
                const webpName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                const webpPath = path.join(directory, webpName);
                try {
                    await fs.access(webpPath);
                } catch {
                    results.missingWebP.push(file.name);
                }
            }
        }
        
        // Print report
        console.log('═'.repeat(50));
        console.log('📊 IMAGE AUDIT REPORT');
        console.log('═'.repeat(50));
        console.log(`Total Images: ${results.total}`);
        console.log(`Total Size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Average Size: ${(results.totalSize / results.total / 1024).toFixed(2)} KB\n`);
        
        if (results.oversized.length > 0) {
            console.log(`⚠️  Oversized Images (> 200KB): ${results.oversized.length}`);
            results.oversized.forEach((img, idx) => {
                if (idx < 10) { // Show first 10
                    console.log(`   ${idx + 1}. ${img.name}: ${img.size} KB`);
                }
            });
            if (results.oversized.length > 10) {
                console.log(`   ... and ${results.oversized.length - 10} more`);
            }
            console.log('');
        }
        
        if (results.missingWebP.length > 0) {
            console.log(`⚠️  Missing WebP Version: ${results.missingWebP.length}`);
            results.missingWebP.slice(0, 10).forEach((img, idx) => {
                console.log(`   ${idx + 1}. ${img}`);
            });
            if (results.missingWebP.length > 10) {
                console.log(`   ... and ${results.missingWebP.length - 10} more`);
            }
            console.log('');
        }
        
        // Recommendations
        console.log('💡 Recommendations:');
        if (results.oversized.length > 0) {
            console.log('   - Compress oversized images to under 200KB');
        }
        if (results.missingWebP.length > 0) {
            console.log('   - Create WebP versions for better compression');
        }
        if (results.totalSize / 1024 / 1024 > 5) {
            console.log('   - Total image size is high, consider lazy loading');
        }
        
        console.log('\n✅ Audit complete!\n');
        
    } catch (error) {
        console.error('❌ Audit failed:', error);
        process.exit(1);
    }
}

// Get directory from command line or use default
const directory = process.argv[2] || 'src/images';
auditImages(directory);
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...\n');
    
    const sourceDir = 'src/images';
    const outputDir = 'dist/images/optimized';
    
    try {
        // Ensure directories exist
        await fs.mkdir(outputDir, { recursive: true });
        
        // Get all images
        const files = await fs.readdir(sourceDir);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif)$/i.test(file)
        );
        
        if (imageFiles.length === 0) {
            console.log('⚠️  No images found in', sourceDir);
            return;
        }
        
        console.log(`Found ${imageFiles.length} images to optimize\n`);
        
        let totalOriginal = 0;
        let totalOptimized = 0;
        
        // Optimize each image
        for (const file of imageFiles) {
            const filePath = path.join(sourceDir, file);
            const stats = await fs.stat(filePath);
            const originalSize = stats.size;
            totalOriginal += originalSize;
            
            console.log(`Processing: ${file} (${(originalSize / 1024).toFixed(2)} KB)`);
            
            // Optimize original format
            await imagemin([filePath], {
                destination: outputDir,
                plugins: [
                    imageminMozjpeg({ 
                        quality: 80, 
                        progressive: true 
                    }),
                    imageminPngquant({ 
                        quality: [0.7, 0.8] 
                    })
                ]
            });
            
            // Create WebP version
            await imagemin([filePath], {
                destination: outputDir,
                plugins: [
                    imageminWebp({ 
                        quality: 80 
                    })
                ]
            });
            
            // Check optimized sizes
            const optimizedPath = path.join(outputDir, file);
            const webpPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
            
            if (await exists(optimizedPath)) {
                const optimizedStats = await fs.stat(optimizedPath);
                totalOptimized += optimizedStats.size;
                const savings = ((1 - optimizedStats.size / originalSize) * 100).toFixed(1);
                console.log(`  ✓ Optimized: ${(optimizedStats.size / 1024).toFixed(2)} KB (${savings}% smaller)`);
            }
            
            if (await exists(webpPath)) {
                const webpStats = await fs.stat(webpPath);
                const savings = ((1 - webpStats.size / originalSize) * 100).toFixed(1);
                console.log(`  ✓ WebP: ${(webpStats.size / 1024).toFixed(2)} KB (${savings}% smaller)`);
            }
            
            console.log('');
        }
        
        // Generate report
        console.log('═'.repeat(50));
        console.log('📊 OPTIMIZATION REPORT');
        console.log('═'.repeat(50));
        console.log(`Total Original Size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Total Optimized Size: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Total Savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
        console.log(`Files Processed: ${imageFiles.length}`);
        console.log('═'.repeat(50));
        
        console.log('\n✅ Image optimization complete!\n');
        
    } catch (error) {
        console.error('❌ Error during optimization:', error);
        process.exit(1);
    }
}

async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

// Run optimization
optimizeImages();
const { minify } = require('terser');
const fs = require('fs').promises;
const path = require('path');

async function buildJS() {
    console.log('⚡ Building JavaScript...\n');
    
    try {
        const jsDir = 'src/js';
        const files = await fs.readdir(jsDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        if (jsFiles.length === 0) {
            console.log('⚠️  No JavaScript files found');
            return;
        }
        
        // Read all JS files
        let combinedJS = '';
        for (const file of jsFiles) {
            const content = await fs.readFile(path.join(jsDir, file), 'utf8');
            combinedJS += `\n/* ${file} */\n${content}\n`;
        }
        
        // Minify
        const result = await minify(combinedJS, {
            compress: {
                dead_code: true,
                drop_console: false, // Keep console in production? Set to true to remove
                drop_debugger: true,
                keep_classnames: false,
                keep_fnames: false,
                passes: 2
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false
            },
            sourceMap: {
                filename: 'bundle.min.js',
                url: 'bundle.min.js.map'
            }
        });
        
        // Ensure output directory exists
        await fs.mkdir('dist/js', { recursive: true });
        
        // Write minified JS
        await fs.writeFile('dist/js/bundle.min.js', result.code);
        
        // Write source map
        if (result.map) {
            await fs.writeFile('dist/js/bundle.min.js.map', result.map);
        }
        
        // Calculate savings
        const originalSize = Buffer.byteLength(combinedJS);
        const minifiedSize = Buffer.byteLength(result.code);
        const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        
        console.log(`✓ JavaScript minified: ${(originalSize/1024).toFixed(2)} KB → ${(minifiedSize/1024).toFixed(2)} KB`);
        console.log(`  Savings: ${savings}%`);
        console.log(`  Files bundled: ${jsFiles.length}`);
        console.log(`  Source map: ${result.map ? 'Generated' : 'Not generated'}\n`);
        
        console.log('✅ JavaScript build complete!\n');
        
    } catch (error) {
        console.error('❌ JavaScript build failed:', error);
        process.exit(1);
    }
}

buildJS();
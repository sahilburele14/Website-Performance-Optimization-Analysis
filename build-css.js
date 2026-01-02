const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const fs = require('fs').promises;
const path = require('path');

async function buildCSS() {
    console.log('🎨 Building CSS...\n');
    
    try {
        // Read main CSS
        const cssPath = 'src/css/main.css';
        const css = await fs.readFile(cssPath, 'utf8');
        
        // Process CSS
        const result = await postcss([
            autoprefixer,
            cssnano({
                preset: ['default', {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                    minifyFontValues: true,
                    minifySelectors: true,
                    reduceIdents: false // Keep keyframe names
                }]
            })
        ]).process(css, { 
            from: cssPath, 
            to: 'dist/css/main.min.css' 
        });
        
        // Ensure output directory exists
        await fs.mkdir('dist/css', { recursive: true });
        
        // Write minified CSS
        await fs.writeFile('dist/css/main.min.css', result.css);
        
        // Calculate savings
        const originalSize = Buffer.byteLength(css);
        const minifiedSize = Buffer.byteLength(result.css);
        const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        
        console.log(`✓ CSS minified: ${(originalSize/1024).toFixed(2)} KB → ${(minifiedSize/1024).toFixed(2)} KB`);
        console.log(`  Savings: ${savings}%\n`);
        
        // Extract critical CSS
        await extractCriticalCSS(css);
        
        console.log('✅ CSS build complete!\n');
        
    } catch (error) {
        console.error('❌ CSS build failed:', error);
        process.exit(1);
    }
}

async function extractCriticalCSS(fullCSS) {
    // Simple critical CSS extraction
    const criticalSelectors = [
        'body', 'html', '*', '.header', '.hero', '.logo', '.nav',
        'h1', 'h2', '.container', '.cta-button'
    ];
    
    const lines = fullCSS.split('\n');
    const criticalLines = [];
    let inCriticalBlock = false;
    
    for (const line of lines) {
        // Check if line contains a critical selector
        if (criticalSelectors.some(selector => line.includes(selector))) {
            inCriticalBlock = true;
        }
        
        if (inCriticalBlock) {
            criticalLines.push(line);
            if (line.includes('}')) {
                inCriticalBlock = false;
            }
        }
    }
    
    const criticalCSS = criticalLines.join('\n');
    await fs.writeFile('dist/css/critical.css', criticalCSS);
    
    console.log('✓ Critical CSS extracted');
    console.log(`  Size: ${(Buffer.byteLength(criticalCSS)/1024).toFixed(2)} KB\n`);
}

buildCSS();
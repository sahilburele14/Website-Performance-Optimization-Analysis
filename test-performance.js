const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;

async function testPerformance(url) {
    console.log(`🧪 Testing performance for: ${url}\n`);
    
    let chrome;
    
    try {
        // Launch Chrome
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--no-sandbox']
        });
        
        const options = {
            logLevel: 'info',
            output: ['html', 'json'],
            onlyCategories: ['performance'],
            port: chrome.port
        };
        
        // Run Lighthouse
        const runnerResult = await lighthouse(url, options);
        
        // Extract scores
        const report = runnerResult.lhr;
        const performanceScore = Math.round(report.categories.performance.score * 100);
        
        console.log('\n═'.repeat(50));
        console.log(`📊 PERFORMANCE SCORE: ${performanceScore}/100`);
        console.log('═'.repeat(50));
        
        // Core Web Vitals
        const metrics = report.audits;
        console.log('\n📈 Core Web Vitals:');
        console.log(`  First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
        console.log(`  Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
        console.log(`  Total Blocking Time: ${metrics['total-blocking-time'].displayValue}`);
        console.log(`  Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
        console.log(`  Speed Index: ${metrics['speed-index'].displayValue}`);
        
        // Opportunities
        console.log('\n💡 Top Opportunities:');
        const opportunities = Object.values(metrics)
            .filter(audit => audit.details && audit.details.type === 'opportunity')
            .sort((a, b) => b.numericValue - a.numericValue)
            .slice(0, 5);
        
        opportunities.forEach((opp, idx) => {
            console.log(`  ${idx + 1}. ${opp.title}`);
            console.log(`     Potential savings: ${opp.displayValue}`);
        });
        
        // Save reports
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlReport = runnerResult.report[0];
        const jsonReport = runnerResult.report[1];
        
        await fs.writeFile(`performance-report-${timestamp}.html`, htmlReport);
        await fs.writeFile(`performance-report-${timestamp}.json`, jsonReport);
        
        console.log('\n✅ Reports saved:');
        console.log(`   - performance-report-${timestamp}.html`);
        console.log(`   - performance-report-${timestamp}.json\n`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        process.exit(1);
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
}

// Get URL from command line or use default
const url = process.argv[2] || 'https://www.ecoleglobale.com';
testPerformance(url);
/**
 * Demo Scripts for Ecole Globale Performance Demo
 */

// Console logging for demo
console.log('%c✅ Ecole Globale Performance Demo Loaded!', 
    'color: #10b981; font-size: 16px; font-weight: bold;');

console.log('%c📊 Performance Analysis:', 
    'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('   Current Score: 42/100');
console.log('   Optimized Score: 85+/100');
console.log('   Improvement: 43 points');

console.log('%c⚡ Load Time:', 
    'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('   Before: 6.8 seconds');
console.log('   After: 2.1 seconds');
console.log('   Improvement: 70% faster');

console.log('%c📉 Page Size:', 
    'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('   Before: 4.5 MB');
console.log('   After: 1.8 MB');
console.log('   Improvement: 60% smaller');

console.log('%c🎯 Next Steps:', 
    'color: #f59e0b; font-size: 14px; font-weight: bold;');
console.log('   1. Test current site with PageSpeed Insights');
console.log('   2. Implement image optimization first');
console.log('   3. Enable server compression and caching');
console.log('   4. Defer non-critical JavaScript');
console.log('   5. Monitor with Lighthouse');

// Performance measurement
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`%c🚀 Demo page loaded in ${loadTime.toFixed(2)}ms`, 
        'color: #10b981; font-weight: bold;');
    
    // Show navigation timing
    setTimeout(() => {
        console.log('%c📈 Real-time Metrics:', 
            'color: #667eea; font-size: 14px; font-weight: bold;');
        
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            console.log(`   DNS Lookup: ${(navTiming.domainLookupEnd - navTiming.domainLookupStart).toFixed(2)}ms`);
            console.log(`   TCP Connection: ${(navTiming.connectEnd - navTiming.connectStart).toFixed(2)}ms`);
            console.log(`   DOM Interactive: ${navTiming.domInteractive.toFixed(2)}ms`);
            console.log(`   DOM Complete: ${navTiming.domComplete.toFixed(2)}ms`);
        }
        
        // Get resource timings
        const resources = performance.getEntriesByType('resource');
        console.log(`   Resources Loaded: ${resources.length}`);
        
        // Calculate total size
        let totalSize = 0;
        resources.forEach(resource => {
            if (resource.transferSize) {
                totalSize += resource.transferSize;
            }
        });
        console.log(`   Total Transfer Size: ${(totalSize / 1024).toFixed(2)} KB`);
        
    }, 1000);
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Track page visibility
let pageVisibleTime = 0;
let lastVisibilityChange = Date.now();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pageVisibleTime += Date.now() - lastVisibilityChange;
        console.log(`📊 Page visible for: ${(pageVisibleTime / 1000).toFixed(1)}s`);
    } else {
        lastVisibilityChange = Date.now();
    }
});

// Warn before leaving
window.addEventListener('beforeunload', (e) => {
    console.log('👋 Thanks for viewing the demo!');
});
/**
 * Performance Monitoring and Web Vitals Tracking
 */

(function() {
    'use strict';

    // Performance metrics storage
    const metrics = {
        fcp: null,
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null
    };

    // First Contentful Paint
    function measureFCP() {
        const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const fcp = entries[entries.length - 1];
            metrics.fcp = fcp.startTime;
            console.log('📊 FCP:', metrics.fcp.toFixed(2), 'ms');
        });
        
        try {
            fcpObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.error('FCP measurement failed:', e);
        }
    }

    // Largest Contentful Paint
    function measureLCP() {
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lcp = entries[entries.length - 1];
            metrics.lcp = lcp.renderTime || lcp.loadTime;
            console.log('📊 LCP:', metrics.lcp.toFixed(2), 'ms');
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.error('LCP measurement failed:', e);
        }
    }

    // Cumulative Layout Shift
    function measureCLS() {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            metrics.cls = clsValue;
            console.log('📊 CLS:', metrics.cls.toFixed(3));
        });
        
        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.error('CLS measurement failed:', e);
        }
    }

    // Time to First Byte
    function measureTTFB() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
            console.log('📊 TTFB:', metrics.ttfb.toFixed(2), 'ms');
        }
    }

    // Send metrics to analytics
    function sendMetrics() {
        if (typeof gtag === 'function') {
            gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                fcp: Math.round(metrics.fcp),
                lcp: Math.round(metrics.lcp),
                cls: metrics.cls.toFixed(3),
                ttfb: Math.round(metrics.ttfb)
            });
        }
        
        // Can also send to custom endpoint
        // fetch('/api/metrics', {
        //     method: 'POST',
        //     body: JSON.stringify(metrics)
        // });
    }

    // Initialize measurements
    function init() {
        measureTTFB();
        measureFCP();
        measureLCP();
        measureCLS();
        
        // Send metrics after 5 seconds
        setTimeout(sendMetrics, 5000);
        
        console.log('✅ Performance monitoring initialized');
    }

    // Start monitoring when page loads
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // Export metrics
    window.PerformanceMetrics = metrics;
})();
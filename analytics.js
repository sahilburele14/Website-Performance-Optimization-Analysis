/**
 * Analytics - Loaded Last (Deferred)
 * Google Analytics and Facebook Pixel
 */

(function() {
    'use strict';

    // Google Analytics (gtag.js)
    function loadGoogleAnalytics() {
        const GA_ID = 'G-XXXXXXXXXX'; // Replace with your GA ID
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_ID, {
            'send_page_view': true,
            'anonymize_ip': true
        });
        
        window.gtag = gtag;
        console.log('✅ Google Analytics loaded');
    }

    // Facebook Pixel
    function loadFacebookPixel() {
        const PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with your Pixel ID
        
        !function(f,b,e,v,n,t,s) {
            if(f.fbq)return;
            n=f.fbq=function(){
                n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
            };
            if(!f._fbq)f._fbq=n;
            n.push=n;
            n.loaded=!0;
            n.version='2.0';
            n.queue=[];
            t=b.createElement(e);
            t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
        }(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', PIXEL_ID);
        fbq('track', 'PageView');
        
        console.log('✅ Facebook Pixel loaded');
    }

    // Track custom events
    function trackEvent(category, action, label, value) {
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
    }

    // Track scroll depth
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90];
    
    function trackScrollDepth() {
        const scrollPercentage = Math.round(
            (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
        );
        
        if (scrollPercentage > maxScroll) {
            maxScroll = scrollPercentage;
            
            scrollMilestones.forEach(milestone => {
                if (maxScroll >= milestone && maxScroll < milestone + 10) {
                    trackEvent('Engagement', 'Scroll Depth', `${milestone}%`);
                }
            });
        }
    }

    // Initialize analytics
    function init() {
        // Wait 2 seconds before loading analytics
        setTimeout(() => {
            loadGoogleAnalytics();
            loadFacebookPixel();
            
            // Track scroll depth
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(trackScrollDepth, 100);
            }, { passive: true });
            
            // Track outbound links
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.href && !link.href.includes(window.location.hostname)) {
                    trackEvent('Outbound', 'Click', link.href);
                }
            });
            
            console.log('✅ Analytics initialized');
        }, 2000);
    }

    // Start after page is interactive
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
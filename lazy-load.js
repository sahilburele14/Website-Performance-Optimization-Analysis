/**
 * Lazy Loading Implementation
 * Modern approach using Intersection Observer API
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, config);

    // Load image function
    function loadImage(img) {
        // Handle <picture> element
        const picture = img.parentElement;
        if (picture && picture.tagName === 'PICTURE') {
            const sources = picture.querySelectorAll('source');
            sources.forEach(source => {
                if (source.dataset.srcset) {
                    source.srcset = source.dataset.srcset;
                    source.removeAttribute('data-srcset');
                }
            });
        }
        
        // Load the image
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        
        // Remove lazy class and add loaded class
        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // Dispatch custom event
        img.dispatchEvent(new CustomEvent('lazyloaded', {
            detail: { element: img }
        }));
    }

    // Initialize lazy loading
    function init() {
        const lazyImages = document.querySelectorAll('img.lazy');
        
        // Check if browser supports Intersection Observer
        if ('IntersectionObserver' in window) {
            lazyImages.forEach(img => imageObserver.observe(img));
            console.log(`✅ Lazy loading initialized for ${lazyImages.length} images`);
        } else {
            // Fallback for older browsers
            console.warn('⚠️ IntersectionObserver not supported, loading all images');
            lazyImages.forEach(img => loadImage(img));
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for use in other scripts
    window.LazyLoad = {
        observe: function(images) {
            if (Array.isArray(images)) {
                images.forEach(img => imageObserver.observe(img));
            } else {
                imageObserver.observe(images);
            }
        }
    };
})();
/**
 * WidgetTranslationService - Handles translation of third-party widgets and plugins
 * Detects active widgets and extracts translatable content
 */
class WidgetTranslationService {
    constructor(shopifyAPI, translationService) {
        this.shopifyAPI = shopifyAPI;
        this.translationService = translationService;
        this.detectedWidgets = [];
        this.widgetSelectors = {
            // Common widget selectors for text extraction
            'review-widgets': [
                '.reviews-widget', '.review-content', '.testimonial',
                '[data-reviews]', '.stamped-review', '.yotpo-widget'
            ],
            'chat-widgets': [
                '.chat-widget', '.live-chat', '.messenger-widget',
                '[data-chat]', '.intercom-widget', '.zendesk-widget'
            ],
            'popup-widgets': [
                '.popup-widget', '.modal-content', '.newsletter-popup',
                '[data-popup]', '.popup-text', '.modal-text'
            ],
            'social-widgets': [
                '.social-widget', '.instagram-feed', '.twitter-widget',
                '[data-social]', '.facebook-widget', '.social-proof'
            ],
            'announcement-bars': [
                '.announcement-bar', '.promo-banner', '.top-banner',
                '[data-announcement]', '.promotion-text'
            ],
            'countdown-timers': [
                '.countdown-widget', '.timer-widget', '.urgency-timer',
                '[data-countdown]', '.countdown-text'
            ],
            'currency-converters': [
                '.currency-widget', '.currency-converter',
                '[data-currency]', '.currency-selector'
            ],
            'size-guides': [
                '.size-guide', '.sizing-chart', '.size-widget',
                '[data-size-guide]', '.size-info'
            ],
            'search-widgets': [
                '.search-widget', '.search-suggestions', '.autocomplete',
                '[data-search]', '.search-results'
            ],
            'recommendation-widgets': [
                '.recommended-products', '.product-recommendations',
                '[data-recommendations]', '.upsell-widget', '.cross-sell'
            ]
        };
    }

    /**
     * Detect active widgets on the storefront
     */
    async detectActiveWidgets() {
        this.log('info', 'Starting widget detection...');
        
        try {
            // Get the main storefront URL to scan
            const storeUrl = `https://${this.shopifyAPI.storeUrl}`;
            
            // In a real implementation, this would use a headless browser or proxy
            // For demo purposes, we'll simulate widget detection
            this.detectedWidgets = await this.simulateWidgetDetection(storeUrl);
            
            this.log('success', `Detected ${this.detectedWidgets.length} active widgets`);
            return this.detectedWidgets;
            
        } catch (error) {
            this.log('error', `Widget detection failed: ${error.message}`);
            return [];
        }
    }

    /**
     * Simulate widget detection (in production, this would scan the actual storefront)
     */
    async simulateWidgetDetection(storeUrl) {
        // Simulate common widgets that might be found
        const simulatedWidgets = [
            {
                id: 'review-widget-1',
                name: 'Product Reviews Widget',
                type: 'review-widgets',
                description: 'Customer product reviews and ratings',
                textCount: 15,
                selectors: ['.reviews-widget', '.review-content'],
                extractedTexts: [
                    'Write a Review',
                    'Customer Reviews',
                    'Based on reviews',
                    'Verified Purchase',
                    'Helpful review',
                    'This product is amazing!',
                    'Great quality and fast shipping',
                    'Highly recommended',
                    'Sort by',
                    'Most Recent',
                    'Highest Rating',
                    'Lowest Rating',
                    'Show more reviews',
                    'Was this helpful?',
                    'Report review'
                ]
            },
            {
                id: 'announcement-bar-1',
                name: 'Announcement Bar',
                type: 'announcement-bars',
                description: 'Top promotional banner',
                textCount: 3,
                selectors: ['.announcement-bar'],
                extractedTexts: [
                    'Free shipping on orders over $50!',
                    'Limited time offer - 20% off everything',
                    'New collection available now'
                ]
            },
            {
                id: 'chat-widget-1',
                name: 'Live Chat Support',
                type: 'chat-widgets',
                description: 'Customer support chat widget',
                textCount: 12,
                selectors: ['.chat-widget'],
                extractedTexts: [
                    'Chat with us',
                    'How can we help?',
                    'Start conversation',
                    'Online now',
                    'Typically replies in minutes',
                    'Send message',
                    'Type your message...',
                    'We\'re here to help!',
                    'Get support',
                    'Contact support',
                    'Live chat',
                    'Ask a question'
                ]
            },
            {
                id: 'popup-widget-1',
                name: 'Newsletter Signup Popup',
                type: 'popup-widgets',
                description: 'Email subscription popup',
                textCount: 8,
                selectors: ['.newsletter-popup'],
                extractedTexts: [
                    'Join our newsletter',
                    'Get 10% off your first order',
                    'Subscribe now',
                    'Enter your email',
                    'Stay updated with our latest offers',
                    'No spam, unsubscribe anytime',
                    'Subscribe',
                    'Maybe later'
                ]
            },
            {
                id: 'social-proof-1',
                name: 'Social Proof Widget',
                type: 'social-widgets',
                description: 'Recent purchases notification',
                textCount: 6,
                selectors: ['.social-proof'],
                extractedTexts: [
                    'Someone just bought this',
                    'minutes ago',
                    'items left in stock',
                    'people are viewing this',
                    'Recently purchased',
                    'Limited quantity'
                ]
            },
            {
                id: 'size-guide-1',
                name: 'Size Guide Widget',
                type: 'size-guides',
                description: 'Product sizing information',
                textCount: 10,
                selectors: ['.size-guide'],
                extractedTexts: [
                    'Size Guide',
                    'Find your size',
                    'Measure yourself',
                    'Size Chart',
                    'Small',
                    'Medium',
                    'Large',
                    'Extra Large',
                    'Sizing tips',
                    'Still unsure? Contact us'
                ]
            },
            {
                id: 'recommendations-1',
                name: 'Product Recommendations',
                type: 'recommendation-widgets',
                description: 'Related products widget',
                textCount: 7,
                selectors: ['.product-recommendations'],
                extractedTexts: [
                    'You might also like',
                    'Customers also bought',
                    'Related products',
                    'Complete the look',
                    'Add to cart',
                    'Quick view',
                    'See more recommendations'
                ]
            }
        ];

        // Simulate detection delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return simulatedWidgets;
    }

    /**
     * Extract translatable text from detected widgets
     * @param {Array} selectedWidgets - User-selected widgets for translation
     */
    async extractWidgetTexts(selectedWidgets) {
        this.log('info', `Extracting texts from ${selectedWidgets.length} selected widgets`);
        
        const allTexts = [];
        
        for (const widget of selectedWidgets) {
            const widgetData = this.detectedWidgets.find(w => w.id === widget.id);
            if (!widgetData) continue;
            
            // Convert extracted texts to translation format
            const widgetTexts = widgetData.extractedTexts.map((text, index) => ({
                widgetId: widget.id,
                widgetName: widgetData.name,
                textIndex: index,
                originalText: text,
                selector: widgetData.selectors[0], // Use first selector as primary
                field: `text_${index}`
            }));
            
            allTexts.push(...widgetTexts);
        }
        
        this.log('success', `Extracted ${allTexts.length} translatable texts from widgets`);
        return allTexts;
    }

    /**
     * Translate widget texts
     * @param {Array} selectedWidgets - Selected widgets
     * @param {string} targetLanguage - Target language
     */
    async translateWidgets(selectedWidgets, targetLanguage) {
        if (!selectedWidgets || selectedWidgets.length === 0) {
            throw new Error('No widgets selected for translation');
        }

        this.log('info', `Starting translation of ${selectedWidgets.length} widgets to ${targetLanguage}`);
        
        // Extract all texts from selected widgets
        const widgetTexts = await this.extractWidgetTexts(selectedWidgets);
        
        if (widgetTexts.length === 0) {
            this.log('warning', 'No translatable texts found in selected widgets');
            return [];
        }

        // Translate using the translation service
        const translatedTexts = await this.translationService.batchTranslate(
            widgetTexts,
            targetLanguage,
            'widget'
        );

        // Process and format results
        const results = this.processTranslationResults(translatedTexts);
        
        this.log('success', `Widget translation completed. ${results.length} items processed`);
        return results;
    }

    /**
     * Process translation results and group by widget
     */
    processTranslationResults(translatedTexts) {
        const widgetResults = {};
        
        translatedTexts.forEach(item => {
            if (!widgetResults[item.widgetId]) {
                widgetResults[item.widgetId] = {
                    widgetId: item.widgetId,
                    widgetName: item.widgetName,
                    translations: []
                };
            }
            
            widgetResults[item.widgetId].translations.push({
                field: item.field,
                originalText: item.originalText,
                translatedText: item.translatedText,
                selector: item.selector,
                textIndex: item.textIndex
            });
        });
        
        return Object.values(widgetResults);
    }

    /**
     * Generate implementation code for widget translations
     * @param {Array} translationResults - Translation results
     */
    generateImplementationCode(translationResults) {
        this.log('info', 'Generating implementation code for widget translations');
        
        let code = `// Widget Translation Implementation Code\n`;
        code += `// Copy this code to your theme's JavaScript files\n\n`;
        code += `function applyWidgetTranslations() {\n`;
        code += `  const translations = {\n`;
        
        translationResults.forEach(widget => {
            code += `    // ${widget.widgetName}\n`;
            widget.translations.forEach(translation => {
                code += `    "${translation.originalText}": "${translation.translatedText}",\n`;
            });
            code += `\n`;
        });
        
        code += `  };\n\n`;
        code += `  // Apply translations to DOM elements\n`;
        code += `  Object.keys(translations).forEach(originalText => {\n`;
        code += `    const elements = document.querySelectorAll('*');\n`;
        code += `    elements.forEach(element => {\n`;
        code += `      if (element.textContent && element.textContent.trim() === originalText) {\n`;
        code += `        element.textContent = element.textContent.replace(originalText, translations[originalText]);\n`;
        code += `      }\n`;
        code += `    });\n`;
        code += `  });\n`;
        code += `}\n\n`;
        code += `// Apply translations when DOM is ready\n`;
        code += `if (document.readyState === 'loading') {\n`;
        code += `  document.addEventListener('DOMContentLoaded', applyWidgetTranslations);\n`;
        code += `} else {\n`;
        code += `  applyWidgetTranslations();\n`;
        code += `}`;
        
        return code;
    }

    /**
     * Get widget statistics
     */
    getWidgetStats() {
        const totalWidgets = this.detectedWidgets.length;
        const totalTexts = this.detectedWidgets.reduce((sum, widget) => sum + widget.textCount, 0);
        
        const widgetTypes = {};
        this.detectedWidgets.forEach(widget => {
            widgetTypes[widget.type] = (widgetTypes[widget.type] || 0) + 1;
        });
        
        return {
            totalWidgets,
            totalTexts,
            widgetTypes,
            detectedWidgets: this.detectedWidgets
        };
    }

    /**
     * Search for specific widget types
     * @param {string} searchTerm - Search term
     */
    searchWidgets(searchTerm) {
        if (!searchTerm) return this.detectedWidgets;
        
        const term = searchTerm.toLowerCase();
        return this.detectedWidgets.filter(widget => 
            widget.name.toLowerCase().includes(term) ||
            widget.description.toLowerCase().includes(term) ||
            widget.type.toLowerCase().includes(term)
        );
    }

    /**
     * Reset detected widgets
     */
    resetDetection() {
        this.detectedWidgets = [];
        this.log('info', 'Widget detection reset');
    }

    /**
     * Logging helper
     */
    log(level, message) {
        if (window.logManager) {
            window.logManager.log(level, `[WidgetTranslationService] ${message}`);
        }
        console.log(`[WidgetTranslationService] ${level.toUpperCase()}: ${message}`);
    }
}
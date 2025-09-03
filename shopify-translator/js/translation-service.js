/**
 * TranslationService - Optimized OpenAI integration with token tracking
 * Handles batch translations and token optimization
 */
class TranslationService {
    constructor() {
        this.apiKey = null;
        this.totalTokensUsed = 0;
        this.requestCount = 0;
        this.batchSize = 10; // Number of texts to translate in one batch
        this.maxTokensPerRequest = 3000;
    }

    /**
     * Initialize the service with OpenAI API key
     * @param {string} apiKey - OpenAI API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Batch translate multiple texts efficiently
     * @param {Array} texts - Array of text objects to translate
     * @param {string} targetLanguage - Target language code
     * @param {string} context - Context for translation (product, collection, etc.)
     */
    async batchTranslate(texts, targetLanguage, context = 'general') {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not set');
        }

        if (!texts || texts.length === 0) {
            return [];
        }

        this.log('info', `Starting batch translation of ${texts.length} texts to ${targetLanguage}`);
        
        const results = [];
        const batches = this.createBatches(texts, this.batchSize);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            this.log('info', `Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

            try {
                const batchResults = await this.translateBatch(batch, targetLanguage, context);
                results.push(...batchResults);
                
                // Update progress
                if (window.updateProgress) {
                    window.updateProgress(((i + 1) / batches.length) * 100);
                }

                // Add delay between batches to respect rate limits
                if (i < batches.length - 1) {
                    await this.delay(1000);
                }
            } catch (error) {
                this.log('error', `Batch ${i + 1} failed: ${error.message}`);
                // Add failed items with original text
                results.push(...batch.map(item => ({ ...item, translatedText: item.originalText })));
            }
        }

        this.log('success', `Batch translation completed. Total tokens used: ${this.totalTokensUsed}`);
        return results;
    }

    /**
     * Translate a single batch of texts
     * @param {Array} batch - Batch of text objects
     * @param {string} targetLanguage - Target language
     * @param {string} context - Translation context
     */
    async translateBatch(batch, targetLanguage, context) {
        const prompt = this.createBatchPrompt(batch, targetLanguage, context);
        
        const requestPayload = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt(targetLanguage, context)
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: this.maxTokensPerRequest,
            temperature: 0.3
        };

        const response = await this.makeOpenAIRequest(requestPayload);
        
        // Parse the response and match with original items
        return this.parseBatchResponse(response, batch);
    }

    /**
     * Create batches of texts for efficient processing
     */
    createBatches(texts, batchSize) {
        const batches = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            batches.push(texts.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Create a batch prompt for multiple texts
     */
    createBatchPrompt(batch, targetLanguage, context) {
        const languageNames = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese'
        };

        const langName = languageNames[targetLanguage] || targetLanguage;
        
        let prompt = `Translate the following ${context} texts to ${langName}. Return ONLY the translations in the same order, separated by "|||":\n\n`;
        
        batch.forEach((item, index) => {
            prompt += `${index + 1}. ${item.originalText}\n`;
        });

        prompt += `\nRespond with translations separated by "|||" in the exact same order.`;
        
        return prompt;
    }

    /**
     * Get system prompt for translation context
     */
    getSystemPrompt(targetLanguage, context) {
        const contextInstructions = {
            'product': 'You are translating e-commerce product information. Maintain marketing tone and product appeal.',
            'collection': 'You are translating collection names and descriptions. Keep them concise and appealing.',
            'page': 'You are translating website page content. Maintain the original meaning and structure.',
            'widget': 'You are translating widget/plugin text. Keep functionality clear and user-friendly.',
            'general': 'You are translating general content. Maintain tone and meaning.'
        };

        return `You are a professional translator specializing in e-commerce content. ${contextInstructions[context] || contextInstructions.general} Translate accurately while preserving formatting and maintaining cultural appropriateness for the target market.`;
    }

    /**
     * Parse batch translation response
     */
    parseBatchResponse(response, originalBatch) {
        try {
            const translatedText = response.choices[0].message.content.trim();
            const translations = translatedText.split('|||').map(t => t.trim());
            
            return originalBatch.map((item, index) => ({
                ...item,
                translatedText: translations[index] || item.originalText
            }));
        } catch (error) {
            this.log('error', `Failed to parse batch response: ${error.message}`);
            return originalBatch.map(item => ({ ...item, translatedText: item.originalText }));
        }
    }

    /**
     * Make request to OpenAI API with token tracking
     */
    async makeOpenAIRequest(payload) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not set');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        // Track token usage
        if (data.usage) {
            this.totalTokensUsed += data.usage.total_tokens;
            this.requestCount++;
            
            this.log('info', `Request ${this.requestCount}: Used ${data.usage.total_tokens} tokens (${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion)`);
            
            // Update UI token counter
            if (window.updateTokenCount) {
                window.updateTokenCount(this.totalTokensUsed);
            }
        }

        return data;
    }

    /**
     * Validate fields before translation based on user selection
     * @param {object} item - Item to validate
     * @param {object} selectedFields - User selected fields
     * @param {string} itemType - Type of item (product, collection, etc.)
     */
    validateFieldsForTranslation(item, selectedFields, itemType) {
        const validatedTexts = [];
        
        switch (itemType) {
            case 'product':
                if (selectedFields.title && item.title) {
                    validatedTexts.push({
                        field: 'title',
                        originalText: item.title,
                        itemId: item.id
                    });
                }
                if (selectedFields.description && item.body_html) {
                    // Strip HTML for translation, we'll reapply it later
                    const textContent = this.stripHTML(item.body_html);
                    if (textContent.trim()) {
                        validatedTexts.push({
                            field: 'description',
                            originalText: textContent,
                            itemId: item.id,
                            hasHTML: true,
                            originalHTML: item.body_html
                        });
                    }
                }
                if (selectedFields.tags && item.tags) {
                    validatedTexts.push({
                        field: 'tags',
                        originalText: item.tags,
                        itemId: item.id
                    });
                }
                break;
                
            case 'collection':
                if (selectedFields.title && item.title) {
                    validatedTexts.push({
                        field: 'title',
                        originalText: item.title,
                        itemId: item.id
                    });
                }
                if (selectedFields.description && item.body_html) {
                    const textContent = this.stripHTML(item.body_html);
                    if (textContent.trim()) {
                        validatedTexts.push({
                            field: 'description',
                            originalText: textContent,
                            itemId: item.id,
                            hasHTML: true,
                            originalHTML: item.body_html
                        });
                    }
                }
                break;
                
            case 'page':
                if (selectedFields.title && item.title) {
                    validatedTexts.push({
                        field: 'title',
                        originalText: item.title,
                        itemId: item.id
                    });
                }
                if (selectedFields.content && item.body_html) {
                    const textContent = this.stripHTML(item.body_html);
                    if (textContent.trim()) {
                        validatedTexts.push({
                            field: 'content',
                            originalText: textContent,
                            itemId: item.id,
                            hasHTML: true,
                            originalHTML: item.body_html
                        });
                    }
                }
                break;
        }
        
        return validatedTexts;
    }

    /**
     * Strip HTML tags for translation while preserving structure info
     */
    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Restore HTML structure after translation
     */
    restoreHTML(originalHTML, translatedText) {
        // Simple replacement - in production, this would be more sophisticated
        const div = document.createElement('div');
        div.innerHTML = originalHTML;
        
        // Replace text content while preserving structure
        const walker = document.createTreeWalker(
            div,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.trim()) {
                textNodes.push(node);
            }
        }
        
        // This is a simplified approach - production would need more sophisticated text mapping
        if (textNodes.length === 1) {
            textNodes[0].nodeValue = translatedText;
        }
        
        return div.innerHTML;
    }

    /**
     * Get translation statistics
     */
    getStats() {
        return {
            totalTokensUsed: this.totalTokensUsed,
            requestCount: this.requestCount,
            averageTokensPerRequest: this.requestCount > 0 ? Math.round(this.totalTokensUsed / this.requestCount) : 0
        };
    }

    /**
     * Reset token counter
     */
    resetStats() {
        this.totalTokensUsed = 0;
        this.requestCount = 0;
        this.log('info', 'Translation statistics reset');
    }

    /**
     * Delay helper for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Logging helper
     */
    log(level, message) {
        if (window.logManager) {
            window.logManager.log(level, `[TranslationService] ${message}`);
        }
        console.log(`[TranslationService] ${level.toUpperCase()}: ${message}`);
    }
}
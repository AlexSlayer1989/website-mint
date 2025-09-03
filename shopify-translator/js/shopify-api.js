/**
 * ShopifyAPI - Optimized class for Shopify store interactions
 * Handles all API communications with minimal token usage
 */
class ShopifyAPI {
    constructor() {
        this.storeUrl = null;
        this.apiKey = null;
        this.isConnected = false;
        this.rateLimitRemaining = 40;
        this.lastRequestTime = 0;
    }

    /**
     * Connect to a Shopify store
     * @param {string} storeUrl - The store URL (without protocol)
     * @param {string} apiKey - The API access token
     */
    async connect(storeUrl, apiKey) {
        this.storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        this.apiKey = apiKey;
        
        try {
            // Test connection with a minimal API call
            const response = await this.makeRequest('/admin/api/2023-10/shop.json');
            if (response.shop) {
                this.isConnected = true;
                this.log('success', `Connected to store: ${response.shop.name}`);
                return response.shop;
            }
        } catch (error) {
            this.log('error', `Failed to connect: ${error.message}`);
            throw error;
        }
    }

    /**
     * Make an optimized API request with rate limiting
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.isConnected && !endpoint.includes('/shop.json')) {
            throw new Error('Not connected to store');
        }

        // Rate limiting - ensure we don't exceed API limits
        await this.waitForRateLimit();

        const url = `https://${this.storeUrl}${endpoint}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'X-Shopify-Access-Token': this.apiKey,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (options.body) {
            requestOptions.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, requestOptions);
            
            // Update rate limit info
            this.updateRateLimit(response.headers);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(`API Error ${response.status}: ${error.error || error.errors || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            this.log('error', `API Request failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all products with minimal data for selection
     */
    async getProducts(limit = 250) {
        this.log('info', 'Fetching products...');
        const products = [];
        let pageInfo = null;

        do {
            const params = new URLSearchParams({
                limit: limit.toString(),
                fields: 'id,title,handle,status,updated_at'
            });

            if (pageInfo) {
                params.append('page_info', pageInfo);
            }

            const response = await this.makeRequest(`/admin/api/2023-10/products.json?${params}`);
            products.push(...response.products);

            // Check for pagination
            pageInfo = this.extractPageInfo(response);
        } while (pageInfo);

        this.log('success', `Fetched ${products.length} products`);
        return products;
    }

    /**
     * Get full product data for translation
     * @param {number} productId - Product ID
     */
    async getProductForTranslation(productId) {
        const response = await this.makeRequest(`/admin/api/2023-10/products/${productId}.json`);
        return response.product;
    }

    /**
     * Update product with translated content
     * @param {number} productId - Product ID
     * @param {object} translatedData - Translated product data
     */
    async updateProduct(productId, translatedData) {
        const response = await this.makeRequest(`/admin/api/2023-10/products/${productId}.json`, {
            method: 'PUT',
            body: { product: translatedData }
        });
        return response.product;
    }

    /**
     * Get collections for translation
     */
    async getCollections(limit = 250) {
        this.log('info', 'Fetching collections...');
        const collections = [];
        let pageInfo = null;

        do {
            const params = new URLSearchParams({
                limit: limit.toString(),
                fields: 'id,title,handle,updated_at'
            });

            if (pageInfo) {
                params.append('page_info', pageInfo);
            }

            const response = await this.makeRequest(`/admin/api/2023-10/custom_collections.json?${params}`);
            collections.push(...response.custom_collections);

            pageInfo = this.extractPageInfo(response);
        } while (pageInfo);

        this.log('success', `Fetched ${collections.length} collections`);
        return collections;
    }

    /**
     * Get collection for translation
     * @param {number} collectionId - Collection ID
     */
    async getCollectionForTranslation(collectionId) {
        const response = await this.makeRequest(`/admin/api/2023-10/custom_collections/${collectionId}.json`);
        return response.custom_collection;
    }

    /**
     * Update collection with translated content
     */
    async updateCollection(collectionId, translatedData) {
        const response = await this.makeRequest(`/admin/api/2023-10/custom_collections/${collectionId}.json`, {
            method: 'PUT',
            body: { custom_collection: translatedData }
        });
        return response.custom_collection;
    }

    /**
     * Get pages for translation
     */
    async getPages(limit = 250) {
        this.log('info', 'Fetching pages...');
        const pages = [];
        let pageInfo = null;

        do {
            const params = new URLSearchParams({
                limit: limit.toString(),
                fields: 'id,title,handle,updated_at'
            });

            if (pageInfo) {
                params.append('page_info', pageInfo);
            }

            const response = await this.makeRequest(`/admin/api/2023-10/pages.json?${params}`);
            pages.push(...response.pages);

            pageInfo = this.extractPageInfo(response);
        } while (pageInfo);

        this.log('success', `Fetched ${pages.length} pages`);
        return pages;
    }

    /**
     * Get page for translation
     */
    async getPageForTranslation(pageId) {
        const response = await this.makeRequest(`/admin/api/2023-10/pages/${pageId}.json`);
        return response.page;
    }

    /**
     * Update page with translated content
     */
    async updatePage(pageId, translatedData) {
        const response = await this.makeRequest(`/admin/api/2023-10/pages/${pageId}.json`, {
            method: 'PUT',
            body: { page: translatedData }
        });
        return response.page;
    }

    /**
     * Get installed apps/widgets (requires appropriate permissions)
     */
    async getInstalledApps() {
        try {
            // Note: This requires private app permissions or specific scopes
            const response = await this.makeRequest('/admin/api/2023-10/application_charges.json');
            return response.application_charges || [];
        } catch (error) {
            this.log('warning', 'Could not fetch installed apps: ' + error.message);
            return [];
        }
    }

    /**
     * Extract pagination info from response headers
     */
    extractPageInfo(response) {
        // In a real implementation, extract Link header pagination info
        // For now, return null to end pagination
        return null;
    }

    /**
     * Rate limiting management
     */
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (this.rateLimitRemaining <= 2 && timeSinceLastRequest < 1000) {
            const waitTime = 1000 - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Update rate limit info from response headers
     */
    updateRateLimit(headers) {
        const remaining = headers.get('X-Shopify-Shop-Api-Call-Limit');
        if (remaining) {
            const [used, total] = remaining.split('/').map(Number);
            this.rateLimitRemaining = total - used;
        }
    }

    /**
     * Logging helper
     */
    log(level, message) {
        if (window.logManager) {
            window.logManager.log(level, `[ShopifyAPI] ${message}`);
        }
        console.log(`[ShopifyAPI] ${level.toUpperCase()}: ${message}`);
    }
}
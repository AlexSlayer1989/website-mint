/**
 * Main application file for Shopify Translation Plugin
 * Handles UI interactions and coordinates between services
 */

// Global variables
let shopifyAPI = null;
let translationService = null;
let widgetTranslationService = null;
let logManager = null;

// Application state
let currentStore = null;
let products = [];
let collections = [];
let pages = [];
let currentTab = 'products';

/**
 * Log Manager for comprehensive logging
 */
class LogManager {
    constructor() {
        this.logs = [];
        this.logContainer = null;
    }

    init() {
        this.logContainer = document.getElementById('log-container');
    }

    log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            level,
            message
        };
        
        this.logs.push(logEntry);
        this.displayLog(logEntry);
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs = this.logs.slice(-100);
        }
    }

    displayLog(entry) {
        if (!this.logContainer) return;
        
        const logElement = document.createElement('div');
        logElement.className = `log-entry ${entry.level}`;
        logElement.innerHTML = `<span class="log-timestamp">${entry.timestamp}</span>${entry.message}`;
        
        this.logContainer.appendChild(logElement);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    clear() {
        this.logs = [];
        if (this.logContainer) {
            this.logContainer.innerHTML = '';
        }
    }

    export() {
        return this.logs.map(log => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    }
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize services
    shopifyAPI = new ShopifyAPI();
    translationService = new TranslationService();
    logManager = new LogManager();
    logManager.init();
    
    // Make services globally available
    window.logManager = logManager;
    window.updateTokenCount = updateTokenCount;
    window.updateProgress = updateProgress;
    
    // Initialize UI
    initializeEventListeners();
    initializeTabs();
    
    logManager.log('info', 'Shopify Translation Plugin initialized');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Store connection
    document.getElementById('connect-store').addEventListener('click', connectToStore);
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', switchTab);
    });
    
    // Translation buttons
    document.getElementById('translate-products').addEventListener('click', translateProducts);
    document.getElementById('translate-collections').addEventListener('click', translateCollections);
    document.getElementById('translate-pages').addEventListener('click', translatePages);
    document.getElementById('translate-widgets').addEventListener('click', translateWidgets);
    
    // Widget detection
    document.getElementById('detect-widgets').addEventListener('click', detectWidgets);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Initialize tab system
 */
function initializeTabs() {
    showTab('products');
}

/**
 * Connect to Shopify store
 */
async function connectToStore() {
    const storeUrl = document.getElementById('store-url').value.trim();
    const apiKey = document.getElementById('api-key').value.trim();
    const openaiKey = document.getElementById('openai-key').value.trim();
    
    if (!storeUrl || !apiKey || !openaiKey) {
        logManager.log('error', 'Please fill in all required fields');
        return;
    }
    
    try {
        setLoadingState(true);
        
        // Check for demo mode
        if (storeUrl.includes('demo-store') || apiKey.includes('demo')) {
            logManager.log('info', 'Demo mode detected - loading sample data');
            await loadDemoData();
            document.getElementById('tabs-container').style.display = 'block';
            logManager.log('success', 'Demo mode initialized - explore the interface!');
            return;
        }
        
        // Connect to Shopify
        currentStore = await shopifyAPI.connect(storeUrl, apiKey);
        
        // Set up translation service
        translationService.setApiKey(openaiKey);
        
        // Initialize widget service
        widgetTranslationService = new WidgetTranslationService(shopifyAPI, translationService);
        
        // Load initial data
        await loadInitialData();
        
        // Show main interface
        document.getElementById('tabs-container').style.display = 'block';
        
        logManager.log('success', `Successfully connected to ${currentStore.name}`);
        
    } catch (error) {
        logManager.log('error', `Connection failed: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Load initial data from store
 */
async function loadInitialData() {
    try {
        // Load products, collections, and pages in parallel
        const [productsData, collectionsData, pagesData] = await Promise.all([
            shopifyAPI.getProducts(),
            shopifyAPI.getCollections(),
            shopifyAPI.getPages()
        ]);
        
        products = productsData;
        collections = collectionsData;
        pages = pagesData;
        
        // Populate UI lists
        populateProductList();
        populateCollectionList();
        populatePageList();
        
    } catch (error) {
        logManager.log('error', `Failed to load store data: ${error.message}`);
    }
}

/**
 * Load demo data for testing purposes
 */
async function loadDemoData() {
    // Demo products
    products = [
        { id: 1, title: 'Premium Cotton T-Shirt', handle: 'cotton-tshirt', status: 'active' },
        { id: 2, title: 'Vintage Denim Jacket', handle: 'denim-jacket', status: 'active' },
        { id: 3, title: 'Wireless Bluetooth Headphones', handle: 'bluetooth-headphones', status: 'active' },
        { id: 4, title: 'Organic Coffee Beans', handle: 'coffee-beans', status: 'active' },
        { id: 5, title: 'Luxury Watch Collection', handle: 'luxury-watch', status: 'active' }
    ];
    
    // Demo collections
    collections = [
        { id: 101, title: 'Summer Collection 2024', handle: 'summer-2024' },
        { id: 102, title: 'Electronics & Gadgets', handle: 'electronics' },
        { id: 103, title: 'Home & Garden', handle: 'home-garden' },
        { id: 104, title: 'Fashion Accessories', handle: 'accessories' }
    ];
    
    // Demo pages
    pages = [
        { id: 201, title: 'About Us', handle: 'about' },
        { id: 202, title: 'Shipping Policy', handle: 'shipping' },
        { id: 203, title: 'Return Policy', handle: 'returns' },
        { id: 204, title: 'Privacy Policy', handle: 'privacy' }
    ];
    
    // Set up demo services
    translationService.setApiKey('demo_key');
    widgetTranslationService = new WidgetTranslationService(shopifyAPI, translationService);
    
    // Populate UI lists
    populateProductList();
    populateCollectionList();
    populatePageList();
    
    logManager.log('info', 'Demo data loaded successfully');
}

/**
 * Populate product list
 */
function populateProductList() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
    }
    
    products.forEach(product => {
        const item = createListItem(product, 'product');
        container.appendChild(item);
    });
}

/**
 * Populate collection list
 */
function populateCollectionList() {
    const container = document.getElementById('collection-list');
    container.innerHTML = '';
    
    if (collections.length === 0) {
        container.innerHTML = '<p>No collections found</p>';
        return;
    }
    
    collections.forEach(collection => {
        const item = createListItem(collection, 'collection');
        container.appendChild(item);
    });
}

/**
 * Populate page list
 */
function populatePageList() {
    const container = document.getElementById('page-list');
    container.innerHTML = '';
    
    if (pages.length === 0) {
        container.innerHTML = '<p>No pages found</p>';
        return;
    }
    
    pages.forEach(page => {
        const item = createListItem(page, 'page');
        container.appendChild(item);
    });
}

/**
 * Create a list item for products/collections/pages
 */
function createListItem(item, type) {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    
    listItem.innerHTML = `
        <input type="checkbox" id="${type}-${item.id}" value="${item.id}">
        <div class="list-item-content">
            <div class="list-item-title">${item.title}</div>
            <div class="list-item-subtitle">ID: ${item.id} | Handle: ${item.handle || 'N/A'}</div>
        </div>
    `;
    
    return listItem;
}

/**
 * Switch between tabs
 */
function switchTab(event) {
    const tabName = event.target.dataset.tab;
    showTab(tabName);
}

function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
}

/**
 * Get selected fields for translation
 */
function getSelectedFields(type) {
    const fields = {};
    
    switch (type) {
        case 'product':
            fields.title = document.getElementById('product-title').checked;
            fields.description = document.getElementById('product-description').checked;
            fields.tags = document.getElementById('product-tags').checked;
            fields.metaTitle = document.getElementById('product-meta-title').checked;
            fields.metaDescription = document.getElementById('product-meta-description').checked;
            fields.variantTitle = document.getElementById('product-variant-title').checked;
            break;
            
        case 'collection':
            fields.title = document.getElementById('collection-title').checked;
            fields.description = document.getElementById('collection-description').checked;
            fields.metaTitle = document.getElementById('collection-meta-title').checked;
            fields.metaDescription = document.getElementById('collection-meta-description').checked;
            break;
            
        case 'page':
            fields.title = document.getElementById('page-title').checked;
            fields.content = document.getElementById('page-content').checked;
            fields.metaTitle = document.getElementById('page-meta-title').checked;
            fields.metaDescription = document.getElementById('page-meta-description').checked;
            break;
    }
    
    return fields;
}

/**
 * Get selected items
 */
function getSelectedItems(type) {
    const checkboxes = document.querySelectorAll(`#${type}-list input[type="checkbox"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Translate products
 */
async function translateProducts() {
    const selectedFields = getSelectedFields('product');
    const selectedIds = getSelectedItems('product');
    const targetLanguage = document.getElementById('target-language').value;
    
    if (!validateTranslationRequest(selectedFields, selectedIds, 'products')) {
        return;
    }
    
    try {
        setLoadingState(true);
        logManager.log('info', `Starting translation of ${selectedIds.length} products`);
        
        for (let i = 0; i < selectedIds.length; i++) {
            const productId = selectedIds[i];
            
            // Get full product data
            const product = await shopifyAPI.getProductForTranslation(productId);
            
            // Validate and extract texts for translation
            const textsToTranslate = translationService.validateFieldsForTranslation(
                product, selectedFields, 'product'
            );
            
            if (textsToTranslate.length === 0) {
                logManager.log('warning', `No translatable content found for product ${product.title}`);
                continue;
            }
            
            // Translate
            const translatedTexts = await translationService.batchTranslate(
                textsToTranslate, targetLanguage, 'product'
            );
            
            // Apply translations back to product
            const updatedProduct = applyProductTranslations(product, translatedTexts, selectedFields);
            
            // Update in Shopify
            await shopifyAPI.updateProduct(productId, updatedProduct);
            
            logManager.log('success', `Translated product: ${product.title}`);
            updateProgress(((i + 1) / selectedIds.length) * 100);
        }
        
        logManager.log('success', 'Product translation completed successfully');
        
    } catch (error) {
        logManager.log('error', `Product translation failed: ${error.message}`);
    } finally {
        setLoadingState(false);
        updateProgress(0);
    }
}

/**
 * Translate collections
 */
async function translateCollections() {
    const selectedFields = getSelectedFields('collection');
    const selectedIds = getSelectedItems('collection');
    const targetLanguage = document.getElementById('target-language').value;
    
    if (!validateTranslationRequest(selectedFields, selectedIds, 'collections')) {
        return;
    }
    
    try {
        setLoadingState(true);
        logManager.log('info', `Starting translation of ${selectedIds.length} collections`);
        
        for (let i = 0; i < selectedIds.length; i++) {
            const collectionId = selectedIds[i];
            
            const collection = await shopifyAPI.getCollectionForTranslation(collectionId);
            
            const textsToTranslate = translationService.validateFieldsForTranslation(
                collection, selectedFields, 'collection'
            );
            
            if (textsToTranslate.length === 0) {
                logManager.log('warning', `No translatable content found for collection ${collection.title}`);
                continue;
            }
            
            const translatedTexts = await translationService.batchTranslate(
                textsToTranslate, targetLanguage, 'collection'
            );
            
            const updatedCollection = applyCollectionTranslations(collection, translatedTexts, selectedFields);
            await shopifyAPI.updateCollection(collectionId, updatedCollection);
            
            logManager.log('success', `Translated collection: ${collection.title}`);
            updateProgress(((i + 1) / selectedIds.length) * 100);
        }
        
        logManager.log('success', 'Collection translation completed successfully');
        
    } catch (error) {
        logManager.log('error', `Collection translation failed: ${error.message}`);
    } finally {
        setLoadingState(false);
        updateProgress(0);
    }
}

/**
 * Translate pages
 */
async function translatePages() {
    const selectedFields = getSelectedFields('page');
    const selectedIds = getSelectedItems('page');
    const targetLanguage = document.getElementById('target-language').value;
    
    if (!validateTranslationRequest(selectedFields, selectedIds, 'pages')) {
        return;
    }
    
    try {
        setLoadingState(true);
        logManager.log('info', `Starting translation of ${selectedIds.length} pages`);
        
        for (let i = 0; i < selectedIds.length; i++) {
            const pageId = selectedIds[i];
            
            const page = await shopifyAPI.getPageForTranslation(pageId);
            
            const textsToTranslate = translationService.validateFieldsForTranslation(
                page, selectedFields, 'page'
            );
            
            if (textsToTranslate.length === 0) {
                logManager.log('warning', `No translatable content found for page ${page.title}`);
                continue;
            }
            
            const translatedTexts = await translationService.batchTranslate(
                textsToTranslate, targetLanguage, 'page'
            );
            
            const updatedPage = applyPageTranslations(page, translatedTexts, selectedFields);
            await shopifyAPI.updatePage(pageId, updatedPage);
            
            logManager.log('success', `Translated page: ${page.title}`);
            updateProgress(((i + 1) / selectedIds.length) * 100);
        }
        
        logManager.log('success', 'Page translation completed successfully');
        
    } catch (error) {
        logManager.log('error', `Page translation failed: ${error.message}`);
    } finally {
        setLoadingState(false);
        updateProgress(0);
    }
}

/**
 * Detect widgets
 */
async function detectWidgets() {
    if (!widgetTranslationService) {
        logManager.log('error', 'Please connect to a store first');
        return;
    }
    
    try {
        setLoadingState(true);
        const statusDiv = document.getElementById('widget-detection-status');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = 'Detecting active widgets...';
        
        const widgets = await widgetTranslationService.detectActiveWidgets();
        
        statusDiv.innerHTML = `Found ${widgets.length} active widgets`;
        populateWidgetList(widgets);
        
    } catch (error) {
        logManager.log('error', `Widget detection failed: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Populate widget list
 */
function populateWidgetList(widgets) {
    const container = document.getElementById('widget-list');
    container.innerHTML = '';
    
    if (widgets.length === 0) {
        container.innerHTML = '<p>No widgets detected</p>';
        return;
    }
    
    widgets.forEach(widget => {
        const widgetItem = document.createElement('div');
        widgetItem.className = 'widget-item';
        
        widgetItem.innerHTML = `
            <label>
                <input type="checkbox" value="${widget.id}">
                <div class="widget-info">
                    <div class="widget-name">${widget.name}</div>
                    <div class="widget-description">${widget.description}</div>
                    <div class="widget-text-count">${widget.textCount} translatable texts</div>
                </div>
            </label>
        `;
        
        container.appendChild(widgetItem);
    });
}

/**
 * Translate widgets
 */
async function translateWidgets() {
    if (!widgetTranslationService) {
        logManager.log('error', 'Please detect widgets first');
        return;
    }
    
    const selectedWidgets = getSelectedWidgets();
    const targetLanguage = document.getElementById('target-language').value;
    
    if (selectedWidgets.length === 0) {
        logManager.log('error', 'Please select at least one widget to translate');
        return;
    }
    
    try {
        setLoadingState(true);
        
        const results = await widgetTranslationService.translateWidgets(selectedWidgets, targetLanguage);
        
        // Generate implementation code
        const implementationCode = widgetTranslationService.generateImplementationCode(results);
        
        // Show results to user
        showWidgetTranslationResults(results, implementationCode);
        
    } catch (error) {
        logManager.log('error', `Widget translation failed: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Get selected widgets
 */
function getSelectedWidgets() {
    const checkboxes = document.querySelectorAll('#widget-list input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => ({ id: cb.value }));
}

/**
 * Show widget translation results
 */
function showWidgetTranslationResults(results, implementationCode) {
    // Create results modal or section
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
        align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto;">
            <h3>Widget Translation Results</h3>
            <p>Translated ${results.length} widgets. Copy the code below to implement translations:</p>
            <textarea style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;">${implementationCode}</textarea>
            <div style="margin-top: 10px;">
                <button onclick="this.closest('.modal').remove()">Close</button>
                <button onclick="navigator.clipboard.writeText(this.previousElementSibling.previousElementSibling.value)">Copy Code</button>
            </div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
}

/**
 * Apply product translations
 */
function applyProductTranslations(product, translatedTexts, selectedFields) {
    const updated = { ...product };
    
    translatedTexts.forEach(item => {
        switch (item.field) {
            case 'title':
                if (selectedFields.title) updated.title = item.translatedText;
                break;
            case 'description':
                if (selectedFields.description) {
                    updated.body_html = item.hasHTML ? 
                        translationService.restoreHTML(item.originalHTML, item.translatedText) :
                        item.translatedText;
                }
                break;
            case 'tags':
                if (selectedFields.tags) updated.tags = item.translatedText;
                break;
        }
    });
    
    return updated;
}

/**
 * Apply collection translations
 */
function applyCollectionTranslations(collection, translatedTexts, selectedFields) {
    const updated = { ...collection };
    
    translatedTexts.forEach(item => {
        switch (item.field) {
            case 'title':
                if (selectedFields.title) updated.title = item.translatedText;
                break;
            case 'description':
                if (selectedFields.description) {
                    updated.body_html = item.hasHTML ? 
                        translationService.restoreHTML(item.originalHTML, item.translatedText) :
                        item.translatedText;
                }
                break;
        }
    });
    
    return updated;
}

/**
 * Apply page translations
 */
function applyPageTranslations(page, translatedTexts, selectedFields) {
    const updated = { ...page };
    
    translatedTexts.forEach(item => {
        switch (item.field) {
            case 'title':
                if (selectedFields.title) updated.title = item.translatedText;
                break;
            case 'content':
                if (selectedFields.content) {
                    updated.body_html = item.hasHTML ? 
                        translationService.restoreHTML(item.originalHTML, item.translatedText) :
                        item.translatedText;
                }
                break;
        }
    });
    
    return updated;
}

/**
 * Validate translation request
 */
function validateTranslationRequest(selectedFields, selectedIds, itemType) {
    // Check if any fields are selected
    const hasSelectedFields = Object.values(selectedFields).some(field => field);
    if (!hasSelectedFields) {
        logManager.log('error', `Please select at least one field to translate for ${itemType}`);
        return false;
    }
    
    // Check if any items are selected
    if (selectedIds.length === 0) {
        logManager.log('error', `Please select at least one ${itemType.slice(0, -1)} to translate`);
        return false;
    }
    
    return true;
}

/**
 * Update token count display
 */
function updateTokenCount(totalTokens) {
    document.getElementById('tokens-used').textContent = `Tokens Used: ${totalTokens}`;
}

/**
 * Update progress display
 */
function updateProgress(percentage) {
    document.getElementById('translation-progress').textContent = `Progress: ${Math.round(percentage)}%`;
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = loading;
    });
    
    if (loading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case '1':
                event.preventDefault();
                showTab('products');
                break;
            case '2':
                event.preventDefault();
                showTab('collections');
                break;
            case '3':
                event.preventDefault();
                showTab('pages');
                break;
            case '4':
                event.preventDefault();
                showTab('widgets');
                break;
        }
    }
}
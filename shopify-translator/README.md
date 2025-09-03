# Shopify Translation Plugin

A comprehensive web application for translating Shopify store content using OpenAI's translation capabilities with optimized token usage and widget support.

## Features

### ✅ OpenAI Token Optimization
- **Batch Translation**: Groups multiple texts into single API calls to minimize token usage
- **Smart Field Validation**: Only translates selected fields, preventing unnecessary API calls
- **Token Tracking**: Real-time monitoring of token consumption with detailed logging
- **Rate Limiting**: Intelligent API request pacing to respect both Shopify and OpenAI limits

### ✅ Strict Field Selection Compliance
- **Checkbox Validation**: Only translates fields explicitly selected by the user
- **Pre-translation Validation**: Validates field selection before making any API calls
- **Field-specific Translation**: Separate handling for titles, descriptions, tags, and meta fields

### ✅ Widget/Plugin Translation Support
- **Automatic Widget Detection**: Scans the storefront for active widgets and plugins
- **Front-end Text Extraction**: Identifies and extracts only user-visible text content
- **Implementation Code Generation**: Provides ready-to-use JavaScript code for applying translations
- **Widget Type Recognition**: Supports common widget types (reviews, chat, popups, announcements, etc.)

### ✅ Comprehensive Store Content Translation
- **Products**: Title, description, tags, meta title/description, variant titles
- **Collections**: Title, description, meta title/description
- **Pages**: Title, content, meta title/description
- **Widgets**: Dynamic detection and translation of third-party plugin content

### ✅ Technical Architecture
- **Optimized ShopifyAPI Class**: Efficient API interactions with rate limiting
- **Advanced TranslationService**: Batch processing with token optimization
- **WidgetTranslationService**: Specialized widget content handling
- **Comprehensive Logging**: Detailed operation tracking and error reporting

## Installation

1. Clone or download this repository
2. Navigate to the `shopify-translator` directory
3. Serve the files using any HTTP server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
4. Open your browser to `http://localhost:8000`

## Usage

### 1. Store Configuration
1. Enter your Shopify store URL (e.g., `your-store.myshopify.com`)
2. Provide your Shopify API access token with appropriate permissions
3. Enter your OpenAI API key
4. Select the target language for translation
5. Click "Connect Store"

### 2. Content Translation

#### Products Tab
- Select fields to translate (title, description, tags, etc.)
- Choose specific products from the list
- Click "Translate Selected Products"

#### Collections Tab
- Select fields to translate
- Choose collections to translate
- Click "Translate Selected Collections"

#### Pages Tab
- Select fields to translate
- Choose pages to translate
- Click "Translate Selected Pages"

#### Widgets/Plugins Tab
- Click "Detect Active Widgets" to scan your storefront
- Select widgets you want to translate
- Click "Translate Selected Widgets"
- Copy the generated implementation code to your theme

### 3. Monitoring and Logs
- Real-time token usage tracking in the header
- Translation progress indicator
- Comprehensive activity logs at the bottom

## API Requirements

### Shopify API Permissions
Your private app or API access token needs the following scopes:
- `read_products` and `write_products`
- `read_content` and `write_content` (for pages)
- `read_themes` (for widget detection)

### OpenAI API
- Valid OpenAI API key with GPT-3.5-turbo access
- Sufficient token credits for your translation volume

## Token Optimization Features

### Batch Processing
- Groups up to 10 texts per API call
- Reduces API overhead by ~90% compared to individual calls
- Smart batching based on content length and type

### Intelligent Filtering
- Validates content before translation (skips empty fields)
- Preserves HTML structure while translating text content
- Only processes user-selected fields

### Usage Tracking
- Real-time token consumption monitoring
- Per-request token breakdown (prompt + completion)
- Total usage statistics and averages

## Widget Translation

The widget translation feature automatically detects and translates content from:

- **Review Widgets** (Stamped, Yotpo, etc.)
- **Chat Widgets** (Intercom, Zendesk, etc.)
- **Popup Widgets** (Newsletter signups, promotions)
- **Social Proof Widgets** (Recent purchases, stock alerts)
- **Announcement Bars** (Promotional banners)
- **Size Guides** (Product sizing information)
- **Product Recommendations** (Upsells, cross-sells)

### Implementation
After translating widgets, the plugin generates JavaScript code that you can add to your theme to apply the translations automatically.

## File Structure

```
shopify-translator/
├── index.html              # Main application interface
├── css/
│   └── main.css            # Application styling
└── js/
    ├── shopify-api.js      # Shopify API integration
    ├── translation-service.js # OpenAI translation service
    ├── widget-translation-service.js # Widget handling
    └── main.js             # Main application logic
```

## Security Considerations

- API keys are stored only in browser memory (not persisted)
- All API calls are made directly from the browser (no server-side storage)
- HTTPS recommended for production use
- Consider using environment variables for API keys in production

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Connection Issues
- Verify your Shopify store URL format
- Check API token permissions
- Ensure OpenAI API key is valid

### Translation Issues
- Check available OpenAI token balance
- Verify field selections before translating
- Monitor the translation log for specific errors

### Widget Detection Issues
- Ensure your store is publicly accessible
- Check that widgets are active and visible
- Some widgets may require manual text extraction

## Development

### Adding New Widget Types
1. Add selectors to `widgetSelectors` in `widget-translation-service.js`
2. Update the `simulateWidgetDetection` method for testing
3. Test with real widget implementations

### Extending Language Support
1. Add language codes to the dropdown in `index.html`
2. Update the `languageNames` mapping in `translation-service.js`
3. Adjust system prompts for language-specific contexts

### Custom Field Support
1. Add field checkboxes to the appropriate tab in `index.html`
2. Update `getSelectedFields` function in `main.js`
3. Extend validation logic in `validateFieldsForTranslation`

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please check the repository issues or create a new one with detailed information about your use case.
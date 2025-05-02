# AI Insight Widget Integration Guide

This guide explains how to integrate the AI Insight Widget into any website.

## Overview

The AI Insight Widget analyzes content on webpages and provides AI-generated insights. It can be integrated into any website using a few simple methods.

## Prerequisites

- Backend API running at a known URL (e.g., `http://localhost:8000`)
- Widget files accessible via a web server:
  - `widget.js`
  - `styles.css`

## Integration Methods

### Method 1: Traditional Integration (HTML Embedding)

Add the following code to your HTML file:

```html
<!-- Add the widget stylesheet -->
<link rel="stylesheet" href="https://your-domain.com/path/to/styles.css">

<!-- Add the widget script with configuration options -->
<script src="https://your-domain.com/path/to/widget.js" 
  data-api="https://your-backend-api.com" 
  data-selector="[data-selector]" 
  data-theme="light" 
  data-mode="auto"
  data-dynamic="true"
  data-smart-detection="true"></script>
```

### Method 2: Dynamic Injection via Browser Console

For testing or injecting the widget into sites you don't control:

1. Open the browser console (F12 or Right-click > Inspect > Console)
2. Execute the following code:

```javascript
// Step 1: Add the CSS
const widgetStyles = document.createElement('link');
widgetStyles.rel = 'stylesheet';
widgetStyles.href = 'http://localhost:3000/widget/styles.css';
document.head.appendChild(widgetStyles);

// Step 2: Add the script
const widgetScript = document.createElement('script');
widgetScript.src = 'http://localhost:3000/widget/widget.js';
widgetScript.setAttribute('data-api', 'http://localhost:8000');
widgetScript.setAttribute('data-selector', 'article, .content, main');
widgetScript.setAttribute('data-theme', 'light');
widgetScript.setAttribute('data-mode', 'auto');
widgetScript.setAttribute('data-dynamic', 'true');
widgetScript.setAttribute('data-smart-detection', 'true');
document.body.appendChild(widgetScript);

// Step 3: Wait for script to load, then manually initialize
setTimeout(() => {
  if (typeof AIInsightWidget === 'function') {
    window.aiInsightWidget = new AIInsightWidget({
      apiUrl: 'http://localhost:8000',
      selector: 'article, .content, main', 
      theme: 'light',
      mode: 'manual',
      dynamicContentSupport: true,
      smartContentDetection: true
    });
    console.log("Widget manually initialized");
  } else {
    console.error("AIInsightWidget class not found - script may not be loaded correctly");
  }
}, 1000);
```

### Method 3: Programmatic Integration

For more control over initialization:

```javascript
// Add this to your application code after loading the widget files
document.addEventListener('DOMContentLoaded', () => {
  const insightWidget = new AIInsightWidget({
    apiUrl: 'https://your-backend-api.com',
    selector: 'article, .content, main', 
    theme: 'light',
    mode: 'auto',
    dynamicContentSupport: true,
    smartContentDetection: true
  });
});
```

## Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `apiUrl` | URL of the backend API | `http://localhost:8000` |
| `selector` | CSS selector for content elements | `[data-selector]` |
| `theme` | Widget theme (`light` or `dark`) | `light` |
| `mode` | Analysis mode (`auto` or `manual`) | `auto` |
| `dynamicContentSupport` | Enable dynamic content detection | `true` |
| `smartContentDetection` | Enable smart content detection | `true` |
| `maxHeight` | Maximum height of the widget panel | `400px` |

## Content Selection

The widget can detect content in several ways:

1. **Using data attributes**: Add `data-selector` to elements you want analyzed
   ```html
   <article data-selector>Your content here</article>
   ```

2. **Using CSS selectors**: Configure widget with appropriate selectors
   ```javascript
   selector: 'article, main, .content'
   ```

3. **Smart detection**: Set `smartContentDetection: true` to automatically find content

## Troubleshooting

### Widget Not Appearing

1. Check that the widget script and CSS files are loading correctly
2. Verify the content selectors match elements on your page
3. Try manually initializing the widget
4. Check for console errors related to the widget

### API Connection Issues

1. Ensure your backend API is running
2. Check for CORS configuration issues
3. Verify the API URL is correct and accessible
4. Test the API with a direct call (e.g., `/health` endpoint)

### Content Not Being Detected

1. Try using more specific selectors
2. Add `data-selector` attributes to important content elements
3. Enable `smartContentDetection` option
4. Check console logs for content detection information

## Widget Customization

The widget appearance can be customized by:

1. Selecting a theme (`light` or `dark`)
2. Modifying the CSS (advanced)
3. Configuring the height and other display options

## Security Considerations

1. Configure CORS settings on your backend to allow only trusted domains
2. Use HTTPS for production deployments
3. Consider rate limiting to prevent API abuse

## Advanced Integration

For full control, consider building a custom frontend that directly consumes the API. The backend exposes endpoints like:

- `/analyze` - Analyze content and generate insights
- `/health` - Check API health and status 
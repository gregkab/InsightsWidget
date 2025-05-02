# AI Insight Widget: Browser Console Injection Guide

This guide provides a quick reference for injecting the AI Insight Widget into any website using the browser console.

## Prerequisites

1. Backend API running (default: http://localhost:8000)
2. Frontend server hosting widget files (default: http://localhost:3000)

## Quick Steps

1. Open any website in your browser
2. Open Developer Tools (F12 or Right-click > Inspect)
3. Go to the Console tab
4. Copy and paste the code blocks below in sequence

## Code Blocks

### Step 1: Add the CSS

```javascript
const widgetStyles = document.createElement('link');
widgetStyles.rel = 'stylesheet';
widgetStyles.href = 'http://localhost:3000/widget/styles.css';
document.head.appendChild(widgetStyles);
```

### Step 2: Add the script

```javascript
const widgetScript = document.createElement('script');
widgetScript.src = 'http://localhost:3000/widget/widget.js';
widgetScript.setAttribute('data-api', 'http://localhost:8000');
widgetScript.setAttribute('data-selector', 'article, .content, main');
widgetScript.setAttribute('data-theme', 'light');
widgetScript.setAttribute('data-mode', 'auto');
widgetScript.setAttribute('data-dynamic', 'true');
widgetScript.setAttribute('data-smart-detection', 'true');
document.body.appendChild(widgetScript);
```

### Step 3: Initialize the widget

```javascript
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

## Troubleshooting

- If you see `net::ERR_CONNECTION_REFUSED` errors, make sure your servers are running
- If the widget doesn't appear, check if content on the page matches your selectors
- If the script doesn't load, verify the URLs are correct for your environment

## Customization

Modify these parts of the code to customize the widget:

- `data-theme`: `"light"` or `"dark"`
- `data-mode`: `"auto"` or `"manual"`
- `data-selector`: CSS selector to target content elements
- `apiUrl`: URL of your backend API

## Production Deployment

For production use:
1. Host widget files on a CDN or web server
2. Deploy the backend API to a public server
3. Update URLs in the code to point to your hosted resources
4. Consider using the HTML embedding method instead for permanent integration 
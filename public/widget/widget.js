/**
 * AI Insight Widget
 * 
 * This script creates a widget that analyzes page content and provides AI-generated insights.
 * Built on 2025-04-20
 */

(function() {
/**
 * Utilities Module
 * Helper functions for the widget
 */

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {Number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Debounce function to delay execution until after a pause
 * @param {Function} func - Function to debounce
 * @param {Number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Check if content has changed significantly
 * @param {String} oldContent - Previous content
 * @param {String} newContent - New content
 * @param {Number} threshold - Change threshold (0-1)
 * @returns {Boolean} - True if content has changed significantly
 */
function hasContentChangedSignificantly(oldContent, newContent, threshold = 0.1) {
  // Simple length comparison for demo purposes
  const oldLength = oldContent.length;
  const newLength = newContent.length;
  
  // If length differs by more than threshold percentage, consider it significant
  return Math.abs(oldLength - newLength) / Math.max(oldLength, 1) > threshold;
} 

/**
 * Configuration Module
 * Handles widget configuration and default settings
 */

/**
 * Create default configuration with user overrides
 * @param {Object} userConfig - User provided configuration
 * @returns {Object} - The merged configuration
 */
function createConfig(userConfig = {}) {
  // Default configuration
  const defaultConfig = {
    apiUrl: 'http://localhost:8000',
    selector: '[data-selector]',
    mode: 'auto',
    theme: 'light',
    maxHeight: '400px',
    dynamicContentSupport: true,
    smartContentDetection: true,
  };
  
  // Merge default with user config
  return { ...defaultConfig, ...userConfig };
}

/**
 * Extract configuration from script tag data attributes
 * @returns {Object} - Configuration from script tag
 */
function getConfigFromScriptTag() {
  const scriptTag = document.querySelector('script[data-api]');
  
  if (!scriptTag) return {};
  
  return {
    apiUrl: scriptTag.getAttribute('data-api'),
    selector: scriptTag.getAttribute('data-selector'),
    mode: scriptTag.getAttribute('data-mode'),
    theme: scriptTag.getAttribute('data-theme'),
    maxHeight: scriptTag.getAttribute('data-max-height'),
    dynamicContentSupport: scriptTag.hasAttribute('data-dynamic') ? 
      scriptTag.getAttribute('data-dynamic') !== 'false' : true,
    smartContentDetection: scriptTag.hasAttribute('data-smart-detection') ?
      scriptTag.getAttribute('data-smart-detection') !== 'false' : true
  };
} 

/**
 * Content Detector Module
 * Handles content detection, smart detection, and mutation observation
 */

/**
 * Find content elements based on selector or use smart detection
 * @param {Object} config - Widget configuration
 * @param {Element} widgetElement - The widget element to exclude from detection
 * @returns {Array} - Array of detected content elements
 */
function findContentElements(config, widgetElement) {
  // First try with the provided selector
  let elements = document.querySelectorAll(config.selector);
  
  // If no elements found and smart detection is enabled
  if (elements.length === 0 && config.smartContentDetection) {
    console.log('No content elements found with selector, trying smart detection');
    elements = performSmartContentDetection(widgetElement);
  }
  
  console.log(`Found ${elements.length} content elements for analysis`);
  return elements;
}

/**
 * Automatically detect content without explicit data-selector attributes
 * @param {Element} widgetElement - The widget element to exclude from detection
 * @returns {Array} - Array of detected content elements
 */
function performSmartContentDetection(widgetElement) {
  // Common content containers
  const contentSelectors = [
    'article', 'main', '[role="main"]', 
    '.content', '.post-content', '.entry-content',
    'section:not(header):not(footer)',
    // For single-page applications
    '[data-view]', '[data-page]', '[data-route]',
    // Forms
    'form'
  ];
  
  // Try each selector
  for (const selector of contentSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Smart detection found ${elements.length} content elements with selector: ${selector}`);
      return elements;
    }
  }
  
  // If still no content found, use the body as fallback, but exclude script tags and the widget itself
  console.log('Smart detection using body as fallback');
  return [document.body];
}

/**
 * Create mutation observer to watch for content changes
 * @param {Array} contentElements - Elements to observe
 * @param {Function} onContentChanged - Callback when content changes
 * @returns {MutationObserver} - The mutation observer
 */
function createContentObserver(contentElements, onContentChanged) {
  // Store last content for comparison
  let lastContent = '';
  
  // Extract current content for initial comparison base
  if (contentElements.length > 0) {
    try {
      lastContent = Array.from(contentElements)
        .map(el => el.textContent || '')
        .join('\n\n')
        .trim();
    } catch (e) {
      console.error('Error getting initial content:', e);
    }
  }
  
  // Create mutation observer
  const observer = new MutationObserver((mutations) => {
    // Ignore mutations that are likely not relevant to content
    const relevantChanges = mutations.filter(mutation => {
      // Ignore style changes
      if (mutation.target.nodeName === 'STYLE') return false;
      
      // Ignore script changes
      if (mutation.target.nodeName === 'SCRIPT') return false;
      
      // Ignore changes to the widget itself
      if (mutation.target.closest && mutation.target.closest('.ai-insight-widget')) return false;
      
      // For added nodes, only count if they contain visible text content
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        return Array.from(mutation.addedNodes).some(node => {
          return node.textContent && node.textContent.trim().length > 0;
        });
      }
      
      // For character data, only count if it changed visible text
      if (mutation.type === 'characterData') {
        return mutation.target.textContent && mutation.target.textContent.trim().length > 0;
      }
      
      return false;
    });
    
    if (relevantChanges.length === 0) return;
    
    // Extract current content for comparison
    const currentContent = Array.from(contentElements)
      .map(el => el.textContent || '')
      .join('\n\n')
      .trim();
    
    // Compare text length as a simple heuristic
    // Only trigger if content changed by more than 5% or 20 characters
    const oldLength = lastContent.length;
    const newLength = currentContent.length;
    const absoluteChange = Math.abs(oldLength - newLength);
    const percentChange = oldLength > 0 ? absoluteChange / oldLength : 1;
    
    if (absoluteChange > 20 || percentChange > 0.05) {
      console.log(`Content changes detected (${absoluteChange} chars, ${(percentChange * 100).toFixed(1)}%)`);
      lastContent = currentContent;
      onContentChanged();
    }
  });
  
  // Start observing relevant parts of the DOM
  const observeTarget = contentElements.length === 0 ? 
    document.body : (contentElements.length === 1 ? contentElements[0] : document.body);
  
  observer.observe(observeTarget, { 
    childList: true, 
    subtree: true, 
    characterData: true 
  });
  
  console.log('Dynamic content observation enabled');
  return observer;
}

/**
 * Extract text and form data from content elements
 * @param {Array} contentElements - Elements to extract content from
 * @param {Element} widgetElement - The widget element to exclude
 * @returns {String} - Extracted content text
 */
function extractContentFromElements(contentElements, widgetElement) {
  let content = '';
  
  // Process each content element
  for (const element of contentElements) {
    // Skip the widget itself
    if (element.contains(widgetElement) || widgetElement.contains(element)) {
      continue;
    }
    
    // Extract text content, exclude script tags
    const scripts = Array.from(element.querySelectorAll('script'));
    const clonedElement = element.cloneNode(true);
    
    // Remove scripts from clone
    scripts.forEach(script => {
      const scriptInClone = clonedElement.querySelector(`script[src="${script.src}"]`) || 
                          Array.from(clonedElement.querySelectorAll('script'))
                            .find(s => s.textContent === script.textContent);
      if (scriptInClone && scriptInClone.parentNode) {
        scriptInClone.parentNode.removeChild(scriptInClone);
      }
    });
    
    // Also collect form data if present
    const forms = element.querySelectorAll('form');
    let formData = {};
    
    if (forms.length > 0) {
      Array.from(forms).forEach((form, formIndex) => {
        const formInputs = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
          if (input.name) {
            if (input.type === 'checkbox' || input.type === 'radio') {
              formInputs[input.name] = input.checked ? 'checked' : 'unchecked';
            } else {
              formInputs[input.name] = input.value;
            }
          }
        });
        
        if (Object.keys(formInputs).length > 0) {
          formData[`form_${formIndex}`] = formInputs;
        }
      });
    }
    
    // Add element content
    content += clonedElement.textContent.trim() + '\n\n';
    
    // Add form data in a structured way if available
    if (Object.keys(formData).length > 0) {
      content += "Form Data:\n";
      for (const [formName, inputs] of Object.entries(formData)) {
        content += `${formName}:\n`;
        for (const [inputName, value] of Object.entries(inputs)) {
          content += `  ${inputName}: ${value}\n`;
        }
        content += '\n';
      }
    }
  }
  
  return content;
} 

/**
 * API Service Module
 * Handles communication with the backend API
 */

/**
 * Send content to API for analysis
 * @param {String} apiUrl - URL of the API endpoint
 * @param {String} content - Content to analyze
 * @returns {Promise} - Promise resolving to analysis results
 */
async function analyzeContent(apiUrl, content) {
  try {
    // Send content to API
    const response = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
} 

/**
 * UI Elements Module
 * Handles creating and managing UI components
 */

/**
 * Create all widget UI elements
 * @param {Object} config - Widget configuration
 * @returns {Object} - Object containing all created elements
 */
function createWidgetElements(config) {
  // Create container
  const container = document.createElement('div');
  container.className = 'ai-insight-widget';
  container.setAttribute('data-theme', config.theme);
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'ai-insight-widget__toggle';
  toggleButton.innerHTML = '<span>AI</span>';
  toggleButton.title = 'Toggle AI Insights';
  
  // Create insights panel
  const panel = document.createElement('div');
  panel.className = 'ai-insight-widget__panel';
  panel.innerHTML = `
    <div class="ai-insight-widget__header">
      <h3>AI Insights</h3>
      <button class="ai-insight-widget__close">×</button>
    </div>
    <div class="ai-insight-widget__content"></div>
  `;
  panel.style.display = 'none';
  
  // Append elements to container
  container.appendChild(toggleButton);
  container.appendChild(panel);
  
  // Append container to body
  document.body.appendChild(container);
  
  return {
    container,
    toggleButton,
    panel,
    contentEl: panel.querySelector('.ai-insight-widget__content'),
    closeButton: panel.querySelector('.ai-insight-widget__close'),
    headerEl: panel.querySelector('.ai-insight-widget__header h3')
  };
}

/**
 * Update the panel content
 * @param {Element} contentEl - The content element to update
 * @param {String} content - HTML content to insert
 */
function updatePanelContent(contentEl, content) {
  contentEl.innerHTML = content;
}

/**
 * Show loading state in panel
 * @param {Element} contentEl - The content element
 */
function showLoading(contentEl) {
  updatePanelContent(contentEl, '<div class="ai-insight-widget__loading">Analyzing content...</div>');
}

/**
 * Show error state in panel
 * @param {Element} contentEl - The content element
 * @param {Error} error - The error object
 */
function showError(contentEl, error) {
  updatePanelContent(contentEl, `<div class="ai-insight-widget__error">Error: ${error.message}</div>`);
}

/**
 * Show content changed notification
 * @param {Element} contentEl - The content element
 * @param {Function} onReanalyze - Callback when reanalyze button is clicked
 */
function showContentChangedNotification(contentEl, onReanalyze) {
  // Check if notification already exists
  if (!contentEl.querySelector('.content-changed-notification')) {
    const notification = document.createElement('div');
    notification.className = 'content-changed-notification';
    notification.innerHTML = `
      <div style="background: #fff8e6; color: #854d0e; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 14px;">
        <p style="margin: 0 0 8px 0;"><strong>Content has changed</strong></p>
        <p style="margin: 0 0 8px 0;">The page content has changed since the last analysis.</p>
        <button class="reanalyze-button" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Analyze Again</button>
      </div>
    `;
    
    // Add to top of content
    contentEl.insertBefore(notification, contentEl.firstChild);
    
    // Add click event for reanalysis
    notification.querySelector('.reanalyze-button').addEventListener('click', () => {
      removeContentChangedNotification(contentEl);
      onReanalyze();
    });
  }
}

/**
 * Remove content changed notification if it exists
 * @param {Element} contentEl - The content element
 */
function removeContentChangedNotification(contentEl) {
  const notification = contentEl.querySelector('.content-changed-notification');
  if (notification) {
    notification.remove();
  }
}

/**
 * Format insights for display
 * @param {Array|String} insights - Insights data
 * @returns {String} - Formatted HTML
 */
function formatInsights(insights) {
  if (!insights || insights.length === 0) {
    return '<div class="ai-insight-widget__empty">No insights available</div>';
  }
  
  if (Array.isArray(insights)) {
    return `<div class="ai-insight-widget__insights">
      ${insights.map(insight => `
        <div class="ai-insight-widget__insight">
          <h4>${insight.content}</h4>
          <p class="ai-insight-widget__rationale">${insight.rationale}</p>
          <div class="ai-insight-widget__impact">Impact: <span class="impact-${insight.impact?.toLowerCase()}">${insight.impact}</span></div>
        </div>
      `).join('')}
    </div>`;
  }
  
  return `<div class="ai-insight-widget__insights">${insights}</div>`;
}

/**
 * Add expert role information to the panel
 * @param {Element} headerEl - The header element
 * @param {String} role - The expert role
 */
function addExpertRole(headerEl, role) {
  headerEl.innerHTML = `AI Insights <span style="font-size: 12px; opacity: 0.7; font-weight: normal; margin-left: 4px;">by ${role}</span>`;
} 

/**
 * Styles Module
 * Contains widget CSS styles
 */

/**
 * Add CSS styles to the document
 */
function addStyles() {
  const css = `
    .ai-insight-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .ai-insight-widget__toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #6366f1;
      border: none;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    .ai-insight-widget__toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    
    .ai-insight-widget__toggle.active {
      background: #4f46e5;
    }
    
    .ai-insight-widget__panel {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 350px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      overflow: auto;
      display: flex;
      flex-direction: column;
      max-height: calc(80vh - 60px);
    }
    
    .ai-insight-widget__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .ai-insight-widget__header h3 {
      margin: 0;
      font-size: 16px;
      color: #1f2937;
    }
    
    .ai-insight-widget__close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .ai-insight-widget__content {
      padding: 16px;
      overflow-y: auto;
      flex-grow: 1;
    }
    
    .ai-insight-widget__loading {
      text-align: center;
      padding: 20px;
      color: #6b7280;
    }
    
    .ai-insight-widget__error {
      color: #ef4444;
      padding: 12px;
      border-radius: 4px;
      background: #fee2e2;
    }
    
    .ai-insight-widget__empty {
      text-align: center;
      padding: 20px;
      color: #6b7280;
    }
    
    .ai-insight-widget__insights {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .ai-insight-widget__insight {
      padding: 12px;
      border-radius: 6px;
      background: #f9fafb;
      border-left: 4px solid #6366f1;
    }
    
    .ai-insight-widget__insight h4 {
      margin: 0 0 8px 0;
      color: #111827;
      font-size: 15px;
    }
    
    .ai-insight-widget__rationale {
      margin: 8px 0;
      color: #4b5563;
      font-size: 13px;
    }
    
    .ai-insight-widget__impact {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
    }
    
    .impact-high {
      color: #059669;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .impact-medium {
      color: #d97706;
      background: #fffbeb;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .impact-low {
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    
    [data-theme="dark"] .ai-insight-widget__panel {
      background: #1f2937;
      color: #f3f4f6;
    }
    
    [data-theme="dark"] .ai-insight-widget__header {
      background: #111827;
      border-bottom: 1px solid #374151;
    }
    
    [data-theme="dark"] .ai-insight-widget__header h3 {
      color: #f9fafb;
    }
    
    [data-theme="dark"] .ai-insight-widget__close {
      color: #9ca3af;
    }
    
    [data-theme="dark"] .ai-insight-widget__insight {
      background: #111827;
      border-left: 4px solid #4f46e5;
    }
    
    [data-theme="dark"] .ai-insight-widget__insight h4 {
      color: #f9fafb;
    }
    
    [data-theme="dark"] .ai-insight-widget__rationale {
      color: #d1d5db;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
} 

/**
 * AI Insight Widget
 * Main module that integrates all components
 */








/**
 * AI Insight Widget Class
 * Main widget implementation
 */
class AIInsightWidget {
  /**
   * Create a new widget instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Initialize configuration
    this.config = createConfig(config);
    
    // Initialize state
    this.isLoading = false;
    this.insights = null;
    this.initialized = false;
    this.contentObserver = null;
    this.contentChanged = false;
    this.contentElements = [];
    this.previousContent = '';
    
    // Initialize the widget
    this.init();
  }
  
  /**
   * Initialize the widget
   */
  init() {
    if (this.initialized) return;
    
    // Create widget elements
    const elements = createWidgetElements(this.config);
    this.ui = elements;
    
    // Add event listeners
    this.addEventListeners();
    
    // Set up content detection
    this.setupContentDetection();
    
    // Add CSS styles
    addStyles();
    
    this.initialized = true;
    console.log('AI Insight Widget initialized');
  }
  
  /**
   * Add event listeners to widget elements
   */
  addEventListeners() {
    // Toggle panel on button click
    this.ui.toggleButton.addEventListener('click', () => this.togglePanel());
    
    // Close panel on close button click
    this.ui.closeButton.addEventListener('click', () => this.togglePanel(false));
  }
  
  /**
   * Set up content detection and observation
   */
  setupContentDetection() {
    // Find content elements
    this.contentElements = findContentElements(this.config, this.ui.container);
    
    // Set up dynamic content observation if enabled
    if (this.config.dynamicContentSupport) {
      this.contentObserver = createContentObserver(
        this.contentElements, 
        () => {
          this.contentChanged = true;
          
          // If panel is visible, show notification about content changes
          if (this.ui.panel.style.display !== 'none' && this.insights) {
            showContentChangedNotification(this.ui.contentEl, () => this.analyzeContent());
          }
        }
      );
    }
    
    // If mode is auto, analyze content immediately
    if (this.config.mode === 'auto' && this.contentElements.length > 0) {
      this.analyzeContent();
    }
  }
  
  /**
   * Toggle the insights panel
   * @param {Boolean} show - Force panel state
   */
  togglePanel(show = null) {
    const isVisible = this.ui.panel.style.display !== 'none';
    const newState = show !== null ? show : !isVisible;
    
    this.ui.panel.style.display = newState ? 'block' : 'none';
    this.ui.toggleButton.classList.toggle('active', newState);
    
    // If showing panel and content has changed or no insights available, analyze content
    if (newState && (!this.insights || this.contentChanged) && !this.isLoading) {
      this.analyzeContent();
    }
  }
  
  /**
   * Analyze page content and get insights
   */
  async analyzeContent() {
    // Reset content changed flag
    this.contentChanged = false;
    
    // Remove any existing content changed notification
    removeContentChangedNotification(this.ui.contentEl);
    
    // Refresh content elements in case DOM has changed significantly
    if (this.config.dynamicContentSupport) {
      this.contentElements = findContentElements(this.config, this.ui.container);
    }
    
    if (this.isLoading || this.contentElements.length === 0) return;
    
    this.isLoading = true;
    showLoading(this.ui.contentEl);
    
    try {
      // Extract content from elements
      const content = extractContentFromElements(this.contentElements, this.ui.container);
      
      // Store content for comparison
      this.previousContent = content;
      
      // Send content to API for analysis
      const data = await analyzeContent(this.config.apiUrl, content);
      this.insights = data.insights;
      
      // Update panel with insights
      updatePanelContent(this.ui.contentEl, formatInsights(this.insights));
      
      // Show expert role if available
      if (data.expert_role) {
        addExpertRole(this.ui.headerEl, data.expert_role);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      showError(this.ui.contentEl, error);
    } finally {
      this.isLoading = false;
    }
  }
}

// Auto-initialize the widget if data-api attribute is present
document.addEventListener('DOMContentLoaded', () => {
  const config = getConfigFromScriptTag();
  
  if (config.apiUrl) {
    // Initialize widget with config from script tag
    window.aiInsightWidget = new AIInsightWidget(config);
  }
});

// Export the widget class
window.AIInsightWidget = AIInsightWidget; 

})();
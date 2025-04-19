/**
 * AI Insight Widget
 * 
 * This script creates a widget that analyzes page content and provides AI-generated insights.
 */

class AIInsightWidget {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:8000',
      selector: config.selector || '[data-selector]',
      mode: config.mode || 'auto',
      theme: config.theme || 'light',
      maxHeight: config.maxHeight || '400px',
      ...config
    };
    
    this.isLoading = false;
    this.insights = null;
    this.initialized = false;
    
    // Initialize the widget
    this.init();
  }
  
  /**
   * Initialize the widget
   */
  init() {
    if (this.initialized) return;
    
    // Create widget elements
    this.createWidgetElements();
    
    // Add event listeners
    this.addEventListeners();
    
    // Set up content detection
    this.setupContentDetection();
    
    // Add CSS styles
    this.addStyles();
    
    this.initialized = true;
    console.log('AI Insight Widget initialized');
  }
  
  /**
   * Create widget UI elements
   */
  createWidgetElements() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'ai-insight-widget';
    this.container.setAttribute('data-theme', this.config.theme);
    
    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'ai-insight-widget__toggle';
    this.toggleButton.innerHTML = '<span>AI</span>';
    this.toggleButton.title = 'Toggle AI Insights';
    
    // Create insights panel
    this.panel = document.createElement('div');
    this.panel.className = 'ai-insight-widget__panel';
    this.panel.innerHTML = `
      <div class="ai-insight-widget__header">
        <h3>AI Insights</h3>
        <button class="ai-insight-widget__close">×</button>
      </div>
      <div class="ai-insight-widget__content"></div>
    `;
    this.panel.style.display = 'none';
    
    // Append elements to container
    this.container.appendChild(this.toggleButton);
    this.container.appendChild(this.panel);
    
    // Append container to body
    document.body.appendChild(this.container);
  }
  
  /**
   * Add CSS styles to the document
   */
  addStyles() {
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
   * Add event listeners to widget elements
   */
  addEventListeners() {
    // Toggle panel on button click
    this.toggleButton.addEventListener('click', () => this.togglePanel());
    
    // Close panel on close button click
    const closeButton = this.panel.querySelector('.ai-insight-widget__close');
    closeButton.addEventListener('click', () => this.togglePanel(false));
  }
  
  /**
   * Set up content detection based on data attributes
   */
  setupContentDetection() {
    // Find elements with data-selector attribute
    this.contentElements = document.querySelectorAll(this.config.selector);
    
    if (this.contentElements.length === 0) {
      console.warn('No content elements found for AI Insight Widget');
    } else {
      console.log(`Found ${this.contentElements.length} content elements for analysis`);
      
      // If mode is auto, analyze content immediately
      if (this.config.mode === 'auto') {
        this.analyzeContent();
      }
    }
  }
  
  /**
   * Toggle the insights panel
   */
  togglePanel(show = null) {
    const isVisible = this.panel.style.display !== 'none';
    const newState = show !== null ? show : !isVisible;
    
    this.panel.style.display = newState ? 'block' : 'none';
    this.toggleButton.classList.toggle('active', newState);
    
    // If showing panel and no insights available, analyze content
    if (newState && !this.insights && !this.isLoading) {
      this.analyzeContent();
    }
  }
  
  /**
   * Analyze page content and get insights
   */
  async analyzeContent() {
    if (this.isLoading || this.contentElements.length === 0) return;
    
    this.isLoading = true;
    this.updatePanelContent('<div class="ai-insight-widget__loading">Analyzing content...</div>');
    
    try {
      // Collect content from elements
      const content = Array.from(this.contentElements).map(el => el.textContent).join('\n\n');
      
      // Send content to API
      const response = await fetch(`${this.config.apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      this.insights = data.insights;
      
      // Update panel with insights
      this.updatePanelContent(this.formatInsights(this.insights));
      
      // Show expert role if available
      if (data.expert_role) {
        this.addExpertRole(data.expert_role);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      this.updatePanelContent(`<div class="ai-insight-widget__error">Error: ${error.message}</div>`);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Add expert role information to the panel
   */
  addExpertRole(role) {
    const headerEl = this.panel.querySelector('.ai-insight-widget__header h3');
    headerEl.innerHTML = `AI Insights <span style="font-size: 12px; opacity: 0.7; font-weight: normal; margin-left: 4px;">by ${role}</span>`;
  }
  
  /**
   * Update panel content
   */
  updatePanelContent(content) {
    const contentEl = this.panel.querySelector('.ai-insight-widget__content');
    contentEl.innerHTML = content;
  }
  
  /**
   * Format insights for display
   */
  formatInsights(insights) {
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
}

// Auto-initialize the widget if data-api attribute is present
document.addEventListener('DOMContentLoaded', () => {
  const scriptTag = document.querySelector('script[data-api]');
  
  if (scriptTag) {
    const apiUrl = scriptTag.getAttribute('data-api');
    const selector = scriptTag.getAttribute('data-selector');
    const mode = scriptTag.getAttribute('data-mode');
    const theme = scriptTag.getAttribute('data-theme');
    const maxHeight = scriptTag.getAttribute('data-max-height');
    
    // Initialize widget with config from script tag
    window.aiInsightWidget = new AIInsightWidget({
      apiUrl,
      selector,
      mode,
      theme,
      maxHeight
    });
  }
});

// Export the widget class
window.AIInsightWidget = AIInsightWidget; 
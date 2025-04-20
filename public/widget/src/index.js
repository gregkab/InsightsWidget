/**
 * AI Insight Widget
 * Main module that integrates all components
 */

import { createConfig, getConfigFromScriptTag } from './core/config.js';
import { findContentElements, createContentObserver, extractContentFromElements } from './core/content-detector.js';
import { analyzeContent } from './core/api-service.js';
import { 
  createWidgetElements, 
  updatePanelContent, 
  showLoading, 
  showError, 
  showContentChangedNotification, 
  removeContentChangedNotification,
  formatInsights, 
  addExpertRole 
} from './ui/elements.js';
import { addStyles } from './ui/styles.js';
import { hasContentChangedSignificantly } from './utils/helpers.js';

/**
 * AI Insight Widget Class
 * Main widget implementation
 */
export class AIInsightWidget {
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
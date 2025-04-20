/**
 * UI Elements Module
 * Handles creating and managing UI components
 */

/**
 * Create all widget UI elements
 * @param {Object} config - Widget configuration
 * @returns {Object} - Object containing all created elements
 */
export function createWidgetElements(config) {
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
export function updatePanelContent(contentEl, content) {
  contentEl.innerHTML = content;
}

/**
 * Show loading state in panel
 * @param {Element} contentEl - The content element
 */
export function showLoading(contentEl) {
  updatePanelContent(contentEl, '<div class="ai-insight-widget__loading">Analyzing content...</div>');
}

/**
 * Show error state in panel
 * @param {Element} contentEl - The content element
 * @param {Error} error - The error object
 */
export function showError(contentEl, error) {
  updatePanelContent(contentEl, `<div class="ai-insight-widget__error">Error: ${error.message}</div>`);
}

/**
 * Show content changed notification
 * @param {Element} contentEl - The content element
 * @param {Function} onReanalyze - Callback when reanalyze button is clicked
 */
export function showContentChangedNotification(contentEl, onReanalyze) {
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
export function removeContentChangedNotification(contentEl) {
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
export function formatInsights(insights) {
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
export function addExpertRole(headerEl, role) {
  headerEl.innerHTML = `AI Insights <span style="font-size: 12px; opacity: 0.7; font-weight: normal; margin-left: 4px;">by ${role}</span>`;
} 
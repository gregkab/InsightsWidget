/**
 * Configuration Module
 * Handles widget configuration and default settings
 */

/**
 * Create default configuration with user overrides
 * @param {Object} userConfig - User provided configuration
 * @returns {Object} - The merged configuration
 */
export function createConfig(userConfig = {}) {
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
export function getConfigFromScriptTag() {
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
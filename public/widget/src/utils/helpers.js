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
export function throttle(func, limit) {
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
export function debounce(func, wait) {
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
export function hasContentChangedSignificantly(oldContent, newContent, threshold = 0.1) {
  // Simple length comparison for demo purposes
  const oldLength = oldContent.length;
  const newLength = newContent.length;
  
  // If length differs by more than threshold percentage, consider it significant
  return Math.abs(oldLength - newLength) / Math.max(oldLength, 1) > threshold;
} 
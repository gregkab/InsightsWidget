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
export function findContentElements(config, widgetElement) {
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
export function createContentObserver(contentElements, onContentChanged) {
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
export function extractContentFromElements(contentElements, widgetElement) {
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
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
  // Create mutation observer
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations are relevant (added nodes, character data changes)
    const relevantChanges = mutations.some(mutation => 
      (mutation.type === 'childList' && mutation.addedNodes.length > 0) ||
      mutation.type === 'characterData'
    );
    
    if (relevantChanges) {
      console.log('Content changes detected');
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
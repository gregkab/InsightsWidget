/**
 * Styles Module
 * Contains widget CSS styles
 */

/**
 * Add CSS styles to the document
 */
export function addStyles() {
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
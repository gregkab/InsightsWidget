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
export async function analyzeContent(apiUrl, content) {
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
from typing import Dict
import json
from .base import BaseAgent
from ..exceptions import AIServiceError

class PlannerAgent(BaseAgent):
    """Agent that determines what kind of expert should analyze the content."""
    
    SYSTEM_PROMPT = """You are an insight planner that analyzes webpage content to determine:
1. What type of expert would be best suited to provide insights
2. What specific aspects the expert should focus on

You must return a JSON response with:
- expert_role: The type of expert (e.g., "UX Designer", "Content Marketer", "SEO Specialist")
- analysis_prompt: A specific prompt for the expert to follow
- focus_areas: List of key areas from the content that need attention

Consider the following when making your decision:
- The content's primary purpose and audience
- The technical complexity of the content
- The business goals that might be relevant
- The type of improvements that would be most valuable

Be specific and practical in your recommendations. Choose an expert role that can provide the most actionable insights."""

    def analyze_content(self, content: str, url: str = None) -> Dict:
        """
        Analyze content and determine the best expert and approach.
        
        Args:
            content: The webpage content to analyze
            url: Optional URL of the webpage
        
        Returns:
            Dict containing expert_role, analysis_prompt, and focus_areas
        """
        # Prepare the content for analysis
        context = f"Content: {content}\n"
        if url:
            context += f"URL: {url}\n"
            
        # Set up JSON response format
        response_format = {
            "type": "json_schema",
            "name": "planner_response",
            "schema": {
                "type": "object",
                "properties": {
                    "expert_role": {
                        "type": "string",
                        "description": "The type of expert (e.g., 'UX Designer', 'Content Marketer', 'SEO Specialist')"
                    },
                    "analysis_prompt": {
                        "type": "string",
                        "description": "A specific prompt for the expert to follow"
                    },
                    "focus_areas": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "description": "Key area from the content that needs attention"
                        },
                        "description": "List of key areas from the content that need attention"
                    }
                },
                "required": ["expert_role", "analysis_prompt", "focus_areas"],
                "additionalProperties": False
            },
            "strict": True
        }
        
        # Get AI response
        response = self._call_openai(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=context,
            temperature=0.7,
            response_format=response_format
        )
        
        # Parse and validate response
        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError as e:
            raise AIServiceError(f"Failed to parse planner response: {str(e)}") 
from typing import Any, Dict, Optional
import os
from openai import OpenAI
from dotenv import load_dotenv
from ..exceptions import AIServiceError

# Load environment variables
load_dotenv()

class BaseAgent:
    """Base class for AI agents with common OpenAI functionality."""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    def _call_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Make an API call to OpenAI.
        
        Args:
            system_prompt: The system message defining the AI's role
            user_prompt: The user's message/query
            temperature: Controls randomness (0-1)
            max_tokens: Maximum tokens in response
            response_format: Optional format specification for response
        
        Returns:
            The AI's response text
        """
        try:
            response = self.client.responses.create(
                model="gpt-4o-2024-08-06",
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                text={
                    "format": response_format
                }
            )
            
            return response.output_text
            
        except Exception as e:
            raise AIServiceError(f"OpenAI API error: {str(e)}") 
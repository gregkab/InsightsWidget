from fastapi import HTTPException
from typing import Any, Dict, Optional

class InsightError(HTTPException):
    """Base exception for insight-related errors."""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        additional_info: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.additional_info = additional_info or {}

class ContentTooLongError(InsightError):
    """Raised when content exceeds maximum length."""
    def __init__(self, max_length: int):
        super().__init__(
            status_code=413,
            detail=f"Content exceeds maximum length of {max_length} characters",
            error_code="CONTENT_TOO_LONG"
        )

class InvalidContentError(InsightError):
    """Raised when content is invalid or empty."""
    def __init__(self):
        super().__init__(
            status_code=400,
            detail="Content is invalid or empty",
            error_code="INVALID_CONTENT"
        )

class AIServiceError(InsightError):
    """Raised when there's an error with the AI service."""
    def __init__(self, detail: str):
        super().__init__(
            status_code=503,
            detail=detail,
            error_code="AI_SERVICE_ERROR"
        ) 
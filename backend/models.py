from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class ImpactLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class AnalyzeRequest(BaseModel):
    """Request model for the analyze endpoint."""
    content: str = Field(
        ...,  # ... means required
        min_length=1,
        max_length=50000,  # Reasonable limit for content length
        description="The webpage content to analyze"
    )

class Insight(BaseModel):
    """Model for a single insight."""
    content: str = Field(..., description="The insight content")
    rationale: str = Field(..., description="Explanation of why this insight matters")
    impact: ImpactLevel = Field(..., description="Expected impact of implementing this insight")

class AnalyzeResponse(BaseModel):
    """Response model for the analyze endpoint."""
    insights: List[Insight] = Field(..., min_length=1, max_length=5)
    expert_role: str = Field(..., description="The role of the expert providing insights")
    processing_time: float = Field(..., description="Time taken to process the request in seconds") 
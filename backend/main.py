from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv
import os
import time
from typing import Dict, Any

from backend.models import AnalyzeRequest, AnalyzeResponse, Insight
from backend.exceptions import InsightError, InvalidContentError, AIServiceError
from backend.agents import PlannerAgent, ExpertAgent

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Insight Widget API",
    description="API for the AI Insight Widget that analyzes webpage content",
    version="0.1.0"
)

# Initialize AI agents
planner_agent = PlannerAgent()
expert_agent = ExpertAgent()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(InsightError)
async def insight_error_handler(request: Request, exc: InsightError) -> JSONResponse:
    """Handle custom insight errors."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                "additional_info": exc.additional_info
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "details": exc.errors()
            }
        }
    )

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint to verify the API is running."""
    return {
        "status": "healthy",
        "version": "0.1.0"
    }

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_content(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze webpage content and return insights.
    
    This endpoint processes the provided content through our AI pipeline:
    1. Content is analyzed by the planner agent
    2. Insights are generated by the expert agent
    """
    start_time = time.time()
    
    try:
        # Step 1: Use planner to determine expert and approach
        plan = planner_agent.analyze_content(
            content=request.content,
        )
        
        # Step 2: Get insights from the expert
        expert_insights = expert_agent.generate_insights(
            content=request.content,
            expert_role=plan["expert_role"],
            analysis_prompt=plan["analysis_prompt"],
            focus_areas=plan["focus_areas"],
        )
        
        # Step 3: Convert expert insights to response format
        insights = [
            Insight(
                content=insight["content"],
                rationale=insight["rationale"],
                impact=insight["impact"]
            )
            for insight in expert_insights
        ]
        
        return AnalyzeResponse(
            insights=insights,
            expert_role=plan["expert_role"],
            processing_time=time.time() - start_time
        )
        
    except Exception as e:
        raise AIServiceError(str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True
    ) 
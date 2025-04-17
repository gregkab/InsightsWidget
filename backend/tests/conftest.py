import pytest
from fastapi.testclient import TestClient
from backend.main import app
import os
from dotenv import load_dotenv

# Load test environment variables
load_dotenv()

@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)

@pytest.fixture
def sample_content():
    """Provide sample content for testing."""
    return """
    <html>
        <head>
            <title>Test Page</title>
        </head>
        <body>
            <h1>Welcome to our website</h1>
            <p>This is a test page for our AI insights widget.</p>
            <p>We provide valuable insights about your content.</p>
        </body>
    </html>
    """

@pytest.fixture
def mock_planner_response():
    """Provide mock planner agent response."""
    return {
        "expert_role": "Content Strategist",
        "analysis_prompt": "Analyze the content structure and messaging",
        "focus_areas": ["Content Structure", "User Engagement", "SEO Optimization"]
    }

@pytest.fixture
def mock_expert_response():
    """Provide mock expert agent response."""
    return [
        {
            "content": "The page lacks clear call-to-action elements",
            "rationale": "No buttons or links guiding users to next steps",
            "impact": "Medium"
        },
        {
            "content": "Meta description is missing",
            "rationale": "Important for SEO and click-through rates",
            "impact": "High"
        }
    ] 
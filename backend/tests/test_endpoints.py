import pytest
from fastapi import status
from backend.models import AnalyzeRequest
from backend.main import app

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "status": "healthy",
        "version": "0.1.0"
    }

def test_analyze_endpoint_success(client, sample_content, mock_planner_response, mock_expert_response):
    """Test the analyze endpoint with valid content."""
    request_data = {"content": sample_content}
    response = client.post("/analyze", json=request_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Validate response structure
    assert "insights" in data
    assert "expert_role" in data
    assert "processing_time" in data
    
    # Validate insights
    insights = data["insights"]
    assert isinstance(insights, list)
    assert len(insights) > 0
    
    # Validate each insight
    for insight in insights:
        assert "content" in insight
        assert "rationale" in insight
        assert "impact" in insight
        assert insight["impact"] in ["Low", "Medium", "High"]

def test_analyze_endpoint_empty_content(client):
    """Test the analyze endpoint with empty content."""
    request_data = {"content": ""}
    response = client.post("/analyze", json=request_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_analyze_endpoint_invalid_content_type(client):
    """Test the analyze endpoint with invalid content type."""
    response = client.post("/analyze", content=b"not json")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_analyze_endpoint_missing_content(client):
    """Test the analyze endpoint with missing content field."""
    request_data = {}
    response = client.post("/analyze", json=request_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 
import pytest
import json
from unittest.mock import patch, MagicMock
from backend.agents.planner import PlannerAgent
from backend.agents.expert import ExpertAgent

def test_planner_agent_initialization():
    """Test the planner agent initialization."""
    agent = PlannerAgent()
    assert agent is not None
    assert hasattr(agent, 'analyze_content')

def test_expert_agent_initialization():
    """Test the expert agent initialization."""
    agent = ExpertAgent()
    assert agent is not None
    assert hasattr(agent, 'generate_insights')

@pytest.mark.asyncio
async def test_planner_agent_analyze_content():
    """Test the planner agent's content analysis."""
    agent = PlannerAgent()
    content = "Test content for analysis"
    
    with patch('backend.agents.planner.PlannerAgent._call_openai') as mock_call:
        mock_response = {
            "expert_role": "Content Strategist",
            "analysis_prompt": "Analyze the content",
            "focus_areas": ["Structure", "Engagement"]
        }
        mock_call.return_value = json.dumps(mock_response)
        
        result = agent.analyze_content(content)
        
        assert isinstance(result, dict)
        assert "expert_role" in result
        assert "analysis_prompt" in result
        assert "focus_areas" in result
        assert isinstance(result["focus_areas"], list)

@pytest.mark.asyncio
async def test_expert_agent_generate_insights():
    """Test the expert agent's insight generation."""
    agent = ExpertAgent()
    content = "Test content for insights"
    expert_role = "Content Strategist"
    analysis_prompt = "Analyze the content"
    focus_areas = ["Structure", "Engagement"]
    
    with patch('backend.agents.expert.ExpertAgent._call_openai') as mock_call:
        mock_response = {
            "insights": [
                {
                    "content": "Test insight 1",
                    "rationale": "Test rationale 1",
                    "impact": "Medium"
                },
                {
                    "content": "Test insight 2",
                    "rationale": "Test rationale 2",
                    "impact": "High"
                }
            ]
        }
        mock_call.return_value = json.dumps(mock_response)
        
        insights = agent.generate_insights(
            content=content,
            expert_role=expert_role,
            analysis_prompt=analysis_prompt,
            focus_areas=focus_areas
        )
        
        assert isinstance(insights, list)
        assert len(insights) > 0
        for insight in insights:
            assert "content" in insight
            assert "rationale" in insight
            assert "impact" in insight
            assert insight["impact"] in ["Low", "Medium", "High"]

def test_planner_agent_error_handling():
    """Test the planner agent's error handling."""
    agent = PlannerAgent()
    content = "Test content"
    
    with patch('backend.agents.planner.PlannerAgent._call_openai') as mock_call:
        mock_call.side_effect = Exception("Test error")
        
        with pytest.raises(Exception):
            agent.analyze_content(content)

def test_expert_agent_error_handling():
    """Test the expert agent's error handling."""
    agent = ExpertAgent()
    
    with patch('backend.agents.expert.ExpertAgent._call_openai') as mock_call:
        mock_call.side_effect = Exception("Test error")
        
        with pytest.raises(Exception):
            agent.generate_insights(
                content="Test content",
                expert_role="Test Expert",
                analysis_prompt="Test prompt",
                focus_areas=["Test area"]
            ) 
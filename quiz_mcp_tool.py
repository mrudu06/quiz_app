import sys
import os
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

# Ensure we can import from server package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from server.gemini_service import GeminiService

load_dotenv()

# Initialize MCP Server
mcp = FastMCP("CricketQuizGenerator")

@mcp.tool()
def generate_quiz_questions(data: str, offset: int, prompt: str) -> str:
    """
    Uploads cricket data and a prompt to Gemini to generate quiz questions.

    Args:
        data: The cricket match data (JSON string or text) to be analyzed.
        offset: The data offset (e.g., match ID or line number) to maintain context/history.
        prompt: The instructions for Gemini on how to generate the questions.

    Returns:
        The generated quiz questions from Gemini.
    """
    try:
        service = GeminiService()
        result = service.generate_quiz(data, offset, prompt)
        return result
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()

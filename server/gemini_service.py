import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self, model_name="gemini-2.5-flash"):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set.")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

    def generate_quiz(self, data: str, offset: int, prompt: str) -> str:
        """
        Generates quiz questions based on the provided data and prompt.
        """
        full_prompt = f"""
{prompt}

---
Data Context (Offset: {offset}):
{data}
---
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            return response.text
        except Exception as e:
            return f"Error calling Gemini API: {str(e)}"

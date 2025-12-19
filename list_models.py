import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def list_models():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found.")
        return

    client = genai.Client(api_key=api_key)
    
    print("Listing available models...")
    try:
        for m in client.models.list():
            print(f"Name: {m.name}")
            print(f"  DisplayName: {m.display_name}")
            print(f"  SupportedActions: {m.supported_actions}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()

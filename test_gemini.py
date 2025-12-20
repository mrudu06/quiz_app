from server.gemini_service import GeminiService
import os

import time

def test():
    # Check if API key is present
    if not os.getenv("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY not found in environment variables.")
        print("Please ensure you have a .env file with your API key.")
        return

    try:
        service = GeminiService()
        print(f"Service initialized successfully with model: {service.model_name}")
        
        # Dummy data
        data = "Match: India vs Australia. India scored 300/5. Virat Kohli scored 100 runs."
        prompt = "Generate 1 simple quiz question based on this data."
        
        print("Generating question...")
        
        # Simple retry logic for 429 errors
        max_retries = 3
        for attempt in range(max_retries):
            try:
                result = service.generate_quiz(data, 0, prompt)
                print("\n--- Result ---")
                print(result)
                break
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"Rate limit hit. Retrying in 30 seconds... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(30)
                else:
                    raise e
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()

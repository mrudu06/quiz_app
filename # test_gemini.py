# test_gemini.py
from server.gemini_service import GeminiService

def test():
    try:
        service = GeminiService()
        print("Service initialized.")
        
        # Dummy data
        data = "Match: India vs Australia. India scored 300/5."
        prompt = "Generate 1 simple quiz question based on this data."
        
        print("Generating question...")
        result = service.generate_quiz(data, 0, prompt)
        print("\n--- Result ---")
        print(result)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
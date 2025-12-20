import os
from quiz_mcp_tool import QuizToolController

def run_test():
    print("--- Starting Quiz App Integration Test ---\n")
    
    # 1. Initialize Controller
    print("Initializing Controller...")
    controller = QuizToolController()
    
    # 2. Test Azure Connection (Listing files)
    print("\nStep 1: Checking Azure Storage...")
    if os.getenv("AZURE_STORAGE_CONNECTION_STRING"):
        files = controller.list_cricket_data()
        # Print just the first few lines to avoid flooding the terminal
        print(f"Result from Azure:\n{files[:500]}...") 
    else:
        print("Skipping Azure test (No connection string found in .env).")

    # 3. Simulate Data Retrieval (Mocking the 'get_cricket_data' step)
    print("\nStep 2: Simulating Data Retrieval...")
    # This is a tiny snippet of what Cricsheet JSON looks like
    sample_match_data = """
    {
      "info": {
        "dates": ["2023-03-31"],
        "event": { "name": "Indian Premier League", "match_number": 1 },
        "teams": ["Chennai Super Kings", "Gujarat Titans"],
        "toss": { "decision": "field", "winner": "Gujarat Titans" },
        "outcome": { "winner": "Gujarat Titans", "by": { "wickets": 5 } }
      },
      "innings": [
        {
          "team": "Chennai Super Kings",
          "overs": [
            {
              "over": 0,
              "deliveries": [
                { "batter": "DP Conway", "bowler": "Mohammed Shami", "runs": { "batter": 0, "extras": 0, "total": 0 } },
                { "batter": "DP Conway", "bowler": "Mohammed Shami", "runs": { "batter": 0, "extras": 0, "total": 0 }, "wickets": [ { "player_out": "DP Conway", "kind": "bowled" } ] }
              ]
            },
            {
              "over": 18,
              "deliveries": [
                 { "batter": "RD Gaikwad", "bowler": "AS Joseph", "runs": { "batter": 6, "extras": 0, "total": 6 } }
              ]
            }
          ]
        }
      ]
    }
    """
    print("Loaded sample match data (CSK vs GT, IPL 2023 Match 1).")

    # 4. Test Gemini Generation (Knowledge-based)
    print("\nStep 3: Generating Quiz with Gemini (Knowledge-based)...")
    if os.getenv("GEMINI_API_KEY"):
        topic = "IPL 2024"
        print(f"Requesting creative quiz for topic: {topic}")
        result = controller.generate_quiz_questions(topic=topic, count=2, difficulty="Medium")
        print(f"Result from Gemini:\n{result}")
    else:
        print("Skipping Gemini test (No API key found in .env).")

if __name__ == "__main__":
    run_test()

import requests
import json

# This script simulates the data coming from Gemini and being sent to the Flask backend.

url = 'http://localhost:5000/api/quiz/data'

# Example JSON data structure that Gemini might generate
gemini_data = [
    {
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "answer": "Paris"
    },
    {
        "question": "Which language is used for web apps?",
        "options": ["Python", "Java", "JavaScript", "All of the above"],
        "answer": "All of the above"
    },
    {
        "question": "What does CSS stand for?",
        "options": ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        "answer": "Cascading Style Sheets"
    }
]

try:
    response = requests.post(url, json=gemini_data)
    if response.status_code == 201:
        print("Success! Quiz data loaded.")
        print(response.json())
    else:
        print(f"Failed to load data. Status Code: {response.status_code}")
        print(response.text)
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to the backend. Make sure app.py is running on port 5000.")

# Cricket Quiz App 🏏

A dynamic cricket quiz application that generates questions using real-world data from Cricsheet and the generative capabilities of Google's Gemini AI. User authentication and scoring are managed via a PostgreSQL database.

## 🚀 Features

- **AI-Generated Questions**: Uses Gemini to generate unique and challenging questions (approx. 10 per session) based on raw cricket data.
- **Real Data**: Utilizes authentic match data from [Cricsheet](https://cricsheet.org/).
- **User Authentication**: Secure sign-up and login functionality.
- **Score Tracking**: Persists user scores and history in a PostgreSQL database.

## 🛠️ Tech Stack

- **Data Source**: [Cricsheet](https://cricsheet.org/) (JSON/YAML match data)
- **AI Engine**: Google Gemini API
- **Database**: PostgreSQL (for Users and Scores)
- **Backend**: Python (Recommended for Data/AI integration)
- **Frontend**: React + Vite

## 🏗️ Architecture

1. **Data Ingestion**: Fetch match data from Cricsheet.
2. **Prompt Engineering**: Feed relevant data segments to Gemini with instructions to generate 10 quiz questions.
3. **Quiz Interface**: Present questions to the authenticated user.
4. **Persistence**: Store user credentials and quiz results in PostgreSQL.

## 🗄️ Database Schema (Proposed)

### `users`
- `id` (Primary Key)
- `username`
- `email`
- `password_hash`
- `created_at`

### `scores`
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `score`
- `total_questions`
- `date_played`

## 📝 Setup

### Frontend
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Backend (To be implemented)
1. Clone the repository.
2. Set up PostgreSQL database.
3. Configure environment variables (`GEMINI_API_KEY`, `DB_CONNECTION_STRING`).
4. Run the application.




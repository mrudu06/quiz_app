from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from dotenv import load_dotenv

import time
from sqlalchemy.exc import OperationalError

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Retry DB connection
def wait_for_db():
    retries = 10
    while retries > 0:
        try:
            with app.app_context():
                db.engine.connect()
            print("Database connected!")
            return
        except OperationalError:
            print("Database not ready, waiting...")
            time.sleep(5)
            retries -= 1
    print("Could not connect to database.")

wait_for_db()

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'message': 'Signature verification failed',
        'error': 'invalid_token'
    }), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'description': 'Request does not contain an access token.',
        'error': 'authorization_required'
    }), 401

# --- Models ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    notifications_enabled = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

# Storing quiz questions. 
# Assuming Gemini sends a list of questions. We can store them as a JSON blob or individual rows.
# For simplicity and flexibility with the "Gemini JSON" requirement, we'll store the whole quiz set or individual questions.
# Let's store individual questions to be queryable.

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(500), nullable=False)
    options = db.Column(db.JSON, nullable=False) # Storing options as JSON array
    correct_answer = db.Column(db.String(200), nullable=False)
    
    # Optional: Group questions by a "quiz_id" if we have multiple quizzes
    # quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question_text,
            'options': self.options,
            'answer': self.correct_answer
        }

class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Float, nullable=False)
    level = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    answers = db.relationship('QuizAttemptAnswer', backref='attempt', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'score': self.score,
            'total_questions': self.total_questions,
            'time_taken': self.time_taken,
            'level': self.level,
            'timestamp': self.timestamp.isoformat()
        }

class QuizAttemptAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('quiz_attempt.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=True)
    question_text = db.Column(db.String(500), nullable=False)
    user_answer = db.Column(db.String(200), nullable=True)
    correct_answer = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)

    def to_dict(self):
        return {
            'question_text': self.question_text,
            'user_answer': self.user_answer,
            'correct_answer': self.correct_answer,
            'is_correct': self.is_correct
        }

# --- Routes ---

@app.route('/')
def home():
    return "Quiz App Backend is Running!"

# 1. Authentication Endpoints

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'username': user.username,
            'email': user.email
        }), 200
    else:
        return jsonify({'message': 'Login Unsuccessful. Please check email and password'}), 401

# 2. Quiz Data Endpoints

@app.route('/api/quiz/data', methods=['POST'])
def receive_quiz_data():
    """
    Endpoint to receive quiz data (e.g., from Gemini).
    Expected JSON format:
    [
        {
            "question": "What is 2+2?",
            "options": ["3", "4", "5", "6"],
            "answer": "4"
        },
        ...
    ]
    """
    data = request.get_json()
    
    if not isinstance(data, list):
        return jsonify({'message': 'Invalid data format. Expected a list of questions.'}), 400

    # Clear existing questions? Or append? 
    # For this simple implementation, let's clear and replace to "load a new quiz".
    # In a real app, you'd probably create a new Quiz ID.
    try:
        Question.query.delete()
        
        for item in data:
            question = Question(
                question_text=item.get('question'),
                options=item.get('options'),
                correct_answer=item.get('answer')
            )
            db.session.add(question)
        
        db.session.commit()
        return jsonify({'message': 'Quiz data received and stored successfully', 'count': len(data)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error storing data: {str(e)}'}), 500

@app.route('/api/quiz', methods=['GET'])
@jwt_required()
def get_quiz():
    questions = Question.query.all()
    return jsonify([q.to_dict() for q in questions]), 200

@app.route('/api/quiz/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    score = data.get('score')
    total_questions = data.get('total_questions')
    time_taken = data.get('time_taken')
    level = data.get('level')
    answers_data = data.get('answers') # List of {question_id, question_text, user_answer, correct_answer, is_correct}

    if score is None or not answers_data:
        return jsonify({'message': 'Invalid data'}), 400

    attempt = QuizAttempt(
        user_id=current_user_id,
        score=score,
        total_questions=total_questions,
        time_taken=time_taken,
        level=level
    )
    db.session.add(attempt)
    db.session.flush() # Get ID

    for ans in answers_data:
        attempt_answer = QuizAttemptAnswer(
            attempt_id=attempt.id,
            question_id=ans.get('question_id'),
            question_text=ans.get('question_text'),
            user_answer=ans.get('user_answer'),
            correct_answer=ans.get('correct_answer'),
            is_correct=ans.get('is_correct')
        )
        db.session.add(attempt_answer)
    
    db.session.commit()
    return jsonify({'message': 'Quiz submitted successfully', 'attempt_id': attempt.id}), 201

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_quiz_history():
    current_user_id = int(get_jwt_identity())
    attempts = QuizAttempt.query.filter_by(user_id=current_user_id).order_by(QuizAttempt.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in attempts]), 200

@app.route('/api/history/<int:attempt_id>', methods=['GET'])
@jwt_required()
def get_quiz_attempt_details(attempt_id):
    current_user_id = int(get_jwt_identity())
    attempt = QuizAttempt.query.get_or_404(attempt_id)
    
    if attempt.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    details = {
        'summary': attempt.to_dict(),
        'answers': [a.to_dict() for a in attempt.answers]
    }
    return jsonify(details), 200

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)
    return jsonify({
        'username': user.username,
        'email': user.email,
        'notifications_enabled': user.notifications_enabled
    }), 200

@app.route('/api/user/settings', methods=['PUT'])
@jwt_required()
def update_user_settings():
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    if 'notifications_enabled' in data:
        user.notifications_enabled = data['notifications_enabled']
    
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully'}), 200

@app.route('/api/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({'message': 'Incorrect current password'}), 401
        
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.password = hashed_password
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)

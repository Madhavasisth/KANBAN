from flask import Flask
from kanban_app.app import app


app = Flask(__name__)

@app.route("/")
def home():
    return "✅ Flask is working on Vercel!"

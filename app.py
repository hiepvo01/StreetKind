import os
from flask import Flask, render_template, request, jsonify, send_from_directory
import speech_recognition as sr
from openai import OpenAI
from dotenv import load_dotenv
import io
import pandas as pd

load_dotenv()  # take environment variables from .env.

app = Flask(__name__, static_folder='dist', template_folder='src')

recognizer = sr.Recognizer()
transcript = []
data_file = 'data.xlsx'

# Set your OpenAI API key
openai_api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=openai_api_key)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dist/<path:path>')
def send_dist(path):
    return send_from_directory('dist', path)

@app.route('/start_recording', methods=['POST'])
def start_recording():
    global transcript
    transcript = []
    return jsonify({"message": "Recording started"})

@app.route('/update_transcript', methods=['POST'])
def update_transcript():
    try:
        audio_data = request.files['audio_data']
        audio_data.seek(0)  # Ensure file pointer is at the start
        audio_wav = io.BytesIO(audio_data.read())
        with sr.AudioFile(audio_wav) as source:
            audio = recognizer.record(source)
        text = recognizer.recognize_google(audio)
        transcript.append(text)
        return jsonify({"transcript": transcript})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stop_recording', methods=['POST'])
def stop_recording():
    return jsonify({"message": "Recording stopped", "transcript": transcript})

@app.route('/ask_questions', methods=['POST'])
def ask_questions():
    questions = request.json.get('questions', [])
    transcript_text = " ".join(transcript)
    answers = []

    for question in questions:
        query = f"Based on the following transcript, please answer the question: '{question['question']}'."
        if question['type'] == 'radio':
            query += f" Choose only one option from the following list: {', '.join(question['options'])}. Your answer must be exactly one of the provided options."
        elif question['type'] == 'checkbox':
            query += f" Choose one or more options from the following list: {', '.join(question['options'])}. Your answer must be one or more of the provided options, separated by commas if multiple."
        query += f"\nTranscript: {transcript_text}"

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": query}
            ]
        )
        answer = response.choices[0].message.content.strip()
        answers.append({"question": question['question'], "answer": answer})

    return jsonify({"answers": answers})

@app.route('/save_answers', methods=['POST'])
def save_answers():
    answers = request.json.get('answers', [])
    df = pd.DataFrame([answers])

    if os.path.exists(data_file):
        existing_df = pd.read_excel(data_file)
        df = pd.concat([existing_df, df], ignore_index=True)
    df.to_excel(data_file, index=False)
    return jsonify({"success": True})

@app.route('/view_reports')
def view_reports():
    if os.path.exists(data_file):
        df = pd.read_excel(data_file)
        reports = df.to_dict(orient='records')
    else:
        reports = []
    return render_template('view_reports.html', reports=reports)

@app.route('/update_report', methods=['POST'])
def update_report():
    updated_report = request.json.get('report', {})
    index = int(updated_report.pop('index'))

    if os.path.exists(data_file):
        df = pd.read_excel(data_file)
        for key, value in updated_report.items():
            df.at[index, key] = value
        df.to_excel(data_file, index=False)
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Data file not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
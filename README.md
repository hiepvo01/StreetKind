# StreetKind Voice to Report

A real-time incident data collection and report generation system that uses Speech-to-Text (STT) and Large Language Models (LLM) to assist StreetKind's support team. The application allows voice recording of incidents, automatic transcription, intelligent form filling, and data visualization.

## Features

- 🎤 Real-time voice recording and transcription
- 🤖 Automated form filling using OpenAI's GPT model
- 📊 Data visualization dashboard
- 📝 Editable report management
- 💾 Excel-based data storage
- 🎯 Customizable question sets

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, JavaScript, Bootstrap
- **Speech Recognition**: SpeechRecognition
- **LLM Integration**: OpenAI GPT-3.5
- **Data Processing**: Pandas
- **Visualization**: Chart.js
- **Build Tools**: Node.js, npm

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Python 3.7+
- Node.js and npm
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd streetkind-voice-report
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install Node.js dependencies:
```bash
npm ci
```

5. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

6. Build the frontend assets:
```bash
npm run build
```

## Project Structure

```
streetkind-voice-report/
├── src/
│   ├── index.html
│   ├── index.js
│   ├── view_reports.html
│   └── visualization.html
├── dist/
│   └── bundle.js
├── app.py
├── fake_reports.py
├── requirements.txt
├── package.json
├── .env
└── data.xlsx
```

## Running the Application

1. Start the Flask development server:
```bash
flask run
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage Guide

1. **Recording an Incident**
   - Click "Start Recording" to begin voice recording
   - Speak clearly to describe the incident
   - Click "Stop Recording" when finished
   - The system will automatically transcribe your recording

2. **Form Processing**
   - The LLM will automatically fill out the form based on your recording
   - Review and modify the answers if needed
   - Fields include:
     - Gender
     - Age Group
     - Alone Status
     - Intoxication Signs
     - Escort Requirements
     - Basic Aid Provided
     - Experience Description

3. **Viewing Reports**
   - Navigate to the "View Reports" page
   - All submitted reports are displayed in a table format
   - Click on any cell to edit the content
   - Click "Save" to update the report

4. **Data Visualization**
   - Access the visualization dashboard through the "View Visualizations" button
   - View charts for:
     - Gender Distribution
     - Age Group Distribution
     - Alone Status Distribution

## Development

### Adding New Questions

Modify the `questions` array in `index.js` to add or modify questions:

```javascript
const questions = [
    {
        question: "Your Question",
        type: "radio|checkbox|text",
        options: ["Option 1", "Option 2"]  // For radio/checkbox only
    }
];
```

### Customizing Visualizations

Edit `visualization.html` to add new charts or modify existing ones using Chart.js.

### Generating Fake Data

The project includes `fake_reports.py` for generating simulation data. This is only for development and testing purposes. The generated data follows the same structure as the real application but contains randomly generated values.

## Troubleshooting

Common issues and solutions:

1. **Audio Recording Issues**
   - Ensure microphone permissions are granted in your browser
   - Check if your browser supports the MediaRecorder API

2. **Transcription Errors**
   - Speak clearly and minimize background noise
   - Check internet connection stability

3. **OpenAI API Issues**
   - Verify your API key is correctly set in the `.env` file
   - Check your API usage limits

## Note

This application uses simulated data for development and demonstration purposes. The data generated does not represent real incidents or individuals.

## Contact

For any inquiries or support, please contact:

Andrew Vo  
Email: KhacHiep.Vo@uts.edu.au
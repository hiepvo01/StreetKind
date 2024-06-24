import Recorder from 'recorder-js';

let recording = false;
let recorder;
let audioContext;
let gumStream;

const startRecording = () => {
    fetch('/start_recording', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            recording = true;
            document.getElementById('status').innerText = data.message;

            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                gumStream = stream;
                recorder = new Recorder(audioContext);
                recorder.init(stream);
                recorder.start();
                console.log("Recording started");
            }).catch(err => {
                console.error("Error getting audio stream from getUserMedia", err);
            });
        });
};

const stopRecording = () => {
    fetch('/stop_recording', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            recording = false;
            document.getElementById('status').innerText = data.message;

            recorder.stop().then(({blob}) => {
                gumStream.getAudioTracks()[0].stop();
                uploadAudio(blob);
                console.log("Recording stopped and exported as WAV");
            });
        });
};

const uploadAudio = (blob) => {
    const formData = new FormData();
    formData.append('audio_data', blob, 'recording.wav');
    console.log("Uploading audio...");

    fetch('/update_transcript', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.transcript) {
            console.log("Transcript received:", data.transcript);
            document.getElementById('transcript').innerText = data.transcript.join('\n');
            const audioURL = URL.createObjectURL(blob);
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = audioURL;
            document.getElementById('audio-playback').appendChild(audioElement);
            console.log("Calling askQuestions function");
            askQuestions(); // Call askQuestions function to display questions
        } else if (data.error) {
            console.error("Error:", data.error);
        }
    })
    .catch(error => {
        console.error("Error in uploadAudio fetch:", error);
    });
};

const askQuestions = () => {
    console.log("askQuestions function is called");

    const questions = [
        { question: "Gender", type: "radio", options: ["Male", "Female", "Non-Binary"] },
        { question: "Age Group", type: "radio", options: ["< 18", "18-25", "> 25"] },
        { question: "Alone", type: "radio", options: ["Yes", "No"] },
        { question: "Intoxication Signs", type: "checkbox", options: ["Speech", "Balance", "Co-ordination", "Behavior", "Not Visible"] },
        { question: "Escort", type: "checkbox", options: ["Accommodation", "Transport", "Friends", "Other"] },
        { question: "Basic Aid", type: "checkbox", options: ["Vomit Bag", "Water", "Footwear"] },
        { question: "Describe your experience", type: "text" }
    ];

    document.getElementById('questions').innerHTML = questions.map((q, index) => {
        if (q.type === 'radio') {
            return `<div class="col-md-4">
                <div class="form-group">
                    <p>${q.question}</p>
                    ${q.options.map(option => `<div class="form-check">
                        <input class="form-check-input" type="radio" name="q${index}" value="${option}">
                        <label class="form-check-label">${option}</label>
                    </div>`).join('')}
                </div>
            </div>`;
        } else if (q.type === 'checkbox') {
            return `<div class="col-md-4">
                <div class="form-group">
                    <p>${q.question}</p>
                    ${q.options.map(option => `<div class="form-check">
                        <input class="form-check-input" type="checkbox" name="q${index}" value="${option}">
                        <label class="form-check-label">${option}</label>
                    </div>`).join('')}
                </div>
            </div>`;
        } else if (q.type === 'text') {
            return `<div class="col-12">
                <div class="form-group">
                    <p>${q.question}</p>
                    <textarea class="form-control form-control-textarea" name="q${index}"></textarea>
                </div>
            </div>`;
        }
    }).join('');

    console.log("Questions rendered in HTML");

    // Call the backend API to process the questions
    fetch('/ask_questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
    })
    .then(response => {
        console.log('askQuestions API response status:', response.status);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("askQuestions response data:", data);
        if (data.answers) {
            data.answers.forEach((answer, index) => {
                const questionType = questions[index].type;
                if (questionType === 'radio') {
                    document.querySelectorAll(`input[name="q${index}"]`).forEach(input => {
                        if (answer.answer.includes(input.value)) {
                            input.checked = true;
                        }
                    });
                } else if (questionType === 'checkbox') {
                    const selectedOptions = answer.answer.includes(',') ? answer.answer.split(',').map(option => option.trim()) : [answer.answer.trim()];
                    document.querySelectorAll(`input[name="q${index}"]`).forEach(input => {
                        if (selectedOptions.includes(input.value)) {
                            input.checked = true;
                        }
                    });
                } else if (questionType === 'text') {
                    document.querySelector(`textarea[name="q${index}"]`).value = answer.answer;
                }
            });
        }
    })
    .catch(error => {
        console.error('Error in askQuestions fetch:', error);
    });
};

const reviewAndSubmit = () => {
    console.log("Review and Submit button clicked");

    // Collect the answers
    const answers = {};
    document.querySelectorAll('#questions .form-group').forEach((group, index) => {
        const question = group.querySelector('p').innerText;
        let answer = '';

        if (group.querySelector('input[type="radio"]:checked')) {
            answer = group.querySelector('input[type="radio"]:checked').value;
        } else if (group.querySelector('textarea')) {
            answer = group.querySelector('textarea').value;
        } else {
            const selectedOptions = [];
            group.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                selectedOptions.push(checkbox.value);
            });
            answer = selectedOptions.join(', ');
        }

        answers[question] = answer;
    });

    console.log("Collected answers:", answers);

    // Send the answers to the backend to save in an Excel file
    fetch('/save_answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Answers saved successfully");
            window.location.href = '/view_reports'; // Redirect to the view reports page
        } else {
            console.error("Error saving answers:", data.error);
        }
    })
    .catch(error => {
        console.error('Error in reviewAndSubmit fetch:', error);
    });
};

document.getElementById('start-btn').addEventListener('click', startRecording);
document.getElementById('stop-btn').addEventListener('click', stopRecording);
document.getElementById('review-submit-btn').addEventListener('click', reviewAndSubmit);

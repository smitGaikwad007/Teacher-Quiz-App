const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const questionsList = document.getElementById('questions-list');
const controls = document.getElementById('controls');
const themeToggle = document.getElementById('theme-toggle');

const searchInput = document.getElementById('search-input');
const filterDifficulty = document.getElementById('filter-difficulty');
const sortOrder = document.getElementById('sort-order');

let allQuestions = [];
let filteredQuestions = [];

// Quiz State
let score = 0;
let timeLeft = 300; // 5 minutes in seconds
let timerInterval;
let wrongAnswers = [];
let isQuizActive = false;

const statsBar = document.getElementById('stats-bar');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const resultsSection = document.getElementById('results-section');
const finalScoreVal = document.getElementById('final-score-val');
const wrongAnswersList = document.getElementById('wrong-answers-list');
const restartBtn = document.getElementById('restart-btn');
const solutionsContainer = document.getElementById('solutions-container');

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

startBtn.addEventListener('click', async () => {
    startBtn.textContent = "Loading Questions...";
    try {
        // Fetching 50 questions to allow better filtering and searching experience
        const response = await fetch("https://opentdb.com/api.php?amount=50&category=9");
        const data = await response.json();
        
        // Enhance question objects with unique ID and liked state
        allQuestions = data.results.map((q, index) => ({
            ...q,
            id: index,
            isLiked: false,
            questionDecoded: decodeHTML(q.question)
        }));
        
        filteredQuestions = [...allQuestions];
        
        renderQuestions(filteredQuestions);
        
        quizContainer.style.display = 'flex';
        controls.style.display = 'flex';
        statsBar.style.display = 'flex';
        startBtn.parentElement.style.display = 'none';

        startQuiz();

        setTimeout(() => {
            quizContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);

    } catch (err) {
        console.error(err);
        startBtn.textContent = "Error fetching. Try again.";
    }
});

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function startQuiz() {
    score = 0;
    timeLeft = 300;
    wrongAnswers = [];
    isQuizActive = true;
    updateScoreView();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerView();
        if (timeLeft <= 0) {
            endQuiz();
        }
    }, 1000);
}

function updateTimerView() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateScoreView() {
    scoreDisplay.textContent = score;
}

function handleAnswer(questionId, selectedOption, correctOption, optionElement, card) {
    if (!isQuizActive) return;

    const options = card.querySelectorAll('.Option');
    options.forEach(opt => opt.classList.add('disabled'));

    const question = allQuestions.find(q => q.id === questionId);
    const isCorrect = selectedOption === correctOption;

    if (isCorrect) {
        score += 10;
        optionElement.classList.add('correct');
    } else {
        score = Math.max(0, score - 5);
        optionElement.classList.add('incorrect');
        // Show correct answer too
        options.forEach(opt => {
            if (opt.textContent === decodeHTML(correctOption)) {
                opt.classList.add('correct');
            }
        });
        wrongAnswers.push({
            question: question.questionDecoded,
            correctAnswer: decodeHTML(correctOption),
            studentAnswer: selectedOption
        });
    }

    updateScoreView();
}

function endQuiz() {
    isQuizActive = false;
    clearInterval(timerInterval);
    
    quizContainer.style.display = 'none';
    statsBar.style.display = 'none';
    resultsSection.style.display = 'flex';
    finalScoreVal.textContent = score;

    renderSolutions();
}

function renderSolutions() {
    wrongAnswersList.innerHTML = '';
    if (wrongAnswers.length === 0) {
        solutionsContainer.style.display = 'none';
        const msg = document.createElement('p');
        msg.textContent = "Perfect Score! You got everything right.";
        msg.style.color = "#4caf50";
        wrongAnswersList.appendChild(msg);
        return;
    }

    solutionsContainer.style.display = 'block';
    wrongAnswers.forEach(item => {
        const div = document.createElement('div');
        div.className = 'Wrong-Question-Item';
        div.innerHTML = `
            <div class="Wrong-Q-Text">${item.question}</div>
            <div class="Correct-Ans">Correct Answer: ${item.correctAnswer}</div>
            <div style="color: #f44336; font-size: 0.8em; margin-top: 5px;">Your Answer: ${item.studentAnswer}</div>
        `;
        wrongAnswersList.appendChild(div);
    });
}

restartBtn.addEventListener('click', () => {
    resultsSection.style.display = 'none';
    startBtn.parentElement.style.display = 'flex';
    startBtn.textContent = "Start Your AI Generated Quiz";
});

// Higher-Order Function Logic for Search, Filter, and Sort
function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase();
    const difficulty = filterDifficulty.value;
    const sortVal = sortOrder.value;

    // SEARCH & FILTER using .filter()
    let result = allQuestions.filter(q => {
        const matchesSearch = q.questionDecoded.toLowerCase().includes(searchTerm);
        const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
        return matchesSearch && matchesDifficulty;
    });

    // SORT using .sort()
    if (sortVal === 'alpha-asc') {
        result.sort((a, b) => a.questionDecoded.localeCompare(b.questionDecoded));
    } else if (sortVal === 'alpha-desc') {
        result.sort((a, b) => b.questionDecoded.localeCompare(a.questionDecoded));
    } else if (sortVal === 'length') {
        result.sort((a, b) => a.questionDecoded.length - b.questionDecoded.length);
    }
    // Default order is fetching order

    renderQuestions(result);
}

// Event Listeners for Interactivity
searchInput.addEventListener('input', updateDisplay);
filterDifficulty.addEventListener('change', updateDisplay);
sortOrder.addEventListener('change', updateDisplay);

function renderQuestions(questions) {
    questionsList.innerHTML = ''; 

    if (questions.length === 0) {
        questionsList.innerHTML = '<div class="Question-Card visible">No questions found matching your criteria.</div>';
        return;
    }

    // Using forEach to handle side effects of DOM creation, 
    // but the data manipulation above uses .filter and .sort
    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'Question-Card visible'; // Added visible by default for smooth updates
        card.dataset.id = q.id;

        // Difficulty Badge
        const badge = document.createElement('div');
        badge.className = 'Difficulty-Badge';
        badge.textContent = q.difficulty;
        badge.style.color = q.difficulty === 'easy' ? '#4caf50' : q.difficulty === 'medium' ? '#ff9800' : '#f44336';
        card.appendChild(badge);

        // Favorite Button
        const favBtn = document.createElement('div');
        favBtn.className = `Favorite-Btn ${q.isLiked ? 'active' : ''}`;
        favBtn.textContent = q.isLiked ? '❤️' : '🤍';
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleLike(q.id);
        };
        card.appendChild(favBtn);

        const qText = document.createElement('div');
        qText.className = 'Question-Text';
        qText.textContent = q.questionDecoded;
        card.appendChild(qText);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'Options-Container';

        // Combining and shuffling options
        const allOptions = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

        allOptions.forEach(opt => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'Option';
            optionDiv.textContent = decodeHTML(opt);
            optionDiv.onclick = () => handleAnswer(q.id, optionDiv.textContent, q.correct_answer, optionDiv, card);
            optionsContainer.appendChild(optionDiv);
        });

        card.appendChild(optionsContainer);
        questionsList.appendChild(card);
    });
    
    // Add an end quiz button at bottom
    const endBtn = document.createElement('button');
    endBtn.className = 'Restart-Btn';
    endBtn.textContent = 'Finish Quiz Early';
    endBtn.style.margin = '40px auto';
    endBtn.style.display = 'block';
    endBtn.onclick = endQuiz;
    questionsList.appendChild(endBtn);
}

function toggleLike(id) {
    // Update the state using .map() to create a new array (Immutability pattern)
    allQuestions = allQuestions.map(q => 
        q.id === id ? { ...q, isLiked: !q.isLiked } : q
    );
    updateDisplay();
}
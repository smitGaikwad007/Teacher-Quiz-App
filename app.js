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
        startBtn.parentElement.style.display = 'none';

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
            optionsContainer.appendChild(optionDiv);
        });

        card.appendChild(optionsContainer);
        questionsList.appendChild(card);
    });
}

function toggleLike(id) {
    // Update the state using .map() to create a new array (Immutability pattern)
    allQuestions = allQuestions.map(q => 
        q.id === id ? { ...q, isLiked: !q.isLiked } : q
    );
    updateDisplay();
}
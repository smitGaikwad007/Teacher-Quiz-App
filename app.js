const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');

startBtn.addEventListener('click', async () => {
    try {
        const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple");
        const data = await response.json();
        
        renderQuestions(data.results);
        
        quizContainer.style.display = 'flex';

        setTimeout(() => {
            quizContainer.scrollIntoView({ behavior: 'smooth' });
            
            const cards = document.querySelectorAll('.Question-Card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 150); 
            });
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

function renderQuestions(questions) {
    quizContainer.innerHTML = ''; 

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'Question-Card';

        const qText = document.createElement('div');
        qText.className = 'Question-Text';
        qText.textContent = `${index + 1}. ${decodeHTML(q.question)}`;
        card.appendChild(qText);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'Options-Container';

        const allOptions = [...q.incorrect_answers, q.correct_answer];

        allOptions.sort(() => Math.random() - 0.5);

        allOptions.forEach(opt => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'Option';
            optionDiv.textContent = decodeHTML(opt);
            optionsContainer.appendChild(optionDiv);
        });

        card.appendChild(optionsContainer);
        quizContainer.appendChild(card);
    });
}
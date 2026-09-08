/**
 * Professional Registration Questionnaire
 * Pure Vanilla JavaScript Implementation
 * 
 * Features:
 * - Sequential single-question flow (3 questions)
 * - Accessible radio card options with keyboard support
 * - Dynamic progress bar and step indicator
 * - Inline validation message (no browser alert popups)
 * - State preservation across previous and next navigation
 * - Clean blue and white success screen completion
 */

// ==========================================
// 1. QUESTIONNAIRE DATA DEFINITION
// ==========================================
const questions = [
    {
        id: 1,
        question: "What is your marital status?",
        name: "maritalStatus",
        options: ["Single", "Married", "Divorced", "Widowed"]
    },
    {
        id: 2,
        question: "Are you currently free from outstanding debt?",
        name: "debtStatus",
        options: ["Yes", "No"]
    },
    {
        id: 3,
        question: "Do you currently have a criminal record?",
        name: "criminalRecord",
        options: ["Yes", "No"]
    }
];

// ==========================================
// 2. APPLICATION STATE MANAGEMENT
// ==========================================
// Current question index (0-indexed: 0 for Q1, 1 for Q2, 2 for Q3)
let currentQuestionIndex = 0;

// Store user selections in memory (key: question name, value: selected option)
const userAnswers = {};

// ==========================================
// 3. DOM ELEMENT REFERENCES
// ==========================================
const questionnaireCard = document.getElementById('questionnaire-card');
const successScreen = document.getElementById('success-screen');
const questionContent = document.getElementById('question-content');
const progressText = document.getElementById('progress-text');
const progressFraction = document.getElementById('progress-fraction');
const progressBarFill = document.getElementById('progress-bar-fill');
const validationMsg = document.getElementById('validation-msg');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');

// ==========================================
// 4. PROGRESS INDICATOR UPDATE
// ==========================================
/**
 * Updates the step label and the animated blue progress bar fill.
 */
function updateProgress() {
    const currentNumber = currentQuestionIndex + 1;
    const totalQuestions = questions.length;
    
    // Update text labels: "Question X of 3"
    progressText.textContent = `Question ${currentNumber} of ${totalQuestions}`;
    progressFraction.textContent = `${Math.round((currentNumber / totalQuestions) * 100)}%`;

    // Update the visual width of the progress bar
    const percentage = (currentNumber / totalQuestions) * 100;
    progressBarFill.style.width = `${percentage}%`;
    progressBarFill.setAttribute('aria-valuenow', currentNumber);
}

// ==========================================
// 5. QUESTION RENDERING & ANSWER SELECTION
// ==========================================
/**
 * Dynamically renders the current question, its selectable radio options,
 * and configures the navigation button states.
 */
function renderQuestion() {
    const currentQ = questions[currentQuestionIndex];

    // Hide any active validation alert when loading a question
    hideValidation();

    // Update progress bar
    updateProgress();

    // Build the accessible semantic markup for question and options
    let html = `
        <fieldset class="question-fieldset" id="question-fieldset">
            <legend class="question-title" id="question-title">${escapeHtml(currentQ.question)}</legend>
            <div class="options-container" id="options-container" role="radiogroup" aria-labelledby="question-title">
    `;

    currentQ.options.forEach((optionText, index) => {
        const optionId = `opt-${currentQ.name}-${index}`;
        const isSelected = userAnswers[currentQ.name] === optionText;

        html += `
            <div class="option-item" id="option-item-${index}">
                <input 
                    type="radio" 
                    id="${optionId}" 
                    name="${currentQ.name}" 
                    value="${escapeHtml(optionText)}" 
                    ${isSelected ? 'checked' : ''}
                >
                <label for="${optionId}" class="option-label" id="label-${optionId}">
                    <span>${escapeHtml(optionText)}</span>
                    <span class="option-indicator" aria-hidden="true">
                        <span class="option-indicator-dot"></span>
                    </span>
                </label>
            </div>
        `;
    });

    html += `
            </div>
        </fieldset>
    `;

    questionContent.innerHTML = html;

    // Attach change listeners to options to immediately clear validation on selection
    const radioInputs = questionContent.querySelectorAll(`input[name="${currentQ.name}"]`);
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            userAnswers[currentQ.name] = e.target.value;
            hideValidation();
        });
    });

    // Configure Back Button: Hidden on Question 1, visible on subsequent questions
    if (currentQuestionIndex === 0) {
        backBtn.style.visibility = 'hidden';
        backBtn.setAttribute('aria-hidden', 'true');
        backBtn.setAttribute('tabindex', '-1');
    } else {
        backBtn.style.visibility = 'visible';
        backBtn.removeAttribute('aria-hidden');
        backBtn.removeAttribute('tabindex');
    }

    // Configure Next / Submit Button label
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    nextBtn.textContent = isLastQuestion ? 'Submit' : 'Next';
    nextBtn.setAttribute('aria-label', isLastQuestion ? 'Submit Questionnaire' : 'Proceed to next question');
}

// ==========================================
// 6. VALIDATION HANDLING
// ==========================================
/**
 * Shows the validation error message inside the questionnaire card.
 */
function showValidation() {
    validationMsg.classList.add('is-visible');
    validationMsg.setAttribute('aria-hidden', 'false');
}

/**
 * Hides the validation error message.
 */
function hideValidation() {
    validationMsg.classList.remove('is-visible');
    validationMsg.setAttribute('aria-hidden', 'true');
}

// ==========================================
// 7. NAVIGATION CONTROLS
// ==========================================
/**
 * Handles the Next and Submit button click events.
 * Validates selection before advancing or submitting.
 */
function handleNext() {
    const currentQ = questions[currentQuestionIndex];
    const selectedInput = document.querySelector(`input[name="${currentQ.name}"]:checked`);

    // Validation Check: ensure an option is chosen
    if (!selectedInput) {
        showValidation();
        return;
    }

    // Persist answer in state
    userAnswers[currentQ.name] = selectedInput.value;

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (!isLastQuestion) {
        // Advance to next question
        currentQuestionIndex++;
        renderQuestion();
    } else {
        // Complete the questionnaire and show the success screen
        showSuccessScreen();
    }
}

/**
 * Handles the Back button click event.
 * Allows returning to earlier questions without losing previously selected answers.
 */
function handleBack() {
    if (currentQuestionIndex > 0) {
        // Save current selection if one is checked
        const currentQ = questions[currentQuestionIndex];
        const selectedInput = document.querySelector(`input[name="${currentQ.name}"]:checked`);
        if (selectedInput) {
            userAnswers[currentQ.name] = selectedInput.value;
        }

        currentQuestionIndex--;
        renderQuestion();
    }
}

// ==========================================
// 8. SUBMISSION & SUCCESS SCREEN
// ==========================================
/**
 * Hides the questionnaire card and displays the professional success screen.
 */
function showSuccessScreen() {
    // Hide questionnaire
    questionnaireCard.style.display = 'none';

    // Show completion screen
    successScreen.style.display = 'block';

    // Scroll smoothly to top of the card
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper function to prevent XSS in dynamic output
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================
// 9. EVENT LISTENERS INITIALIZATION
// ==========================================
nextBtn.addEventListener('click', handleNext);
backBtn.addEventListener('click', handleBack);

// Initialize questionnaire on page load
renderQuestion();

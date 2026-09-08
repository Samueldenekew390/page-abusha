/**
 * ==============================================================================
 * REGISTRATION QUESTIONNAIRE - JAVASCRIPT
 * Plain Vanilla JavaScript implementation for question navigation, answer
 * selection, validation, dynamic progress indicator, and submission handling.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------------------------------
  // State Management
  // ----------------------------------------------------------------------------
  const TOTAL_QUESTIONS = 3;
  let currentStep = 1;

  // Store user answers in memory for the active session
  const userAnswers = {
    marital_status: null,
    debt_status: null,
    criminal_record: null
  };

  // Map question step numbers to input group names
  const stepInputNames = {
    1: 'marital_status',
    2: 'debt_status',
    3: 'criminal_record'
  };

  // ----------------------------------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------------------------------
  const questionnaireCard = document.getElementById('questionnaireCard');
  const cardHeader = document.getElementById('cardHeader');
  const progressSection = document.getElementById('progressSection');
  const progressText = document.getElementById('progressText');
  const progressPercent = document.getElementById('progressPercent');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressBarTrack = document.getElementById('progressBarTrack');
  const validationMessage = document.getElementById('validationMessage');
  const questionnaireForm = document.getElementById('questionnaireForm');

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const steps = [null, step1, step2, step3];

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  const successScreen = document.getElementById('successScreen');
  const restartBtn = document.getElementById('restartBtn');

  // ----------------------------------------------------------------------------
  // Progress Indicator
  // Updates question counter text, percentage, and the visual progress bar fill
  // ----------------------------------------------------------------------------
  function updateProgressIndicator() {
    // Calculate percentage (33% for Q1, 67% for Q2, 100% for Q3)
    const percentage = Math.round((currentStep / TOTAL_QUESTIONS) * 100);

    // Update textual indicators
    progressText.textContent = `Question ${currentStep} of ${TOTAL_QUESTIONS}`;
    progressPercent.textContent = `${percentage}%`;

    // Update the progress bar width and ARIA values
    progressBarFill.style.width = `${percentage}%`;
    progressBarTrack.setAttribute('aria-valuenow', currentStep.toString());
  }

  // ----------------------------------------------------------------------------
  // Validation
  // Checks if the user has selected an answer for the current question
  // ----------------------------------------------------------------------------
  function showValidationError() {
    validationMessage.removeAttribute('hidden');
    // Scroll smoothly to ensure the validation notice is prominent if needed
    validationMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearValidationError() {
    validationMessage.setAttribute('hidden', '');
  }

  function isCurrentStepAnswered() {
    const inputName = stepInputNames[currentStep];
    return userAnswers[inputName] !== null && userAnswers[inputName] !== undefined;
  }

  // ----------------------------------------------------------------------------
  // Answer Selection
  // Handles radio button change and card visual highlighting
  // ----------------------------------------------------------------------------
  function initializeAnswerSelection() {
    // Listen for changes across all radio inputs
    const allRadioInputs = questionnaireForm.querySelectorAll('.option-input');

    allRadioInputs.forEach((input) => {
      input.addEventListener('change', (event) => {
        const target = event.target;
        const groupName = target.name;
        const selectedValue = target.value;

        // Save selected value in state
        userAnswers[groupName] = selectedValue;

        // Update visual card highlight in this step
        const parentStep = target.closest('.question-step');
        if (parentStep) {
          const stepCards = parentStep.querySelectorAll('.option-card');
          stepCards.forEach((card) => {
            card.classList.remove('is-selected');
          });

          const activeCard = target.closest('.option-card');
          if (activeCard) {
            activeCard.classList.add('is-selected');
          }
        }

        // Clear validation message once user selects an option
        clearValidationError();
      });
    });
  }

  // ----------------------------------------------------------------------------
  // Question Navigation
  // Switches visible step between Question 1, 2, and 3
  // ----------------------------------------------------------------------------
  function showStep(stepNumber) {
    currentStep = stepNumber;

    // Clear any previous validation notice
    clearValidationError();

    // Show only the current step and hide others
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      if (i === currentStep) {
        steps[i].removeAttribute('hidden');
      } else {
        steps[i].setAttribute('hidden', '');
      }
    }

    // Configure Navigation Buttons:
    // 1. Back button is hidden on Question 1, visible on Question 2 & 3
    if (currentStep === 1) {
      backBtn.setAttribute('hidden', '');
    } else {
      backBtn.removeAttribute('hidden');
    }

    // 2. Next button is shown on Question 1 & 2; Submit button on Question 3
    if (currentStep === TOTAL_QUESTIONS) {
      nextBtn.setAttribute('hidden', '');
      submitBtn.removeAttribute('hidden');
    } else {
      nextBtn.removeAttribute('hidden');
      submitBtn.setAttribute('hidden', '');
    }

    // Update progress bar & label
    updateProgressIndicator();
  }

  // Next Button Click Handler
  nextBtn.addEventListener('click', () => {
    // Validate current step before advancing
    if (!isCurrentStepAnswered()) {
      showValidationError();
      return;
    }

    // Advance to next step
    if (currentStep < TOTAL_QUESTIONS) {
      showStep(currentStep + 1);
    }
  });

  // Back Button Click Handler
  backBtn.addEventListener('click', () => {
    // Clear validation error when going back
    clearValidationError();

    // Return to previous step without losing answers
    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  });

  // ----------------------------------------------------------------------------
  // Submission & Success Screen
  // Validates all 3 questions, hides the questionnaire, and presents completion
  // ----------------------------------------------------------------------------
  questionnaireForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Final validation check for question 3
    if (!isCurrentStepAnswered()) {
      showValidationError();
      return;
    }

    // Validate that all three questions are answered
    const allAnswered = Object.values(userAnswers).every((val) => val !== null);
    if (!allAnswered) {
      showValidationError();
      return;
    }

    // Hide questionnaire form, header, progress indicator, and validation message
    cardHeader.setAttribute('hidden', '');
    progressSection.setAttribute('hidden', '');
    questionnaireForm.setAttribute('hidden', '');
    clearValidationError();

    // Display professional success screen
    successScreen.removeAttribute('hidden');
    successScreen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ----------------------------------------------------------------------------
  // Restart / Reset Handler (Allows restarting the questionnaire)
  // ----------------------------------------------------------------------------
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      // Reset state
      userAnswers.marital_status = null;
      userAnswers.debt_status = null;
      userAnswers.criminal_record = null;

      // Reset form controls
      questionnaireForm.reset();

      // Remove visual highlights from all option cards
      const allCards = questionnaireForm.querySelectorAll('.option-card');
      allCards.forEach((card) => card.classList.remove('is-selected'));

      // Restore header, progress section, and form visibility
      cardHeader.removeAttribute('hidden');
      progressSection.removeAttribute('hidden');
      questionnaireForm.removeAttribute('hidden');
      successScreen.setAttribute('hidden', '');

      // Return to step 1
      showStep(1);
    });
  }

  // ----------------------------------------------------------------------------
  // Initialize Application
  // ----------------------------------------------------------------------------
  initializeAnswerSelection();
  showStep(1);
});

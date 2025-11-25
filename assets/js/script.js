// Trigger intro modal on page load
/**document.addEventListener("DOMContentLoaded", function() {
  var introModal = new bootstrap.Modal(document.getElementById('introModal'));
  introModal.show();
});**/

// Custom error message and validation for contact form
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add("was-validated"); 
    } else {
      // Success message
      const success = document.createElement("div");
      success.className = "alert alert-success mt-3";
      success.textContent = "Your Raven has flown with the Scroll!";
      form.appendChild(success);

      form.reset();
      form.classList.remove("was-validated");
    }
  });
});

// Custom error message and validation for feedback form
document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.getElementById("feedbackForm");

  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop page reload

    if (!feedbackForm.checkValidity()) {
      // If invalid, show saga-style errors
      event.stopPropagation();
      feedbackForm.classList.add("was-validated");
    } else {
      // Success ritual
      const successMessage = document.createElement("div");
      successMessage.className = "alert alert-success mt-3";
      successMessage.textContent = "Your raven has flown with the feedback! The saga scrolls have been updated.";

      // Remove old banners if they exist
      const oldMessage = feedbackForm.querySelector(".alert-success");
      if (oldMessage) {
        oldMessage.remove();
      }

      // Append new banner
      feedbackForm.appendChild(successMessage);

      // Reset form for next raid
      feedbackForm.reset();
      feedbackForm.classList.remove("was-validated");
    }
  });
});


// Session Only Flashcard Array Storage

let flashcards = []; 
// This array is the "library chest" — it holds all flashcards created during the session.



// Fetch Recommended Link Function

async function fetchRecommendedLink(query) {
   try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const data = await response.json();

    if (data.query.search.length > 0) {
      const title = data.query.search[0].title;
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Link fetch failed:", error);
    return null;
  }
}


// Add a flashcard in array session storage only 

function addToFlashcards(question, correctAnswer, userAnswer) {
  fetchRecommendedLink(question).then(link => {
    flashcards.push({ question, correctAnswer, userAnswer, link });
    renderFlashcards(); // Only render AFTER the link is ready
  });
}

// Render flashcards in the modal template

function renderFlashcards() {
  const list = document.getElementById("flashcardList");
  list.innerHTML = "";

  flashcards.forEach((card, index) => {
    const item = document.createElement("div");
    item.className = "card mb-2";
    item.innerHTML = `
      <div class="card-body">
        <p><strong>Q:</strong> ${card.question}</p>
        <p><strong>Your Answer:</strong> ${card.userAnswer}</p>
        <p><strong>Correct Answer:</strong> ${card.correctAnswer}</p>
        ${card.link ? `<p><a href="${card.link}" target="_blank">Learn more</a></p>` : ""}
        <button class="btn btn-danger btn-sm" onclick="deleteFlashcard(${index})">Delete</button>
      </div>`;
    list.appendChild(item);
  });
}

// Delete a flashcard option

function deleteFlashcard(index) {
  flashcards.splice(index, 1);
  renderFlashcards();
}

// Fetch quiz questions based on chosen category and difficulty from OpenTDB
async function fetchQuizQuestions(category, difficulty, amount = 10) {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Quiz fetch failed:", error);
    return [];
  }
}

// Start quiz after choices
async function startQuiz() {
  const category = document.getElementById("quizCategory").value;
  const difficulty = document.getElementById("quizDifficulty").value;

  const questions = await fetchQuizQuestions(category, difficulty, 5);
  renderQuiz(questions); // reuses the renderQuiz logic, but now passes in the array
}





const form = document.getElementById("testForm");
const list = document.getElementById("list");

let allTests = JSON.parse(localStorage.getItem("tests") || "[]");

renderTests();


// Submit form
form.addEventListener("submit", e => {
  e.preventDefault();

  const subject = document.getElementById("subject").value.trim();
  const topic = document.getElementById("topic").value.trim();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;


  if (!subject || !title || !date) return;

  allTests.push({
    id: Date.now(),
    subject,
    topic,
    title,
    due: date,
    hasQuiz: false
  });

  save();
  renderTests();

  form.reset();
});


// Save
function save() {
  localStorage.setItem("tests", JSON.stringify(allTests));
}


// Render
function renderTests() {

  list.innerHTML = "";

  allTests.sort((a, b) =>
    new Date(a.due) - new Date(b.due)
  );

  const today = new Date();

  allTests.forEach((item) => {

    const dueDate = new Date(item.due);
    const diff = (dueDate - today)/(1000*60*60*24);

    let dueClass = "due-later";
    if (diff <= 3) dueClass = "due-soon";
    else if (diff <= 4) dueClass = "due-mid";


    // Decide link
    const page = item.hasQuiz ? "Quiz.html" : "Create.html";


    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `

      <a href="${page}?id=${item.id}" class="card-link">

        <div class="course">
          ${item.subject} • ${item.topic}
        </div>

        <div class="title">${item.title}</div>

        <div class="due ${dueClass}">
          📅 ${dueDate.toLocaleDateString()}
        </div>

        <div class="quiz-status">
          ${item.hasQuiz ? "🧠 Quiz Ready" : "➕ Create Quiz"}
        </div>

      </a>

      <button onclick="deleteTest(${item.id})"
        class="delete-btn">
        ❌ Delete
      </button>
    `;

    list.appendChild(card);
  });
}


// Delete
function deleteTest(id) {

  allTests = allTests.filter(t => t.id !== id);

  save();
  renderTests();
}
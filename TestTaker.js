const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";

const DISCOVERY_DOC =
  "https://classroom.googleapis.com/$discovery/rest?version=v1";

const SCOPES =
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly";

let tokenClient;

// Store tests here
let allTests = [];


// Load API
gapi.load("client", initClient);


async function initClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
}


// Login
function login() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (token) => {
      gapi.client.setToken(token);

      // Reset data
      allTests = [];
      document.getElementById("results").innerHTML = "";

      loadCourses();
    },
  });

  tokenClient.requestAccessToken();
}


// Load classes
async function loadCourses() {
  const res = await gapi.client.classroom.courses.list();
  const courses = res.result.courses || [];

  for (let course of courses) {
    await loadAssignments(course.id, course.name);
  }

  // After all courses load → sort
  sortAndDisplay();
}


// Load assignments
async function loadAssignments(courseId, courseName) {
  const res = await gapi.client.classroom.courses.courseWork.list({
    courseId: courseId,
  });

  const work = res.result.courseWork || [];

  const keywords = [
    "test",
    "quiz",
    "exam",
    "assessment",
    "midterm",
    "final"
  ];

  work.forEach(item => {

    if (!item.dueDate) return;

    const title = item.title.toLowerCase();

    const isTest = keywords.some(word =>
      title.includes(word)
    );

    if (!isTest) return;

    // Create real date
    const due = new Date(
      item.dueDate.year,
      item.dueDate.month - 1,
      item.dueDate.day
    );

    allTests.push({
      course: courseName,
      title: item.title,
      dueDate: due
    });
  });
}


// Sort + display
function sortAndDisplay() {

  allTests.sort((a, b) => a.dueDate - b.dueDate);

  const container = document.getElementById("results");

  container.innerHTML = "";

  allTests.forEach(item => {

    const dateStr =
      item.dueDate.toLocaleDateString();

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <div class="course">${item.course}</div>
      <div class="title">${item.title}</div>
      <div class="due">📅 Due: ${dateStr}</div>
    `;

    container.appendChild(card);
  });

}

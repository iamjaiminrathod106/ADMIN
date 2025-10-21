const API = "https://script.google.com/macros/s/AKfycbwuJ4yEYh2W6KPEIR3DP9qU7iT0vy2DdV8r-nGQ8Db5y6958XbMJnLY7kG2bUjH9dUB/exec";

const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const lawyerForm = document.getElementById("lawyerForm");
const tableBody = document.getElementById("lawyerTable");

let editingEnrol = null;
let isSubmitting = false; // ✅ Prevent multiple submissions

// ✅ Message box with fade animation
let messageBox = document.getElementById("messageBox");
if (!messageBox) {
  messageBox = document.createElement("div");
  messageBox.id = "messageBox";
  messageBox.className = "hidden p-4 mb-4 text-sm rounded-lg text-center font-semibold shadow-md transition-opacity duration-500";
  dashboardPage.querySelector("main").prepend(messageBox);
}

// === LOGIN ===
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  const data = await res.json();

  if (data.success) {
    localStorage.setItem("loggedIn", "true");
    showDashboard();
  } else {
    loginMessage.classList.remove("hidden");
    loginMessage.textContent = "Invalid credentials!";
  }
});

function showDashboard() {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");
  loadLawyers();
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  location.reload();
});

if (localStorage.getItem("loggedIn")) showDashboard();

// === LOAD LAWYERS ===
async function loadLawyers() {
  const res = await fetch(`${API}?action=getLawyers`);
  const data = await res.json();
  tableBody.innerHTML = "";
  data.forEach(lawyer => {
    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-50");
    row.innerHTML = `
      <td class='border px-3 py-2'>${lawyer.Name}</td>
      <td class='border px-3 py-2'>${lawyer.Specialty}</td>
      <td class='border px-3 py-2'>${lawyer.Enrolment}</td>
      <td class='border px-3 py-2'>${lawyer.Phone}</td>
      <td class='border px-3 py-2'>${lawyer.Email}</td>
      <td class='border px-3 py-2'>${lawyer.Address}</td>
      <td class='border px-3 py-2 text-center flex gap-2 justify-center'>
        <button class='bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold editBtn transition transform hover:scale-105'>Edit</button>
        <button class='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold deleteBtn transition transform hover:scale-105'>Delete</button>
      </td>`;
    tableBody.appendChild(row);

    row.querySelector(".editBtn").addEventListener("click", () => editLawyer(lawyer));
    row.querySelector(".deleteBtn").addEventListener("click", () => deleteLawyer(lawyer.Enrolment));
  });
}

// === ADD / UPDATE LAWYER ===
lawyerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSubmitting) return; // ✅ Prevent multiple submissions
  isSubmitting = true;      // Set flag

  const lawyer = {
    Name: document.getElementById("name").value,
    Image: "",
    Specialty: document.getElementById("specialty").value,
    Enrolment: document.getElementById("enrolment").value,
    Phone: document.getElementById("phone").value,
    Email: document.getElementById("emailLawyer").value,
    Address: document.getElementById("address").value
  };

  const action = editingEnrol ? "updateLawyer" : "addLawyer";

  try {
    await fetch(`${API}?action=${action}`, {
      method: "POST",
      body: JSON.stringify(lawyer)
    });

    lawyerForm.reset();
    editingEnrol = null;
    document.getElementById("saveBtn").innerText = "Add Lawyer";
    loadLawyers();
    showMessage(action === "updateLawyer" ? "Lawyer updated successfully!" : "Lawyer added successfully!", "green");
  } catch (err) {
    showMessage("Error submitting data!", "red");
    console.error(err);
  } finally {
    isSubmitting = false; // Reset flag after request completes
  }
});

// === EDIT ===
function editLawyer(lawyer) {
  document.getElementById("name").value = lawyer.Name;
  document.getElementById("specialty").value = lawyer.Specialty;
  document.getElementById("enrolment").value = lawyer.Enrolment;
  document.getElementById("phone").value = lawyer.Phone;
  document.getElementById("emailLawyer").value = lawyer.Email;
  document.getElementById("address").value = lawyer.Address;
  document.getElementById("saveBtn").innerText = "Update Lawyer";
  editingEnrol = lawyer.Enrolment;
  document.getElementById("dashboardPage").scrollIntoView({ behavior: "smooth", block: "start" });
}

// === DELETE ===
async function deleteLawyer(enrol) {
  if (!confirm("Delete this lawyer?")) return;
  await fetch(`${API}?action=deleteLawyer`, {
    method: "POST",
    body: JSON.stringify({ Enrolment: enrol })
  });
  loadLawyers();
  showMessage("Lawyer deleted successfully!", "red");
}

// === MESSAGE BOX FUNCTION WITH FADE ===
function showMessage(msg, type = "green") {
  messageBox.textContent = msg;
  messageBox.classList.remove("hidden", "bg-green-100", "text-green-700", "bg-red-100", "text-red-700", "opacity-0");
  
  if (type === "green") {
    messageBox.classList.add("bg-green-100", "text-green-700");
  } else {
    messageBox.classList.add("bg-red-100", "text-red-700");
  }

  // Fade in
  setTimeout(() => messageBox.classList.add("opacity-100"), 10);

  // Fade out
  setTimeout(() => messageBox.classList.remove("opacity-100"), 4000);
  setTimeout(() => messageBox.classList.add("hidden"), 4500);
}

// === SCROLL TO TOP BUTTON WITH LOGO, BIGGER, HOVER EFFECT ONLY ===
let scrollTopBtn = document.createElement("button");
scrollTopBtn.id = "scrollTopBtn";
scrollTopBtn.innerHTML = `<img src="https://archive.org/download/arrow-upward/arrow-upward.png" alt="Logo" class="w-16 h-16 rounded-full">`;
scrollTopBtn.className = `
  hidden fixed bottom-6 right-6 
  p-0 
  rounded-full 
  flex items-center justify-center
  transition transform duration-300 ease-in-out, box-shadow 0.3s
  hover:scale-110 hover:shadow-xl
`;
document.body.appendChild(scrollTopBtn);

window.onscroll = function() {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    scrollTopBtn.classList.remove("hidden");
  } else {
    scrollTopBtn.classList.add("hidden");
  }
};

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const API = "https://script.google.com/macros/s/AKfycbz4oUPsn1gp6yJ0VIfL9slR2bgewTtuC_0PnXJyTfKd_1UT0CN5-9rYiX5zqsR3T9g/exec";

const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const lawyerForm = document.getElementById("lawyerForm");
const tableBody = document.getElementById("lawyerTable");
const updatingBar = document.getElementById("updatingBar");
const updatingProgress = document.getElementById("updatingProgress");

// ===== Error message under Add/Update button =====
let errorMsg = document.createElement("p");
errorMsg.className = "text-red-600 text-sm mt-2";
errorMsg.style.display = "none";
document.getElementById("saveBtn").insertAdjacentElement("afterend", errorMsg);

let editingEnrol = null;
let isSubmitting = false;
let allLawyers = [];

// ================= LOGIN =================
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();

    if(data.success){
      localStorage.setItem("loggedIn","true");
      showDashboard();
    } else {
      loginMessage.classList.remove("hidden");
      loginMessage.textContent = "Invalid credentials!";
    }
  } catch(err) {
    console.error(err);
    loginMessage.classList.remove("hidden");
    loginMessage.textContent = "Login failed! Try again.";
  }
});

function showDashboard(){
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");
  loadLawyers();
}

logoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem("loggedIn");
  location.reload();
});

if(localStorage.getItem("loggedIn")) showDashboard();

// ================= LOAD LAWYERS =================
async function loadLawyers(){
  try {
    const res = await fetch(`${API}?action=getLawyers`);
    const data = await res.json();
    allLawyers = data; // store for duplicate check
    tableBody.innerHTML = "";
    data.forEach((lawyer,index)=>{
      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class='border px-3 py-2 text-center font-semibold'>${index+1}</td>
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

      row.querySelector(".editBtn").addEventListener("click",()=>editLawyer(lawyer));
      row.querySelector(".deleteBtn").addEventListener("click",()=>deleteLawyer(lawyer.Enrolment));
    });
  } catch(err) {
    console.error(err);
  }
}

// ================= ADD / UPDATE LAWYER =================
lawyerForm.addEventListener("submit", async e => {
  e.preventDefault();
  errorMsg.style.display = "none";
  if(isSubmitting) return;

  const lawyer = {
    Name: document.getElementById("name").value.trim(),
    Image: "",
    Specialty: document.getElementById("specialty").value.trim(),
    Enrolment: document.getElementById("enrolment").value.trim(),
    Phone: document.getElementById("phone").value.trim(),
    Email: document.getElementById("emailLawyer").value.trim(),
    Address: document.getElementById("address").value.trim()
  };

  // ===== DUPLICATE CHECK =====
  let duplicateError = "";

  // Check if exact same lawyer exists (Name + Specialty + Enrolment)
  const exactDuplicate = allLawyers.find(l =>
    l.Name.toLowerCase() === lawyer.Name.toLowerCase() &&
    l.Specialty.toLowerCase() === lawyer.Specialty.toLowerCase() &&
    l.Enrolment === lawyer.Enrolment &&
    l.Enrolment !== editingEnrol
  );
  if(exactDuplicate) duplicateError = "A lawyer with the same Name, Specialty, and Enrolment already exists!";

  // Check if Enrolment number already exists (different lawyer)
  const enrolDuplicate = allLawyers.find(l =>
    l.Enrolment === lawyer.Enrolment &&
    l.Enrolment !== editingEnrol
  );
  if(enrolDuplicate) duplicateError = "Error: Enrolment number already exists for another lawyer!";

  if(duplicateError){
    errorMsg.textContent = duplicateError;
    errorMsg.style.display = "block";
    return;
  }

  const action = editingEnrol ? "updateLawyer" : "addLawyer";

  // === Show updating bar ===
  updatingBar.classList.remove("hidden");
  updatingProgress.style.width = "0%";
  updatingProgress.style.background = "";
  setTimeout(()=> updatingProgress.style.width="100%", 50);

  isSubmitting = true;
  try{
    await fetch(`${API}?action=${action}`,{
      method:"POST",
      body: JSON.stringify(lawyer)
    });

    lawyerForm.reset();
    editingEnrol = null;
    document.getElementById("saveBtn").innerText = "Add Lawyer";
    await loadLawyers();

    setTimeout(()=>{
      updatingBar.classList.add("hidden");
      updatingProgress.style.width="0%";
    },600);

  }catch(err){
    console.error(err);
    updatingProgress.style.background="red";
    setTimeout(()=>{
      updatingBar.classList.add("hidden");
      updatingProgress.style.width="0%";
      updatingProgress.style.background="";
    },800);
  }finally{
    isSubmitting=false;
  }
});

// ================= EDIT LAWYER =================
function editLawyer(lawyer){
  document.getElementById("name").value = lawyer.Name;
  document.getElementById("specialty").value = lawyer.Specialty;
  document.getElementById("enrolment").value = lawyer.Enrolment;
  document.getElementById("phone").value = lawyer.Phone;
  document.getElementById("emailLawyer").value = lawyer.Email;
  document.getElementById("address").value = lawyer.Address;
  document.getElementById("saveBtn").innerText = "Update Lawyer";
  editingEnrol = lawyer.Enrolment;
  document.getElementById("dashboardPage").scrollIntoView({behavior:"smooth",block:"start"});
  errorMsg.style.display = "none";
}

// ================= DELETE LAWYER =================
async function deleteLawyer(enrol){
  if(!confirm("Delete this lawyer?")) return;

  updatingBar.classList.remove("hidden");
  updatingProgress.style.width = "0%";
  updatingProgress.style.background = "red";
  setTimeout(()=> updatingProgress.style.width="100%", 50);

  try {
    await fetch(`${API}?action=deleteLawyer`,{
      method:"POST",
      body:JSON.stringify({Enrolment:enrol})
    });
    await loadLawyers();
    setTimeout(()=>{
      updatingBar.classList.add("hidden");
      updatingProgress.style.width="0%";
      updatingProgress.style.background="";
    },600);
  } catch(err){
    console.error(err);
    updatingProgress.style.background="red";
    setTimeout(()=>{
      updatingBar.classList.add("hidden");
      updatingProgress.style.width="0%";
      updatingProgress.style.background="";
    },800);
  }
}

const ADMINfRAME = document.getElementById('frame');

let data = [];

async function getUsers() {
  const res = await fetch('http://127.0.0.1:5000/API/admin/get');
  data = await res.json();
  
}

async function changeRole(user_id, new_role) {
  fetch("http://127.0.0.1:5000/API/admin/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({user_id, new_role})
  })
}

(async () => {
  await getUsers()  

  data.forEach((element) => {
    ADMINfRAME.innerHTML += `
      <div class="member-box" >
        <div class="text-admin-container">
          <h3>${element.name}</h3>
          <p>${element.email}</p>
        </div>
        <button class="role-btn" id="${element.id}">${element.role}</button>
      </div>
    `;
  });

  const roleBtn = document.querySelectorAll('.role-btn');
  roleBtn.forEach((element) => {
    element.addEventListener('click', async () => {
      if (element.textContent === "teacher"){
        await changeRole(element.id, "student")
        element.textContent = "student"
      }
      else if (element.textContent === "student"){
        element.textContent = "teacher"
        await changeRole(element.id, "teacher")
      }
    });
  });
})();

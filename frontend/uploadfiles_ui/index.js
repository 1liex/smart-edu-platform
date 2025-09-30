const ADMINfRAME = document.getElementById('frame');

async function getUsers() {
  const res = await fetch('http://127.0.0.1:5000/API/admin/get');
  const data = await res.json();
  console.log(data);
  return data;
}

async function displayUsers() {
  const users = await getUsers();

  users.forEach((element) => {
    ADMINfRAME.innerHTML += `
      <div class="member-box">
        <div class="text-admin-container">
          <h3>${element.name}</h3>
          <p>${element.email}</p>
        </div>
        <button class="role-btn">${element.role}</button>
      </div>
    `;
  });
}

displayUsers();

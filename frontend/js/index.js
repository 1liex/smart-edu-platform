async function loadSection(file, cssFile) {
  const res = await fetch(file);
  const text = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const bodyContent = doc.body.innerHTML;

  document.getElementById("content").innerHTML = bodyContent;

  document
    .querySelectorAll("link.dynamic-css")
    .forEach((link) => link.remove());

  // إضافة CSS الجديد
  if (cssFile) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssFile;
    link.classList.add("dynamic-css"); // عشان نقدر نحذفه بسهولة بعدين
    document.head.appendChild(link);
  }
}

let data = [];

async function getData() {
  const res = await fetch("");
  data = await res.json();
  console.log(data);
}

(async () => {
  await loadSection("/frontend/html_pages/home.html", "/frontend/css/home.css");

  async function singIn(data) {
    fetch("#", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });
  }

  async function logIn(data) {
    const res = await fetch(
      "http://localhost/web_project/backend/php/data_structure/get_data.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      }
    );

    data = await res.json();
    if (data.error) {
      console.log(data.error);
    } else {
      await loadSection(
        "/frontend/html_pages/content.html",
        "/frontend/css/content.css"
      );
      showContent();
    }

    function showContent() {
      const frame = document.getElementById("frame");
      const userNameOnNaveBare = document.getElementById("username");
      const teachers = data.teachers;
      const user = data.user;

      teachers.forEach((el) => {
        frame.innerHTML += `<div class="card">
          <div class="circle">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <h3>برمجة الويب المتقدمة</h3>
          <p>D.${el.name}</p>
          <a href="view-content.html" class="contact-btn">View</a>
        </div>`;
      });
      if (user.role === "teacher") {
        console.log("hi teacher");
      } else {
        console.log("u r just student");
      }
      userNameOnNaveBare.innerHTML += `${user.name}`;
      console.log(data);
    }
  }

  document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "signin") {
      await loadSection(
        "/frontend/html_pages/sinin.html",
        "/frontend/css/sinin.css"
      );
      const singUpBtn = document.getElementById("singInBtn");
      const username = document.getElementById("username");
      singUpBtn.addEventListener("click", () => {
        console.log(username.value);
      });
    }

    if (e.target && e.target.id === "loginBtn") {
      await loadSection(
        "/frontend/html_pages/logIn.html",
        "/frontend/css/login.css"
      );
      const form = document.getElementById("form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        loginData = { email: email, password: password };
        await logIn(loginData);
      });
    }

    if (e.target && e.target.id === "homeIcone") {
      await loadSection(
        "/frontend/html_pages/home.html",
        "/frontend/css/home.css"
      );
    }

    if (e.target && e.target.id === "viewContent") {
      await loadSection(
        "/frontend/html_pages/content.html",
        "/frontend/css/content.css"
      );
      console.log("hi");
    }

    if (e.target && e.target.id === "burgerBtn") {
      document
        .getElementById("burgerBtn")
        .addEventListener("click", function () {
          const navMenu = document.getElementById("navMenu");
          const burger = this;

          navMenu.classList.toggle("active");
          burger.classList.toggle("active");
        });
    }

    if (e.target && e.target.id === "forgot-pass") {
      await loadSection(
        "/frontend/html_pages/verify.html",
        "/frontend/css/verify.css"
      );
    }
  });
})();

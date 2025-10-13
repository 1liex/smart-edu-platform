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
    if (typeof cssFile === "object") {
      cssFile.forEach((elements) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = elements;
        link.classList.add("dynamic-css"); // عشان نقدر نحذفه بسهولة بعدين
        document.head.appendChild(link);
      });
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssFile;
      link.classList.add("dynamic-css"); // عشان نقدر نحذفه بسهولة بعدين
      document.head.appendChild(link);
    }
  }
}

let data = [];

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
      alert(data.error);
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

      frame.innerHTML = "";

      teachers.forEach((el) => {
        const options =
          el.files && el.files.length
            ? el.files
                .map(
                  (f) =>
                    `<option value="${f.file_id}" class="op">${f.file_name}</option>`
                )
                .join("")
            : `<option value="">لا يوجد ملفات</option>`;

        // كل select نعطيه class و data attribute عشان نقدر نتعامل معه لاحقًا
        frame.innerHTML += `
<div class="card">
  <div class="circle">
    <svg viewBox="0 0 24 24">
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  </div>
  <p>D. ${el.name}</p>

  <div class="btn-sel">
    <select class="file-select" data-teacher-id="${el.id}">
      <option value="">اختر ملف</option>
      ${options}
    </select>
    <a href="#" class="contact-btn">View</a>
  </div>
</div>

    `;
      });

      if (user.role === "teacher") {
        const addFiles = document.getElementById("add-files");
        addFiles.style.display = "felx";
        addFiles.addEventListener("click", async () => {
          await loadSection("/frontend/uploadfiles_ui/index.html", [
            "/frontend/uploadfiles_ui/uploadFiles.css",
            "/frontend/uploadfiles_ui/uploadKeywords.css",
          ]);
        });
      } else {
        document.getElementById("add-files").style.display = "none";
      }
      userNameOnNaveBare.innerHTML += `${user.name}`;
      userNameOnNaveBare.addEventListener("click", () => {
        console.log("log out");
      });
      console.log(data);

      document.querySelectorAll(".contact-btn").forEach((elements) => {
        elements.addEventListener("click", () => {
          const op = document.querySelectorAll(".op");
          console.log(op);
        });
      });
    }

    document.body.addEventListener("click", async (e) => {
      if (e.target && e.target.id === "homeIcone") {
        await loadSection(
          "/frontend/html_pages/content.html",
          "/frontend/css/content.css"
        );
        showContent();
      }
    });
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

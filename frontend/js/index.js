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
    fetch("#", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
  }

  document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "signup") {
      await loadSection(
        "/frontend/html_pages/sinUp.html",
        "/frontend/css/sinUp.css"
      );
      const singUpBtn = document.getElementById("singUpBtn");
      const username = document.getElementById("username");
      singUpBtn.addEventListener("click", () => {
        console.log(username.value);
      });
    }

    if (e.target && e.target.id === "login") {
      await loadSection(
        "/frontend/html_pages/logIn.html",
        "/frontend/css/login.css"
      );
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
  });
})();

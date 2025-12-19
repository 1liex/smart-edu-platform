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

  if (cssFile) {
    if (typeof cssFile === "object") {
      cssFile.forEach((elements) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = elements;
        link.classList.add("dynamic-css");
        document.head.appendChild(link);
      });
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssFile;
      link.classList.add("dynamic-css");
      document.head.appendChild(link);
    }
  }
}

function showVideoCards(data) {
  const ytRow = document.getElementById("yt-row");
  data.resources.videos.forEach((vid) => {
    ytRow.innerHTML += `
<div class="card">
  <div class="icon"><div class="icon-play"></div></div>
  <h3>Video</h3>
  <p class="Video-title">${vid.title}</p>
  <a href="${vid.link}" class="contact-btn" target="_blank">View</a>
</div>
`;
  });
}

function showDocCards(data) {
  const googleRow = document.getElementById("google-row");
  data.resources.documents.forEach((doc) => {
    googleRow.innerHTML += `
  <div class="card">
    <div class="icon"><div class="icon-search"></div></div>
    <h3>Result</h3>
    <p>${doc.title}</p>
    <a href="${doc.link}" class="contact-btn" target="_blank">View</a>
  </div>
  `;
  });
}

function showResourcesPage(data) {
  const fileTitle = document.getElementById("file-title");
  const selectKeword = document.getElementById("sel");
  const keywords = data.keywords;

  fileTitle.textContent = data.file_path;

  keywords.forEach((el) => {
    const option = `<option value="${el.keyword_id}" class="op">${el.keyword}</option>`;
    selectKeword.innerHTML += option;
  });
  let opId = 0;

  document.body.addEventListener("click", (e) => {
    if (e.target && e.target.id === "sel") {
      opId = e.target.value;
    }
    keywords.forEach((key) => {
      if (Number(opId) === key.keyword_id) {
        const rowYt = document.getElementById("yt-row");
        const rowGoogel = document.getElementById("google-row");
        rowYt.innerHTML = "";
        rowGoogel.innerHTML = "";
        showVideoCards(key);
        showDocCards(key);
      }
    });

    if (e.target && e.target.id === "file-view-btn"){
      console.log(fileTitle.textContent)
      window.location.href =
    `http://127.0.0.1:5000/get_file?filename=${fileTitle.textContent}`;
    }
  });
}

function showContent(data) {
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
    frame.innerHTML += `
<div class="card">
  <div class="circle">
    <svg viewBox="0 0 24 24">
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  </div>
  <h3>D. ${el.name}</h3>
  <p>${el.email}</p>
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
  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchInput = document.getElementById("search").value;
    console.log(data);
    const findTeacher = data.teachers;
    findTeacher.map((el) => {
      if (el.name === searchInput) {
        const options =
          el.files && el.files.length
            ? el.files
                .map(
                  (f) =>
                    `<option value="${f.file_id}" class="op">${f.file_name}</option>`
                )
                .join("")
            : `<option value="">لا يوجد ملفات</option>`;
        frame.innerHTML = `
<div class="card">
  <div class="circle">
    <svg viewBox="0 0 24 24">
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  </div>
  <h3>D. ${el.name}</h3>
  <p>${el.email}</p>
  <div class="btn-sel">
    <select class="file-select" data-teacher-id="${el.id}">
      <option value="">اختر ملف</option>
      ${options}
    </select>
    <a href="#" class="contact-btn">View</a>
  </div>
</div>

    `;
      }
    });
  });
  document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.id == "GoBack") {
      document.getElementById("GoBack").addEventListener("click", async () => {
        await loadSection(
          "/frontend/html_pages/content.html",
          "/frontend/css/content.css"
        );

        showContent(data);
        document.body.style.direction = "rtl";
      });
    }
    if (e.target && e.target.classList.contains("contact-btn")) {
      const parent = e.target.closest(".btn-sel");
      const select = parent.querySelector(".file-select");
      const selectedValue = select.value;

      const teachers = data.teachers;
      let uFIles = [];
      teachers.forEach((teacher) => {
        if (teacher.files && teacher.files.length > 0) {
          teacher.files.forEach(async (file) => {
            if (file.file_id == selectedValue) {
              uFIles = file;
              await loadSection(
                "/frontend/html_pages/view-content.html",
                "/frontend/css/view-content.css"
              );
              showResourcesPage(uFIles);
              const userNameOnNaveBare = document.getElementById("username");
              userNameOnNaveBare.innerHTML = data.user.name;
              userNameOnNaveBare.addEventListener("click", () => {
                sessionStorage.clear();
                window.location.reload();
              });
            }
          });
        }
      });
    }

    if (e.target && e.target.id === "submit-file") {
      const file = document.getElementById("fileUpload");
      const fileData = file.files[0];
      const showFile = document.getElementById("showFilesSec");

      if (showFile.innerHTML) {
        const user = data.user;
        const currentUserId = user.id;
        const fileName = fileData.name.split(".")[0];
        const filePath = fileData.name;
        const fileType = fileData.type.split("/")[1];
        const keywords = [];
        const keywordElements = document.querySelectorAll(".Keywords-border p");
        if (keywordElements.length === 0){
          alert("you have to add keywords")
          return
        }

        keywordElements.forEach((p) => {
          keywords.push(p.textContent);
        });

        const formData = new FormData()

        formData.append("file", fileData)
        formData.append("currentuserid", currentUserId)
        formData.append("filname", fileName)
        formData.append("filepath", filePath)
        formData.append("filetype", fileType)
        formData.append("keywords", JSON.stringify(keywords))
        
        const res = await fetch("http://127.0.0.1:5000/API/uploadFile", {
          method: "POST",
          // headers: { "Content-Type": "application/json" },
          body: formData
        });
        const dat = await res.json();
        alert(dat.message);
        window.location.reload();
      } else {
        alert("plz choose a file");
      }
    }

    if (e.target && e.target.id === "fileUpload") {
      const file = document.getElementById("fileUpload");
      const showFile = document.getElementById("showFilesSec");

      file.addEventListener("change", () => {
        const fileData = file.files[0];

        let sizeText = "";
        const sizeInBytes = fileData.size;

        if (sizeInBytes < 1024 * 1024) {
          const sizeInKB = (sizeInBytes / 1024).toFixed(2);
          sizeText = `${sizeInKB} KB`;
        } else {
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
          sizeText = `${sizeInMB} MB`;
        }

        showFile.innerHTML = `
  <div class="file-border">
    <i class="fa-solid fa-file"></i>

    <div class="file-border-text-holder">
      <h3 class="file-name-text">${fileData.name}</h3>
      <p class="file-size-text">The size is ${sizeText} of 250 MB</p>
    </div>
    <div class="x-button" id="xbutton">
      <button id="close-btn"><i class="fa-solid fa-x" id="clear-file"></i></button>
    </div>
  </div>
  `;
      });

      showFile.addEventListener("click", (e) => {
        if (e.target && e.target.id === "clear-file") {
          showFile.innerHTML = "";
          file.value = "";
        }
      });
    }

    if (e.target && e.target.id === "switch-btn") {
      const fileContainer = document.getElementById("container");
      const keywordContainer = document.getElementById("container-keyword");
      const switchBtn = document.getElementById("switch-btn");

      if (switchBtn.textContent === "Files section") {
        fileContainer.style.display = "flex";
        keywordContainer.style.display = "none";
        switchBtn.textContent = "Keywords section";
      } else {
        fileContainer.style.display = "none";
        keywordContainer.style.display = "flex";
        switchBtn.textContent = "Files section";
      }
    }

    if (e.target && e.target.id === "add-btn") {
      const keywordContainer = document.getElementById("Keywords-container");
      const keywordsEntry = document.getElementById("Keywords-entry");
      const addBtn = document.getElementById("add-btn");
      const clearAllBtn = document.getElementById("del-all-btn");

      addBtn.addEventListener("click", () => {
        keyword = keywordsEntry.value;
        if (keyword) {
          keywordContainer.innerHTML += `
        <div class="Keywords-border">
            <p>${keyword}</p>
            <i class="fa-solid fa-x clear-all-icon" title="delet" id="del-keyword"></i>
        </div>`;
          keywordsEntry.value = "";
        }
      });

      clearAllBtn.addEventListener("click", () => {
        keywordContainer.innerHTML = "";
        keywordsEntry.value = "";
      });

      keywordContainer.addEventListener("click", (e) => {
        if (e.target && e.target.id === "del-keyword") {
          e.target.closest(".Keywords-border").remove();
        }
      });
    }
  });

  if (user.role === "teacher") {
    const addFiles = document.getElementById("add-files");
    addFiles.style.display = "felx";
    addFiles.addEventListener("click", async () => {
      await loadSection("/frontend/uploadfiles_ui/index.html", [
        "/frontend/uploadfiles_ui/uploadFiles.css",
        "/frontend/uploadfiles_ui/uploadKeywords.css",
      ]);
      document.body.style.direction = "ltr";
    });
  } else {
    document.getElementById("add-files").style.display = "none";
  }
  userNameOnNaveBare.innerHTML += `${user.name}`;
  userNameOnNaveBare.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.reload();
  });
}

let data = [];
let sing = [];
async function getDataUsingSessionStorage(data) {
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
    alert(data.error);
  } else {
    await loadSection(
      "/frontend/html_pages/content.html",
      "/frontend/css/content.css"
    );
    showContent(data);
  }
}

(async () => {
  const email = sessionStorage.getItem("email");
  const password = sessionStorage.getItem("password");
  if (email && password) {
    await loadSection(
      "/frontend/html_pages/content.html",
      "/frontend/css/content.css"
    );

    loginData = { email: email, password: password };
    await getDataUsingSessionStorage(loginData);
  } else {
    await loadSection(
      "/frontend/html_pages/home.html",
      "/frontend/css/home.css"
    );
  }

  async function singInD(data) {
    const res = await fetch(
      "http://localhost/web_project/backend/php/SignUp.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      }
    );

    sing = await res.json();
    if (sing.error) {
      alert(sing.error);
    } else {
      alert("Signed in successfully, Now just sing in with the same info");
      showLogInPage();
    }
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
      alert(data.error);
    } else {
      sessionStorage.setItem("email", loginData.email);
      sessionStorage.setItem("password", loginData.password);
      await loadSection(
        "/frontend/html_pages/content.html",
        "/frontend/css/content.css"
      );
      showContent(data);
    }

    document.body.addEventListener("click", async (e) => {
      if (e.target && e.target.id === "homeIcone") {
        await loadSection(
          "/frontend/html_pages/content.html",
          "/frontend/css/content.css"
        );
        showContent(data);
      }
    });
  }

  async function showLogInPage() {
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

  document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "signin") {
      await loadSection(
        "/frontend/html_pages/signUp.html",
        "/frontend/css/signUp.css"
      );

      const singInForme = document.getElementById("signup-form");
      singInForme.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const singIn = { username: username, email: email, password: password };
        await singInD(singIn);
      });
    }

    if (e.target && e.target.id === "loginBtn") {
      showLogInPage();
    }

    if (e.target && e.target.id === "viewContent") {
      await loadSection(
        "/frontend/html_pages/content.html",
        "/frontend/css/content.css"
      );
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

    if (
      (e.target && e.target.id === "hide") ||
      (e.target && e.target.id === "show")
    ) {
      const passFeld = document.getElementById("password");
      const hide = document.getElementById("hide");
      const show = document.getElementById("show");

      if (passFeld.type === "password") {
        passFeld.type = "text";
        hide.style.display = "none";
        show.style.display = "flex";
      } else {
        passFeld.type = "password";
        hide.style.display = "flex";
        show.style.display = "none";
      }
    }
  });
})();

async function loadSection(file, cssFile) {
  const res = await fetch(file);
  const text = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const bodyContent = doc.body.innerHTML;

  document.getElementById('content').innerHTML = bodyContent;

  document
    .querySelectorAll('link.dynamic-css')
    .forEach((link) => link.remove());

  if (cssFile) {
    if (typeof cssFile === 'object') {
      cssFile.forEach((elements) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = elements;
        link.classList.add('dynamic-css');
        document.head.appendChild(link);
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      link.classList.add('dynamic-css');
      document.head.appendChild(link);
    }
  }
}

let data = [];
let sing = [];
(async () => {
  await loadSection('/frontend/html_pages/home.html', '/frontend/css/home.css');

  async function singInD(data) {
    const res = await fetch(
      'http://localhost/web_project/backend/php/SignUp.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      },
    );

    sing = await res.json();
    if (sing.error) {
      alert(sing.error);
    } else {
      alert('Signed in successfully, Now just sing in with the same info');
      showLogInPage();
    }
  }

  async function logIn(data) {
    const res = await fetch(
      'http://localhost/web_project/backend/php/data_structure/get_data.php',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      },
    );

    data = await res.json();
    if (data.error) {
      console.log(data.error);
      alert(data.error);
    } else {
      await loadSection(
        '/frontend/html_pages/content.html',
        '/frontend/css/content.css',
      );
      showContent();
    }

    function showContent() {
      const frame = document.getElementById('frame');
      const userNameOnNaveBare = document.getElementById('username');
      const teachers = data.teachers;
      const user = data.user;

      frame.innerHTML = '';

      teachers.forEach((el) => {
        const options =
          el.files && el.files.length
            ? el.files
                .map(
                  (f) =>
                    `<option value="${f.file_id}" class="op">${f.file_name}</option>`,
                )
                .join('')
            : `<option value="">لا يوجد ملفات</option>`;
        console.log(options);
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

      if (user.role === 'teacher') {
        const addFiles = document.getElementById('add-files');
        addFiles.style.display = 'felx';
        addFiles.addEventListener('click', async () => {
          await loadSection('/frontend/uploadfiles_ui/index.html', [
            '/frontend/uploadfiles_ui/uploadFiles.css',
            '/frontend/uploadfiles_ui/uploadKeywords.css',
          ]);
          document.body.style.direction = 'ltr';
        });
      } else {
        document.getElementById('add-files').style.display = 'none';
      }
      userNameOnNaveBare.innerHTML += `${user.name}`;
      userNameOnNaveBare.addEventListener('click', () => {
        console.log('log out');
      });
      console.log(data);

      document.querySelectorAll('.contact-btn').forEach((elements) => {
        elements.addEventListener('click', () => {
          const op = document.querySelectorAll('.op');
          console.log(op);
        });
      });
    }

    document.body.addEventListener('click', async (e) => {
      if (e.target && e.target.id === 'homeIcone') {
        await loadSection(
          '/frontend/html_pages/content.html',
          '/frontend/css/content.css',
        );
        showContent();
      }

      if (e.target && e.target.id == 'GoBack') {
        document
          .getElementById('GoBack')
          .addEventListener('click', async () => {
            await loadSection(
              '/frontend/html_pages/content.html',
              '/frontend/css/content.css',
            );

            showContent();
            document.body.style.direction = 'rtl';
          });
      }
    });
  }

  async function showLogInPage() {
    await loadSection(
      '/frontend/html_pages/logIn.html',
      '/frontend/css/login.css',
    );

    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.elements.email.value;
      const password = e.target.elements.password.value;
      loginData = { email: email, password: password };
      await logIn(loginData);
    });
  }

  document.body.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'signin') {
      await loadSection(
        '/frontend/html_pages/sinin.html',
        '/frontend/css/sinin.css',
      );

      const singInForme = document.getElementById('signup-form');
      singInForme.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log(username, email, password);
        const singIn = { username: username, email: email, password: password };
        await singInD(singIn);
      });
    }

    if (e.target && e.target.id === 'loginBtn') {
      showLogInPage();
    }

    if (e.target && e.target.id === 'viewContent') {
      await loadSection(
        '/frontend/html_pages/content.html',
        '/frontend/css/content.css',
      );
      console.log('hi');
    }

    if (e.target && e.target.id === 'burgerBtn') {
      document
        .getElementById('burgerBtn')
        .addEventListener('click', function () {
          const navMenu = document.getElementById('navMenu');
          const burger = this;

          navMenu.classList.toggle('active');
          burger.classList.toggle('active');
        });
    }

    if (e.target && e.target.id === 'forgot-pass') {
      await loadSection(
        '/frontend/html_pages/verify.html',
        '/frontend/css/verify.css',
      );
    }

    if (
      (e.target && e.target.id === 'hide') ||
      (e.target && e.target.id === 'show')
    ) {
      const passFeld = document.getElementById('password');
      const hide = document.getElementById('hide');
      const show = document.getElementById('show');

      if (passFeld.type === 'password') {
        passFeld.type = 'text';
        hide.style.display = 'none';
        show.style.display = 'flex';
      } else {
        passFeld.type = 'password';
        hide.style.display = 'flex';
        show.style.display = 'none';
      }
    }

    if (e.target && e.target.id === 'switch-btn') {
      const fileContainer = document.getElementById('container');
      const keywordContainer = document.getElementById('container-keyword');
      const switchBtn = document.getElementById('switch-btn');

      if (switchBtn.textContent === 'Files section') {
        fileContainer.style.display = 'flex';
        keywordContainer.style.display = 'none';
        switchBtn.textContent = 'Keywords section';
      } else {
        fileContainer.style.display = 'none';
        keywordContainer.style.display = 'flex';
        switchBtn.textContent = 'Files section';
      }
    }

    if (e.target && e.target.id === 'add-btn') {
      const keywordContainer = document.getElementById('Keywords-container');
      const keywordsEntry = document.getElementById('Keywords-entry');
      const addBtn = document.getElementById('add-btn');
      const clearAllBtn = document.getElementById('del-all-btn');

      addBtn.addEventListener('click', () => {
        keyword = keywordsEntry.value;
        if (keyword) {
          keywordContainer.innerHTML += `
        <div class="Keywords-border">
            <p>${keyword}</p>
            <i class="fa-solid fa-x clear-all-icon" title="delet" id="del-keyword"></i>
        </div>`;
          keywordsEntry.value = '';
        }
      });

      clearAllBtn.addEventListener('click', () => {
        keywordContainer.innerHTML = '';
        keywordsEntry.value = '';
      });

      keywordContainer.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'del-keyword') {
          e.target.closest('.Keywords-border').remove();
        }
      });
    }

    if (e.target && e.target.id === 'fileUpload') {
      const file = document.getElementById('fileUpload');
      const showFile = document.getElementById('showFilesSec');

      file.addEventListener('change', () => {
        const fileData = file.files[0];

        let sizeText = '';
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

      showFile.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'clear-file') {
          showFile.innerHTML = '';
          file.value = '';
        }
      });
    }

    if (e.target && e.target.id === 'submit-file') {
      const fileInput = document.getElementById('fileUpload');
      const showFile = document.getElementById('showFilesSec');

      if (showFile.innerHTML) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]); // ضفنا الملف إلى الفورم داتا

        fetch('http://127.0.0.1:5000/API/uploadFile', {
          method: 'POST',
          body: formData, // لا تضف headers يدوياً هنا!
        })
          .then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.error(err));
      } else {
        alert('Please upload file');
      }
    }
  });
})();

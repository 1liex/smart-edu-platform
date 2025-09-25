const file = document.getElementById("fileUpload");
const showFile = document.getElementById("showFilesSec");
const closeBtn = document.getElementById("xbutton");

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
      <button id="close-btn"><i class="fa-solid fa-x" id="gg"></i></button>
    </div>
  </div>
  `;
});

showFile.addEventListener("click", (e) => {
  if (e.target && e.target.id === "gg") {
    showFile.innerHTML = "";
    file.value = "";
  }
});

const sections = document.querySelectorAll(".section");

// تحميل ملفات HTML داخل كل section
async function loadSection(sectionId, file) {
  const res = await fetch(file);
  const data = await res.text();
  document.getElementById(sectionId).innerHTML = data;
}

// إخفاء كل section واظهار section محددة
function showSection(sectionId) {
  sections.forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

// مثال: تحميل كل المحتوى عند بدء الصفحة
(async () => {
  await loadSection("home", "home.html");
  await loadSection("page1", "page1.html");
  await loadSection("page2", "page2.html")
  

  // إظهار أول section افتراضي
  showSection("home");











































  
})();

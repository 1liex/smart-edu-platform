// let lastSelectedFile = null; // متغير لتتبع الملف اللي تم اختياره

// document.body.addEventListener('click', async (e) => {
//   if (e.target && e.target.classList.contains('contact-btn')) {
//     const parent = e.target.closest('.btn-sel');
//     const select = parent.querySelector('.file-select');
//     const selectedValue = select.value;

//     if (!selectedValue || selectedValue === lastSelectedFile) return;

//     lastSelectedFile = selectedValue; // نحفظ الملف الحالي لمنع التكرار

//     // الكود اللي يستدعي showResourcesPage
//     const teacher = data.teachers.find((t) =>
//       t.files && t.files.some((f) => f.file_id == selectedValue)
//     );
//     if (teacher) {
//       const file = teacher.files.find((f) => f.file_id == selectedValue);
//       await loadSection(
//         '/frontend/html_pages/view-content.html',
//         '/frontend/css/view-content.css'
//       );
//       showResourcesPage(file);
//     }
//   }
// });


const file = new FormData()
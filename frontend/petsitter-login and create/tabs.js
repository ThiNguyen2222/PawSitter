// tabs for owner vs sitter
document.addEventListener("DOMContentLoaded", () => {
  const ownerTab = document.getElementById("owner-tab");
  const sitterTab = document.getElementById("sitter-tab");
  const ownerForm = document.getElementById("owner-form");
  const sitterForm = document.getElementById("sitter-form");

  if (ownerTab && sitterTab && ownerForm && sitterForm) {
    ownerTab.addEventListener("click", () => {
      ownerTab.classList.add("active");
      sitterTab.classList.remove("active");
      ownerForm.classList.add("active");
      sitterForm.classList.remove("active");
    });

    sitterTab.addEventListener("click", () => {
      sitterTab.classList.add("active");
      ownerTab.classList.remove("active");
      sitterForm.classList.add("active");
      ownerForm.classList.remove("active");
    });
  }
});

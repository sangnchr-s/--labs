var nameInput = document.getElementById('entry-name');
var phoneInput = document.getElementById('entry-phone');
var deleteBtn = document.getElementById('delete-btn');

if (nameInput && phoneInput && deleteBtn) {
  function lockDelete() {
    deleteBtn.disabled = true;
  }

  nameInput.addEventListener('input', lockDelete);
  phoneInput.addEventListener('input', lockDelete);
}

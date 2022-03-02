function switchChat(e) {
  let chatUsers = document.querySelectorAll(".chat-user");
  chatUsers.forEach((elem) => elem.classList.remove("active"));
  e.classList.add("active");
}

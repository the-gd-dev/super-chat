//catching event
function formatDate(date) {
  return moment(date).format("llll");
}
var socket = io();
let userId = document.getElementById("user_id").value;
socket.emit("connected", { userId });

var initialLoaderRooms = ` 
    <li class="m-auto">
      <div>
          <div class="d-block text-center">
              <div class="spinner-border m-auto" role="status"></div>
          </div>
          <div class="d-block mt-2 text-center"><strong> Loading rooms </strong></div>
      </div>
</li>`;
var initialLoaderMessages = ` 
  <div class="m-auto">
    <div class="d-block text-center">
        <div class="spinner-border m-auto" role="status"></div>
    </div>
    <div class="d-block mt-2"><strong> Loading messges please wait....</strong></div>
  </div>`;

socket.on("chat-message", function (data) {
  let user = document.getElementById("user_id").value;
  let reciever = document.getElementById("sender_id").value;
  if (data.reciever === user && data.sender === reciever) {
    document.getElementById("message-wrapper").firstElementChild.innerHTML +=
      renderSingleMessage(user, data.message);
      scrollToBottom();
  }
});

let sideNavUser = document.querySelector(".chat-user-list");
let sideNavUserOverlay = document.querySelector(".overlay-user-sidebar");
sideNavUserOverlay.addEventListener("click", function () {
  sideNavUserOverlay.classList.remove("show");
  sideNavUser.classList.remove("show");
});
function showUserSideBar() {
  sideNavUser.classList.toggle("show");
  sideNavUserOverlay.classList.toggle("show");
}

function renderSingleMessage(currentUser, message) {
  return currentUser === message.senderId._id
    ? `
      <div class="d-flex justify-content-end">
        <div class="message sender">
          <div class="content">
            ${message.message}
          </div>
          <div class="footer text-end p-1 text-muted">
            <small> ${formatDate(message.createdAt)}</small>
          </div>
        </div>
        <div class="display_picture">
          <img src="${message.senderId.display_picture}" />
        </div>
      </div>`
    : `
      <div class="d-flex justify-content-start message-wrapper">
        <div class="display_picture">
          <img src="${message.senderId.display_picture}" />
        </div>
        <div class="message reciever">
          <div class="content">
          ${message.message}
          </div>
          <div class="footer text-end p-1 text-muted">
            <small> ${formatDate(message.createdAt)}</small>
          </div>
        </div>
      </div>
    `;
 
}
function messagesRendering(messages) {
  let user = document.getElementById("user_id").value;
  var appendHtml = `<div class="messages">`;
  messages.forEach(function (message) {
    appendHtml += renderSingleMessage(user, message);
  });
  appendHtml += `</div>`;
  return appendHtml;
}
function scrollToBottom() {
  var messageBody = document.getElementById("message-wrapper");
  messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
}
/**
 * send message
 * @param {*} message
 */
function sendMessage(form) {
  let message = document.getElementById("message").value;
  let sender = document.getElementById("sender_id").value;
  let user = document.getElementById("user_id").value;
  if (!message) return alert("Please enter a message.");

  fetch("/messages/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sender_id: sender, user_id: user }),
  })
    .then((result) => result.json())
    .then((res) => {
      document.getElementById("message-wrapper").firstElementChild.innerHTML += renderSingleMessage(user, res.message);
      scrollToBottom();
      socket.emit("chat-message", {
        message: res.message,
        sender: user,
        reciever: sender,
      }); //emitting
      // document.getElementById("message-wrapper").firstElementChild.innerHTML += renderSingleMessage(user, res.message);
      document.getElementById("message").value = "";
    })
    .catch((err) => {});
}
function personRendering(convo) {
  return `<li class="chat-user" onclick="switchChat(this, '${convo.user._id}')">
            <div class="d-flex flex-rows align-items-center">
                <div class="profile-pic"><img src="${convo.user.display_picture}" ></div>
                <div class="d-flex flex-column ms-2"> 
                    <div class="name">
                    <strong class="text-dark"> ${convo.user.name}</strong>
                    </div>
                    <div class="last-message text-muted text-sm"></div>
                </div>
            </div>
        </li>`;
}

fetch("/conversations")
  .then((response) => {
    return response.json();
  })
  .then((result) => {
    document.getElementById("chattingUsersList").innerHTML = "";
    result.conversations.forEach((c) => {
      document.getElementById("chattingUsersList").innerHTML +=
        personRendering(c);
    });
    document.querySelector(".chat-user").click();
  })
  .catch((err) => {});
function switchChat(e, userId) {
  let chatUsers = document.querySelectorAll(".chat-user");
  chatUsers.forEach((elem) => elem.classList.remove("active"));
  e.classList.add("active");
  document.getElementById("message-wrapper").innerHTML = "";
  document.getElementById("sender_id").value = userId;
  document.getElementById("message-wrapper").innerHTML = initialLoaderMessages;
  fetch("/messages?user=" + userId)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      document.getElementById("message-wrapper").innerHTML = messagesRendering(
        result.messages
      );
      scrollToBottom();
    })
    .catch((err) => {});
}

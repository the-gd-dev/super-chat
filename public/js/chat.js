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

let sideNavUser = document.querySelector(".chat-user-list");
let sideNavUserOverlay = document.querySelector(".overlay-user-sidebar");
sideNavUserOverlay.addEventListener("click", function () {
  sideNavUserOverlay.classList.remove("show");
  sideNavUser.classList.remove("show");
});

/**
 * render single message to container
 * @param {*} currentUser
 * @param {*} message
 * @returns
 */
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
      <div class="d-flex justify-content-start">
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

/**
 * render all messages to container
 * @param {*} messages
 * @returns
 */
function messagesRendering(messages) {
  var appendHtml = `<div class="messages">`;
  messages.forEach(function (message) {
    appendHtml += renderSingleMessage(currentUserId, message);
  });
  appendHtml += `</div>`;
  return appendHtml;
}

/**
 * send message
 * @body { message , sender}
 */
function sendMessage() {
  let $messageInput = document.getElementById("message-input");
  let message = $messageInput.value;
  let sender = $senderInput.value;
  if (!message) return alert("Please enter a message.");

  fetch("/messages/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      sender_id: sender,
      user_id: currentUserId,
    }),
  })
    .then((result) => result.json())
    .then((res) => {
      socket.emit("chat-message", {
        ...res.message,
        sender: currentUserId,
        reciever: sender,
      });
      $messageContainer.firstElementChild.innerHTML += renderSingleMessage(
        currentUserId,
        res.message
      );
      $messageInput.value = "";
      scrollToBottom();
    })
    .catch((err) => {});
}

/**
 * render single friend
 * @param {*} user
 * @returns
 */
function friendRender(user) {
  return `<li class="chat-user" onclick="createConversation('${currentUserId}', '${user._id}')">
    <div class="d-flex flex-rows align-items-center">
        <div class="profile-pic"><img src="${user.display_picture}" ></div>
        <div class="d-flex flex-column ms-2"> 
            <div class="name">
            <strong class="text-dark"> ${user.name}</strong>
            </div>
            <div class="last-message text-muted text-sm"></div>
        </div>
    </div>
  </li>`;
}

/**
 * render single conversation
 * @param {*} convo
 * @returns
 */
function personRendering(convo) {
  return `<li class="chat-user convo-user"  onclick="switchChat(this, '${
    convo.user._id
  }')">
            <div class="d-flex flex-rows align-items-center">
                <div class="profile-pic"><img src="${
                  convo.user.display_picture
                }" ></div>
                <div class="d-flex flex-column ms-2"> 
                    <div class="name">
                      <strong class="text-dark"> ${convo.user.name}</strong>
                    </div>
                    <div id="last__msg__${
                      convo.conversation_id
                    }" class="last-message text-muted text-sm ${
    convo.isLastMessageRead ? "unread__convo" : ""
  }">${convo.lastMessage}</div>
                </div>
            </div>
        </li>`;
}

/**
 * create converation
 * @param {*} sender
 * @param {*} reciever
 */
function createConversation(sender, receiver) {
  fetch("/conversations", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sender, receiver }),
  })
    .then((result) => result.json())
    .then((res) => {
      $conversationContainer.innerHTML = "";
      document.querySelector("#find-friends").value = "";
      fetchConversation();
    })
    .catch((err) => {});
}

document.querySelector("#find-friends").addEventListener("input", function (e) {
  let htmlContent = $conversationContainer.innerHTML;
  if (e.target.value.trim()) {
    fetch("/users?name=" + e.target.value)
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        $conversationContainer.innerHTML = "";
        result.users.forEach((c) => {
          $conversationContainer.innerHTML += friendRender(c);
        });
      })
      .catch((err) => {});
  } else {
    $conversationContainer.innerHTML = htmlContent;
  }
});

/**
 * fetch all conversations
 */
var chatRooms = [];
function fetchConversation() {
  fetch("/conversations")
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      $conversationContainer.innerHTML = "";
      chatRooms = result.conversations;
      result.conversations.forEach((c) => {
        $conversationContainer.innerHTML += personRendering(c);
      });
      document.querySelector(".convo-user").click();
    })
    .catch((err) => {});
}
fetchConversation();

/**
 * switch chat person
 * @param {*} e
 * @param {*} userId
 */
function switchChat(e, userId) {
  let userData = chatRooms.find((cr) => cr.user._id === userId);

  document.querySelector(".chat-header").querySelector(".name").innerHTML =
    userData.user.name;
  document
    .querySelector(".chat-header")
    .querySelector(".profile-pic")
    .querySelector("img")
    .setAttribute("src", userData.user.display_picture);
  let chatUsers = document.querySelectorAll(".convo-user");
  chatUsers.forEach((elem) => elem.classList.remove("active"));
  e.classList.add("active");
  $messageContainer.innerHTML = "";
  $senderInput.value = userId;
  $messageContainer.innerHTML = initialLoaderMessages;
  fetch("/messages?user=" + userId)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      if (result.messages.length > 0) {
        let Ids = result.messages
          .filter((m) => m.isRead === true)
          .map((m) => m._id);
        let conversationId = result.messages[0].conversationId;
        document
          .getElementById(`last__msg__${conversationId}`)
          .classList.remove("unread__convo");
        readBulkMessages(Ids);
        $messageContainer.innerHTML = messagesRendering(result.messages);
        scrollToBottom();
      }
    })
    .catch((err) => {});
}

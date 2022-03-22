var socket = io();
socket.emit("connected", { currentUserId });

/**
 * read all messages at once
 * @param {*} messageIds
 */
function readBulkMessages(messageIds) {
  fetch("/messages/read", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messageIds: messageIds,
    }),
  });
}

/**
 *  chat-message event
 */
socket.on("chat-message", function (data) {
  let recieverId = $senderInput.value;
  if (data.reciever === currentUserId && data.sender === recieverId) {
    $messageContainer.firstElementChild.innerHTML += renderSingleMessage(
      currentUserId,
      data
    );
    readBulkMessages([data._id]);
    document.getElementById("message-input").value = "";
    scrollToBottom();
  }
  if (currentUserId !== data.sender) {
    document
      .getElementById(`last__msg__${data.conversationId}`)
      .classList.add("unread__convo");
  }
  //last message update to convo
  document.getElementById(`last__msg__${data.conversationId}`).innerHTML =
    data.message;
});

var socket = io();
socket.emit("connected", { currentUserId });
/**
 *  chat-message event
 */
socket.on("chat-message", function (data) {
  let recieverId = $senderInput.value;
  if (data.reciever === currentUserId && data.sender === recieverId) {
    $messageContainer.firstElementChild.innerHTML += renderSingleMessage(currentUserId, data.message);
    document.getElementById('message-input').value = "";
    scrollToBottom();
  }
});

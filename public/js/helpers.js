/**
 * format date for messages
 * @param {*} date
 * @returns
 */
function formatDate(date) {
  return moment(date).format("llll");
}

/**
 * toggle user side bar in mobile view
 */
function showUserSideBar() {
  sideNavUser.classList.toggle("show");
  sideNavUserOverlay.classList.toggle("show");
}

/**
 * scroll to bottom of the messages container
 */
function scrollToBottom() {
  var messageBody = document.getElementById("message-wrapper");
  messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
}

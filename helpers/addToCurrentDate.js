module.exports = function (type, count, date = new Date()) {
  if (type === "minutes") {
    return date.getTime() + count * 60 * 1000;
  } else if (type === "hours") {
    return date.getTime() + count * 60 * 60 * 1000;
  } else if (type === "days") {
    return date.getTime() + count * 24 * 60 * 60 * 1000;
  }
};

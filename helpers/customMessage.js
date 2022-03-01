const firstLetterUpperCase = require("./firstLetterUpperCase");
module.exports = (param, type, value = "") => {
  let tParam = firstLetterUpperCase(param);
  switch (type) {
    case "required":
      return `${tParam} should not be empty.`;
    case "min":
      return `${tParam} should not less then ${value} characters.`;
    case "max":
      return `${tParam} should not more then ${value} characters.`;
    case "typo":
      return `${tParam} should be ${value} characters.`;
    default:
      return `${tParam} is invalid.`;
  }
};

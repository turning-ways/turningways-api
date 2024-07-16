exports.capitalize = (str) => {
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

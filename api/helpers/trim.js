/**
 * this function trims empty space from a string
 * @param {string} str
 */
const trimString = (str) => {
  return str.trim();
};
/**
 * this array trims all empty space of  items in an object
 *
 * @param {object} object
 */
const trimObject = (object) => {
  for (const key in object) {
    if (isNaN(object[key])) object[key] = object[key].trim();
  }
};

module.exports = {
  trimString,
  trimObject,
};

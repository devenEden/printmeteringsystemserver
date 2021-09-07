/**
 * checks whether all properties of an object have values
 *
 * @param {object} object
 *
 * @returns {boolean} boolean
 */
const checkProperties = (obj) => {
  for (var key in obj) {
    if (isNaN(obj[key]) && !obj[key]) return false;
  }
  return true;
};

module.exports = checkProperties;

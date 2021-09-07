const sanitizer = require("sanitizer");

/**
 * this function escapes the object for any malicious injecttion
 *
 * @param {Object} body object from the client
 *
 */
const sanitize = (body) => {
  for (const key in body) {
    body[key] = sanitizer.escape(body[key]);
  }
};

module.exports = sanitize;

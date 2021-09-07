const bcrypt = require('bcrypt');

/**
 * Compares the stored database password and the password entered by the users
 * 
 * @param {String} dbPassword 
 * @param {String} password 
 * 
 * @returns  A promise to be either resolved with the comparison result salt or rejected with an Error
 */
const comparePasswords = async (dbPassword, password) => {
    return await bcrypt.compare(password, dbPassword);
}

module.exports = comparePasswords;
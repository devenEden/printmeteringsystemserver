const bcrypt = require('bcrypt');
/**
 * This function hashes the password that has been passed to it using the bcrypt js library
 * 
 * @param {String} password 
 * @returns return a promise of the hashed password hashed password 
 */

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

module.exports = hashPassword;
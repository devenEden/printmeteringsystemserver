const crypto = require("crypto");
/**
 * This function returns a resetToken to reset the password;
 *
 * @returns return a hashed string
 * 
 */
const resetPasswordToken = () => {
    return crypto.randomBytes(25).toString('hex');
};



module.exports = {
    resetPasswordToken
};
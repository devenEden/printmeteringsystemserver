const jwt = require("jsonwebtoken");

/**
 * This function generates a confirmation token for the account
 *
 * @param {string} email
 * @returns account confirmation tolen
 */
const confirmationToken = (email) => {
    const token = jwt.sign({
            email
        },
        process.env.JWT_ACCOUNT_CONFIRMATION_TOKEN, {
            expiresIn: "2d"
        }
    );
    return token;
};

/**
 * This function generates an authentication for the user when logging in
 *
 * @param {Object} payload
 * @returns {string} a jwt signed token 
 */

const authToken = ({
    userId,
    role
}) => {
    const token = jwt.sign({
        id: userId,
        role
    }, process.env.JWT_AUTH_TOKEN, {
        expiresIn: "3d",
    });
    return token;
};

module.exports = {
    confirmationToken,
    authToken,
};
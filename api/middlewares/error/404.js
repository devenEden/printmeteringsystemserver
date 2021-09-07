/**
 * This middleware fires when the path or request  required is not found it replies with a message and
 * and status code of 404
 *
 * @param {*} req request Objext
 * @param {*} res response Object
 * 
 */
const routeNotFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: "Sorry we didn't find what you are looking for",
    });
};

module.exports = routeNotFound;
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = {
        ...err
    };
    error.message = err.message;
    console.log('====================================');
    console.log(error);
    console.log('====================================');

    if (!error.statusCode) error.message = "Sorry internal server error occured";

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Sorry an internal server error occured",
    })
}

module.exports = errorHandler
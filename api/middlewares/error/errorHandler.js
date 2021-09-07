const errorHandler = (err, req, res, next) => {
    let error = {
        ...err
    };
    error.message = err.message;
    console.log('====================================');
    console.log(error);
    console.log('====================================');

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Sorry an internal server error occured",
    })
}

module.exports = errorHandler
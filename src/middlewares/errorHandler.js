const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.originalUrl} = ${message}`);

    res.status(statusCode).json({
        success: false,
        status: err.status || "error",
        error: message
    });
};

export default errorHandler;
export default function globalErrorHandler(err, req, res, next) {
    // Determine the status code
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Internal Server Error';
    let redirectUrl = "/error";
    if (statusCode === 400) {
        redirectUrl = "/login";
    }
    if (err instanceof ApplicationError) {
        // Log the error with custom fields if it's an instance of ApplicationError
        logger.error(err.message, {
            name: err.name,
            statusCode: err.statusCode,
            error: err.err,
            stack: err.stack
        });
    } else {
        // Log generic errors
        logger.error('Internal Server Error', {
            message: err.message,
            stack: err.stack,
        });
    };
    req.flash("error", errorMessage);
    res.status(statusCode).redirect(redirectUrl);
}
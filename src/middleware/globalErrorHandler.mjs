export default function globalErrorHandler(err, req, res, next) {
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
    req.flash("error", err.message);
    res.status(500).redirect("/error");
}
//patron de diseño para manejar los errores

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    res.json({
        message: err.message,
        // En desarrollo mostramos el stack para debuggear, en producción no
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
    });
};

module.exports = {
    errorHandler,
};
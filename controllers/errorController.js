// const AppError = require("./../utils/appError");

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = (err) => {
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   console.log(message);
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);

//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

// const handleJWTError = () =>
//   new AppError("Invalid token. Please log in again!", 401);

// const handleJWTExpiredError = () =>
//   new AppError("Your token has expired! Please log in again.", 401);

// const sendErrorDev = (err, req, res) => {
//   // A) API
//   if (req.originalUrl.startsWith("/api")) {
//     return res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   }

//   // B) RENDERED WEBSITE
//   console.error("ERROR 💥", err);
//   return res.status(err.statusCode).render("error", {
//     title: "Something went wrong!",
//     msg: err.message,
//   });
// };

// const sendErrorProd = (err, req, res) => {
//   // A) API
//   if (req.originalUrl.startsWith("/api")) {
//     // A) Operational, trusted error: send message to client
//     if (err.isOperational) {
//       return res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message,
//       });
//     }

//     // B) Programming or other unknown error: don't leak error details
//     console.error("ERROR 💥", err);
//     return res.status(500).json({
//       status: "error",
//       message: "Something went very wrong!",
//     });
//   }

//   // B) RENDERED WEBSITE
//   if (err.isOperational) {
//     return res.status(err.statusCode).render("error", {
//       title: "Something went wrong!",
//       msg: err.message,
//     });
//   }

//   // B) Programming or other unknown error: don't leak error details
//   console.error("ERROR 💥", err);
//   return res.status(err.statusCode).render("error", {
//     title: "Something went wrong!",
//     msg: "Please try again later.",
//   });
// };

// module.exports = (err, req, res, next) => {
//   // console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     console.log(error);
//     error.message = err.errorResponse.errmsg;
//     error.code = err.errorResponse.code;
//     error.name = err.errorResponse.name;
//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(err);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);
//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

//     sendErrorProd(error, req, res);
//   }
// };

const AppError = require("./../utils/appError");

// Handle MongoDB CastError (invalid field types in DB)
const handleCastErrorDB = (err) => {
  const message = `Geçersiz ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle MongoDB Duplicate Fields Error (unique constraint violation)
const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Aynı anahtara sahip öge mevcut: ${value}. Lütfen farklı bir değer deneyiniz!`;

  console.error(message); // Keep logging for debugging
  return new AppError(message, 400);
};

// Handle MongoDB ValidationError (validation failed)
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Geçersiz girdi. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle JWT errors (Invalid token)
const handleJWTError = () =>
  new AppError("Geçersiz token. Lütfen tekrar giriş yapmayı deneyizin!", 401);

// Handle JWT expiration errors (Token expired)
const handleJWTExpiredError = () =>
  new AppError("Tokeninizin süresi dolmuş. Lütfen tekrar deneyiniz!", 401);

// Send errors during development (detailed error stack)
const sendErrorDev = (err, req, res) => {
  // For API requests
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // For rendered website requests
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Bir şeyler ters gitti!",
    msg: err.message,
  });
};

// Send errors during production (generic error messages)
const sendErrorProd = (err, req, res) => {
  // For API requests
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming or unknown error (log and send generic message)
    console.error("ERROR 💥", err);
    return res.status(500).json({
      status: "error",
      message: "Bir şeyler ters gitti!",
    });
  }

  // For rendered website requests
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Bir şeyler ters gitti!",
      msg: err.message,
    });
  }

  // Programming or unknown error (log and send generic message)
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Bir şeyler ters gitti!",
    msg: "Lütfen daha sonra tekrar deneyiniz.",
  });
};

// Main error handling middleware
module.exports = (err, req, res, next) => {
  // Set default status code and status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // Development error handling (detailed error response)
    return sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    // Log the error for debugging in production
    error.name = err._message;

    // Handle specific error types
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "User validation failed")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // Send the error response (generic or operational)
    return sendErrorProd(error, req, res);
  }
};

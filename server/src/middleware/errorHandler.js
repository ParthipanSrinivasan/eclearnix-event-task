import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Express recognises error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.notFound("Not found");
  } else if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    error = ApiError.badRequest("Please check the highlighted fields", details);
  } else if (err?.code === 11000) {
    error = ApiError.conflict("This record already exists");
  } else if (err?.type === "entity.parse.failed") {
    error = ApiError.badRequest("Request body is not valid JSON");
  }

  if (!(error instanceof ApiError)) {
    console.error(err);
    error = new ApiError(500, "Something went wrong. Please try again.");
  }

  res.status(error.status).json({
    message: error.message,
    ...(error.details && { errors: error.details }),
    ...(!env.isProduction && error.status === 500 && { stack: err.stack }),
  });
}

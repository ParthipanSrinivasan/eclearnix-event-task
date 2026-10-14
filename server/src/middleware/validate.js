import { ApiError } from "../utils/ApiError.js";

function toFieldErrors(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Validates and normalises part of the request with a Zod schema.
 * The parsed body replaces `req.body`; parsed query params go to `req.validQuery`
 * (Express 5 makes `req.query` read-only).
 */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      throw ApiError.badRequest("Please check the highlighted fields", toFieldErrors(result.error));
    }
    if (source === "query") req.validQuery = result.data;
    else req[source] = result.data;
    next();
  };
}

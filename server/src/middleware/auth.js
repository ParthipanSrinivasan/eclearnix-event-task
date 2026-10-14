import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function userFromRequest(req) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }
  // Load the user so deleted accounts and role changes take effect immediately.
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("Your session is no longer valid. Please log in again.");
  return user;
}

/** Rejects the request unless it carries a valid token. Sets `req.user`. */
export async function requireAuth(req, _res, next) {
  const user = await userFromRequest(req);
  if (!user) throw ApiError.unauthorized();
  req.user = user;
  next();
}

/** Sets `req.user` when a valid token is present, but lets anonymous requests through. */
export async function optionalAuth(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}

/** Use after `requireAuth`. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
    next();
  };
}

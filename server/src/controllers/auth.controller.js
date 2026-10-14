import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict("An account with this email already exists");

  // Public sign-up always creates a regular user; admins are provisioned on the server.
  const user = await User.create({ name, email, password, role: "USER" });
  res.status(201).json({ token: signToken(user), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  res.json({ token: signToken(user), user });
}

export function me(req, res) {
  res.json({ user: req.user });
}

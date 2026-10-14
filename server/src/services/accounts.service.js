import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function ensureAccounts() {
  await ensureAccount({ ...env.admin, role: "ADMIN", label: "Admin", envPrefix: "ADMIN" });
  await ensureAccount({ ...env.demoUser, role: "USER", label: "Demo user", envPrefix: "USER" });
}

async function ensureAccount({ name, email, password, role, label, envPrefix }) {
  if (!email || !password) {
    if (role === "ADMIN") console.warn(`${envPrefix}_EMAIL / ${envPrefix}_PASSWORD not set: no admin account was created.`);
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    // The configured admin email must always be an admin.
    if (role === "ADMIN" && existing.role !== "ADMIN") {
      existing.role = "ADMIN";
      await existing.save();
      console.log(`Promoted ${normalizedEmail} to admin.`);
    }
    return;
  }

  await User.create({ name, email: normalizedEmail, password, role });
  console.log(`${label} account created: ${normalizedEmail}`);
}

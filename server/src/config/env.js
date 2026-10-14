import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  isProduction,
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: required("JWT_SECRET", isProduction ? undefined : "dev-only-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  admin: {
    name: process.env.ADMIN_NAME ?? "Admin",
    email: process.env.ADMIN_EMAIL ?? "admin@gmail.com",
    password: process.env.ADMIN_PASSWORD ?? "Admin@123",
  },
  demoUser: {
    name: process.env.USER_NAME ?? "Demo User",
    email: process.env.USER_EMAIL ?? "user@example.com",
    password: process.env.USER_PASSWORD ?? "User@1234",
  },
};

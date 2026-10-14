import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { ensureAccounts } from "./services/accounts.service.js";

async function start() {
  await connectDatabase();
  await ensureAccounts();

  const server = createApp().listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}/api`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start the server:", err);
  process.exit(1);
});

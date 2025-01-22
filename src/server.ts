import app from "./app";
import { initDb } from "./config/db";
import logger from "./config/logger";
import config from "config";

const startServer = async () => {
  const PORT: number = config.get("server.port");
  try {
    await initDb();
    logger.info("Database connected successfully.");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      logger.on("finish", () => {
        process.exit(1);
      });
    }
  }
};

void startServer();

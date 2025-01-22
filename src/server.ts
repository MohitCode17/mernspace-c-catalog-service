import app from "./app";
import logger from "./config/logger";
import config from "config";

const startServer = () => {
  const PORT: number = config.get("server.port");
  try {
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

startServer();

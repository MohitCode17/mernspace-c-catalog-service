import app from "./app";
import logger from "./config/logger";

const startServer = () => {
  const PORT = 5502;
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

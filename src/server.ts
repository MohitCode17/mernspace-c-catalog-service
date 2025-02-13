import app from "./app";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";
import { MessageProducerBroker } from "./common/types/broker";
import { initDb } from "./config/db";
import { kafkaProducerBroker } from "./config/kafka";
import logger from "./config/logger";
import config from "config";

const startServer = async () => {
  const PORT: number = config.get("server.port");
  let messageProducerBroker: MessageProducerBroker | null = null;

  try {
    await initDb();
    logger.info("Database connected successfully.");

    // CONNECT TO KAFKA
    messageProducerBroker = createMessageProducerBroker();

    await messageProducerBroker.connect();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (messageProducerBroker) {
        await messageProducerBroker.disconnect();
      }
      logger.error(err.message);
      logger.on("finish", () => {
        process.exit(1);
      });
    }
  }
};

void startServer();

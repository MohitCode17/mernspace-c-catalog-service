import config from "config";
import { MessageProducerBroker } from "../types/broker";
import { kafkaProducerBroker } from "../../config/kafka";

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
  // Making singletone
  if (!messageProducer) {
    messageProducer = new kafkaProducerBroker("catalog-service", [
      config.get("kafka.broker"),
    ]);
  }

  return messageProducer;
};

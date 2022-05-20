import WebSocketClient from './clients/WebSocketClient';
import { log } from './utils/log';

let retries = 0;
let maxRetries = 10;
let client = null;

const socket = function initSocket(url, handlers, reconnect) {
  client = new WebSocketClient(url);
  maxRetries = reconnect;

  client.onOpen(() => {});

  client.onClose((reason) => {
    log.warn(reason);
    if (retries === 0) {
      handlers.close();
    }

    // Try to reconnect.
    client = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries < maxRetries) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-mixed-operators, no-restricted-properties
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;

      retries += 1;

      log.info('Trying to reconnect...');

      setTimeout(() => {
        socket(url, handlers, reconnect);
      }, retryInMs);
    }
  });

  client.onMessage((data) => {
    retries = 0;
    const message = JSON.parse(data);
    log.info(message);

    if (handlers[message.type]) {
      handlers[message.type](message.data, message.params);
    }
  });
};

export default socket;

import { log } from '../utils/log';

export default class WebSocketClient {
  constructor(url) {
    this.client = new global.WebSocket(url);
    this.client.onerror = (error) => {
      log.error(error);
    };
  }

  onOpen(f) {
    if (this.client) this.client.onopen = f;
  }

  onClose(f) {
    if (this.client) this.client.onclose = f;
  }

  // call f with the message string as the first argument
  onMessage(f) {
    if (this.client) {
      this.client.onmessage = (e) => {
        f(e.data);
      };
    }
  }
}

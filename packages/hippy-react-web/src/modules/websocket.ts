const enum WebSocketReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

class WebSocketWeb implements HippyTypes.WebSocket {
  public protocol = '';
  public url: string;
  public webSocketIns: WebSocket;
  public readyState: number;
  public onopen: ((...args: any[]) => void | undefined) | undefined;
  public onmessage: ((...args: any[]) => void | undefined) | undefined;
  public onclose: ((...args: any[]) => void | undefined) | undefined;
  public onerror: ((...args: any[]) => void | undefined) | undefined;


  public constructor(url: any, protocols: string[] | string) {
    this.readyState = WebSocketReadyState.CONNECTING;
    if (!url || typeof url !== 'string') {
      throw new TypeError('Invalid WebSocket url');
    }
    this.url = url;
    this.webSocketIns = new WebSocket(url, protocols);
    this.webSocketIns.addEventListener('open', (event) => {
      this.readyState = WebSocketReadyState.OPEN;
      console.log('open', event);
      if (this.onopen) {
        this.onopen(event);
      }
    });
    this.webSocketIns.addEventListener('message', (event) => {
      console.log('message', event);
      if (this.onmessage) {
        this.onmessage(event);
      }
    });
    this.webSocketIns.addEventListener('close', (event) => {
      this.readyState = WebSocketReadyState.CLOSED;
      console.log('close', event);
      if (this.onclose) {
        this.onclose(event);
      }
    });
    this.webSocketIns.addEventListener('error', (event) => {
      console.log('error', event);
      if (this.onerror) {
        this.onerror(event);
      }
    });
  }
  public close(code: number, reason: string) {
    if (this.readyState !== WebSocketReadyState.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }
    this.readyState = WebSocketReadyState.CLOSING;
    this.webSocketIns.close(code, reason);
  }
  public send(data: string | undefined) {
    if (this.readyState !== WebSocketReadyState.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }
    if (typeof data !== 'string') {
      throw new TypeError(`Unsupported websocket data type: ${typeof data}`);
    }
    this.webSocketIns.send(data);
  }
};

export default WebSocketWeb;

export interface LayoutValue {
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number,
}

export interface LayoutEvent {
  NativeEvent: {
    layout: LayoutValue,
  },
  layout: LayoutValue,
  target: any
  timeStamp: number
}

export interface ResizeObserver {
  disconnect: () => void;
  observe: (target: Element, options?: ResizeObserverOptions) => void;
  unobserve: (target: Element) => void;
};

type NetworkChangeEventData = any;
type NetworkInfoCallback = (data: NetworkChangeEventData) => void;

export class NetInfoRevoker {
  public eventName: string;
  public listener: undefined | NetworkInfoCallback;
  public constructor(eventName: string, listener: NetworkInfoCallback) {
    this.eventName = eventName;
    this.listener = listener;
  }

  public remove() {
    if (!this.eventName || !this.listener) {
      return;
    }
    removeEventListener(this.eventName, this.listener);
    this.listener = undefined;
  }
}

export interface NetInfoModule {
  addEventListener: (eventName: string, listener: NetworkInfoCallback) => NetInfoRevoker;
  removeEventListener: (eventName: string, listener?: NetInfoRevoker | NetworkInfoCallback) => void;
  fetch: () => Promise<NetworkChangeEventData>;
};

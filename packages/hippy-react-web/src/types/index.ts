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

export interface NetInfoModule {
  addEventListener: (eventName: string, listener: NetworkInfoCallback) => { remove: () => void };
  removeEventListener: (eventName: string, listener?: NetworkInfoCallback) => void;
  fetch: () => Promise<NetworkChangeEventData>;
};

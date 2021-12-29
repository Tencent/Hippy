export type LayoutValue = {
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number,
};

export type LayoutEvent = {
  NativeEvent: {
    layout: LayoutValue,
  },
  layout: LayoutValue,
  target: any
  timeStamp: number
};

export interface ResizeObserver {
  disconnect(): void;
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
};

export type StyleSheet = Record<string, any> | Record<string, any>[];

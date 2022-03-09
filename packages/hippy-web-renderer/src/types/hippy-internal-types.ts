
export type HippyNativeBridge = (action: string, callObj?: { moduleName: string, methodName: string, params: any } | any) => void;

export interface HippyJsBridge {
  callNative(moduleName: string, methodName: string, ...args: any[]): void;
  callNativeWithCallbackId(moduleName: string, methodName: string, ...args: any[]): number;
  callNativeWithPromise<T>(moduleName: string, methodName: string, ...args: any[]): Promise<T>;
  removeNativeCallback(callBack: HippyCallBack): void;
}

export type HippyJsCallNatives = (moduleName: string, moduleFunc: string, callId: number, params?: any[]) => void;

export namespace HippyTransferData {
  export type NativeUIEvent = [nodeId: string, eventName: string, eventParams: any];
  export type NativeEvent = [eventName: string, eventParams: any];

  export type NativeGestureEventTypes = 'onClick' | 'onPressIn' | 'onPressOut' | 'onLongClick' | 'onTouchDown' | 'onTouchMove' | 'onTouchEnd' | 'onTouchCancel';
  export type NativeGestureEvent = {
    name: NativeGestureEventTypes,
    id: number;
    page_x?: number;
    page_y: number;
  };
}



import { HippyTransferData } from "../types/hippy-internal-types";
import { HippyWebEngine } from "./engine";

export class HippyWebEngineContext {
  engine: HippyWebEngine;
  constructor(engine: HippyWebEngine) {
      this.engine = engine;
  }
  /**
   * 向上层发送普通事件
   */
  sendEvent(type: string, params: any) {
      hippyBridge('callJsModule', {
          moduleName: 'EventDispatcher',
          methodName: 'receiveNativeEvent',
          params: [type, params],
      });
  }
  /**
   * 向上层发送 UI 事件
   */
  sendUiEvent(nodeId: number, type: string, params: any) {
      hippyBridge('callJsModule', {
          moduleName: 'EventDispatcher',
          methodName: 'receiveUIComponentEvent',
          params: [nodeId, type, params],
      });
  }

  /**
   * 向上层发送手势事件
   */
  sendGestureEvent(e: HippyTransferData.NativeGestureEvent) {
      hippyBridge('callJsModule', {
          moduleName: 'EventDispatcher',
          methodName: 'receiveNativeGesture',
          params: e,
      });
  }

  subscribe(evt: string, callback: Function) {
      this.engine.eventBus.subscribe(evt, callback);
  }

  getModuleByName (moduleName: string) {
    return this.engine.modules[moduleName];
  }
}

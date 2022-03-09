import { HippyTransferData } from '../types/hippy-internal-types';
import { HippyWebEngine } from './engine';

export class HippyWebEngineContext {
  engine: HippyWebEngine;
  constructor(engine: HippyWebEngine) {
    this.engine = engine;
  }
  /**
   * send normal event to js side
   */
  sendEvent(type: string, params: any) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveNativeEvent',
      params: [type, params],
    });
  }
  /**
   * send ui event to js side
   */
  sendUiEvent(nodeId: number, type: string, params: any) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveUIComponentEvent',
      params: [nodeId, type, params],
    });
  }

  /**
   * send gesture event to js side
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

  getModuleByName(moduleName: string) {
    return this.engine.modules[moduleName];
  }
}

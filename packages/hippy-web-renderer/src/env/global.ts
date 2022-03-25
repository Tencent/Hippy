import { dealloc } from './event';
import { nativeGlobal } from './native-global';
import { emitter, hippyRegister } from './others';
import { asyncStorage } from './storage';
import { document } from './ui-manager-module';
import { HippyJsBridge } from './js2native';

declare global {
  interface HippyGlobalObject {
    bridge: HippyJsBridge,
    on: typeof emitter.on,
    off: typeof emitter.off,
    emit: typeof emitter.emit,
    asyncStorage: typeof asyncStorage,
    turboPromise: typeof Promise,
    register: {
      regist: typeof hippyRegister,
    }
    device: HippyDeviceInfo,
    document: typeof document,
  }

  interface HippyJsGlobal {
    moduleCallId: number;
    moduleCallList: any;
    jsModuleList: any;
    appRegister: any;
    canRequestAnimationFrame: boolean;
    requestAnimationFrameQueue: any;
    nodeIdCache: any;
    nodeTreeCache: any;
    destroyInstanceList: any;
    globalEventHandle: any;
    requestAnimationFrameId: number;
    nodeParamCache: any;
  }
  /* eslint no-var: off */
  var __fetch: (url: string, option: any) => Promise<any>;

  var Hippy: HippyGlobalObject;

  var __ISHIPPY__: boolean;

  var __GLOBAL__: HippyJsGlobal;

  var __HIPPYNATIVEGLOBAL__: typeof nativeGlobal;

  var flushQueueImmediate: any;

  var HippyDealloc: typeof dealloc;

  var hippyBridge: (action: string, payload?: any) => void;

  var hippyCallNatives: (moduleName: string, methodName: string, callId: string, params?: any[]) => void;

  var __Headers: typeof global.Headers;

  var __Response: typeof global.Response;

  var __localStorage: typeof global.localStorage;

  var turboPromise: typeof global.Promise;
}

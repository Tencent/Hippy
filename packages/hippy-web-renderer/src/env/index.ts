import { Dimensions } from './dimensions';
import { dealloc } from './event';
import { nativeGlobal } from './native-global';
import { Headers, Response, fetch } from './network';
import { getGlobal } from '../get-global';
import { emitter, hippyRegister } from './others';
import { asyncStorage } from './storage';
import { document } from './ui-manager-module';
import { platform } from './platform';
import { bridge, HippyJsBridge } from './js2native';
import { nativeBridge } from './native2js';
import { device } from './device';

console.log(nativeBridge);

const global = getGlobal();


declare global {
  interface HippyModule {
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

  interface HippyInternalGlobal {
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

  var Hippy: HippyModule;

  var __ISHIPPY__: boolean;

  var __GLOBAL__: HippyInternalGlobal;

  var __HIPPYNATIVEGLOBAL__: typeof nativeGlobal;

  var flushQueueImmediate: any;

  var HippyDealloc: typeof dealloc;

  var hippyBridge: (action: string, payload?: any) => void;

  var hippyCallNatives: (moduleName: string, methodName: string, callId: string, params?: any[]) => void;
}


// global
global.Hippy = {} as any;
global.__GLOBAL__ = {} as any;
global.hippyBridge = nativeBridge;
global.__ISHIPPY__ = true;
global.__GLOBAL__.globalEventHandle = {};
global.__GLOBAL__.jsModuleList = {
  Dimensions,
};
global.__HIPPYNATIVEGLOBAL__ = nativeGlobal;
global.HippyDealloc = dealloc;
global.Headers = Headers as any;
global.Response = Response as any;
global.fetch = fetch as any;
// TODO:
// global.dynamicLoad


// __GLOBAL__

__GLOBAL__.appRegister = {};
__GLOBAL__.nodeIdCache = {};
__GLOBAL__.nodeTreeCache = {};
__GLOBAL__.nodeParamCache = {}; // Not necessary for Android, but need for clean.
__GLOBAL__.moduleCallId = 0;
__GLOBAL__.moduleCallList = {};
__GLOBAL__.canRequestAnimationFrame = true;
__GLOBAL__.requestAnimationFrameId = 0;
__GLOBAL__.requestAnimationFrameQueue = {};
__GLOBAL__.destroyInstanceList = {};

// hippy
Hippy.bridge = bridge;
Hippy.device = device as any;
Hippy.register = {
  regist: hippyRegister,
};
Hippy.on = emitter.on;
Hippy.off = emitter.off;
Hippy.emit = emitter.emit;

Hippy.asyncStorage = asyncStorage;
Hippy.turboPromise = global.Promise;
Hippy.document = document;
Hippy.device.platform = platform();



global.localStorage = Hippy.asyncStorage as any;
global.turboPromise = Hippy.turboPromise;

// init

Dimensions.init();



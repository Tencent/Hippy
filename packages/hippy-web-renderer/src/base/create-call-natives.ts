
import { HippyWebEngine } from "./engine";

export const createCallNatives = (engine: HippyWebEngine) => {
  return (moduleName: string, methodName: string, callId: string, params: any[] = []) => {
    const mod = engine.modules[moduleName];
    if (mod != null) {
      mod[methodName]?.(...params, callId != null ? createPromise(moduleName, methodName, callId) : undefined);
    }
  };
}

const createPromise = (moduleName, methodName, callId) => {
  return {
    resolve: (params) => {
      hippyBridge('callBack', {
        callId: callId,
        methodName,
        moduleName,
        params,
        result: 0,
      });
    },
    reject: (params) => {
      hippyBridge('callBack', {
        callId: callId,
        methodName,
        moduleName,
        params,
        result: -1,
      });
    },
  }
}

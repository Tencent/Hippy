import { HippyWebEngine } from './engine';

export const createCallNatives = (engine: HippyWebEngine) => (
  moduleName: string, methodName: string,
  callId: string, params: any[] = [],
) => {
  console.log(moduleName, methodName, callId, params);
  const mod = engine.modules[moduleName];
  if (mod != null) {
    mod[methodName]?.(...params, callId != null ? createPromise(moduleName, methodName, callId) : undefined);
  }
};

const createPromise = (moduleName, methodName, callId) => ({
  resolve: (params) => {
    hippyBridge('callBack', {
      callId,
      methodName,
      moduleName,
      params,
      result: 0,
    });
  },
  reject: (params) => {
    hippyBridge('callBack', {
      callId,
      methodName,
      moduleName,
      params,
      result: -1,
    });
  },
});

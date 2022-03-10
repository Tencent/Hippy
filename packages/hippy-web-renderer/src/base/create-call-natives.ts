import { HippyWebEngine } from './engine';

export const createCallNatives = (engine: HippyWebEngine) => (
  moduleName: string,
  methodName: string,
  callId: string,
  params: any[] = [],
) => {
  engine.invokeModuleMethod(moduleName, methodName, callId, params);
};

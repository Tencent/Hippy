// android和ios的参数列表不一致
import type { CallbackType } from '../../../../global';

type CallUIFunctionArgs =
  | [nodeId: number, funcName: string, args: any]
  | [
      componentName: string,
      nodeId: number,
      funcName: string,
      args: any,
  ];
export interface UiManagerModule {
  callUIFunction: (
    args: CallUIFunctionArgs,
    callback?: (...params: any[]) => any,
  ) => void;
  measureInWindow: (nodeId: number, callback: CallbackType) => void;
  measureInAppWindow: (nodeId: number, callback: CallbackType) => void;
}

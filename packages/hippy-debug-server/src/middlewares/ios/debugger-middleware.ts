import { ChromeCommand, ChromeEvent } from '@tencent/tdf-devtools-protocol/types/enum-chrome-mapping';
import { sendEmptyResultToDevtools } from '../default-middleware';
import { getRequestId } from '../global-id';
import { MiddleWareManager } from '../middleware-context';

export let lastScriptEval;

export const debuggerMiddlewares: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [ChromeEvent.DebuggerScriptParsed]: ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      lastScriptEval = eventRes.params.scriptId;
      sendToDevtools(eventRes);
    },
    'Inspector.inspect': ({ msg, sendToDevtools }) => {
      const res = msg as UnionToIntersection<Adapter.CDP.Res>;
      res.method = 'DOM.inspectNodeRequested';
      res.params.backendNodeId = res.params.object.objectId;
      delete res.params.object;
      delete res.params.hints;
      sendToDevtools(res);
    },
    'Debugger.enable': sendEmptyResultToDevtools,
    'Debugger.setBlackboxPatterns': sendEmptyResultToDevtools,
    'Debugger.setPauseOnExceptions': sendEmptyResultToDevtools,
  },
  downwardMiddleWareListMap: {
    [ChromeCommand.DebuggerEnable]: ({ sendToApp, msg }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Debugger.setBreakpointsActive',
        params: { active: true },
      });
      sendToApp(msg);
    },
    ['Debugger.canSetScriptSource']: ({ msg, sendToDevtools }) =>
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: false,
      }),
    [ChromeCommand.DebuggerSetBlackboxPatterns]: ({ msg, sendToDevtools }) => {
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: {},
      });
    },
    'Debugger.setAsyncCallStackDepth': ({ msg, sendToDevtools }) => {
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: true,
      });
    },
  },
};

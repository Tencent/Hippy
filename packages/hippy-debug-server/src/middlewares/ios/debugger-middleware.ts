import { MiddleWareManager } from '../middleware-context';
import { getRequestId } from './global-id';

export let lastScriptEval;

export const debuggerMiddlewares: MiddleWareManager = {
  upwardMiddleWareListMap: {
    'Debugger.scriptParsed': ({ msg, sendToDevtools }) => {
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
  },
  downwardMiddleWareListMap: {
    'Debugger.enable': ({ sendToApp, msg }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Debugger.setBreakpointsActive',
        params: { active: true },
      });
      sendToApp(msg);
    },
    'Debugger.canSetScriptSource': ({ msg, sendToDevtools }) =>
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        result: false,
      }),
    'Debugger.setBlackboxPatterns': ({ msg, sendToDevtools }) => {
      sendToDevtools({ id: (msg as Adapter.CDP.Req).id, result: {} });
    },
    'Debugger.setAsyncCallStackDepth': ({ msg, sendToDevtools }) => {
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        result: true,
      });
    },
  },
};

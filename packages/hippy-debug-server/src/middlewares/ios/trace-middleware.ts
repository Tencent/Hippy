import { MiddleWareManager } from '../middleware-context';
import { getRequestId } from '../global-id';
import TraceAdapter from './trace-adapter';

export const traceMiddlewares: MiddleWareManager = {
  upwardMiddleWareListMap: {
    'ScriptProfiler.trackingComplete': ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      console.log(`onPerformanceProfileCompleteEvent, msg = ${eventRes}`);
      const traceAdapter = new TraceAdapter();
      const v8json = traceAdapter.jsc2v8(eventRes.params);
      sendToDevtools({
        method: 'Tracing.dataCollected',
        params: {
          value: v8json,
        },
      });
    },
  },
  downwardMiddleWareListMap: {
    'Tracing.start': ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'ScriptProfiler.startTracking',
        params: { includeSamples: true },
      });
    },
    'Tracing.end': ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'ScriptProfiler.stopTracking',
        params: {},
      });
    },
  },
};

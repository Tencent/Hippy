import { MiddleWareManager } from '../middleware-context';
import { getRequestId } from './global-id';
import HeapAdapter from './heap-adapter';

export const heapMiddlewares: MiddleWareManager = {
  upwardMiddleWareListMap: {},
  downwardMiddleWareListMap: {
    'HeapProfiler.enable': ({ msg, sendToApp, sendToDevtools }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.enable',
        params: {},
      }).then((res) => {
        console.log('Heap.enable res', msg);
        sendToDevtools({ id: (msg as Adapter.CDP.Req).id, result: res });
      });
    },
    'HeapProfiler.disable': ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.disable',
        params: {},
      });
    },
    'HeapProfiler.takeHeapSnapshot': ({ msg, sendToApp, sendToDevtools }) => {
      const req = msg as Adapter.CDP.Req;
      console.log('onTakeHeapSnapshot', msg);
      const { reportProgress } = req.params;
      sendToApp({
        id: getRequestId(),
        method: 'Heap.snapshot',
        params: {},
      }).then((res) => {
        const commandRes = res as Adapter.CDP.CommandRes;
        const { snapshotData } = commandRes.result;
        const snapshot = JSON.parse(snapshotData);
        const v8snapshot = new HeapAdapter().jsc2v8(snapshot);
        const wholeChunk = JSON.stringify(v8snapshot);
        if (reportProgress)
          sendToDevtools({
            method: 'HeapProfiler.reportHeapSnapshotProgress',
            params: {
              finished: true,
              done: wholeChunk.length,
              total: wholeChunk.length,
            },
          });
        sendToDevtools({
          method: 'HeapProfiler.addHeapSnapshotChunk',
          params: {
            chunk: wholeChunk,
          },
        });
        sendToDevtools({
          id: (msg as Adapter.CDP.Req).id,
          result: {},
        });
      });
    },
    'HeapProfiler.collectGarbage': ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.gc',
      });
    },
  },
};

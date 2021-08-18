import { ChromeCommand } from 'tdf-devtools-protocol/types/enum-chrome-mapping';
import { getRequestId } from '../global-id';
import { MiddleWareManager } from '../middleware-context';
import HeapAdapter from './heap-adapter';

export const heapMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {},
  downwardMiddleWareListMap: {
    [ChromeCommand.HeapProfilerEnable]: ({ msg, sendToApp, sendToDevtools }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.enable',
        params: {},
      }).then((res) => {
        console.log('Heap.enable res', msg);
        sendToDevtools({
          id: (msg as Adapter.CDP.Req).id,
          method: msg.method,
          result: res,
        });
      });
    },
    [ChromeCommand.HeapProfilerDisable]: ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.disable',
        params: {},
      });
    },
    [ChromeCommand.HeapProfilerTakeHeapSnapshot]: ({ msg, sendToApp, sendToDevtools }) => {
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
          method: msg.method,
          result: {},
        });
      });
    },
    [ChromeCommand.HeapProfilerCollectGarbage]: ({ sendToApp }) => {
      sendToApp({
        id: getRequestId(),
        method: 'Heap.gc',
        params: {},
      });
    },
  },
};

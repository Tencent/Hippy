import { TdfCommand, TdfEvent } from 'tdf-devtools-protocol/types/enum-tdf-mapping';
import { cssMiddleWareManager } from '../css-middleware';
import { onFetchHeapCache, onGetHeapMeta } from '../heap-middleware';
import { MiddleWareManager } from '../middleware-context';
import { onGetTDFLog } from '../tdf-log-middleware';
import { debuggerMiddleWareManager } from './debugger-middleware';
import { heapMiddleWareManager } from './heap-middleware';
import { logMiddleWareManager } from './log-middleware';
import { runtimeMiddleWareManager } from './runtime-middleware';
import { traceMiddleWareManager } from './trace-middleware';

export const iosMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
    [TdfEvent.TDFLogGetLog]: [onGetTDFLog],
    ...debuggerMiddleWareManager.upwardMiddleWareListMap,
    ...logMiddleWareManager.upwardMiddleWareListMap,
    ...runtimeMiddleWareManager.upwardMiddleWareListMap,
    ...traceMiddleWareManager.upwardMiddleWareListMap,
    ...heapMiddleWareManager.upwardMiddleWareListMap,
    ...cssMiddleWareManager.upwardMiddleWareListMap,
  },
  downwardMiddleWareListMap: {
    'TDFMemory.fetchHeapCache': [onFetchHeapCache],
    ...debuggerMiddleWareManager.downwardMiddleWareListMap,
    ...logMiddleWareManager.downwardMiddleWareListMap,
    ...runtimeMiddleWareManager.downwardMiddleWareListMap,
    ...traceMiddleWareManager.downwardMiddleWareListMap,
    ...heapMiddleWareManager.downwardMiddleWareListMap,
    ...cssMiddleWareManager.downwardMiddleWareListMap,
  },
};

import { TdfCommand, TdfEvent } from 'tdf-devtools-protocol/types/enum-tdf-mapping';
import { onFetchHeapCache, onGetHeapMeta } from '../heap-middleware';
import { MiddleWareManager } from '../middleware-context';
import { debuggerMiddlewares } from './debugger-middleware';
import { heapMiddlewares } from './heap-middleware';
import { logMiddlewares } from './log-middleware';
import { runtimeMiddlewares } from './runtime-middleware';
import { traceMiddlewares } from './trace-middleware';
import { onGetTDFLog } from '../tdf-log-middleware';

export const iosMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
    [TdfEvent.TDFLogGetLog]: [onGetTDFLog],
    ...debuggerMiddlewares.upwardMiddleWareListMap,
    ...logMiddlewares.upwardMiddleWareListMap,
    ...runtimeMiddlewares.upwardMiddleWareListMap,
    ...traceMiddlewares.upwardMiddleWareListMap,
    ...heapMiddlewares.upwardMiddleWareListMap,
  },
  downwardMiddleWareListMap: {
    'TDFMemory.fetchHeapCache': [onFetchHeapCache],
    ...debuggerMiddlewares.downwardMiddleWareListMap,
    ...logMiddlewares.downwardMiddleWareListMap,
    ...runtimeMiddlewares.downwardMiddleWareListMap,
    ...traceMiddlewares.downwardMiddleWareListMap,
    ...heapMiddlewares.downwardMiddleWareListMap,
  },
};

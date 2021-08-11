import { TdfCommand } from '@tencent/tdf-devtools-protocol/types/enum-tdf-mapping';
import { MiddleWareManager } from '../middleware-context';
import { onGetHeapMeta } from '../heap-middleware';
import { debuggerMiddlewares } from './debugger-middleware';
import { heapMiddlewares } from './heap-middleware';
import { logMiddlewares } from './log-middleware';
import { runtimeMiddlewares } from './runtime-middleware';
import { traceMiddlewares } from './trace-middleware';

export const iosMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
    ...debuggerMiddlewares.upwardMiddleWareListMap,
    ...logMiddlewares.upwardMiddleWareListMap,
    ...runtimeMiddlewares.upwardMiddleWareListMap,
    ...traceMiddlewares.upwardMiddleWareListMap,
    ...heapMiddlewares.upwardMiddleWareListMap,
  },
  downwardMiddleWareListMap: {
    ...debuggerMiddlewares.downwardMiddleWareListMap,
    ...logMiddlewares.downwardMiddleWareListMap,
    ...runtimeMiddlewares.downwardMiddleWareListMap,
    ...traceMiddlewares.downwardMiddleWareListMap,
    ...heapMiddlewares.downwardMiddleWareListMap,
  },
};

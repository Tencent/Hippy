import { TdfCommand, TdfEvent } from 'tdf-devtools-protocol/types/enum-tdf-mapping';
import { cssMiddleWareManager } from '../css-middleware';
import { onFetchHeapCache, onGetHeapMeta } from '../heap-middleware';
import { MiddleWareManager } from '../middleware-context';
import { onGetTDFLog } from '../tdf-log-middleware';

export const androidMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
    [TdfEvent.TDFLogGetLog]: [onGetTDFLog],
    ...cssMiddleWareManager.upwardMiddleWareListMap,
  },
  downwardMiddleWareListMap: {
    'TDFMemory.fetchHeapCache': [onFetchHeapCache],
    ...cssMiddleWareManager.downwardMiddleWareListMap,
  },
};

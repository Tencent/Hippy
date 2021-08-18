import { TdfCommand, TdfEvent } from 'tdf-devtools-protocol/types/enum-tdf-mapping';
import { MiddleWareManager } from '../middleware-context';
import { onFetchHeapCache, onGetHeapMeta } from '../heap-middleware';
import { onGetTDFLog } from '../tdf-log-middleware';

export const androidMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
    [TdfEvent.TDFLogGetLog]: [onGetTDFLog],
  },
  downwardMiddleWareListMap: {
    'TDFMemory.fetchHeapCache': [onFetchHeapCache],
  },
};

import { TdfCommand } from '@tencent/tdf-devtools-protocol/types/enum-tdf-mapping';
import { MiddleWareManager } from '../middleware-context';
import { onFetchHeapCache, onGetHeapMeta } from '../heap-middleware';

export const androidMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: [onGetHeapMeta],
  },
  downwardMiddleWareListMap: {
    'TDFMemory.fetchHeapCache': [onFetchHeapCache],
  },
};

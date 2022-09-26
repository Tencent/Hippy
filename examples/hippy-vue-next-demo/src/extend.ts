/* eslint-disable no-console */
/**
 *  extend custom nativeapis and components demo
 */

import { HippyTouchEvent } from '@hippy/vue-next';


declare module '@hippy/vue-next' {
  export interface NativeInterfaceMap {
    customModule: {
      customMethod: (arg1: string, arg2: number) => void;
      customMethodWithPromise: (arg1: string, arg2: number) => boolean;
    };
  }
}

declare module '@hippy/vue-next' {
  export interface HippyGlobalEventHandlersEventMap {
    // extend new event name and related event interface
    onTest: HippyTouchEvent;
    // extend existing event interface
    onAnotherTest: HippyEvent;
  }
  export interface HippyEvent {
    testProp: number;
  }
}

import Hippy from './hippy';

declare module NodeJS  {
  interface Global {
    __PLATFORM__: string;
    __GLOBAL__: {
      nodeId: number;
      reactRoots?: Map<number, any>;
      nodeTreeCache?: {
        [key: string]: any;
      };
      nodeIdCache?: {
        [key: number]: any;
      };
      nodeDeleteIdCache?: {
        [key: number]: {
          [key: number]: string;
        }
      };
      nodeParamCache: {
        [key: number]: {
          [key: number]: any;
        };
      };
      jsModuleList?: any;
      animationId: number;
      renderCount: number;
    };
    Hippy: Hippy.HippyConstance;
  }
}

import { HippyWebEngine } from './engine';

declare global {
  interface HippyGlobalObject {
    web: {
      Engine: typeof HippyWebEngine,
      engine: HippyWebEngine
    },
  }
}

Hippy.web = {} as any;
Hippy.web.Engine = HippyWebEngine;

export * from './engine';
export * from './base-unit';
export * from './context';
export { HippyView, View }  from '../component';

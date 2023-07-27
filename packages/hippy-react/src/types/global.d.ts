/* eslint-disable */
// // @ts-ignore
declare var global: HippyTypes.HippyGlobal & typeof globalThis;

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Global extends HippyTypes.HippyGlobal {};
  }
};

/* eslint-disable import/prefer-default-export */

const globalThis = typeof window === 'object'
  ? window
  : { innerHeight: 0, innerWidth: 0, screen: { height: 0, width: 0 } };

const Device = {
  platform: 'web',
  window: {
    height: globalThis.innerHeight,
    width: globalThis.innerWidth,
    scale: 1,
    statusBarHeight: 0,
  },
  screen: {
    height: globalThis.screen.height,
    width: globalThis.screen.width,
    scale: 1,
    statusBarHeight: 0,
  },
};

export {
  Device,
};

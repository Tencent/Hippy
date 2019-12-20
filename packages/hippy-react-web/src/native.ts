/* eslint-disable import/prefer-default-export */

const Device = {
  platform: 'web',
  window: {
    height: window.innerHeight,
    width: window.innerWidth,
    scale: 1,
    statusBarHeight: 0,
  },
  screen: {
    height: window.screen.height,
    width: window.screen.width,
    scale: 1,
    statusBarHeight: 0,
  },
};

export {
  Device,
};

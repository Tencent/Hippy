export function checkUpdateDimension() {
  const initData = {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    statusBarHeight: 0,
    navigationBarHeight: 0,
  };
  const windowPhysicalPixels = initData;
  windowPhysicalPixels.width = window.screen.width;
  windowPhysicalPixels.height = window.screen.height;
  windowPhysicalPixels.scale = window.devicePixelRatio;
  windowPhysicalPixels.fontScale = window.devicePixelRatio;
  // TODO need implement api to get statusBarHeight
  windowPhysicalPixels.statusBarHeight = 0;
  // TODO need implement api to get navigationBarHeight
  windowPhysicalPixels.navigationBarHeight = 0;

  const screenPhysicalPixels = initData;
  screenPhysicalPixels.width = window.screen.width;
  screenPhysicalPixels.height = window.screen.height;
  screenPhysicalPixels.scale = window.devicePixelRatio;
  screenPhysicalPixels.fontScale = window.devicePixelRatio;
  // TODO need implement api to get statusBarHeight
  screenPhysicalPixels.statusBarHeight = 0;
  // TODO need implement api to get navigationBarHeight
  screenPhysicalPixels.navigationBarHeight = 0;
  return { windowPhysicalPixels, screenPhysicalPixels };
}

export const nativeGlobal = {
  OS: 'web',
  Platform: {
    OS: 'android',
    Localization: undefined,
  },
  Dimensions: {
    window: {
      scale: window.devicePixelRatio || 1,
      height: window.innerHeight,
      width: window.innerWidth,
    },
    ...checkUpdateDimension(),
  },
};



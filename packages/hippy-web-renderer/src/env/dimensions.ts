

declare global {
  interface HippyDeviceInfo {
    platform: any,
    window: any,
    screen: any,
    pixelRatio: any,
  }
}


export const Dimensions = {
  get(key: keyof HippyDeviceInfo) {
    const device = Hippy.device || {};
    return device[key];
  },
  set(nativeDimensions) {
    if (!nativeDimensions) {
      return;
    }
    const { windowPhysicalPixels = null, screenPhysicalPixels = null } = nativeDimensions;
    if (windowPhysicalPixels) {
      Hippy.device.window = {
        width: windowPhysicalPixels.width,
        height: windowPhysicalPixels.height,
        scale: windowPhysicalPixels.scale,
        fontScale: windowPhysicalPixels.fontScale,
        statusBarHeight: windowPhysicalPixels.statusBarHeight,
        navigatorBarHeight: windowPhysicalPixels.navigationBarHeight,
      };
    }

    if (screenPhysicalPixels) {
      Hippy.device.screen = {
        width: screenPhysicalPixels.width,
        height: screenPhysicalPixels.height,
        scale: screenPhysicalPixels.scale,
        fontScale: screenPhysicalPixels.fontScale,
        statusBarHeight: screenPhysicalPixels.statusBarHeight, // px unit
        navigatorBarHeight: screenPhysicalPixels.navigationBarHeight,
      };
    }

    Hippy.device.pixelRatio = Hippy.device.window.scale;
  },
  init() {
    const { windowPhysicalPixels, screenPhysicalPixels } = __HIPPYNATIVEGLOBAL__.Dimensions as any;
    this.set({
      windowPhysicalPixels,
      screenPhysicalPixels,
    });
  },
};





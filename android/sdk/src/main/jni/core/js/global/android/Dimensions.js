const Dimensions = {
  get(key) {
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
        width: windowPhysicalPixels.width / windowPhysicalPixels.scale,
        height: windowPhysicalPixels.height / windowPhysicalPixels.scale,
        scale: windowPhysicalPixels.scale,
        fontScale: windowPhysicalPixels.fontScale,
        statusBarHeight: windowPhysicalPixels.statusBarHeight / windowPhysicalPixels.scale,
      };
    }

    if (screenPhysicalPixels) {
      Hippy.device.screen = {
        width: screenPhysicalPixels.width / screenPhysicalPixels.scale,
        height: screenPhysicalPixels.height / screenPhysicalPixels.scale,
        scale: screenPhysicalPixels.scale,
        fontScale: screenPhysicalPixels.fontScale,
        statusBarHeight: screenPhysicalPixels.statusBarHeight, // px unit
      };
    }

    Hippy.device.pixelRatio = Hippy.device.window.scale;
  },
  init() {
    const { windowPhysicalPixels, screenPhysicalPixels } = __HIPPYNATIVEGLOBAL__.Dimensions;
    this.set({
      windowPhysicalPixels, screenPhysicalPixels,
    });
  },
};

Dimensions.init();

__GLOBAL__.jsModuleList = {
  Dimensions,
};

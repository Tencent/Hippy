/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

Hippy.device.window = 0;
Hippy.device.screen = 0;

Hippy.device.window = __HIPPYNATIVEGLOBAL__.Dimensions.window;
Hippy.device.screen = __HIPPYNATIVEGLOBAL__.Dimensions.screen;

__GLOBAL__.jsModuleList = {
  Dimensions: {
    window: Hippy.device.window,
    screen: Hippy.device.screen,
  },
};

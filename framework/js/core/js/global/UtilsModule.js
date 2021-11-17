/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

if (Hippy.device.platform.OS === 'android') {
  Hippy.device.vibrate = (pattern, repeat) => {
    let _pattern = pattern;
    let _repeat = repeat;
    if (typeof pattern === 'number') {
      _pattern = [0, pattern];
    }

    if (repeat === undefined) {
      _repeat = -1;
    }

    Hippy.bridge.callNativeWithCallbackId('UtilsModule', 'vibrate', true, _pattern, _repeat);
  };

  Hippy.device.cancelVibrate = () => {
    Hippy.bridge.callNativeWithCallbackId('UtilsModule', 'cancel', true);
  };
} else if (Hippy.device.platform.OS === 'ios') { // to_do
  Hippy.device.vibrate = () => {};
  Hippy.device.cancelVibrate = () => {};
}

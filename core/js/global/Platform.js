/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

/*
  IOS __HIPPYNATIVEGLOBAL__ : {
    Device : 'iPhone XR',
    SDKVersion : '0.2.1',
    OS ：'ios',
    OSVersion : '12.0'
  }

  Android __HIPPYNATIVEGLOBAL__ : {
    Platform : {
      OS : 'android',
      APILevel : 'xxx'
    }
  }

  Hippy.device.platform = {
    'OS': 'web',
    'Device': '',
    'OSVersion': '', // for ios
    'SDKVersion': '',
    'APILevel': '', // for android
    'AppVersion': '', // to_do
    'PixelRatio' : 1, // to_do
    'Dimensions' : { // to_do
      window : {
        width : 1,
        height : 1,
        scale : 1,
        fontScale : 1
      },
      screen : {
        width : 1,
        height : 1,
        scale : 1,
        fontScale : 1,
        statusBarHeight : 1
      }
    }
  };
*/

Hippy.device.platform = {};

if (typeof __HIPPYNATIVEGLOBAL__ !== 'undefined') {
  const Localization = { country: '', language: '', direction: 0 };
  if (__HIPPYNATIVEGLOBAL__.OS === 'ios') {
    Hippy.device.platform.OS = __HIPPYNATIVEGLOBAL__.OS;
    Hippy.device.platform.Device = __HIPPYNATIVEGLOBAL__.Device;
    Hippy.device.platform.OSVersion = __HIPPYNATIVEGLOBAL__.OSVersion;
    Hippy.device.platform.SDKVersion = __HIPPYNATIVEGLOBAL__.SDKVersion;
    Hippy.device.platform.Localization = __HIPPYNATIVEGLOBAL__.Localization || Localization;
  } else {
    Hippy.device.platform.OS = __HIPPYNATIVEGLOBAL__.Platform.OS;
    Hippy.device.platform.APILevel = __HIPPYNATIVEGLOBAL__.Platform.APILevel;
    Hippy.device.platform.Localization = __HIPPYNATIVEGLOBAL__.Platform.Localization || Localization;
  }
}

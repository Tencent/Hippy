/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

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

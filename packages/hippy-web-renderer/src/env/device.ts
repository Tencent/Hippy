declare global {
  interface HippyDeviceInfo {
    vibrate: any,
    cancelVibrate: any,
  }
}

export const device: Partial<HippyDeviceInfo> = {
  vibrate: () => {},
  cancelVibrate: () => {},
};

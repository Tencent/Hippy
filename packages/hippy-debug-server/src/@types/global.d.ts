declare module NodeJS {
  interface Global {
    addon: Addon
  }
}

interface Addon {
  addEventListener: (event: string, data: TunnelData) => void,
  tunnelStart: (adbPath: string, iwdpParams: string) => void,
  getDeviceList: (cb: (devices: Array<DeviceInfo>) => void) => void,
  selectDevice: (deviceId: string) => void,
  sendMsg: (msg: string) => void,
  exit: () => void,
};

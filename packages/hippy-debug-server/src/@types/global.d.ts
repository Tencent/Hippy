declare namespace NodeJS {
  interface Global {
    addon: Addon;
  }
}

interface Addon {
  addEventListener: (event: string, data: TunnelData) => void;
  tunnelStart: (adbPath: string, iwdpParams: string) => void;
  getDeviceList: (cb: (devices: Array<DeviceInfo>) => void) => void;
  selectDevice: (deviceId: string) => void;
  sendMsg: (msg: string) => void;
  exit: () => void;
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

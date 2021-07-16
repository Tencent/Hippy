import { DevicePlatform, DeviceStatus } from './enum';

export interface DeviceInfo {
  deviceid: string;
  devicename: string;
  physicalstatus: DeviceStatus;
  platform: DevicePlatform;
  osVersion?: string;
}

export type TunnelData = DeviceInfo | number;

export interface DebugPage {
  devtoolsFrontendUrl: string,
  faviconUrl?: string,
  thumbnailUrl: string,
  title: string,
  url: string,
  description: string,
  webSocketDebuggerUrl: string,
  devtoolsFrontendUrlCompat?: string,
  type?: string,
  appId?: string,
  device?: {
    deviceId: string,
    deviceName: string,
    deviceOSVersion: string,
    url: string
  }
}


export namespace Tunnel {
  export interface Req {
    module: string;
    content: any;
  }

  export type ModuleCallback = (msg: unknown) => void;
}

import { DevicePlatform, DeviceStatus } from './enum';
import WebSocket from 'ws/index.js';

export interface DeviceInfo {
  deviceid: string;
  devicename: string;
  physicalstatus: DeviceStatus;
  platform: DevicePlatform;
  osVersion?: string;
}

export type TunnelData = DeviceInfo | number;

export interface DebugPage {
  id: string,
  clientId: string,
  devtoolsFrontendUrl: string,
  faviconUrl?: string,
  thumbnailUrl: string,
  title: string,
  url: string,
  description: string,
  webSocketDebuggerUrl: string,
  devtoolsFrontendUrlCompat?: string,
  platform: DevicePlatform,
  type?: string,
  appId?: string,
  ws?: WebSocket,
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

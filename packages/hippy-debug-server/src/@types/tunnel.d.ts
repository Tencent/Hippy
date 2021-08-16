import { AppClientType, DevicePlatform, DeviceStatus } from './enum';

export interface DeviceInfo {
  deviceid: string;
  devicename: string;
  physicalstatus: DeviceStatus;
  platform: DevicePlatform;
  osVersion?: string;
}

export type TunnelData = DeviceInfo | number;

export interface DebugTarget {
  id: string;
  clientId: string;
  devtoolsFrontendUrl: string;
  faviconUrl?: string;
  thumbnailUrl: string;
  title: string;
  url: string;
  description: string;
  webSocketDebuggerUrl: string;
  devtoolsFrontendUrlCompat?: string;
  platform: DevicePlatform;
  appClientTypeList: AppClientType[];
  type?: string;
  appId?: string;
  device?: {
    deviceId: string;
    deviceName: string;
    deviceOSVersion: string;
    url: string;
  };
}

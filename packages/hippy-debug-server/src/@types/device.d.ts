import { DevicePlatform, DeviceStatus } from './enum';
export interface DeviceInfo {
  deviceid: string;
  devicename: string;
  physicalstatus: DeviceStatus;
  platform: DevicePlatform;
  osVersion?: string;
}

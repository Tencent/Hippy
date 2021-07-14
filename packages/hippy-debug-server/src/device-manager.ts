import { DeviceInfo } from './@types/tunnel';
import { DeviceStatus, DevicePlatform, DeviceManagerEvent } from './@types/enum';
import { EventEmitter } from 'events';

const tag = '[device-manager]';

class DeviceManager extends EventEmitter {
  deviceList: DeviceInfo[] = [];
  selectedIndex: number = -1;
  appConnect: boolean = false;

  addDevice(device: DeviceInfo) {
    if (!this.deviceList.find((item) => item.deviceid === device.deviceid)) {
      this.deviceList.splice(this.deviceList.length - 1, 0, device);
    }
    this.emit(DeviceManagerEvent.addDevice, device);
  }

  removeDevice(device: DeviceInfo) {
    const deviceIndex = this.deviceList.findIndex((item) => item.deviceid === device.deviceid);
    if (deviceIndex > 0) {
      this.deviceList.splice(deviceIndex, 1);
    }
    this.emit(DeviceManagerEvent.removeDevice, device);
  }

  appDidDisConnect() {
    this.appConnect = false;
    // state.selectedIndex = -1;
    this.emit(DeviceManagerEvent.appDidDisConnect, this.getCurrent());
  }

  appDidConnect() {
    this.appConnect = true;
    this.emit(DeviceManagerEvent.appDidConnect, this.getCurrent());
  }

  getDeviceList() {
    global.addon.getDeviceList((devices: any) => {
      console.log(tag, 'getDeviceList', devices);
      for (const device of devices) {
        if (device.physicalstatus === DeviceStatus.Disconnected) {
          device.devicename = `${device.devicename}(已断开)`;
        }
      }

      this.deviceList = devices;
      if (devices.length) {
        const isDeviceDisconnect = devices[this.selectedIndex]?.physicalstatus === DeviceStatus.Disconnected;
        if (isDeviceDisconnect) {
          this.selectedIndex = -1;
          return;
        }

        if (this.selectedIndex < 0) {
          this.selectedIndex = 0;
          const device = this.deviceList[this.selectedIndex];
          const deviceId = device.deviceid;
          console.log(tag, `selectDevice ${deviceId}`);
          global.addon.selectDevice(deviceId);
        }
      } else {
        this.selectedIndex = -1;
      }
    });
  }

  getCurrent() {
    return this.deviceList[this.selectedIndex];
  }
}

export default new DeviceManager();

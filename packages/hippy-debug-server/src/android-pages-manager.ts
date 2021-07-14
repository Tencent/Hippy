
import { v4 as uuidv4 } from 'uuid';
import deviceManager from './device-manager';
import { DeviceInfo } from './@types/tunnel';
import { ClientType, ClientRole, ClientEvent, AppClientType, DevicePlatform, DeviceManagerEvent } from './@types/enum';

let clientId;

/**
 * 安卓有两个通道：
 *    - ws通道：在 ws on connection 时追加可调试页面，on close 时移除
 *    - tunnel通道：tunnel app connect 时添加可调试页面， app disconnect 时移除，device disconnect时清空
 * 两通道共存时，走tunnel通道
 */
class AndroidPageManager {
  wsPages: string[] = [];
  tunnelPages: string[] = [];
  useTunnel = false;

  constructor() {
    this.bindTunnelPage();
  }

  getPages() {
    if(this.useTunnel) return this.tunnelPages;
    else return this.wsPages;
  }

  bindTunnelPage() {
    deviceManager.on(DeviceManagerEvent.removeDevice, device => {
      if(device.platform === DevicePlatform.Android) {
        this.tunnelPages.splice(0, this.tunnelPages.length);
      }
    });
    deviceManager.on(DeviceManagerEvent.appDidConnect, device => {
      // this.useTunnel = true;
      clientId = uuidv4();
      this.tunnelPages.push(clientId);
    });
    deviceManager.on(DeviceManagerEvent.appDidDisConnect, device => {
      // this.useTunnel = false;
      const index = this.tunnelPages.findIndex(v => v === clientId);
      if(index > -1) this.tunnelPages.splice(index, 1);
      clientId = null;
    });
  }

  addWsClientId(): string {
    // 这里app端未区分clientId，且reload时，旧连接不会close。所以这里复用旧连接 id
    if(this.wsPages.length) return this.wsPages[0];

    const clientId = uuidv4();
    this.wsPages.push(clientId);
    return clientId;
  }

  removeWsClientId(clientId: string) {
    const index = this.wsPages.findIndex(v => v === clientId);
    if(index > -1) this.wsPages.splice(index, 1);
  }
}

export default new AndroidPageManager();

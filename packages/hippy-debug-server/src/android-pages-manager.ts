
import { v4 as uuidv4 } from 'uuid';
import WebSocket, { Server } from 'ws/index.js';
import { DeviceInfo } from './@types/tunnel';
import { ClientRole, ClientEvent, AppClientType, DevicePlatform, DeviceManagerEvent } from './@types/enum';


/**
 * 安卓有两个通道：
 *    - ws通道：在 ws on connection 时追加可调试页面，on close 时移除
 *    - tunnel通道：tunnel app connect 时添加可调试页面， app disconnect 时移除，device disconnect时清空
 * 两通道共存时，走tunnel通道
 */
class AndroidTargetManager {
  wsTargets: {
    id: string,
    ws: WebSocket,
  }[] = [];
  customTargets: {
    id: string,
    ws?: WebSocket,
  }[] = [];
  useCustom = false;

  constructor() {}

  private addTarget(wsTargets, clientId, data = {}) {
    const index = wsTargets.findIndex(v => v.id === clientId);
    if(index === -1) {
      wsTargets.push({
        id: clientId,
        ...data,
      });
    }
  }

  private removeTarget(wsTargets, clientId: string) {
    const index = wsTargets.findIndex(v => v === clientId);
    if(index > -1) wsTargets.splice(index, 1);
  }

  getTargets() {
    if(this.useCustom) return this.customTargets;
    else return this.wsTargets;
  }

  addWsTarget(clientId: string, ws) {
    this.addTarget(this.wsTargets, clientId, {ws});
  }

  removeWsTarget(clientId: string) {
    this.removeTarget(this.wsTargets, clientId);
  }

  clearCustomTarget() {
    this.customTargets = [];
  }

  addCustomTarget(clientId: string) {
    this.addTarget(this.customTargets, clientId);
  }

  removeCustomTarget(clientId: string) {
    this.removeTarget(this.customTargets, clientId);
  }
}

export default new AndroidTargetManager();

import { DevtoolsClient } from '../client';
import { DevicePlatform, ClientEvent } from '../@types/enum';
import { DeviceInfo, DebugPage } from '../@types/tunnel';
import { AndroidProtocol, AndroidTarget, IosTarget, IOS8Protocol, IOS9Protocol, IOS12Protocol } from '../adapter';
import { IosProxyClient, WsAppClient, TunnelAppClient } from '../client';
import deviceManager from '../device-manager';

class MessageChannel {
  adapter: AndroidProtocol | IOS8Protocol | IOS9Protocol | IOS12Protocol;
  devtoolsClient;
  appClient;
  adapterMap = new Map<string, AndroidProtocol | IOS8Protocol | IOS9Protocol | IOS12Protocol>();

  // get current() {
  //   const device = store.getters['device/current'];
  //   return this.adapterMap.get(device.deviceid);
  // }

  constructor() {
    this.devtoolsClient = new DevtoolsClient();
  }

  /**
   * 安卓设备连接后调用
   * ios选择页面后调用
   *
   * 如adapter已存在，重新设置调试页面，adapter.target.appClient
   *
   * @param page
   */
  init(page?: DebugPage) {
    const device = deviceManager.getCurrent();
    if (device.platform === DevicePlatform.Android) {
      const id = device.deviceid;
      if(this.adapterMap.has(id)) return;
      this.appClient = new TunnelAppClient(device.deviceid);
      const androidTarget = new AndroidTarget(this.devtoolsClient, this.appClient);
      this.adapter = new AndroidProtocol(androidTarget);
      this.adapterMap.set(id, this.adapter);
    } else if (device.platform === DevicePlatform.IOS) {
      if (page) {
        const url = page.webSocketDebuggerUrl;
        const id = url;
        if(this.adapterMap.has(id)) return;
        const version = page.device.deviceOSVersion;
        this.appClient = new IosProxyClient(url);
        const iosTarget = new IosTarget(this.devtoolsClient, this.appClient, page);
        this.adapter = getIosProtocolAdapter(version, iosTarget);
        this.adapterMap.set(id, this.adapter);
        this.devtoolsClient.on('close', () => {
          // ios 的 resume 需要发送 Debugger.disable
          this.sendMessage({
            id: Date.now(),
            method: 'Debugger.disable',
            params: {},
          })
        })
      }
    }
  }

  /**
   * 设备移除时清除adapter
   */
  destory() {
    this.devtoolsClient.emit(ClientEvent.Close);
  }

  sendMessage(msg: Adapter.CDP.Req) {
    this.adapter.target.devtoolsClient.sendMessage(msg);
  }

  registerDomainCallback(domain: string, cb: Adapter.DomainCallback) {
    this.adapter.target.devtoolsClient.registerDomainCallback(domain, cb);
  }
}

const getIosProtocolAdapter = (version, iosTarget) => {
  const parts = version.split('.');
  if (parts.length) {
    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    if (major <= 8) return new IOS8Protocol(iosTarget);
    if (major > 12 || (major === 12 && minor >= 2)) return new IOS12Protocol(iosTarget);
  }
  return new IOS9Protocol(iosTarget);
};

export default new MessageChannel();

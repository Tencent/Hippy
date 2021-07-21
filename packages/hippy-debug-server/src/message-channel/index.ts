import { DevicePlatform, ClientEvent, AppClientType, ClientRole } from '../@types/enum';
import { DeviceInfo, DebugPage } from '../@types/tunnel';
import { AndroidProtocol, AndroidTarget, IosTarget, IOS8Protocol, IOS9Protocol, IOS12Protocol } from '../adapter';
import { IosProxyClient, WsAppClient, TunnelAppClient, AppClient, DevtoolsClient } from '../client';
import WebSocket from 'ws/index.js';
import createDebug from 'debug';

const debug = createDebug('socket-bridge');

type Adapter = AndroidProtocol | IOS8Protocol | IOS9Protocol | IOS12Protocol;

class MessageChannel {
  // id: `${appClientId}-${devtoolsClientId}`
  adapterMap = new Map<string, Adapter>();
  // id: page.webSocketDebuggerUrl
  appClientMap = new Map<string, AppClient>();
  // id: req.url
  devtoolsClientMap = new Map<string, DevtoolsClient>();

  constructor() {}

  /**
   * 新增通道 devtools client， app client, adapter
   * 在选择调试页面后调用
   */
  addChannel({
    devtoolsClient,
    appClientId,
    appClientType,
    ws,
    debugPage,
    platform,
  }: {
    devtoolsClient: DevtoolsClient,
    appClientId: string,
    appClientType: AppClientType,
    ws: WebSocket,
    debugPage: DebugPage,
    platform: DevicePlatform,
  }): AppClient | void {
    if (platform === DevicePlatform.Android) {
      const devtoolsClientId = devtoolsClient.id;
      const adapterId = `${appClientId}-${devtoolsClientId}`;

      if(this.adapterMap.has(adapterId)) return;

      let appClient
      if(appClientType === AppClientType.Tunnel)
        appClient = new TunnelAppClient(appClientId);
      else
        appClient = new WsAppClient(appClientId, ws);
      const androidTarget = new AndroidTarget(devtoolsClient, appClient);
      const adapter = new AndroidProtocol(androidTarget);
      this.adapterMap.set(adapterId, adapter);
      return appClient;
    } else if(platform === DevicePlatform.IOS) {
      if (!debugPage?.webSocketDebuggerUrl) return;

      const version = debugPage.device.deviceOSVersion;
      const url = debugPage.webSocketDebuggerUrl;
      const devtoolsClientId = devtoolsClient.id;
      const adapterId = `${appClientId}-${devtoolsClientId}`;
      if(this.adapterMap.has(adapterId)) return this.appClientMap.get(appClientId);

      let appClient;
      if(this.appClientMap.has(appClientId)) appClient = this.appClientMap.get(appClientId);
      else appClient = new IosProxyClient(url);

      const iosTarget = new IosTarget(devtoolsClient, appClient, debugPage);
      const adapter = getIosProtocolAdapter(version, iosTarget);
      this.adapterMap.set(adapterId, adapter);
      return appClient;
    } else {
      debug('invalid platform!');
    }
  }

  /**
   * 移除通道，app断连/devtools断连时做清理
   * @param appClientId
   * @param devtoolsClientId
   */
  removeChannel(appClientId, devtoolsClientId) {
    const adapterId = `${appClientId}-${devtoolsClientId}`;
    this.appClientMap.delete(appClientId);
    this.devtoolsClientMap.delete(devtoolsClientId);
    this.adapterMap.delete(adapterId);
  }

  /**
   * 获取通道
   */
  getInstance(appClientId: string, devtoolsClientId: string): {
    sendMessage: (msg: Adapter.CDP.Req) => void,
    registerDomainCallback: (domain: string, cb: Adapter.DomainCallback) => void,
  } | void {
    const adapterId = `${appClientId}-${devtoolsClientId}`;
    const adapter = this.adapterMap.get(adapterId);
    if(!adapter) return debug('message channel adapter instance doesn\'t exist!!!');

    return {
      sendMessage: adapter.target.devtoolsClient.sendMessage.bind(adapter.target.devtoolsClient),
      registerDomainCallback: adapter.target.devtoolsClient.registerDomainCallback.bind(adapter.target.devtoolsClient),
    };
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

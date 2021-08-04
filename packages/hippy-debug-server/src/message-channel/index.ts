import { DevicePlatform, ClientEvent, AppClientType, ClientRole } from '../@types/enum';
import { DeviceInfo, DebugPage } from '../@types/tunnel';
import { AndroidProtocol, AndroidTarget, IosTarget, IOS8Protocol, IOS9Protocol, IOS12Protocol } from '../adapter';
import { IwdpAppClient, WsAppClient, TunnelAppClient, AppClient, DevtoolsClient, appClientManager } from '../client';
import WebSocket from 'ws/index.js';
import createDebug from 'debug';

const debug = createDebug('socket-bridge');

type Adapter = AndroidProtocol | IOS8Protocol | IOS9Protocol | IOS12Protocol;

class MessageChannel {
  // id: devtoolsClientId
  adapterMap = new Map<string, Adapter>();
  // id: target.id
  appClientMap = new Map<string, AppClient[]>();
  // id: req.url
  devtoolsClientMap = new Map<string, DevtoolsClient>();

  constructor() {}

  /**
   * 新增通道 devtools client， app client, adapter
   * 在选择调试页面后调用
   */
  addChannel(target: DebugPage) {
    const devtoolsClientId = target.clientId;
    const adapterId = devtoolsClientId;
    const appClientId = target.id;

    if (this.devtoolsClientMap.has(devtoolsClientId)) {
      const devtoolsClient = this.devtoolsClientMap.get(devtoolsClientId);
      const appClients = this.appClientMap.get(appClientId);
      return { devtoolsClient, appClients };
    }

    const devtoolsClient = new DevtoolsClient(devtoolsClientId);
    this.devtoolsClientMap.set(devtoolsClientId, devtoolsClient);

    if (target.platform === DevicePlatform.Android) {
      if (this.adapterMap.has(adapterId)) {
        return {
          appClients: this.appClientMap.get(appClientId),
          devtoolsClient,
        };
      }

      const appClientOptions = appClientManager.getAndroidAppClients();
      const appClients = appClientOptions.map(({ ctor, ...option }) => {
        if (ctor.name === AppClientType.WS) option.ws = target.ws;
        return new ctor(appClientId, option);
      });
      const androidTarget = new AndroidTarget(devtoolsClient, appClients);
      const adapter = new AndroidProtocol(androidTarget);
      this.adapterMap.set(adapterId, adapter);
      this.appClientMap.set(appClientId, appClients);
      return { appClients, devtoolsClient };
    } else if (target.platform === DevicePlatform.IOS) {
      if (!target.webSocketDebuggerUrl) return;

      const appClientOptions = appClientManager.getIosAppClients();
      const version = target.device.deviceOSVersion;
      // const url = target.webSocketDebuggerUrl;

      if (this.adapterMap.has(adapterId)) {
        const appClients = this.appClientMap.get(appClientId);
        return { appClients, devtoolsClient };
      }

      let appClients;
      if (this.appClientMap.has(appClientId)) appClients = this.appClientMap.get(appClientId);
      else {
        appClients = appClientOptions.map(({ ctor, ...option }) => {
          return new ctor(appClientId, option);
        });
      }
      const iosTarget = new IosTarget(devtoolsClient, appClients, target);
      const adapter = getIosProtocolAdapter(version, iosTarget);
      this.adapterMap.set(adapterId, adapter);
      this.appClientMap.set(appClientId, appClients);
      return { appClients, devtoolsClient };
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
    this.appClientMap.delete(appClientId);
    this.devtoolsClientMap.delete(devtoolsClientId);
    this.adapterMap.delete(devtoolsClientId);
  }

  /**
   * 获取通道
   */
  getInstance(appClientId: string, devtoolsClientId: string): Adapter.Channel | void {
    const adapter = this.adapterMap.get(devtoolsClientId);
    if (!adapter) return debug("message channel adapter instance doesn't exist!!!");

    return {
      sendMessage: adapter.target.devtoolsClient.sendMessage.bind(adapter.target.devtoolsClient),
      registerDomainCallback: adapter.target.devtoolsClient.registerDomainCallback.bind(adapter.target.devtoolsClient),
      registerModuleCallback: adapter.target.devtoolsClient.registerModuleCallback.bind(adapter.target.devtoolsClient),
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

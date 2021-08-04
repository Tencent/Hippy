import { AppClient, AppClientOption } from './app-client';
import { IwdpAppClient } from './iwdp-app-client';
import { WsAppClient } from './ws-app-client';
import { TunnelAppClient } from './tunnel-app-client';

type AppClientConfig = AppClientOption & {
  ctor: new (id: string, option: AppClientOption) => AppClient; // 构造器外部注入，可在 TDF 上做扩展
};

/**
 * 管理不同调试器的 AppClient 通道
 */
class AppClientManager {
  androidAppClients: AppClientConfig[] = [];
  iosAppClients: AppClientConfig[] = [];

  getAndroidAppClients() {
    return this.androidAppClients;
  }

  addAndroidAppClients(appClientOption: AppClientConfig) {
    this.androidAppClients.push(appClientOption);
  }

  getIosAppClients() {
    return this.iosAppClients;
  }

  addIosAppClients(appClientOption: AppClientConfig) {
    this.iosAppClients.push(appClientOption);
  }

  reset() {
    this.androidAppClients = [];
    this.iosAppClients = [];
  }
}

export const appClientManager = new AppClientManager();

/**
 * hippy
 *
 * - 安卓走 ws 通道
 * - ios走 iwdp 通道
 */
export const initHippyEnv = () => {
  appClientManager.reset();
  appClientManager.addAndroidAppClients({
    useAllDomain: true,
    useAdapter: true,
    ctor: WsAppClient,
  });
  appClientManager.addIosAppClients({
    useAllDomain: true,
    useAdapter: true,
    ctor: IwdpAppClient,
  });
};

// 终端自己实现的域
const customDomains = ['Page', 'Dom', 'Css', 'Overlay', 'TDFInspector', 'TDFPerformance', 'TDFMemory'];

/**
 * voltron
 *
 * - 安卓
 *    - 走 ws 通道
 * - ios
 *    - 自实现协议走 ws 通道
 *    - jsc实现的协议走 iwdp
 */
export const initVoltronEnv = () => {
  appClientManager.reset();
  initHippyEnv();
  appClientManager.addIosAppClients({
    useAllDomain: false,
    acceptDomains: customDomains,
    useAdapter: false,
    ctor: WsAppClient,
  });
};

/**
 * tdf
 *
 * - 安卓
 *    - tunnel通道
 * - ios
 *    - 自实现协议走 tunnel 通道
 *    - jsc实现的协议走 iwdp 通道
 */
export const initTdfEnv = () => {
  console.log('initTdfEnv');
  appClientManager.reset();
  appClientManager.addAndroidAppClients({
    useAllDomain: true,
    useAdapter: true,
    ctor: TunnelAppClient,
  });
  appClientManager.addIosAppClients({
    useAllDomain: false,
    useAdapter: true,
    ignoreDomains: customDomains,
    ctor: IwdpAppClient,
  });
  appClientManager.addIosAppClients({
    useAllDomain: false,
    acceptDomains: customDomains,
    useAdapter: false,
    ctor: TunnelAppClient,
  });
};

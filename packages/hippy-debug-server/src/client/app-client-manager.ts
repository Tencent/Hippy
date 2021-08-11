import { androidMiddleWareManager, iosMiddleWareManager } from '../middlewares';
import { AppClient, AppClientOption } from './app-client';
import { IwdpAppClient } from './iwdp-app-client';
import { TunnelAppClient } from './tunnel-app-client';
import { WsAppClient } from './ws-app-client';

/**
 * 管理不同调试器的 AppClient 通道
 */
class AppClientManager {
  private androidAppClientOptionList: AppClientFullOptionOmicCtx[] = [];
  private iosAppClientOptionList: AppClientFullOptionOmicCtx[] = [];

  public getAndroidAppClientOptions() {
    return this.androidAppClientOptionList;
  }

  public addAndroidAppClientOption(appClientOption: AppClientFullOptionOmicCtx) {
    this.androidAppClientOptionList.push(appClientOption);
  }

  public getIosAppClientOptions() {
    return this.iosAppClientOptionList;
  }

  public addIosAppClientOption(appClientOption: AppClientFullOptionOmicCtx) {
    this.iosAppClientOptionList.push(appClientOption);
  }

  public reset() {
    this.androidAppClientOptionList = [];
    this.iosAppClientOptionList = [];
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
  appClientManager.addAndroidAppClientOption({
    useAllDomain: true,
    useAdapter: true,
    middleWareManager: androidMiddleWareManager,
    Ctor: WsAppClient,
  });
  appClientManager.addIosAppClientOption({
    useAllDomain: true,
    useAdapter: true,
    middleWareManager: iosMiddleWareManager,
    Ctor: IwdpAppClient,
  });
  appClientManager.addIosAppClientOption({
    useAllDomain: false,
    acceptDomains: customDomains,
    useAdapter: false,
    middleWareManager: iosMiddleWareManager,
    Ctor: TunnelAppClient,
  });
};

// 终端自己实现的域
const customDomains = ['Page', 'DOM', 'CSS', 'Overlay', 'getHeapMeta', 'dumpDomTree', 'updateDomTree'];

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
  appClientManager.addIosAppClientOption({
    useAllDomain: false,
    acceptDomains: customDomains,
    useAdapter: false,
    middleWareManager: iosMiddleWareManager,
    Ctor: WsAppClient,
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
  appClientManager.addAndroidAppClientOption({
    useAllDomain: true,
    useAdapter: true,
    middleWareManager: androidMiddleWareManager,
    Ctor: TunnelAppClient,
  });
  appClientManager.addIosAppClientOption({
    useAllDomain: false,
    useAdapter: true,
    ignoreDomains: customDomains,
    middleWareManager: iosMiddleWareManager,
    Ctor: IwdpAppClient,
  });
  appClientManager.addIosAppClientOption({
    useAllDomain: false,
    acceptDomains: customDomains,
    useAdapter: false,
    middleWareManager: iosMiddleWareManager,
    Ctor: TunnelAppClient,
  });
};

export type AppClientFullOption = AppClientOption & {
  Ctor: new (id: string, option: AppClientOption) => AppClient; // 构造器外部注入，可在 TDF 上做扩展
};

export type AppClientFullOptionOmicCtx = Omit<AppClientFullOption, 'urlParsedContext'>;

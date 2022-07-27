export interface QqUiModule {
  setStatusBarDarkFont: (isDarkFont: boolean) => void;
  // 这里实际上是stringify过的参数，参考mqq文档
  showTips: (tips: string) => void;
  // 返回值需要用户parse

  showDialog: (params: string) => string;
  openUrlScheme: (scheme: string, businessId: string) => void;
  openUrl: (params: string) => void;
}

export interface QqDataModule {
  getCurrentJsBundleVersion: () => number;
}

export interface QqDebugModule {
  // 终端给的点和文档不一致，这里🙅🏻‍♀️细化了
  getPerformanceData: () => { [point: string]: number };
}

export interface HippyPushParams {
  // 参数比较多，参考https://iwiki.woa.com/pages/viewpage.action?pageId=419651335
  bundleName: string;
  domain?: string;
  errorUrl?: string;
  isAnimated?: boolean;
  from?: string;
  url?: string;
  bundleUrl?: string;
  isTransparent?: boolean;
  isLandscapeScreen?: boolean;
  isStatusBarDarkFont?: boolean;
  backgroundColor?: string;
  isDebugMode?: boolean;
  isPreload?: boolean;
  // android 专有参数
  processName?: 'main' | 'tool' | 'local';
  updateJsBundleType?: 0 | 1;
  isInToolProcess?: boolean;
  isCustomNightMode?: boolean;
  // iOS 专有参数
  businessInfo?: Record<string, any>;
  pathPluginType?: 1 | 2 | 3 | 4 | 5;
  debugUrl?: string;
  isPresent?: boolean;
  disableRightDragToBack?: boolean;
  supportNightModeTheme?: boolean;
}
export interface QqNavigatorModule {
  pop: ({ isAnimated }: { isAnimated: boolean }) => void;
  push: (args: HippyPushParams) => void;
}

export interface QqWebDataModule {
  // iOS因为实现问题，需要传入一个空map（{}）
  getDefaultUserAgent: (args: Record<string, never>) => string;
}

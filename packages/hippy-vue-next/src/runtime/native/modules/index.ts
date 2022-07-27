import type { AnimationModule } from './animation-module';
import type { ClipboardModule } from './clip-board-module';
import type { DeviceEventModule } from './device-event-module';
import type { Http } from './http';
import type { ImageLoaderModule } from './image-loader-module';
import type { NetInfo } from './net-info';
import type { Network } from './network';
import type {
  QqUiModule,
  QqDataModule,
  QqNavigatorModule,
  QqWebDataModule,
  QqDebugModule,
} from './qq-module';
import type { UiManagerModule } from './ui-manager-module';
import type { Websocket } from './websocket';
import type { ZplanVasHippyAppModule } from './zplan-vas-module';

export interface NativeInterfaceMap {
  // 这里的key是终端定好的模块名，不能随意改动
  UIManagerModule: UiManagerModule;
  ImageLoaderModule: ImageLoaderModule;
  websocket: Websocket;
  NetInfo: NetInfo;
  ClipboardModule: ClipboardModule;
  network: Network;
  AnimationModule: AnimationModule;
  DeviceEventModule: DeviceEventModule;
  http: Http;
  ZplanVasHippyAppModule: ZplanVasHippyAppModule;
  QQUiModule: QqUiModule;
  QQDataModule: QqDataModule;
  QQNavigatorModule: QqNavigatorModule;
  QQWebDataModule: QqWebDataModule;
  QQDebugModule: QqDebugModule;
}

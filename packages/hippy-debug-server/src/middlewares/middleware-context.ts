import { AppClientType, DevicePlatform } from 'src/@types/enum';
import { ClientRole } from '../@types/enum';
import { DebugTarget } from '../@types/tunnel';

export interface ContextBase {
  url?: string;
}

export interface UrlParsedContext extends ContextBase {
  clientId: string;
  targetId: string;
  debugTarget: DebugTarget;
  platform: DevicePlatform;
  appClientTypeList?: AppClientType[];
  clientRole?: ClientRole;
  bundleName?: string;
  customDomains?: string[];
  pathname?: string;
}

export interface MiddleWareContext extends UrlParsedContext {
  msg: Adapter.CDP.Req | Adapter.CDP.Res;
  sendToApp: (msg: Adapter.CDP.Data) => Promise<Adapter.CDP.Res>;
  sendToDevtools: (msg: Adapter.CDP.Data) => void;
}

export type MiddleWare = (ctx: MiddleWareContext, next: () => void) => void;

export interface MiddleWareManager {
  upwardMiddleWareListMap: { [k: string]: Array<MiddleWare> | MiddleWare };
  downwardMiddleWareListMap: { [k: string]: Array<MiddleWare> | MiddleWare };
}

export const debugTarget2UrlParsedContext = (debugTarget: DebugTarget): UrlParsedContext => ({
  clientId: debugTarget.clientId,
  targetId: debugTarget.id,
  debugTarget,
  platform: debugTarget.platform,
});

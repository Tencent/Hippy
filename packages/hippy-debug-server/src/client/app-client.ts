/**
 * app 客户端，未来可能有多个消息通道：
 *    - tunnel 通道
 *    - app ws client 通道
 *    - IWDP ws client 通道
 *
 * 统一封装一层，防止app端通道频繁修改
 */
import { EventEmitter } from 'events';
import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import {
  defaultDownwardMiddleware,
  defaultUpwardMiddleware,
  MiddleWareManager,
  UrlParsedContext,
} from '../middlewares';
import { getRequestId } from '../middlewares/global-id';
import { CDP_DOMAIN_LIST, getDomain } from '../utils/cdp';
import { compose } from '../utils/middleware';

/**
 * 对外接口：
 *  on:
 *      message       : app response
 *      close         : app 断连后触发，需通知 devtools 也断连
 *  send              : send command to app
 **/
export abstract class AppClient extends EventEmitter {
  public id: string;
  public type: AppClientType;
  protected middleWareManager: MiddleWareManager;
  protected urlParsedContext: UrlParsedContext;
  protected msgBuffer: any[] = [];
  protected acceptDomains: string[] = CDP_DOMAIN_LIST;
  protected ignoreDomains: string[] = [];
  protected useAdapter = true;
  protected useAllDomain = true;
  protected isClosed = false;
  protected msgIdMethodMap: Map<number, string> = new Map();

  constructor(
    id,
    {
      useAllDomain = true,
      useAdapter = true,
      acceptDomains,
      ignoreDomains = [],
      middleWareManager,
      urlParsedContext,
    }: AppClientOption,
  ) {
    super();
    this.id = id;
    this.useAllDomain = useAllDomain;
    this.acceptDomains = acceptDomains;
    this.ignoreDomains = ignoreDomains;
    this.useAdapter = useAdapter;
    this.middleWareManager = middleWareManager;
    this.urlParsedContext = urlParsedContext;
  }

  public send(msg: Adapter.CDP.Req): void {
    if (!this.filter(msg)) return;

    const { method } = msg;
    this.msgIdMethodMap.set(msg.id, msg.method);
    let middlewareList = this.middleWareManager.downwardMiddleWareListMap[method];
    if (!middlewareList) middlewareList = [];
    if (!(middlewareList instanceof Array)) middlewareList = [middlewareList];
    const fullMiddlewareList = [...middlewareList, defaultDownwardMiddleware];

    compose(fullMiddlewareList)(this.makeContext(msg));
  }

  protected sendToDevtools(msg: Adapter.CDP.Res) {
    if (!msg) return;
    this.emit(ClientEvent.Message, msg);
  }

  protected onMessage(msg: Adapter.CDP.Res) {
    if ('id' in msg) {
      const method = this.msgIdMethodMap.get(msg.id);
      if (method) msg.method = method;
      this.msgIdMethodMap.delete(msg.id);
    }

    const { method } = msg;
    let middlewareList = this.middleWareManager.upwardMiddleWareListMap[method] || [];
    if (!middlewareList) middlewareList = [];
    if (!(middlewareList instanceof Array)) middlewareList = [middlewareList];
    const fullMiddlewareList = [...middlewareList, defaultUpwardMiddleware];
    compose(fullMiddlewareList)(this.makeContext(msg));
  }

  protected makeContext(msg: Adapter.CDP.Req | Adapter.CDP.Res) {
    return {
      ...this.urlParsedContext,
      msg,
      sendToApp: (msg: Adapter.CDP.Req) => {
        if (!msg.id) {
          msg.id = getRequestId();
        }
        this.sendToApp(msg);
      },
      sendToDevtools: this.sendToDevtools.bind(this),
    };
  }

  /**
   * 通过filter的才会下行，否则直接丢弃
   */
  protected filter(msg: Adapter.CDP.Req) {
    if (this.useAllDomain) return true;
    const { method } = msg;
    const domain = getDomain(method);

    if (this.ignoreDomains.length) {
      const isIgnoreDomain = this.ignoreDomains.indexOf(domain) !== -1 || this.ignoreDomains.indexOf(method) !== -1;
      return !isIgnoreDomain;
    }
    const isAcceptDomain = this.acceptDomains.indexOf(domain) !== -1 || this.acceptDomains.indexOf(method) !== -1;
    return isAcceptDomain;
  }

  public abstract resumeApp(): void;
  protected abstract sendToApp(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res>;
  protected abstract registerMessageListener(): void;
}

export type AppClientOption = {
  useAllDomain: boolean;
  useAdapter: boolean;
  acceptDomains?: string[];
  ignoreDomains?: string[];
  ws?: WebSocket;
  middleWareManager: MiddleWareManager;
  urlParsedContext: UrlParsedContext;
};

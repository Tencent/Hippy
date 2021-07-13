/**
 * app 客户端，未来可能有多个消息通道：
 *    - tunnel层
 *    - app ws client
 *    - IWDP ws client
 *
 * 统一封装一层，防止app端频繁修改
 */
import { EventEmitter } from 'events';
import { AppClientType } from '../@types/enum';

/**
 * 对外接口：
 *  on:
 *      message       : app response
 *      close         : app 断连后触发，需通知 devtools 也断连
 *  resume            : devtools 断连后触发，需通知 v8/jscore 继续运行
 *  send              : send to app
 **/
export abstract class AppClient extends EventEmitter {
  id: string;
  type: AppClientType;
  msgBuffer: any[] = [];

  constructor(id) {
    super();
    this.id = id;
  }

  abstract send(msg): void;
  abstract resume(): void;
 }

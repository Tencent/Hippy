/**
 * ProtocolAdapter 在 device connect 时就已确认其实例类型，一个设备全局唯一，
 * 可以在 debugger之外注册 filter，调用 send.
 */

// import { IosTarget } from './ios/target';
// import { AndroidTarget } from './android/target';

export class ProtocolAdapter {
  public target: any;

  constructor(target: any) {
    this.target = target;
  }
}

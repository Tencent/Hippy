import { IOS9Protocol } from './ios9';
import { IosTarget } from '../target';

export class IOS12Protocol extends IOS9Protocol {
  constructor(target: IosTarget) {
    super(target);
    target.targetBased = false;

    target.addMessageFilter('target::Target.targetCreated', (msg) => this.onTargetCreated(msg));
    target.addMessageFilter('tools::Inspector.enable', (msg) => this.onInspectEnable(msg));
  }

  private onTargetCreated(msg: any): Promise<any> {
    this.target.targetId = msg.params.targetInfo.targetId;

    return Promise.resolve(msg);
  }

  private onInspectEnable(msg): Promise<any> {
    console.info(msg);
    this.target.callTarget('Inspector.initialized', { active: true });
    return Promise.resolve(msg);
  }
}

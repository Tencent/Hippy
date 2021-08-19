/**
 * 安卓有两个通道：
 *    - ws通道：在 ws on connection 时追加可调试页面，on close 时移除
 *    - tunnel通道：tunnel app connect 时添加可调试页面， app disconnect 时移除，device disconnect时清空
 * 两通道共存时，走tunnel通道
 */
import createDebug from 'debug';
import { add, remove } from './utils/array';

const debug = createDebug('socket-bridge');

class AndroidDebugTargetManager {
  public useCustom = false;
  private wsTargetIdList: string[] = [];
  private customTargetIdList: string[] = [];

  public getTargetIdList() {
    return this.useCustom ? this.customTargetIdList : this.wsTargetIdList;
  }

  public addWsTarget(id: string) {
    debug('android ws target connect.');
    add(this.wsTargetIdList, id);
  }

  public removeWsTarget(id: string) {
    debug('android ws target disconnect.');
    remove(this.wsTargetIdList, id);
  }

  public clearCustomTarget() {
    this.customTargetIdList = [];
  }

  public addCustomTarget(id: string) {
    debug('android custom target connect.');
    add(this.customTargetIdList, id);
  }

  public removeCustomTarget(id: string) {
    debug('android custom target disconnect.');
    remove(this.customTargetIdList, id);
  }
}

export const androidDebugTargetManager = new AndroidDebugTargetManager();

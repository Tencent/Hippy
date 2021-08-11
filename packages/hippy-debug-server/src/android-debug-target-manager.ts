/**
 * 安卓有两个通道：
 *    - ws通道：在 ws on connection 时追加可调试页面，on close 时移除
 *    - tunnel通道：tunnel app connect 时添加可调试页面， app disconnect 时移除，device disconnect时清空
 * 两通道共存时，走tunnel通道
 */
import { add, remove } from './utils/array';

class AndroidDebugTargetManager {
  private wsTargetIdList: string[] = [];
  private customTargetIdList: string[] = [];
  private useCustom = false;

  public getTargetIdList() {
    return this.useCustom ? this.customTargetIdList : this.wsTargetIdList;
  }

  public addWsTarget(id: string) {
    add(this.wsTargetIdList, id);
  }

  public removeWsTarget(id: string) {
    remove(this.wsTargetIdList, id);
  }

  public clearCustomTarget() {
    this.customTargetIdList = [];
  }

  public addCustomTarget(id: string) {
    add(this.customTargetIdList, id);
  }

  public removeCustomTarget(id: string) {
    remove(this.customTargetIdList, id);
  }
}

export const androidDebugTargetManager = new AndroidDebugTargetManager();

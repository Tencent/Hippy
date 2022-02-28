import { BaseModule, ModuleContext } from '../../types';
import { callbackToHippy } from '../common';

export class ImageLoadModule implements BaseModule {
  public static moduleName = 'ImageLoadModule';
  private context!: ModuleContext;
  public constructor(context: ModuleContext) {
    this.context = context;
  }

  public getSize(callBackId: number, url: string) {
    if (!url) {
      callbackToHippy(callBackId, `image url not support ${url}`, false, 'getSize', ImageLoadModule.moduleName);
      return;
    }

    const img = new Image();
    img.onload = () => {
      callbackToHippy(callBackId, { width: img.width, height: img.height }, false, 'getSize', ImageLoadModule.moduleName);
    };
    img.src = url;
  }

  public prefetch(callBackId: number, url: string) {
    if (!url) {
      return;
    }
    const img = new Image();
    img.src = url;
  }

  public initialize() {

  }

  public destroy() {

  }
}

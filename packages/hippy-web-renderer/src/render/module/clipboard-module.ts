import { BaseModule, ModuleContext } from '../../types';
import { callbackToHippy } from '../common';

export class ClipboardModule implements BaseModule {
  public static moduleName = 'ClipboardModule'
  private context!: ModuleContext;

  public constructor(context: ModuleContext) {
    this.context = context;
  }

  public destroy() {
  }

  public initialize() {
  }

  public getString(callBackId: number) {
    let data = '';
    if (!!(window?.navigator?.clipboard)) {
      window.navigator.clipboard.readText().then((text) => {
        data = text;
      }, () => {
        console.warn('get clipboard failed');
      })
        .finally(() => {
          callbackToHippy(callBackId, data, true, 'getString', ClipboardModule.moduleName);
        });
    }
  }

  public setString(callBackId: number, value: string) {
    if (!!(window?.navigator?.clipboard)) {
      window.navigator.clipboard.writeText(value).then(null, () => {
        console.warn('set clipboard failed');
      });
    }
    if (!!(document?.queryCommandSupported && document?.queryCommandSupported('copy'))) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        console.warn('set clipboard failed');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
}

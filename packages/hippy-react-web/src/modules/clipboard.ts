import { canUseClipboard, canUseDOM, canUseCopyCommand } from '../utils/execution-environment';

const Clipboard = {
  getString() {
    return new Promise((resolve, reject) => {
      if (canUseClipboard) {
        window.navigator.clipboard.readText().then((text) => {
          resolve(text);
        }, () => {
          reject('');
        });
      } else {
        reject('');
      }
    });
  },
  setString(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (canUseClipboard) {
        window.navigator.clipboard.writeText(text).then(() => {
          resolve();
        }, () => {
          reject();
        });
      } else if (canUseDOM && canUseCopyCommand) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          resolve();
        } catch {
          reject();
        } finally {
          document.body.removeChild(textarea);
        }
      } else {
        reject();
      }
    });
  },
};

export default Clipboard;

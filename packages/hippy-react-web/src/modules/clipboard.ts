import { canUseClipboard, canUseDOM, canUseCopyCommand } from '../utils/execution-environment';
import { warn } from '../utils';

const Clipboard = {
  getString() {
    return new Promise((resolve) => {
      if (canUseClipboard) {
        window.navigator.clipboard.readText().then((text) => {
          resolve(text);
        }, () => {
          warn('Clipboard getString is not supported');
          resolve('');
        });
      } else {
        warn('Clipboard getString is not supported');
        resolve('');
      }
    });
  },
  setString(text: string): Promise<void> {
    const setStringNotSupportWarn = () => {
      warn('Clipboard setString is not supported');
    };
    return new Promise((resolve) => {
      if (canUseClipboard) {
        window.navigator.clipboard.writeText(text).then(() => {
          resolve();
        }, () => {
          setStringNotSupportWarn();
          resolve();
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
          setStringNotSupportWarn();
          resolve();
        } finally {
          document.body.removeChild(textarea);
        }
      } else {
        setStringNotSupportWarn();
        resolve();
      }
    });
  },
};

export default Clipboard;

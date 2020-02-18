import { Bridge } from '../global';

/**
 * The the string contents from clipboard
 */
function getString(): Promise<string> {
  return Bridge.callNativeWithPromise('ClipboardModule', 'getString');
}

/**
 * Set the string content to clipboard
 *
 * @param {string} text - The string content that will set into clipboard.
 */
function setString(text: string): void {
  Bridge.callNative('ClipboardModule', 'setString', text);
}

export {
  getString,
  setString,
};

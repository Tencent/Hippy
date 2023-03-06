import { SsrCommonParams } from './index';

const unescapeRE = /&quot;|&amp;|&#39;|&lt;|&gt;/;

/**
 * unescape xss html entity
 *
 * @param string - html entity string
 */
export function unescapeHtml(string: string): string {
  let str = string;
  const match = unescapeRE.exec(str);

  // return if non match
  if (!match) {
    return str;
  }

  // unescape
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&gt;/g, '>');

  return str;
}

/**
 * current platform is iOS or not
 *
 * @param hippyContext
 */
export function isIOS(hippyContext: SsrCommonParams): boolean {
  return hippyContext?.device?.platform?.OS === 'ios';
}

/**
 * current platform is android or not
 *
 * @param hippyContext
 */
export function isAndroid(hippyContext: SsrCommonParams): boolean {
  return hippyContext?.device?.platform?.OS === 'android';
}

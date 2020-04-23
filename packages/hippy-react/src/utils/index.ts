/* eslint-disable import/prefer-default-export */

const IS_NUMBER_REG = new RegExp(/^\d+$/);
let silent = false;

/**
 * Trace running information
 */
function trace(...context: any[]) {
  // In production build or silent
  if (process.env.NODE_ENV === 'production' || silent) {
    return;
  }
  /* eslint-disable-next-line no-console */
  console.log(...context);
}

/**
 * Warninng information output
 */
function warn(...context: any[]) {
  // In production build
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  /* eslint-disable-next-line no-console */
  console.warn(...context);
}

/**
 * Convert unicode string to normal string
 * @param {string} text - The unicode string input
 */
function unicodeToChar(text: string): string {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

/**
 * Convert to string as possible
 */
const numberRegEx = new RegExp('^[+-]?\\d+(\\.\\d+)?$');
/**
 * Try to convert something to number
 *
 * @param {any} input - The input try to convert number
 */
function tryConvertNumber(input: any) {
  if (typeof input === 'number') {
    return input;
  }
  if (typeof input === 'string' && numberRegEx.test(input)) {
    try {
      return parseFloat(input);
    } catch (err) {
      return input;
    }
  }
  return input;
}

/**
 * Determine input is function.
 *
 * @param {any} input - the input will determine is function.
 * @returns {boolean}
 */
function isFunction(input: any): boolean {
  return Object.prototype.toString.call(input) === '[object Function]';
}

/**
 * Determine a string is number.
 * @param {string} input - the input will determine is number.
 * @returns {boolean}
 */
function isNumber(input: string): boolean {
  return IS_NUMBER_REG.test(input);
}

/**
 * Make trace be silent.
 */
function setSilent(silentArg: boolean): void {
  silent = silentArg;
}

export {
  trace,
  warn,
  unicodeToChar,
  tryConvertNumber,
  isFunction,
  isNumber,
  setSilent,
};

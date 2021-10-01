/* eslint-disable no-bitwise */
/* eslint-disable no-cond-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */

import { camelize } from 'shared/util';
import { tryConvertNumber, warn } from '@vue/util/index';
import translateColor from './color-parser';

const PROPERTIES_MAP = {
  textDecoration: 'textDecorationLine',
  boxShadowOffset: 'shadowOffset',
  boxShadowOffsetX: 'shadowOffsetX',
  boxShadowOffsetY: 'shadowOffsetY',
  boxShadowOpacity: 'shadowOpacity',
  boxShadowRadius: 'shadowRadius',
  boxShadowSpread: 'shadowSpread',
  boxShadowColor: 'shadowColor',
};

// linear-gradient direction description map
const LINEAR_GRADIENT_DIRECTION_MAP = {
  totop: '0',
  totopright: 'totopright',
  toright: '90',
  tobottomright: 'tobottomright',
  tobottom: '180', // default value
  tobottomleft: 'tobottomleft',
  toleft: '270',
  totopleft: 'totopleft',
};

const DEGREE_UNIT = {
  TURN: 'turn',
  RAD: 'rad',
  DEG: 'deg',
};

const commentRegexp = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

/**
 * Trim `str`.
 */
function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}


/**
 * Adds non-enumerable parent node reference to each node.
 */
function addParent(obj, parent) {
  const isNode = obj && typeof obj.type === 'string';
  const childParent = isNode ? obj : parent;
  Object.keys(obj).forEach((k) => {
    const value = obj[k];
    if (Array.isArray(value)) {
      value.forEach((v) => {
        addParent(v, childParent);
      });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  });

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null,
    });
  }

  return obj;
}

/**
 * Convert the px unit to pt directly.
 * We found to the behavior of convert the unit directly is correct.
 */
function convertPxUnitToPt(value) {
  // If value is number just ignore
  if (Number.isInteger(value)) {
    return value;
  }
  // If value unit is px, change to use pt as 1:1.
  if (value.endsWith('px')) {
    const num = parseFloat(value.slice(0, value.indexOf('px')), 10);
    if (!Number.isNaN(num)) {
      value = num;
    }
  }
  return value;
}

/**
 * Parse the CSS to be AST tree.
 */
function parseCSS(css, options) {
  options = options || {};

  /**
   * Positional.
   */

  let lineno = 1;
  let column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    const lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    const i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    const start = { line: lineno, column };
    return (node) => {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */
  class Position {
    constructor(start) {
      this.start = start;
      this.end = { line: lineno, column };
      this.source = options.source;
      this.content = css;
    }
  }

  /**
   * Error `msg`.
   */

  const errorsList = [];

  function error(msg) {
    const err = new Error(`${options.source}:${lineno}:${column}: ${msg}`);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    const rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList,
      },
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    let node;
    const rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    const m = re.exec(css);
    if (!m) {
      return null;
    }
    const str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules = []) {
    let c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    const pos = position();
    if (css.charAt(0) !== '/' || css.charAt(1) !== '*') {
      return null;
    }

    let i = 2;
    while (css.charAt(i) !== '' && (css.charAt(i) !== '*' || css.charAt(i + 1) !== '/')) {
      i += 1;
    }
    i += 2;

    if (css.charAt(i - 1) === '') {
      return error('End of comment missing');
    }

    const str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str,
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    const m = match(/^([^{]+)/);
    if (!m) {
      return null;
    }
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, m => m.replace(/,/g, '\u200C'))
      .split(/\s*(?![^(]*\)),\s*/)
      .map(s => s.replace(/\u200C/g, ','));
  }

  /**
   * convert string value to string degree
   * @param {string} value
   * @param {string} unit
   */
  function convertToDegree(value, unit = DEGREE_UNIT.DEG) {
    const convertedNumValue = parseFloat(value);
    let result = value || '';
    const [, decimals] = value.split('.');
    if (decimals && decimals.length > 2) {
      result = convertedNumValue.toFixed(2);
    }
    switch (unit) {
      // turn unit
      case DEGREE_UNIT.TURN:
        result = `${(convertedNumValue * 360).toFixed(2)}`;
        break;
      // radius unit
      case DEGREE_UNIT.RAD:
        result = `${(180 / Math.PI * convertedNumValue).toFixed(2)}`;
        break;
      default:
    }
    return result;
  }

  /**
   * parse gradient angle or direction
   * @param {string} value
   */
  function getLinearGradientAngle(value) {
    const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
    const reg = /^([+-]?\d+\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
    const valueList = reg.exec(processedValue);
    if (!Array.isArray(valueList)) return;
    // default direction is to bottom, i.e. 180degree
    let angle = '180';
    const [direction, angleValue, angleUnit] = valueList;
    if (angleValue && angleUnit) { // angle value
      angle = convertToDegree(angleValue, angleUnit);
    } else if (direction && typeof LINEAR_GRADIENT_DIRECTION_MAP[direction] !== 'undefined') { // direction description
      angle = LINEAR_GRADIENT_DIRECTION_MAP[direction];
    } else {
      warn('linear-gradient direction or angle is invalid, default value [to bottom] would be used');
    }
    return angle;
  }

  /**
   * parse gradient color stop
   * @param {string} value
   */
  function getLinearGradientColorStop(value) {
    const processedValue = (value || '').replace(/\s+/g, ' ').trim();
    const [color, percentage] = processedValue.split(/\s+(?![^(]*?\))/);
    const percentageCheckReg = /^([+-]?\d+\.?\d*)%$/g;
    if (color && !percentageCheckReg.exec(color) && !percentage) {
      return {
        color: translateColor(color),
      };
    }
    if (color && percentageCheckReg.exec(percentage)) {
      return {
        // color stop ratio
        ratio: parseFloat(percentage.split('%')[0]) / 100,
        color: translateColor(color),
      };
    }
    warn('linear-gradient color stop is invalid');
  }

  /**
   * parse backgroundImage
   * @param {string} property
   * @param {string|Object|number|boolean} value
   * @returns {(string|{})[]}
   */
  function parseBackgroundImage(property, value) {
    let processedValue = value;
    let processedProperty = property;
    if (value.indexOf('linear-gradient') === 0) {
      processedProperty = 'linearGradient';
      const valueString = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
      const tokens = valueString.split(/,(?![^(]*?\))/);
      const colorStopList = [];
      processedValue = {};
      tokens.forEach((value, index) => {
        if (index === 0) {
          // the angle of linear-gradient parameter can be optional
          const angle = getLinearGradientAngle(value);
          if (angle) {
            processedValue.angle = angle;
          } else {
            // if angle ignored, default direction is to bottom, i.e. 180degree
            processedValue.angle = '180';
            const colorObject = getLinearGradientColorStop(value);
            if (colorObject) colorStopList.push(colorObject);
          }
        } else {
          const colorObject = getLinearGradientColorStop(value);
          if (colorObject) colorStopList.push(colorObject);
        }
      });
      processedValue.colorStopList = colorStopList;
    } else {
      const regexp = /(?:\(['"]?)(.*?)(?:['"]?\))/;
      const executed = regexp.exec(value);
      if (executed && executed.length > 1) {
        [, processedValue] = executed;
      }
    }
    return [processedProperty, processedValue];
  }

  /**
   * Parse declaration.
   */
  function declaration() {
    const pos = position();

    // prop
    let prop = match(/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) {
      return null;
    }
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) {
      return error('property missing \':\'');
    }

    // val
    const propertyName = prop.replace(commentRegexp, '');
    const camelizedProperty = camelize(propertyName);
    let property = (() => {
      const property = PROPERTIES_MAP[camelizedProperty];
      if (property) {
        return property;
      }
      return camelizedProperty;
    })();
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/);
    let value = val ? trim(val[0]).replace(commentRegexp, '') : '';

    switch (property) {
      case 'backgroundImage': {
        [property, value] = parseBackgroundImage(property, value);
        break;
      }
      case 'transform': {
        const keyReg = /((\w+)\s*\()/;
        const valueReg = /(?:\(['"]?)(.*?)(?:['"]?\))/;
        const oldValue = value;
        value = [];
        oldValue.split(' ').forEach((transformKeyValue) => {
          if (keyReg.test(transformKeyValue)) {
            const key = keyReg.exec(transformKeyValue)[2];
            let v = valueReg.exec(transformKeyValue)[1];
            if (v.indexOf('.') === 0) {
              v = `0${v}`;
            }
            if (parseFloat(v).toString() === v) {
              v = parseFloat(v);
            }
            const transform = {};
            transform[key] = v;
            value.push(transform);
          } else {
            error('missing \'(\'');
          }
        });
        break;
      }
      case 'fontWeight':
        // Keep string and going on.
        break;
      case 'textShadowOffset': {
        const pos = value.split(' ')
          .filter(v => v)
          .map(v => convertPxUnitToPt(v));
        const [width] = pos;
        let [, height] = pos;
        if (!height) {
          height = width;
        }
        value = {
          width,
          height,
        };
        break;
      }
      case 'shadowOffset': {
        const pos = value.split(' ')
          .filter(v => v)
          .map(v => convertPxUnitToPt(v));
        const [x] = pos;
        let [, y] = pos;
        if (!y) {
          y = x;
        }
        // FIXME: should not be width and height, should be x and y.
        value = {
          x,
          y,
        };
        break;
      }
      case 'collapsable':
        value = Boolean(value);
      default: {
        value = tryConvertNumber(value);
        // Convert the px to pt for specific properties
        const sizeProperties = ['top', 'left', 'right', 'bottom', 'height', 'width', 'size', 'padding', 'margin', 'ratio', 'radius', 'offset', 'spread'];
        if (sizeProperties.find(size => property.toLowerCase().indexOf(size) > -1)) {
          value = convertPxUnitToPt(value);
        }
      }
    }

    const ret = pos({
      type: 'declaration',
      value,
      property,
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    let decls = [];

    if (!open()) return error('missing \'{\'');
    comments(decls);

    // declarations
    let decl;
    while (decl = declaration()) {
      if (decl !== false) {
        if (Array.isArray(decl)) {
          decls = decls.concat(decl);
        } else {
          decls.push(decl);
        }
        comments(decls);
      }
    }

    if (!close()) return error('missing \'}\'');
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    let m;
    const vals = [];
    const pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) {
      return null;
    }

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations(),
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    const pos = position();
    let m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) {
      return null;
    }
    const vendor = m[1];

    // identifier
    m = match(/^([-\w]+)\s*/);
    if (!m) {
      return error('@keyframes missing name');
    }
    const name = m[1];

    if (!open()) return error('@keyframes missing \'{\'');

    let frame;
    let frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error('@keyframes missing \'}\'');

    return pos({
      type: 'keyframes',
      name,
      vendor,
      keyframes: frames,
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    const pos = position();
    const m = match(/^@supports *([^{]+)/);

    if (!m) {
      return null;
    }
    const supports = trim(m[1]);

    if (!open()) return error('@supports missing \'{\'');

    const style = comments().concat(rules());

    if (!close()) return error('@supports missing \'}\'');

    return pos({
      type: 'supports',
      supports,
      rules: style,
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    const pos = position();
    const m = match(/^@host\s*/);

    if (!m) {
      return null;
    }

    if (!open()) {
      return error('@host missing \'{\'');
    }

    const style = comments().concat(rules());

    if (!close()) {
      return error('@host missing \'}\'');
    }

    return pos({
      type: 'host',
      rules: style,
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    const pos = position();
    const m = match(/^@media *([^{]+)/);

    if (!m) {
      return null;
    }
    const media = trim(m[1]);

    if (!open()) {
      return error('@media missing \'{\'');
    }

    const style = comments().concat(rules());

    if (!close()) {
      return error('@media missing \'}\'');
    }

    return pos({
      type: 'media',
      media,
      rules: style,
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    const pos = position();
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) {
      return null;
    }

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2]),
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    const pos = position();
    const m = match(/^@page */);
    if (!m) {
      return null;
    }

    const sel = selector() || [];

    if (!open()) {
      return error('@page missing \'{\'');
    }
    let decls = comments();

    // declarations
    let decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) {
      return error('@page missing \'}\'');
    }

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls,
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    const pos = position();
    const m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) {
      return null;
    }

    const vendor = trim(m[1]);
    const doc = trim(m[2]);

    if (!open()) {
      return error('@document missing \'{\'');
    }

    const style = comments().concat(rules());

    if (!close()) {
      return error('@document missing \'}\'');
    }

    return pos({
      type: 'document',
      document: doc,
      vendor,
      rules: style,
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    const pos = position();
    const m = match(/^@font-face\s*/);
    if (!m) {
      return null;
    }

    if (!open()) {
      return error('@font-face missing \'{\'');
    }
    let decls = comments();

    // declarations
    let decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) {
      return error('@font-face missing \'}\'');
    }

    return pos({
      type: 'font-face',
      declarations: decls,
    });
  }

  /**
   * Parse import
   */

  const atimport = compileAtRule('import');

  /**
   * Parse charset
   */

  const atcharset = compileAtRule('charset');

  /**
   * Parse namespace
   */

  const atnamespace = compileAtRule('namespace');

  /**
   * Parse non-block at-rules
   */


  function compileAtRule(name) {
    const re = new RegExp(`^@${name}\\s*([^;]+);`);
    return () => {
      const pos = position();
      const m = match(re);
      if (!m) {
        return null;
      }
      const ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    };
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] !== '@') {
      return null;
    }

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */

  function rule() {
    const pos = position();
    const sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations(),
    });
  }

  return addParent(stylesheet());
}

export default parseCSS;
export {
  PROPERTIES_MAP,
};

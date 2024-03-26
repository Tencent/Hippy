/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-bitwise */
/* eslint-disable no-cond-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import { camelize } from '@vue/shared';

import { translateColor } from './color-parser';

// eslint-disable-next-line
type NeedToTyped = any;

/**
 * @public
 */
export interface PropertiesMapType {
  textDecoration: 'string';
  boxShadowOffset: 'string';
  boxShadowOffsetX: 'string';
  boxShadowOffsetY: 'string';
  boxShadowOpacity: 'string';
  boxShadowRadius: 'string';
  boxShadowSpread: 'string';
  boxShadowColor: 'string';
}

/**
 * css node declaration type
 *
 * @public
 */
export interface CssDeclarationType {
  type: string;
  property: string;
  value: string | number;
}

/**
 * CSS AST type
 *
 * @public
 */
export interface CssNodeType {
  type: string;
  selectors: string[];
  declarations: CssDeclarationType[];
}

/**
 * Color object
 *
 * @public
 */
export interface ColorObject {
  // color value
  color: number;
  // color contrast
  ratio?: number | undefined;
}

/**
 * parse css options
 *
 * @public
 */
export interface CssParserOption {
  source: number;
  silent?: boolean;
}

/**
 * CSS node
 *
 * @public
 */
export interface CssNode {
  [key: string]: NeedToTyped;
}

// parse css error type
type NewError = Error & {
  reason: string;
  filename: number;
  line: number;
  column: number;
  source: string;
};

/**
 * properties map
 *
 * @public
 */
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

// degree unit
const DEGREE_UNIT = {
  TURN: 'turn',
  RAD: 'rad',
  DEG: 'deg',
};

// regular expression of comment
const commentRegexp = /\/\*.{0,1000}?\*\//gms;

/**
 * Output warning debug information to console
 *
 * @param context - output content
 */
function warn(...context: NeedToTyped[]): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(...context);
}

// regular expression of number
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');

/**
 * convert to number
 * @param str - target string or number
 */
function tryConvertNumber(str: string | number): string | number {
  if (typeof str === 'number') {
    return str;
  }

  if (numberRegEx.test(str)) {
    try {
      return parseFloat(str);
    } catch (err) {
      // pass
    }
  }

  return str;
}

/**
 * Convert the px unit value to the pt unit value used by the native
 *
 * @param value - target px unit value
 */
function convertPxUnitToPt(value) {
  // If value is number just ignore
  if (Number.isInteger(value)) {
    return value;
  }
  // If value unit is px, change to use pt as 1:1.
  if (typeof value === 'string' && value.endsWith('px')) {
    const num = parseFloat(value.slice(0, value.indexOf('px')));
    if (!Number.isNaN(num)) {
      value = num;
    }
  }
  return value;
}

/**
 * Convert the angle value of a string to an angle value
 *
 * @param value - target value
 * @param unit - unit type
 *
 * @public
 */
function convertToDegree(value: string, unit = DEGREE_UNIT.DEG): string {
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
      result = `${((180 / Math.PI) * convertedNumValue).toFixed(2)}`;
      break;
    default:
      break;
  }
  return result;
}

/**
 * Get the angle value of the linear gradient
 *
 * @param value - target value
 *
 * @public
 */
function getLinearGradientAngle(value: string): string {
  const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
  const reg = /^([+-]?(?=(?<digit>\d+))\k<digit>\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
  const valueList = reg.exec(processedValue);
  if (!Array.isArray(valueList)) return '';
  // default direction is to bottom, i.e. 180degree
  let angle = '180';
  const [direction, angleValue, angleUnit] = valueList;
  if (angleValue && angleUnit) {
    // handling values of type angular
    angle = convertToDegree(angleValue, angleUnit);
  } else if (
    direction
    && typeof LINEAR_GRADIENT_DIRECTION_MAP[direction] !== 'undefined'
  ) {
    // direct direction
    angle = LINEAR_GRADIENT_DIRECTION_MAP[direction];
  } else {
    warn('linear-gradient direction or angle is invalid, default value [to bottom] would be used');
  }
  return angle;
}

/**
 * Get the color value of the linear gradient when it stops
 *
 * @param value - color
 *
 * @public
 */
function getLinearGradientColorStop(value = ''): ColorObject | null {
  const processedValue = value.replace(/\s+/g, ' ').trim();
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

  return null;
}

/**
 * parse background image style attribute
 *
 * @param property - property name
 * @param value - property value
 *
 * @public
 */
function parseBackgroundImage(
  property: string,
  value: NeedToTyped,
): [string, NeedToTyped] {
  let processedValue = value;
  let processedProperty = property;
  if (value.indexOf('linear-gradient') === 0) {
    processedProperty = 'linearGradient';
    const valueString = value.substring(
      value.indexOf('(') + 1,
      value.lastIndexOf(')'),
    );
    const tokens = valueString.split(/,(?![^(]*?\))/);
    const colorStopList: ColorObject[] = [];
    processedValue = {};
    tokens.forEach((token, index) => {
      if (index === 0) {
        // the angle of linear-gradient parameter can be optional
        const angle = getLinearGradientAngle(token);
        if (angle) {
          processedValue.angle = angle;
        } else {
          // if angle ignored, default direction is to bottom, i.e. 180degree
          processedValue.angle = '180';
          const colorObject = getLinearGradientColorStop(token);
          if (colorObject) colorStopList.push(colorObject);
        }
      } else {
        const colorObject = getLinearGradientColorStop(token);
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
 * Recursively add non-enumerable parent nodes
 *
 * @param obj - target object
 * @param parent - parent node
 */
function addParent(obj: CssNode, parent: CssNode | null) {
  const isNode = obj && typeof obj.type === 'string';
  const childParent = isNode ? obj : parent;

  // Take all the keys of the node, and judge the value, if it is an array and an object, then recursively addParent
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

  // If it is a node type, add a parent node, if no parent node is passed in, set it to null
  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent,
    });
  }

  return obj;
}

/**
 * parse css code into AST tree
 *
 * @param css - css code
 * @param options - parse options
 *
 * @public
 */
function parseCSS(
  css: string,
  options: CssParserOption = { source: 0 },
): CssNode {
  // position
  let lineno = 1;
  let column = 1;

  /**
   * update lineno and column
   */
  function updatePosition(str) {
    const lines = str.match(/\n/g);
    if (lines) lineno += lines.length;

    const i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
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
   * Remove the whitespace at the beginning of css and update the location information
   */
  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Record the position and set the value of node.position
   */
  function position() {
    return (node) => {
      node.position = {
        start: { line: lineno, column },
        end: { line: lineno, column },
        source: options.source,
        content: css,
      };
      whitespace();
      return node;
    };
  }

  const errorsList: NewError[] = [];

  function error(msg) {
    const errorInstance: Error = new Error(`${options.source}:${lineno}:${column}: ${msg}`);
    const newError: NewError = {
      ...errorInstance,
      reason: msg,
      filename: options.source,
      line: lineno,
      column,
      source: css,
    };

    if (options.silent) {
      errorsList.push(newError);
    } else {
      throw newError;
    }
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
    while (
      css.charAt(i) !== ''
      && (css.charAt(i) !== '*' || css.charAt(i + 1) !== '/')
    ) {
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
   * Parse comments;
   */
  function comments(rawRules: CssNode[] = []) {
    let c;
    const commentRules = rawRules || [];
    while ((c = comment())) {
      if (c !== false) {
        commentRules.push(c);
      }
    }
    return commentRules;
  }

  /**
   * Generate rule set
   */
  function rules() {
    let node: CssNode | boolean;
    const actualRules: CssNode[] = [];
    whitespace();
    comments(actualRules);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
      if (node) {
        actualRules.push(node as CssNode);
        comments(actualRules);
      }
    }
    return actualRules;
  }

  /**
   * Process the stylesheet and get a list of rules
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
   * Remove whitespace between opening brace and content
   */
  function open() {
    return match(/^{\s*/);
  }

  /**
   * Remove whitespace between closing brace and content
   */
  function close() {
    return match(/^}/);
  }

  /**
   * Parse selector.
   */
  function selector() {
    const matched = match(/^([^{]+)/);
    if (!matched) {
      return null;
    }
    /* @fix Remove all comments from selectors like #root .result /* df *\/ div
     * http://ostermiller.org/findcomment.html */
    return matched[0]
      .trim()
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, m => m.replace(/,/g, '\u200C'))
      .split(/\s*(?![^(]*\)),\s*/)
      .map(s => s.replace(/\u200C/g, ','));
  }

  /**
   * Parse declaration.
   */
  // eslint-disable-next-line complexity
  function declaration() {
    const pos = position();

    // prop
    let prop = match(/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+])?)\s*/);
    if (!prop) {
      return null;
    }
    prop = prop[0].trim();

    // :
    if (!match(/^:\s*/)) {
      return error('property missing \':\'');
    }

    // val
    const propertyName = prop.replace(commentRegexp, '');
    const camelizeProperty = camelize(propertyName);
    let property = (() => {
      const mapProperty = PROPERTIES_MAP[camelizeProperty];
      if (mapProperty) {
        return mapProperty;
      }
      return camelizeProperty;
    })();
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]{0,500}?\)|[^};])+)/);
    let value = val ? val[0].trim().replace(commentRegexp, '') : '';

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
            let key;
            let v;

            const matchedKey = keyReg.exec(transformKeyValue);
            const matchedValue = valueReg.exec(transformKeyValue);

            if (matchedKey) {
              [, , key] = matchedKey;
            }

            if (matchedValue) {
              [, v] = matchedValue;
            }

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
      case 'shadowOffset': {
        const declarationPos = value
          .split(' ')
          .filter(v => v)
          .map(v => convertPxUnitToPt(v));
        const [x] = declarationPos;
        let [, y] = declarationPos;
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
        break;
      default: {
        value = tryConvertNumber(value);
        // Convert the px to pt for specific properties
        const sizeProperties = [
          'top',
          'left',
          'right',
          'bottom',
          'height',
          'width',
          'size',
          'padding',
          'margin',
          'ratio',
          'radius',
          'offset',
          'spread',
        ];
        if (
          sizeProperties.find(size => property.toLowerCase().indexOf(size) > -1)
        ) {
          value = convertPxUnitToPt(value);
        }
      }
    }

    const ret = pos({
      type: 'declaration',
      value,
      property,
    });

    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */
  function declarations() {
    let decls: NeedToTyped[] = [];

    if (!open()) return error('missing \'{\'');
    comments(decls);

    // declarations
    let decl;
    while ((decl = declaration())) {
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

  /**
   * Parse keyframe.
   */
  function keyframe() {
    let m;
    const vals: string[] = [];
    const pos = position();

    while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
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
    while ((frame = keyframe())) {
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
    const supports = m[1].trim();

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
    const media = m[1].trim();

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
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]{1,200}?);/);
    if (!m) {
      return null;
    }

    return pos({
      type: 'custom-media',
      name: m[1].trim(),
      media: m[2].trim(),
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
    while ((decl = declaration())) {
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

    const vendor = m[1].trim();
    const doc = m[2].trim();

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
    while ((decl = declaration())) {
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
   * Parse at rule.
   */
  // eslint-disable-next-line complexity
  function atrule() {
    if (css[0] !== '@') {
      return null;
    }

    return (
      atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface()
    );
  }

  return addParent(stylesheet(), null);
}

export {
  convertToDegree,
  getLinearGradientColorStop,
  getLinearGradientAngle,
  parseCSS,
  parseBackgroundImage,
  PROPERTIES_MAP,
};

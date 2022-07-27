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
 * 属性map类型
 *
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
 * css节点声明类型
 *
 * @public
 */
export interface CssDeclarationType {
  // 节点类型
  type: string;
  property: string;
  value: string | number;
}

/**
 * CSS AST 节点类型
 *
 * @public
 */
export interface CssNodeType {
  type: string;
  selectors: string[];
  declarations: CssDeclarationType[];
}

/**
 * Color对象类型
 *
 * @public
 */
export interface ColorObject {
  // 颜色数字值，native使用
  color: number;
  // 颜色对比度
  ratio?: number | undefined;
}

/**
 * parse css的选项类型
 *
 * @public
 */
export interface CssParserOption {
  source: number;
  silent?: boolean;
}

/**
 * CSS节点对象类型
 *
 * @public
 */
export interface CssNode {
  // key为string，value可以是字符串，对象，数组等任意值
  [key: string]: NeedToTyped;
}

/** parse css 错误类型 */
type NewError = Error & {
  reason: string;
  filename: number;
  line: number;
  column: number;
  source: string;
};

/**
 * 属性map
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

// 角度单位
const DEGREE_UNIT = {
  TURN: 'turn',
  RAD: 'rad',
  DEG: 'deg',
};

// 评论的正则表达式
const commentRegexp = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

/**
 * 将警告调试信息输出到console中
 *
 * @param context - 待输出的上下文
 */
function warn(...context: NeedToTyped[]): void {
  // 生产环境不输出
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // console统一封装处理
  // eslint-disable-next-line no-console
  console.warn(...context);
}

// 数字格式正则
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');
/**
 * 将字符串尽可能转为数字
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
 * 将px单位值转换为终端使用的pt单位值
 *
 * @param value - 需要转换的单位值
 */
function convertPxUnitToPt(value) {
  // If value is number just ignore
  if (Number.isInteger(value)) {
    return value;
  }
  // If value unit is px, change to use pt as 1:1.
  if (value.endsWith('px')) {
    const num = parseFloat(value.slice(0, value.indexOf('px')));
    if (!Number.isNaN(num)) {
      value = num;
    }
  }
  return value;
}

/**
 * 将字符串的角度值转换为角度值
 *
 * @param value - 需要转换的角度值
 * @param unit - 角度值的单位类型
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
 * 获取linear gradient的角度值
 *
 * @param value - 角度或方向值
 *
 * @public
 */
function getLinearGradientAngle(value: string): string {
  const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
  const reg = /^([+-]?\d+\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
  const valueList = reg.exec(processedValue);
  if (!Array.isArray(valueList)) return '';
  // default direction is to bottom, i.e. 180degree
  let angle = '180';
  const [direction, angleValue, angleUnit] = valueList;
  if (angleValue && angleUnit) {
    // 处理角度类型的值
    angle = convertToDegree(angleValue, angleUnit);
  } else if (
    direction
    && typeof LINEAR_GRADIENT_DIRECTION_MAP[direction] !== 'undefined'
  ) {
    // 直接指明方向
    angle = LINEAR_GRADIENT_DIRECTION_MAP[direction];
  } else {
    warn('linear-gradient direction or angle is invalid, default value [to bottom] would be used');
  }
  return angle;
}

/**
 * 获取linear gradient的停止时的颜色值
 *
 * @param value - 颜色值
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
 * parse背景图样式属性，得到处理后的属性值
 *
 * @param property - 属性名
 * @param value - 值
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
    const regexp = /(\(['"]?)(.*?)(['"]?\))/;
    const executed = regexp.exec(value);
    if (executed && executed.length > 1) {
      [, processedValue] = executed;
    }
  }
  return [processedProperty, processedValue];
}

/**
 * 递归为每个添加non-enumerable的父节点
 *
 * @param obj - 需要添加父节点的对象
 * @param parent - 父节点
 */
function addParent(obj: CssNode, parent: CssNode | null) {
  // 如果节点的type存在且类型为string，则节点属于Node
  const isNode = obj && typeof obj.type === 'string';
  // 孩子节点的父节点，如果当前节点是节点类型，则孩子节点父节点设置为当前节点
  // 否则使用更上层的父节点
  const childParent = isNode ? obj : parent;

  // 取节点的所有key，并判断值，如果是数组和对象，则进行parent的添加
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

  // 如果是节点类型，则添加父节点，没有传入父节点则设为null
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
 * 将 css 代码 parse 为 AST 树
 *
 * @param css - 待parse的css
 * @param options - parse选项
 *
 * @public
 */
function parseCSS(
  css: string,
  options: CssParserOption = { source: 0 },
): CssNode {
  /**
   * Positional 位置信息
   */
  let lineno = 1;
  let column = 1;

  /**
   * 基于 str 更新lineno 和 column的值
   */
  function updatePosition(str) {
    // 读取有多少换行符，增加lineno的值
    const lines = str.match(/\n/g);
    if (lines) lineno += lines.length;

    // 找到字符串最后一个换行符的位置，如果有，则
    // 列数为字符串长度减去换行符位置，否则长度为字符串总长
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
   * 将css开头的空白去除，并更新位置信息
   */
  function whitespace() {
    match(/^\s*/);
  }

  /**
   * 记录position并设置node.position的值
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

  /**
   * Error `msg`.
   */

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
   * 生成规则集
   */
  function rules() {
    let node: CssNode | boolean;
    const actualRules: CssNode[] = [];
    whitespace();
    comments(actualRules);

    // 当css
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
   * 处理样式表，得到rules列表
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
   * 移除左大括号到内容间的空白
   */
  function open() {
    return match(/^{\s*/);
  }

  /**
   * 移除右大括号到内容间的空白
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
    /* @fix Remove all comments from selectors
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
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/);
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
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
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

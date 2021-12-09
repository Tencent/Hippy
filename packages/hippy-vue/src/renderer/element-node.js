/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import colorParser from '@css-loader/color-parser';
import { PROPERTIES_MAP } from '@css-loader/css-parser';
import { getViewMeta, normalizeElementName } from '../elements';
import {
  unicodeToChar,
  tryConvertNumber,
  setsAreEqual,
  endsWith,
  getBeforeLoadStyle,
  warn,
} from '../util';
import Native from '../runtime/native';
import { updateChild, updateWithChildren } from './native';
import { Event, EventEmitter } from './native/event';
import { Text } from './native/components';
import ViewNode from './view-node';

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
  // if default direction is to bottom, i.e. 180degree
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
      color: colorParser(color),
    };
  }
  if (color && percentageCheckReg.exec(percentage)) {
    return {
      // color stop ratio
      ratio: parseFloat(percentage.split('%')[0]) / 100,
      color: colorParser(color),
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
 * parse text shadow offset
 * @param property
 * @param value
 * @param style
 * @returns {(*|number)[]}
 */
function parseTextShadowOffset(property, value = 0, style) {
  const offsetMap = {
    textShadowOffsetX: 'width',
    textShadowOffsetY: 'height',
  };
  style.textShadowOffset = style.textShadowOffset || {};
  Object.assign(style.textShadowOffset, {
    [offsetMap[property]]: value,
  });
  return ['textShadowOffset', style.textShadowOffset];
}

class ElementNode extends ViewNode {
  constructor(tagName) {
    super();
    // Tag name
    this.tagName = tagName;
    // ID attribute in template.
    this.id = '';
    // style attribute in template.
    this.style = {};
    // Vue style scope id.
    this._styleScopeId = null;
    // Class attribute in template.
    this.classList = new Set(); // Fake DOMTokenLis
    // Other attributes in template.
    this.attributes = {};
    // Event observer.
    this._emitter = null;
    // Style pre-processor
    this.beforeLoadStyle = getBeforeLoadStyle();
  }

  toString() {
    return `${this.constructor.name}(${this._tagName})`;
  }

  set tagName(name) {
    this._tagName = normalizeElementName(name);
  }

  get tagName() {
    return this._tagName;
  }

  get meta() {
    if (this._meta) {
      return this._meta;
    }
    this._meta = getViewMeta(this._tagName);
    return this._meta;
  }

  get emitter() {
    return this._emitter;
  }

  hasAttribute(key) {
    return !!this.attributes[key];
  }

  getAttribute(key) {
    return this.attributes[key];
  }

  setAttribute(key, value) {
    try {
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (typeof (this.attributes[key]) === 'boolean' && value === '') {
        value = true;
      }
      if (key === undefined) {
        updateChild(this);
        return;
      }
      switch (key) {
        case 'class': {
          const newClassList = new Set(value.split(' ').filter(x => x.trim()));
          if (setsAreEqual(this.classList, newClassList)) {
            return;
          }
          this.classList = newClassList;
          // update current node and child nodes
          updateWithChildren(this);
          return;
        }
        case 'id':
          if (value === this.id) {
            return;
          }
          this.id = value;
          // update current node and child nodes
          updateWithChildren(this);
          return;
        // Convert text related to character for interface.
        case 'text':
        case 'value':
        case 'defaultValue':
        case 'placeholder': {
          if (typeof value !== 'string') {
            try {
              value = value.toString();
            } catch (err) {
              throw new TypeError(`Property ${key} must be string：${err.message}`);
            }
          }
          value = value.trim().replace(/(&nbsp;|Â)/g, ' ');
          this.attributes[key] = unicodeToChar(value);
          break;
        }
        // FIXME: UpdateNode numberOfRows will makes Image flicker on Android.
        //        So make it working on iOS only.
        case 'numberOfRows':
          this.attributes[key] = value;
          if (Native.Platform !== 'ios') {
            return;
          }
          break;
        case 'caretColor':
        case 'caret-color':
          this.attributes['caret-color'] = Native.parseColor(value);
          break;
        default:
          this.attributes[key] = value;
      }
      updateChild(this);
    } catch (err) {
      // Throw error in development mode
      if (process.env.NODE_ENV !== 'production') {
        throw err;
      }
    }
  }

  removeAttribute(key) {
    delete this.attributes[key];
  }

  setStyle(property, value, isBatchUpdate = false) {
    if (value === undefined) {
      delete this.style[property];
      return;
    }
    // Preprocess the style
    let {
      property: p,
      value: v,
    } = this.beforeLoadStyle({
      property,
      value,
    });
    // Process the specific style value
    switch (p) {
      case 'fontWeight':
        if (typeof v !== 'string') {
          v = v.toString();
        }
        break;
      case 'caretColor':
        this.attributes['caret-color'] = colorParser(v);
        break;
      case 'backgroundImage': {
        [p, v] = parseBackgroundImage(p, v);
        break;
      }
      case 'textShadowOffsetX':
      case 'textShadowOffsetY': {
        [p, v] = parseTextShadowOffset(p, v, this.style);
        break;
      }
      case 'textShadowOffset': {
        const { x = 0, width = 0, y = 0, height = 0 } = v || {};
        v = { width: x || width, height: y || height };
        break;
      }
      default: {
        // Convert the property to W3C standard.
        if (Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, p)) {
          p = PROPERTIES_MAP[p];
        }
        // Convert the value
        if (typeof v === 'string') {
          v = v.trim();
          // Convert inline color style to int
          if (p.toLowerCase().indexOf('color') >= 0) {
            v = colorParser(v, Native.Platform);
          // Convert inline length style, drop the px unit
          } else if (endsWith(v, 'px')) {
            v = parseFloat(v.slice(0, v.length - 2));
          } else {
            v = tryConvertNumber(v);
          }
        }
      }
    }
    if (v === undefined || v === null || this.style[p] === v) {
      return;
    }
    this.style[p] = v;
    if (!isBatchUpdate) {
      updateChild(this);
    }
  }

  /**
   * set native style props
   */
  setNativeProps(nativeProps) {
    if (nativeProps) {
      const { style } = nativeProps;
      if (style) {
        Object.keys(style).forEach((key) => {
          this.setStyle(key, style[key], true);
        });
        updateChild(this);
      }
    }
  }

  setStyleScope(styleScopeId) {
    if (typeof styleScopeId !== 'string') {
      styleScopeId = styleScopeId.toString();
    }
    this._styleScopeId = styleScopeId;
  }

  appendChild(childNode) {
    super.appendChild(childNode);
    if (childNode.meta.symbol === Text) {
      this.setText(childNode.text);
    }
  }

  insertBefore(childNode, referenceNode) {
    super.insertBefore(childNode, referenceNode);
    if (childNode.meta.symbol === Text) {
      this.setText(childNode.text);
    }
  }

  moveChild(childNode, referenceNode) {
    super.moveChild(childNode, referenceNode);
    if (childNode.meta.symbol === Text) {
      this.setText(childNode.text);
    }
  }

  removeChild(childNode) {
    super.removeChild(childNode);
    if (childNode.meta.symbol === Text) {
      this.setText('');
    }
  }

  setText(text) {
    // Hacking for textarea, use value props to instance text props
    if (this.tagName === 'textarea') {
      return this.setAttribute('value', text);
    }
    return this.setAttribute('text', text);
  }

  addEventListener(eventNames, callback, options) {
    if (!this._emitter) {
      this._emitter = new EventEmitter(this);
    }
    this._emitter.addEventListener(eventNames, callback, options);
    // Added default scrollEventThrottle when scroll event is added.
    if (eventNames === 'scroll' && !(this.getAttribute('scrollEventThrottle') > 0)) {
      const scrollEventThrottle = 200;
      if (scrollEventThrottle) {
        this.attributes.scrollEventThrottle = scrollEventThrottle;
      }
    }
    if (this.polyFillNativeEvents) {
      this.polyFillNativeEvents('addEvent', eventNames, callback, options);
    }
    updateChild(this);
  }

  removeEventListener(eventNames, callback, options) {
    if (!this._emitter) {
      return null;
    }
    if (this.polyFillNativeEvents) {
      this.polyFillNativeEvents('removeEvent', eventNames, callback, options);
    }
    return this._emitter.removeEventListener(eventNames, callback, options);
  }

  dispatchEvent(eventInstance) {
    if (!(eventInstance instanceof Event)) {
      throw new Error('dispatchEvent method only accept Event instance');
    }
    // Current Target always be the event listener.
    eventInstance.currentTarget = this;
    // But target be the first target.
    // Be careful, here's different than Browser,
    // because Hippy can't callback without element _emitter.
    if (!eventInstance.target) {
      eventInstance.target = this;
      // IMPORTANT: It's important for vnode diff and directive trigger.
      if (typeof eventInstance.value === 'string') {
        eventInstance.target.value = eventInstance.value;
      }
    }
    if (this._emitter) {
      this._emitter.emit(eventInstance);
    }
    if (this.parentNode && eventInstance.bubbles) {
      this.parentNode.dispatchEvent.call(this.parentNode, eventInstance);
    }
  }

  /**
   * getBoundingClientRect
   *
   * Get the position and size of element
   * Because it's a async function, need await prefix.
   *
   * And if the element is out of visible area, result will be none.
   */
  getBoundingClientRect() {
    return Native.measureInWindow(this);
  }

  /**
   * Scroll children to specific position.
   */
  scrollToPosition(x = 0, y = 0, duration = 1000) {
    if (typeof x !== 'number' || typeof y !== 'number') {
      return;
    }
    if (duration === false) {
      duration = 0;
    }
    Native.callUIFunction(this, 'scrollToWithOptions', [{ x, y, duration }]);
  }

  /**
   * Native implementation for the Chrome/Firefox Element.scrollTop method
   */
  scrollTo(x, y, duration) {
    let animationDuration = duration;
    if (typeof x === 'object' && x) {
      const { left, top, behavior = 'auto' } = x;
      ({ duration: animationDuration } = x);
      this.scrollToPosition(left, top, behavior === 'none' ? 0 : animationDuration);
    } else {
      this.scrollToPosition(x, y, duration);
    }
  }
}

export default ElementNode;

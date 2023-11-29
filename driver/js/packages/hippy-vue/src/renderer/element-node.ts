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

// @ts-expect-error TS(2307): Cannot find module '@css-loader/css-parser' or its... Remove this comment to see the full error message
import { PROPERTIES_MAP } from '@css-loader/css-parser';
import { getViewMeta, normalizeElementName } from '../elements';
import {
  unicodeToChar,
  capitalizeFirstLetter,
  tryConvertNumber,
  setsAreEqual,
  endsWith,
  getBeforeLoadStyle,
  warn,
  isDev,
  whitespaceFilter,
} from '../util';
import { EventMethod, EventHandlerType } from '../util/event';
import Native from '../runtime/native';
import { updateChild, updateWithChildren, updateEvent } from './native';
import { Event, EventDispatcher, EventEmitter } from './native/event';
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
function convertToDegree(value: any, unit = DEGREE_UNIT.DEG) {
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
function getLinearGradientAngle(value: any) {
  const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
  const reg = /^([+-]?(?=(?<digit>\d+))\k<digit>\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
  const valueList = reg.exec(processedValue);
  if (!Array.isArray(valueList)) return;
  // if default direction is to bottom, i.e. 180degree
  let angle = '180';
  const [direction, angleValue, angleUnit] = valueList;
  if (angleValue && angleUnit) { // angle value
    angle = convertToDegree(angleValue, angleUnit);
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  } else if (direction && typeof LINEAR_GRADIENT_DIRECTION_MAP[direction] !== 'undefined') { // direction description
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
function getLinearGradientColorStop(value: any) {
  const processedValue = (value || '').replace(/\s+/g, ' ').trim();
  const [color, percentage] = processedValue.split(/\s+(?![^(]*?\))/);
  const percentageCheckReg = /^([+-]?\d+\.?\d*)%$/g;
  if (color && !percentageCheckReg.exec(color) && !percentage) {
    return {
      color: Native.parseColor(color),
    };
  }
  if (color && percentageCheckReg.exec(percentage)) {
    return {
      // color stop ratio
      ratio: parseFloat(percentage.split('%')[0]) / 100,
      color: Native.parseColor(color),
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
function parseBackgroundImage(property: any, value: any, style: any) {
  // reset the backgroundImage and linear gradient property
  delete style[property];
  removeLinearGradient(property, value, style);
  let processedValue = value;
  let processedProperty = property;
  if (value.indexOf('linear-gradient') === 0) {
    processedProperty = 'linearGradient';
    const valueString = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    const tokens = valueString.split(/,(?![^(]*?\))/);
    const colorStopList: any = [];
    processedValue = {};
    tokens.forEach((value: any, index: any) => {
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
 * remove linear gradient
 * @param property
 * @param value
 * @param style
 */
function removeLinearGradient(property: any, value: any, style: any) {
  if (property === 'backgroundImage' && style.linearGradient) {
    delete style.linearGradient;
  }
}

const offsetMap = {
  textShadowOffsetX: 'width',
  textShadowOffsetY: 'height',
};
/**
 * parse text shadow offset
 * @param property
 * @param value
 * @param style
 * @returns {(*|number)[]}
 */
function parseTextShadowOffset(property: any, value = 0, style: any) {
  style.textShadowOffset = style.textShadowOffset || {};
  Object.assign(style.textShadowOffset, {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    [offsetMap[property]]: value,
  });
  return ['textShadowOffset', style.textShadowOffset];
}

/**
 * remove text shadow offset
 * @param property
 * @param value
 * @param style
 */
function removeTextShadowOffset(property: any, value: any, style: any) {
  if ((property === 'textShadowOffsetX' || property === 'textShadowOffsetY') && style.textShadowOffset) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    delete style.textShadowOffset[offsetMap[property]];
    if (Object.keys(style.textShadowOffset).length === 0) {
      delete style.textShadowOffset;
    }
  }
}

/**
 * remove empty style
 * @param property
 * @param value
 * @param style
 */
function removeStyle(property: any, value: any, style: any) {
  if (value === undefined) {
    delete style[property];
    removeLinearGradient(property, value, style);
    removeTextShadowOffset(property, value, style);
  }
}

function transverseEventNames(eventNames: any, callback: any) {
  if (typeof eventNames !== 'string') return;
  const events = eventNames.split(',');
  for (let i = 0, l = events.length; i < l; i += 1) {
    const eventName = events[i].trim();
    callback(eventName);
  }
}

function createEventListener(nativeName: any, originalName: any) {
  return (event: any) => {
    const { id, currentId, params, eventPhase } = event;
    const dispatcherEvent = {
      id,
      nativeName,
      originalName,
      currentId,
      params,
      eventPhase,
    };
    EventDispatcher.receiveComponentEvent(dispatcherEvent, event);
  };
}

class ElementNode extends ViewNode {
  _emitter: any;
  _meta: any;
  _tagName: any;
  attributes: any;
  beforeLoadStyle: any;
  classList: any;
  events: any;
  filterAttribute: any;
  id: any;
  polyfillNativeEvents: any;
  scopeIdList: any;
  style: any;
  constructor(tagName: any) {
    super();
    // Tag name
    this.tagName = tagName;
    // ID attribute in template.
    this.id = '';
    // style attribute in template.
    this.style = {};
    // Vue style scope id list.
    this.scopeIdList = [];
    // Class attribute in template.
    this.classList = new Set(); // Fake DOMTokenLis
    // Other attributes in template.
    this.attributes = {};
    // events map
    this.events = {};
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

  hasAttribute(key: any) {
    return !!this.attributes[key];
  }

  getAttribute(key: any) {
    return this.attributes[key];
  }

  setAttribute(rawKey: any, rawValue: any, options = {}) {
    try {
      let key = rawKey;
      let value = rawValue;
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (typeof (this.attributes[key]) === 'boolean' && value === '') {
        value = true;
      }
      if (key === undefined) {
        !(options as any).notToNative && updateChild(this);
        return;
      }
      switch (key) {
        case 'class': {
          const newClassList = new Set(value.split(' ').filter((x: any) => x.trim()));
          if (setsAreEqual(this.classList, newClassList)) {
            return;
          }
          this.classList = newClassList;
          // update current node and child nodes
          !(options as any).notToNative && updateWithChildren(this);
          return;
        }
        case 'id':
          if (value === this.id) {
            return;
          }
          this.id = value;
          // update current node and child nodes
          !(options as any).notToNative && updateWithChildren(this);
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
              warn(`Property ${key} must be string：${(err as any).message}`);
            }
          }
          if (!options || !(options as any).textUpdate) {
            // white space handler
            value = whitespaceFilter(value);
          }
          value = unicodeToChar(value);
          break;
        }
        case 'numberOfRows':
          if (Native.Platform !== 'ios') {
            return;
          }
          break;
        case 'caretColor':
        case 'caret-color':
          key = 'caret-color';
          value = Native.parseColor(value);
          break;
        case 'break-strategy':
          key = 'breakStrategy';
          break;
        case 'placeholderTextColor':
        case 'placeholder-text-color':
          key = 'placeholderTextColor';
          value = Native.parseColor(value);
          break;
        case 'underlineColorAndroid':
        case 'underline-color-android':
          key = 'underlineColorAndroid';
          value = Native.parseColor(value);
          break;
        case 'nativeBackgroundAndroid': {
          const nativeBackgroundAndroid = value;
          if (typeof nativeBackgroundAndroid.color !== 'undefined') {
            nativeBackgroundAndroid.color = Native.parseColor(nativeBackgroundAndroid.color);
          }
          key = 'nativeBackgroundAndroid';
          value = nativeBackgroundAndroid;
          break;
        }
        default:
      }
      if (this.attributes[key] === value) return;
      this.attributes[key] = value;
      if (typeof this.filterAttribute === 'function') {
        this.filterAttribute(this.attributes);
      }
      !(options as any).notToNative && updateChild(this, (options as any).notUpdateStyle);
    } catch (err) {
      // Throw error in development mode
      if (isDev()) {
        throw err;
      }
    }
  }

  removeAttribute(key: any) {
    delete this.attributes[key];
  }

  setStyles(batchStyles: any) {
    if (!batchStyles || typeof batchStyles !== 'object' || Object.keys(batchStyles).length === 0) {
      return;
    }
    Object.keys(batchStyles).forEach((styleKey) => {
      const styleValue = batchStyles[styleKey];
      this.setStyle(styleKey, styleValue, true);
    });
    updateChild(this);
  }

  setStyle(rawKey: any, rawValue: any, notToNative = false) {
    // Preprocess the style
    let {
      value,
      property: key,
    } = this.beforeLoadStyle({
      property: rawKey,
      value: rawValue,
    });
    if (rawValue === undefined) {
      removeStyle(key, value, this.style);
      if (!notToNative) {
        updateChild(this);
      }
      return;
    }
    // Process the specific style value
    switch (key) {
      case 'fontWeight':
        if (typeof value !== 'string') {
          value = value.toString();
        }
        break;
      case 'backgroundImage': {
        [key, value] = parseBackgroundImage(key, value, this.style);
        break;
      }
      case 'textShadowOffsetX':
      case 'textShadowOffsetY': {
        [key, value] = parseTextShadowOffset(key, value, this.style);
        break;
      }
      case 'textShadowOffset': {
        const { x = 0, width = 0, y = 0, height = 0 } = value || {};
        value = { width: x || width, height: y || height };
        break;
      }
      default: {
        // Convert the property to W3C standard.
        if (Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, key)) {
          key = PROPERTIES_MAP[key];
        }
        // Convert the value
        if (typeof value === 'string') {
          value = value.trim();
          // Convert inline color style to int
          if (key.toLowerCase().indexOf('color') >= 0) {
            value = Native.parseColor(value);
            // Convert inline length style, drop the px unit
          // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
          } else if (endsWith(value, 'px')) {
            value = parseFloat(value.slice(0, value.length - 2));
          } else {
            value = tryConvertNumber(value);
          }
        }
      }
    }
    if (value === undefined || value === null || this.style[key] === value) {
      return;
    }
    this.style[key] = value;
    if (!notToNative) {
      updateChild(this);
    }
  }

  /**
   * set native style props
   */
  setNativeProps(nativeProps: any) {
    if (nativeProps) {
      const { style } = nativeProps;
      this.setStyles(style);
    }
  }

  /**
   * repaint element with the latest style map, which maybe loaded from HMR chunk or dynamic chunk
   */
  repaintWithChildren() {
    updateWithChildren(this);
  }

  setStyleScope(styleScopeId: any) {
    if (typeof styleScopeId !== 'string') {
      styleScopeId = styleScopeId.toString();
    }
    if (styleScopeId && !this.scopeIdList.includes(styleScopeId)) {
      this.scopeIdList.push(styleScopeId);
    }
  }

  get styleScopeId() {
    return this.scopeIdList;
  }

  appendChild(childNode: any) {
    if (childNode && childNode.meta.symbol === Text) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.appendChild(childNode);
  }

  insertBefore(childNode: any, referenceNode: any) {
    if (childNode && childNode.meta.symbol === Text) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.insertBefore(childNode, referenceNode);
  }

  moveChild(childNode: any, referenceNode: any) {
    if (childNode && childNode.meta.symbol === Text) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.moveChild(childNode, referenceNode);
  }

  removeChild(childNode: any) {
    if (childNode && childNode.meta.symbol === Text) {
      this.setText('', { notToNative: true });
    }
    super.removeChild(childNode);
  }

  setText(text: any, options = {}) {
    // Hacking for textarea, use value props to instance text props
    if (this.tagName === 'textarea') {
      return this.setAttribute('value', text, { notToNative: !!(options as any).notToNative });
    }
    return this.setAttribute('text', text, { notToNative: !!(options as any).notToNative });
  }

  setListenerHandledType(key: any, type: any) {
    if (this.events[key]) {
      this.events[key].handledType = type;
    }
  }

  isListenerHandled(key: any, type: any) {
    if (this.events[key] && type !== this.events[key].handledType) {
      // if handledType not equals type params, this event needs updated
      // if handledType equals undefined, this event needs created
      return false;
    }
    // if event not existed, marked it has been handled
    return true;
  }

  getNativeEventName(eventName: any) {
    let nativeEventName = `on${capitalizeFirstLetter(eventName)}`;
    if (this.meta.component) {
      const { eventNamesMap } = this.meta.component;
      if (eventNamesMap && eventNamesMap[eventName]) {
        nativeEventName = eventNamesMap[eventName];
      }
    }
    return nativeEventName;
  }

  addEventListener(eventNames: any, callback: any, options: any) {
    if (!this._emitter) {
      this._emitter = new EventEmitter(this);
    }
    // Added default scrollEventThrottle when scroll event is added.
    if (eventNames === 'scroll' && !(this.getAttribute('scrollEventThrottle') > 0)) {
      const scrollEventThrottle = 200;
      if (scrollEventThrottle) {
        this.attributes.scrollEventThrottle = scrollEventThrottle;
      }
    }
    if (typeof this.polyfillNativeEvents === 'function') {
      ({ eventNames, callback, options } = this.polyfillNativeEvents(
        EventMethod.ADD,
        eventNames,
        callback,
        options,
      ));
    }
    this._emitter.addEventListener(eventNames, callback, options);
    transverseEventNames(eventNames, (eventName: any) => {
      const nativeEventName = this.getNativeEventName(eventName);
      if (!this.events[nativeEventName]) {
        this.events[nativeEventName] = {
          name: nativeEventName,
          type: EventHandlerType.ADD,
          listener: createEventListener(nativeEventName, eventName),
          isCapture: false,
        };
      } else if (this.events[nativeEventName] && this.events[nativeEventName].type !== EventHandlerType.ADD) {
        this.events[nativeEventName].type = EventHandlerType.ADD;
      }
    });
    updateEvent(this);
  }

  removeEventListener(eventNames: any, callback: any, options: any) {
    if (!this._emitter) {
      return null;
    }
    if (typeof this.polyfillNativeEvents === 'function') {
      ({ eventNames, callback, options } = this.polyfillNativeEvents(
        EventMethod.REMOVE,
        eventNames,
        callback,
        options,
      ));
    }
    const observer = this._emitter.removeEventListener(eventNames, callback, options);
    transverseEventNames(eventNames, (eventName: any) => {
      const nativeEventName = this.getNativeEventName(eventName);
      if (this.events[nativeEventName]) {
        this.events[nativeEventName].type = EventHandlerType.REMOVE;
      }
    });
    updateEvent(this);
    return observer;
  }

  dispatchEvent(eventInstance: any, targetNode: any, domEvent: any) {
    if (!(eventInstance instanceof Event)) {
      throw new Error('dispatchEvent method only accept Event instance');
    }
    // Current Target always be the event listener.
    eventInstance.currentTarget = this;
    // But target be the first target.
    // Be careful, here's different from Browser,
    // because Hippy can't call back without element _emitter.
    if (!eventInstance.target) {
      eventInstance.target = targetNode || this;
      // IMPORTANT: It's important for vnode diff and directive trigger.
      if (typeof (eventInstance as any).value === 'string') {
        eventInstance.target.value = (eventInstance as any).value;
      }
    }
    if (this._emitter) {
      this._emitter.emit(eventInstance);
    }
    if (!eventInstance.bubbles && domEvent) {
      domEvent.stopPropagation();
    }
  }

  /**
   * getBoundingClientRect
   * @deprecated
   * Get the position and size of element
   * Because it's an async function, need await prefix.
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
    // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
    if (duration === false) {
      duration = 0;
    }
    Native.callUIFunction(this, 'scrollToWithOptions', [{ x, y, duration }]);
  }

  /**
   * Native implementation for the Chrome/Firefox Element.scrollTop method
   */
  scrollTo(x: any, y: any, duration: any) {
    let animationDuration = duration;
    if (typeof x === 'object' && x) {
      const { left, top, behavior = 'auto' } = x;
      ({ duration: animationDuration } = x);
      this.scrollToPosition(left, top, behavior === 'none' ? 0 : animationDuration);
    } else {
      this.scrollToPosition(x, y, duration);
    }
  }

  setPressed(pressed: any) {
    Native.callUIFunction(this, 'setPressed', [pressed]);
  }

  setHotspot(x: any, y: any) {
    Native.callUIFunction(this, 'setHotspot', [x, y]);
  }
}

export default ElementNode;

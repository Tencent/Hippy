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
import { updateChild, updateWithChildren, updateEvent } from '../native';
import { Event, EventDispatcher, EventEmitter } from '../event';
import { Text } from '../native/components';
import { CallbackType, CommonMapParams, NativeNodeProps, NeedToTyped } from '../types/native';
import ViewNode from './view-node';
import TextNode from './text-node';


// linear-gradient direction description map
const LINEAR_GRADIENT_DIRECTION_MAP: CommonMapParams = {
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

const ATTRIBUTE_KEY_MAP = {
  BEFORE_LOAD_STYLE_DISABLED: 'beforeLoadStyleDisabled',
  CLASS: 'class',
  ID: 'id',
  TEXT: 'text',
  VALUE: 'value',
  DEFAULT_VALUE: 'defaultValue',
  PLACEHOLDER: 'placeholder',
  NUMBER_OF_ROWS: 'numberOfRows',
  CARET_COLOR: 'caretColor',
  CARET_DASH_COLOR: 'caret-color',
  BREAK_STRATEGY: 'break-strategy',
  PLACEHOLDER_TEXT_COLOR: 'placeholderTextColor',
  PLACEHOLDER_DASH_TEXT_DASH_COLOR: 'placeholder-text-color',
  UNDERLINE_COLOR_ANDROID: 'underlineColorAndroid',
  UNDERLINE_DASH_COLOR_DASH_ANDROID: 'underline-color-android',
  NATIVE_BACKGROUND_ANDROID: 'nativeBackgroundAndroid',
};

interface OffsetMapType {
  textShadowOffsetX: string;
  textShadowOffsetY: string;
}

const offsetMap: OffsetMapType = {
  textShadowOffsetX: 'width',
  textShadowOffsetY: 'height',
};

/**
 * convert string value to string degree
 * @param {string} value
 * @param {string} unit
 */
function convertToDegree(value: string, unit = DEGREE_UNIT.DEG) {
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
function getLinearGradientAngle(value: string) {
  const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
  const reg = /^([+-]?(?=(?<digit>\d+))\k<digit>\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
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
function getLinearGradientColorStop(value: string) {
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
function parseBackgroundImage(property: NeedToTyped, value: NeedToTyped, style: NeedToTyped) {
  // reset the backgroundImage and linear gradient property
  delete style[property];
  removeLinearGradient(property, value, style);
  let processedValue = value;
  let processedProperty = property;
  if (value.indexOf('linear-gradient') === 0) {
    processedProperty = 'linearGradient';
    const valueString = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    const tokens = valueString.split(/,(?![^(]*?\))/);
    const colorStopList: NeedToTyped = [];
    processedValue = {};
    tokens.forEach((value: string, index: number) => {
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
function removeLinearGradient(property: NeedToTyped, value: NeedToTyped, style: NeedToTyped) {
  if (property === 'backgroundImage' && style.linearGradient) {
    delete style.linearGradient;
  }
}

/**
 * parse text shadow offset
 * @param property
 * @param value
 * @param style
 * @returns {(*|number)[]}
 */
function parseTextShadowOffset(property: NeedToTyped, value = 0, style: NeedToTyped) {
  style.textShadowOffset = style.textShadowOffset || {};
  Object.assign(style.textShadowOffset, {
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
function removeTextShadowOffset(property: NeedToTyped, value: NeedToTyped, style: NeedToTyped) {
  if ((property === 'textShadowOffsetX' || property === 'textShadowOffsetY') && style.textShadowOffset) {
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
function removeStyle(property: NeedToTyped, value: NeedToTyped, style: NeedToTyped) {
  if (value === undefined) {
    delete style[property];
    removeLinearGradient(property, value, style);
    removeTextShadowOffset(property, value, style);
  }
}

function transverseEventNames(eventNames: NeedToTyped, callback: CallbackType) {
  if (typeof eventNames !== 'string') return;
  const events = eventNames.split(',');
  for (let i = 0, l = events.length; i < l; i += 1) {
    const eventName = events[i].trim();
    callback(eventName);
  }
}

function createEventListener(nativeName: NeedToTyped, originalName: NeedToTyped) {
  return (event: NeedToTyped) => {
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

interface OptionMapType {
  notToNative?: boolean;
  textUpdate?: boolean;
  notUpdateStyle?: boolean;
}

export class ElementNode extends ViewNode {
  // id
  public id = '';
  // style list, such as class="wrapper red" => ['wrapper', 'red']
  public classList: Set<string>;
  // attributes
  public attributes: any;
  // style
  public style: NativeNodeProps;
  // events map
  public events: NativeNodeProps;
  // element content for text element
  public value?: string;
  // additional processing of properties
  public filterAttribute?: CallbackType;
  // style preprocessor
  public beforeLoadStyle: CallbackType;
  // polyFill of native event
  public polyfillNativeEvents?: (
    method: string,
    eventNames: string,
    callback: CallbackType,
    options?: EventListenerOptions
  ) => {
    eventNames: string,
    callback: CallbackType,
    options?: EventListenerOptions
  };
  // style scoped id for element
  public scopeIdList: NeedToTyped = [];
  private _emitter: EventEmitter | null;
  // element tag name, such as div, ul, hi-swiper, etc.
  private _tagName = '';

  constructor(tagName: string) {
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

  public toString() {
    return `${this.constructor.name}(${this._tagName})`;
  }

  public set tagName(name) {
    this._tagName = normalizeElementName(name);
  }

  public get tagName() {
    return this._tagName;
  }

  public get meta() {
    if (this._meta) {
      return this._meta;
    }
    this._meta = getViewMeta(this._tagName);
    return this._meta;
  }

  public get emitter() {
    return this._emitter;
  }

  public hasAttribute(key: string) {
    return !!this.attributes[key];
  }

  public getAttribute(key: string) {
    return this.attributes[key];
  }

  public setAttribute(rawKey: string, rawValue: NeedToTyped, options: OptionMapType = {}) {
    try {
      let key = rawKey;
      let value = rawValue;
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (typeof (this.attributes[key]) === 'boolean' && value === '') {
        value = true;
      }
      if (key === undefined) {
        !options.notToNative && updateChild(this);
        return;
      }
      switch (key) {
        case ATTRIBUTE_KEY_MAP.CLASS: {
          const newClassList = new Set(value.split(' ').filter((x: NeedToTyped) => x.trim()) as string);
          if (setsAreEqual(this.classList, newClassList)) {
            return;
          }
          this.classList = newClassList;
          // update current node and child nodes
          !options.notToNative && updateWithChildren(this);
          return;
        }
        case ATTRIBUTE_KEY_MAP.ID:
          if (value === this.id) {
            return;
          }
          this.id = value;
          // update current node and child nodes
          !options.notToNative && updateWithChildren(this);
          return;
        // Convert text related to character for interface.
        case ATTRIBUTE_KEY_MAP.TEXT:
        case ATTRIBUTE_KEY_MAP.VALUE:
        case ATTRIBUTE_KEY_MAP.DEFAULT_VALUE:
        case ATTRIBUTE_KEY_MAP.PLACEHOLDER: {
          if (typeof value !== 'string') {
            try {
              value = value.toString();
            } catch (err) {
              warn(`Property ${key} must be string：${(err as Error).message}`);
            }
          }
          if (!options || !options.textUpdate) {
            // white space handler
            value = whitespaceFilter(value);
          }
          value = unicodeToChar(value);
          break;
        }
        case ATTRIBUTE_KEY_MAP.NUMBER_OF_ROWS:
          if (Native.Platform !== 'ios') {
            return;
          }
          break;
        case ATTRIBUTE_KEY_MAP.CARET_COLOR:
        case ATTRIBUTE_KEY_MAP.CARET_DASH_COLOR:
          key = 'caret-color';
          value = Native.parseColor(value);
          break;
        case ATTRIBUTE_KEY_MAP.BREAK_STRATEGY:
          key = 'breakStrategy';
          break;
        case ATTRIBUTE_KEY_MAP.PLACEHOLDER_TEXT_COLOR:
        case ATTRIBUTE_KEY_MAP.PLACEHOLDER_DASH_TEXT_DASH_COLOR:
          key = 'placeholderTextColor';
          value = Native.parseColor(value);
          break;
        case ATTRIBUTE_KEY_MAP.UNDERLINE_COLOR_ANDROID:
        case ATTRIBUTE_KEY_MAP.UNDERLINE_DASH_COLOR_DASH_ANDROID:
          key = 'underlineColorAndroid';
          value = Native.parseColor(value);
          break;
        case ATTRIBUTE_KEY_MAP.NATIVE_BACKGROUND_ANDROID: {
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
      !options.notToNative && updateChild(this, options.notUpdateStyle);
    } catch (err) {
      // Throw error in development mode
      if (isDev()) {
        throw err;
      }
    }
  }

  public removeAttribute(key: string) {
    delete this.attributes[key];
  }

  public setStyles(batchStyles: NeedToTyped) {
    if (!batchStyles || typeof batchStyles !== 'object' || Object.keys(batchStyles).length === 0) {
      return;
    }
    Object.keys(batchStyles).forEach((styleKey) => {
      const styleValue = batchStyles[styleKey];
      this.setStyle(styleKey, styleValue, true);
    });
    updateChild(this);
  }

  public setStyle(rawKey: string, rawValue: NeedToTyped, notToNative = false) {
    // Preprocess the style
    let key = rawKey;
    let value = rawValue;
    if (!this.getAttribute(ATTRIBUTE_KEY_MAP.BEFORE_LOAD_STYLE_DISABLED)) {
      ({ value, property: key } = this.beforeLoadStyle({ property: rawKey, value: rawValue }));
    }
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
  public setNativeProps(nativeProps: NeedToTyped) {
    if (nativeProps) {
      const { style } = nativeProps;
      this.setStyles(style);
    }
  }

  /**
   * repaint element with the latest style map, which maybe loaded from HMR chunk or dynamic chunk
   */
  public repaintWithChildren() {
    updateWithChildren(this);
  }

  public setStyleScope(styleScopeId: NeedToTyped) {
    if (typeof styleScopeId !== 'string') {
      styleScopeId = styleScopeId.toString();
    }
    if (styleScopeId && !this.scopeIdList.includes(styleScopeId)) {
      this.scopeIdList.push(styleScopeId);
    }
  }

  public get styleScopeId() {
    return this.scopeIdList;
  }

  public isTextNode(childNode: ViewNode) {
    return childNode?.meta.symbol === Text;
  }

  public appendChild(childNode: ViewNode) {
    if (childNode?.meta.symbol === Text && childNode instanceof TextNode) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.appendChild(childNode);
  }

  public insertBefore(childNode: ViewNode, referenceNode: ViewNode) {
    if (this.isTextNode(childNode) && childNode instanceof TextNode) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.insertBefore(childNode, referenceNode);
  }

  public moveChild(childNode: ViewNode, referenceNode: ViewNode) {
    if (this.isTextNode(childNode) && childNode instanceof TextNode) {
      this.setText(childNode.text, { notToNative: true });
    }
    super.moveChild(childNode, referenceNode);
  }

  public removeChild(childNode: ViewNode) {
    if (this.isTextNode(childNode) && childNode instanceof TextNode) {
      this.setText('', { notToNative: true });
    }
    super.removeChild(childNode);
  }

  public setText(text: string, options: OptionMapType = {}) {
    // Hacking for textarea, use value props to instance text props
    if (this.tagName === 'textarea') {
      return this.setAttribute('value', text, { notToNative: !!options.notToNative });
    }
    return this.setAttribute('text', text, { notToNative: !!options.notToNative });
  }

  public setListenerHandledType(key: string, type: string) {
    if (this.events[key]) {
      this.events[key].handledType = type;
    }
  }

  public isListenerHandled(key: string, type: string) {
    if (this.events[key] && type !== this.events[key].handledType) {
      // if handledType not equals type params, this event needs updated
      // if handledType equals undefined, this event needs created
      return false;
    }
    // if event not existed, marked it has been handled
    return true;
  }

  public getNativeEventName(eventName: string) {
    let nativeEventName = `on${capitalizeFirstLetter(eventName)}`;
    if (this.meta.component) {
      const { eventNamesMap } = this.meta.component;
      if (eventNamesMap?.[eventName]) {
        nativeEventName = eventNamesMap[eventName];
      }
    }
    return nativeEventName;
  }

  public addEventListener(eventNames: string, callback: CallbackType, options?: EventListenerOptions) {
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
    transverseEventNames(eventNames, (eventName: string) => {
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

  public removeEventListener(eventNames: string, callback: CallbackType, options?: EventListenerOptions) {
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
    transverseEventNames(eventNames, (eventName: string) => {
      const nativeEventName = this.getNativeEventName(eventName);
      if (this.events[nativeEventName]) {
        this.events[nativeEventName].type = EventHandlerType.REMOVE;
      }
    });
    updateEvent(this);
    return observer;
  }

  public dispatchEvent(eventInstance: Event, targetNode: ElementNode, domEvent: HippyTypes.DOMEvent): void {
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
      if (typeof eventInstance.value === 'string' && eventInstance.target) {
        eventInstance.target.value = eventInstance.value;
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
  public getBoundingClientRect() {
    return Native.measureInWindow(this);
  }

  /**
   * Scroll children to specific position.
   */
  public scrollToPosition(
    x: number | undefined = 0,
    y: number | undefined = 0,
    rawDuration: number | boolean = 1000,
  ): void {
    if (typeof x !== 'number' || typeof y !== 'number') {
      return;
    }
    let duration = rawDuration;

    if (duration === false) {
      duration = 0;
    }
    Native.callUIFunction(this, 'scrollToWithOptions', [{ x, y, duration }]);
  }

  /**
   * Native implementation for the Chrome/Firefox Element.scrollTop method
   */
  public scrollTo(
    x:
    | number
    | {
      left: number;
      top: number;
      behavior: string;
      duration: number | boolean;
    },
    y?: number,
    duration?: number | boolean,
  ): void {
    let animationDuration = duration;
    if (typeof x === 'object' && x) {
      const { left, top, behavior = 'auto' } = x;
      ({ duration: animationDuration } = x);
      this.scrollToPosition(left, top, behavior === 'none' ? 0 : animationDuration);
    } else {
      this.scrollToPosition(x as number, y, duration);
    }
  }

  /**
   * Set pressed state
   * @param pressed - whether to press
   */
  public setPressed(pressed: boolean): void {
    Native.callUIFunction(this, 'setPressed', [pressed]);
  }

  /**
   * Set hot zone
   *
   * @param x - x coordinate
   * @param y - y coordinate
   */
  public setHotspot(x: number, y: number): void {
    Native.callUIFunction(this, 'setHotspot', [x, y]);
  }
}

export default ElementNode;

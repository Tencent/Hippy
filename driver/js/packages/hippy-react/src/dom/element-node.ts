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

/* eslint-disable no-param-reassign */

import Animation from '../modules/animation';
import AnimationSet from '../modules/animation-set';
import { colorParse, colorArrayParse, Color } from '../color';
import { updateChild, updateWithChildren, endBatch } from '../renderer/render';
import {
  isNumber,
  warn,
  unicodeToChar,
  tryConvertNumber,
  convertImgUrl,
  isCaptureEvent,
  hasTargetEvent,
} from '../utils';
import { eventNamesMap, eventHandlerType, NATIVE_EVENT_INDEX } from '../utils/node';
import { EventDispatcher } from '../event';
import ViewNode from './view-node';

interface Attributes {
  [key: string]: string | number | boolean | object | undefined;
}

interface NativePropsStyle {
  [key: string]: string | object | number | HippyTypes.Transform
}

interface PropertiesMap {
  [propName: string]: string;
}

interface DirectionMap {
  [propName: string]: string;
}

interface AttributeUpdateOption {
  notToNative?: boolean
}

interface DegreeUnit {
  [propName: string]: string;
}

const PROPERTIES_MAP: PropertiesMap = {
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
const LINEAR_GRADIENT_DIRECTION_MAP: DirectionMap = {
  totop: '0',
  totopright: 'totopright',
  toright: '90',
  tobottomright: 'tobottomright',
  tobottom: '180', // default value
  tobottomleft: 'tobottomleft',
  toleft: '270',
  totopleft: 'totopleft',
};

const DEGREE_UNIT: DegreeUnit = {
  TURN: 'turn',
  RAD: 'rad',
  DEG: 'deg',
};

/**
 * convert string value to string degree
 * @param {string} value
 * @param {string} unit
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
function getLinearGradientAngle(value: string): string | undefined {
  const processedValue = (value || '').replace(/\s*/g, '').toLowerCase();
  const reg = /^([+-]?(?=(?<digit>\d+))\k<digit>\.?\d*)+(deg|turn|rad)|(to\w+)$/g;
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
function getLinearGradientColorStop(value: string): Object | undefined {
  const processedValue = (value || '').replace(/\s+/g, ' ').trim();
  const [color, percentage] = processedValue.split(/\s+(?![^(]*?\))/);
  const percentageCheckReg = /^([+-]?\d+\.?\d*)%$/g;
  if (color && !percentageCheckReg.exec(color) && !percentage) {
    return {
      color: colorParse(color),
    };
  }
  if (color && percentageCheckReg.exec(percentage)) {
    return {
      // color stop ratio
      ratio: parseFloat(percentage.split('%')[0]) / 100,
      color: colorParse(color),
    };
  }
  warn('linear-gradient color stop is invalid');
}

/**
 * parse backgroundImage
 * @param {string} styleKey
 * @param {string} styleValue
 * @param style
 */
function parseBackgroundImage(styleKey: string, styleValue: string, style: any) {
  // handle linear-gradient style
  if (styleValue.indexOf('linear-gradient') === 0) {
    const valueString = styleValue.substring(styleValue.indexOf('(') + 1, styleValue.lastIndexOf(')'));
    const tokens = valueString.split(/,(?![^(]*?\))/);
    const colorStopList: object[] = [];
    style.linearGradient = style.linearGradient || {};
    tokens.forEach((value: any, index: number) => {
      if (index === 0) {
        // the angle of linear-gradient parameter can be optional
        const angle = getLinearGradientAngle(value);
        if (angle) {
          style.linearGradient.angle = angle;
        } else {
          // if angle ignored, default direction is to bottom, i.e. 180degree
          style.linearGradient.angle = '180';
          const colorObject = getLinearGradientColorStop(value);
          if (colorObject) colorStopList.push(colorObject);
        }
      } else {
        const colorObject = getLinearGradientColorStop(value);
        if (colorObject) colorStopList.push(colorObject);
      }
    });
    style.linearGradient.colorStopList = colorStopList;
  } else {
    (style as any)[styleKey] = convertImgUrl(styleValue);
  }
  return style;
}

/**
 * parse text shadow offset
 * @param {string} styleKey
 * @param {number} styleValue
 * @param {any} style
 */
function parseTextShadowOffset(styleKey: string, styleValue: number, style: any) {
  const offsetMap: PropertiesMap = {
    textShadowOffsetX: 'width',
    textShadowOffsetY: 'height',
  };
  style.textShadowOffset = style.textShadowOffset || {};
  Object.assign(style.textShadowOffset, {
    [offsetMap[styleKey]]: styleValue || 0,
  });
  return style;
}

/**
 * get final key sent to native
 * @param key
 */
function getEventName(key: string) {
  if (isCaptureEvent(key)) {
    key = key.replace('Capture', '');
  }
  if (eventNamesMap[key]) {
    return eventNamesMap[key][NATIVE_EVENT_INDEX];
  }
  return key;
}

function createEventListener(nativeName, originalName): (event: HippyTypes.DOMEvent) => void {
  return (event) => {
    const { id,  currentId, params, eventPhase } = event;
    const dispatcherEvent = {
      id,
      nativeName,
      originalName,
      params,
      currentId,
      eventPhase,
    };
    EventDispatcher.receiveComponentEvent(dispatcherEvent, event);
  };
}

class ElementNode extends ViewNode {
  public tagName: string;
  public id = '';
  public style: HippyTypes.Style = {};
  public inheritStyle: HippyTypes.Style = {};
  public attributes: Attributes = {};
  public events: object = {};

  public constructor(tagName: string) {
    super();
    // Tag name
    this.tagName = tagName;
  }

  public get nativeName() {
    return this.meta.component.name;
  }

  public toString() {
    return `${this.tagName}:(${this.nativeName})`;
  }

  setListenerHandledType(key, type) {
    if (this.events[key]) {
      this.events[key].handledType = type;
    }
  }

  isListenerHandled(key, type) {
    if (this.events[key] && type !== this.events[key].handledType) {
      // if handledType not equals type params, this event needs updated
      // if handledType equals undefined, this event needs created
      return false;
    }
    // if event not existed, marked it has been handled
    return true;
  }

  public hasAttribute(key: string) {
    return !!this.attributes[key];
  }

  public getAttribute(key: string) {
    return this.attributes[key];
  }

  public setStyleAttribute(value: any) {
    // Clean old styles
    this.style = {};
    let styleArray = value;

    // Convert style to array if it's a array like object
    // Forward compatibility workaround.
    if (!Array.isArray(styleArray) && Object.hasOwnProperty.call(styleArray, 0)) {
      const tempStyle: any[] = [];
      const tempObjStyle: {
        [key: string]: any;
      } = {};
      Object.keys(styleArray).forEach((styleKey) => {
        // Workaround for the array and object mixed style.
        if (isNumber(styleKey)) {
          tempStyle.push(styleArray[styleKey]);
        } else {
          tempObjStyle[styleKey] = styleArray[styleKey];
        }
      });
      styleArray = [...tempStyle, tempObjStyle];
    }

    // Convert style to array if style is a standalone object
    if (!Array.isArray(styleArray)) {
      styleArray = [styleArray];
    }

    // Merge the styles if style is array
    let mergedStyles: HippyTypes.Style = {};
    styleArray.forEach((style: HippyTypes.Style) => {
      if (Array.isArray(style)) {
        style.forEach((subStyle) => {
          mergedStyles = {
            ...mergedStyles,
            ...subStyle,
          };
        });
      } else if (typeof style === 'object' && style) {
        mergedStyles = {
          ...mergedStyles,
          ...style,
        };
      }
    });

    // Apply the styles
    Object.keys(mergedStyles).forEach((styleKey) => {
      const styleValue = (mergedStyles as any)[styleKey];
      // Convert the property to W3C standard.
      if (Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, styleKey)) {
        styleKey = PROPERTIES_MAP[styleKey];
      }
      if (styleKey === 'transform') {
        const transforms = {};
        if (!Array.isArray(styleValue)) {
          throw new TypeError('transform only support array args');
        }

        // Merge the transform styles
        styleValue.forEach((transformSet: any) => {
          Object.keys(transformSet).forEach((transform) => {
            const transformValue = (transformSet as any)[transform];
            if (transformValue instanceof Animation
                || transformValue instanceof AnimationSet) {
              (transforms as any)[transform] = {
                animationId: transformValue.animationId,
              };
            } else if (transformValue === null) {
              if ((transforms as any)[transform]) {
                delete (transforms as any)[transform];
              }
            } else if (transformValue !== undefined) {
              (transforms as any)[transform] = transformValue;
            }
          });
        });

        // Save the transform styles.
        const transformsKeys = Object.keys(transforms);
        if (transformsKeys.length) {
          if (!Array.isArray(this.style.transform)) {
            this.style.transform = [];
          }
          transformsKeys.forEach(transform => (this.style.transform as any[]).push({
            [transform]: (transforms as any)[transform],
          }));
        }
      } else if (styleValue === null && (this.style as any)[styleKey] !== undefined) {
        (this.style as any)[styleKey] = undefined;
        // Convert to animationId if value is instanceOf Animation/AnimationSet
      } else if (styleValue instanceof Animation || styleValue instanceof AnimationSet) {
        (this.style as any)[styleKey] = {
          animationId: styleValue.animationId,
        };
        // Translate color
      } else if (styleKey.toLowerCase().indexOf('colors') > -1) {
        (this.style as any)[styleKey] = colorArrayParse((styleValue as Color[]));
      } else if (styleKey.toLowerCase().indexOf('color') > -1) {
        (this.style as any)[styleKey] = colorParse((styleValue as Color));
      } else if (styleKey === 'fontWeight' && styleValue) {
        (this.style as any)[styleKey] = typeof styleValue !== 'string' ? styleValue.toString() : styleValue;
      } else if (styleKey === 'backgroundImage' && styleValue) {
        this.style = parseBackgroundImage(styleKey, styleValue, this.style);
      } else if (styleKey === 'textShadowOffset') {
        const { x = 0, width = 0, y = 0, height = 0 } = styleValue || {};
        (this.style as any)[styleKey] = { width: x || width, height: y || height };
      } else if (['textShadowOffsetX', 'textShadowOffsetY'].indexOf(styleKey) >= 0) {
        this.style = parseTextShadowOffset(styleKey as string, styleValue as number, this.style);
      } else {
        (this.style as any)[styleKey] = styleValue;
      }
    });
  }

  // set node attributes in a batch
  public setAttributes(attributeQueue: [][] = []) {
    if (Array.isArray(attributeQueue) && attributeQueue.length > 0) {
      attributeQueue.forEach((attributeList) => {
        if (Array.isArray(attributeList)) {
          const [key, value]: (string | any)[] = attributeList;
          this.setAttribute(key, value, { notToNative: true });
        }
      });
      updateChild(this);
    }
  }

  parseAnimationStyleProp(style) {
    // Set useAnimation if animation exist in style
    let useAnimation = false;
    Object.keys(style).some((declare) => {
      const styleVal = (style as any)[declare];
      if (styleVal && Array.isArray(styleVal) && declare === 'transform') {
        for (let i = 0; i < styleVal.length; i += 1) {
          const transform = styleVal[i];
          /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
          for (const transformKey in (transform as any)) {
            const transformValue = (transform as any)[transformKey];
            if (typeof transformValue === 'object'
              && transformValue !== null
              && Number.isInteger(transformValue.animationId)) {
              useAnimation = true;
              return true;
            }
          }
        }
      }
      if (typeof styleVal === 'object'
        && styleVal !== null
        && Number.isInteger((styleVal as Animation).animationId)) {
        useAnimation = true;
        return true;
      }
      return false;
    });
    if (useAnimation) {
      this.attributes.useAnimation = true;
    } else if (typeof this.attributes.useAnimation === 'boolean') {
      this.attributes.useAnimation = undefined;
    }
  }

  parseAttributeProp(key: string, value: any): boolean {
    const caseList = [
      {
        match: () => ['id'].indexOf(key) >= 0,
        action: () => {
          if (value === this.id) {
            return true;
          }
          this.id = value;
          // update current node and child nodes
          updateWithChildren(this);
          return true;
        },
      },
      {
        match: () => ['value', 'defaultValue', 'placeholder'].indexOf(key) >= 0,
        action: () => {
          this.attributes[key] = unicodeToChar(value);
          return false;
        },
      },
      {
        match: () => ['text'].indexOf(key) >= 0,
        action: () => {
          this.attributes[key] = value;
          return false;
        },
      },
      {
        match: () => ['style'].indexOf(key) >= 0,
        action: () => {
          if (typeof value !== 'object' || value === undefined || value === null) {
            return true;
          }
          this.setStyleAttribute(value);
          const inheritProperties = ['color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'textAlign', 'lineHeight'];
          const needInherit = inheritProperties.some(prop => Object.prototype.hasOwnProperty.call(value, prop));
          if (needInherit) {
            updateWithChildren(this);
          }
          return false;
        },
      },
      {
        match: () => true,
        action: () => {
          if (typeof value === 'function') {
            const eventName = getEventName(key);
            if (!this.events[key]) {
              // add event initially
              this.events[key] = {
                name: eventName,
                type: eventHandlerType.ADD,
                isCapture: isCaptureEvent(key),
                listener: createEventListener(eventName, key),
              };
            } else if (this.events[key] && this.events[key].type !== eventHandlerType.ADD) {
              // add event again when it is removed before
              this.events[key].type = eventHandlerType.ADD;
            }
          } else {
            if (hasTargetEvent(key, this.events)
              && typeof value !== 'function') {
              // remove event
              this.events[key].type = eventHandlerType.REMOVE;
              return false;
            }
            this.attributes[key] = value;
          }
          return false;
        },
      },
    ];

    let isNeedReturn = false;
    caseList.some((conditionObj: { match: Function, action: Function }) => {
      if (conditionObj.match()) {
        isNeedReturn = conditionObj.action();
        return true;
      }
      return false;
    });
    return isNeedReturn;
  }

  // set node attribute
  public setAttribute(key: string, value: any, options: AttributeUpdateOption = {}) {
    try {
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (typeof (this.attributes[key]) === 'boolean' && value === '') {
        value = true;
      }
      if (key === undefined) {
        !options.notToNative && updateChild(this);
        return;
      }
      const isNeedReturn = this.parseAttributeProp(key, value);
      if (isNeedReturn) return;
      this.parseAnimationStyleProp(this.style);
      !options.notToNative && updateChild(this);
    } catch (e) {
      // noop
    }
  }

  public removeAttribute(key: string) {
    delete this.attributes[key];
  }

  /* istanbul ignore next */
  public setStyle(property: string, value: string | number | HippyTypes.Transform, notToNative = false) {
    if (value === null) {
      delete (this.style as any)[property];
      return;
    }
    let v = value;
    let p = property;
    // Convert the property to W3C standard.
    if (Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, property)) {
      p = PROPERTIES_MAP[property];
    }
    if (typeof v === 'string') {
      v = (value as string).trim();
      if (p.toLowerCase().indexOf('colors') > -1) {
        (v as any) = colorArrayParse(v as any);
      } else if (p.toLowerCase().indexOf('color') > -1) {
        v = colorParse(v);
      } else {
        v = tryConvertNumber(v);
      }
    }
    if (v === undefined || v === null || (this.style as any)[p] === v) {
      return;
    }
    (this.style as any)[p] = v;
    if (!notToNative) {
      updateChild(this);
    }
  }

  /**
   * set native style props
   */
  public setNativeProps(nativeProps: NativePropsStyle) {
    if (nativeProps) {
      const { style } = nativeProps;
      if (style) {
        const styleProps = (style as NativePropsStyle);
        Object.keys(styleProps).forEach((key) => {
          this.setStyle(key, styleProps[key], true);
        });
        updateChild(this);
        endBatch(true);
      }
    }
  }

  public setText(text: string | undefined) {
    if (typeof text !== 'string') {
      try {
        text = (text as any).toString();
      } catch (err) {
        throw new Error('Only string type is acceptable for setText');
      }
    }
    text = (text as string).trim();
    if (!text && !this.getAttribute('text')) {
      return null;
    }
    text = unicodeToChar(text);
    text = text.replace(/&nbsp;/g, ' ').replace(/Â/g, ' '); // FIXME: Â is a template compiler error.
    // Hacking for textarea, use value props to instance text props
    if (this.tagName === 'textarea') {
      return this.setAttribute('value', text);
    }
    return this.setAttribute('text', text);
  }
}

export default ElementNode;

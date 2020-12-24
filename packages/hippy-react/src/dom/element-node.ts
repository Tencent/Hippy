/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import Hippy from '@localTypes/hippy';
import { Transform } from '@localTypes/style';
import ViewNode from './view-node';
import Animation from '../modules/animation';
import AnimationSet from '../modules/animation-set';
import { colorParse, colorArrayParse, Color } from '../color';
import { updateChild, updateWithChildren } from '../renderer/render';
import { Device } from '../native';
import {
  unicodeToChar,
  tryConvertNumber,
  isNumber,
} from '../utils';
import '@localTypes/global';

interface Attributes {
  [key: string]: string | number | true;
}

interface NativePropsStyle {
  [key: string]: string | object | number | Transform
}

interface PropertiesMap {
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

class ElementNode extends ViewNode {
  tagName: string;

  id: string = '';

  style: Hippy.Style = {};

  attributes: Attributes = {};

  constructor(tagName: string) {
    super();

    // Tag name
    this.tagName = tagName;
  }

  get nativeName() {
    return this.meta.component.name;
  }

  toString() {
    return `${this.tagName}:(${this.nativeName})`;
  }

  hasAttribute(key: string) {
    return !!this.attributes[key];
  }

  getAttribute(key: string) {
    return this.attributes[key];
  }

  /* istanbul ignore next */
  setAttribute(key: string, value: any) {
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
        case 'id':
          if (value === this.id) {
            return;
          }
          this.id = value;
          // update current node and child nodes
          updateWithChildren(this);
          return;
        // Convert placeholder to char for interface.
        case 'value':
        case 'defaultValue':
        case 'placeholder':
          this.attributes[key] = unicodeToChar(value);
          break;
        // Text must be a text not a number.
        case 'text':
          this.attributes[key] = value;
          break;
        // FIXME: UpdateNode numberOfRows will makes Image flicker on Android.
        //        So make it working on iOS only.
        case 'numberOfRows':
          this.attributes[key] = value;
          if (Device.platform.OS !== 'ios') {
            return;
          }
          break;
        // There's no onPress event handler in Native
        // Map to onClick event handler directly
        case 'onPress':
          this.attributes.onClick = true;
          break;
        case 'style': {
          if (typeof value !== 'object' || value === undefined || value === null) {
            return;
          }
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
          let mergedStyles: Hippy.Style = {};
          styleArray.forEach((style: Hippy.Style) => {
            if (Array.isArray(style)) {
              style.forEach((subStyle) => {
                mergedStyles = {
                  ...mergedStyles,
                  ...subStyle,
                };
              });
            } else if (typeof style === 'object' && style) {
              // TODO: Merge transform
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
              delete (this.style as any)[styleKey];
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
            } else {
              (this.style as any)[styleKey] = styleValue;
            }
          });
          break;
        }
        default:
          if (typeof value === 'function') {
            this.attributes[key] = true;
          } else {
            this.attributes[key] = value;
          }
      }

      // Set useAnimation if animation exist in style
      let useAnimation = false;
      Object.keys(this.style).some((declare) => {
        const style = (this.style as any)[declare];
        if (style && Array.isArray(style) && declare === 'transform') {
          for (let i = 0; i < style.length; i += 1) {
            const transform = style[i];
            /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
            for (const transformKey in (transform as any)) {
              const transformValue = (transform as any)[transformKey];
              if (typeof transformValue === 'object'
                && transformValue !== null
                && Number.isInteger(transformValue.animationId)) {
                useAnimation = true;
                return transformValue;
              }
            }
          }
        }
        if (typeof style === 'object'
          && style !== null
          && Number.isInteger((style as Animation).animationId)) {
          useAnimation = true;
          return style;
        }
        return false;
      });
      if (useAnimation) {
        this.attributes.useAnimation = true;
      } else if (typeof this.attributes.useAnimation === 'boolean') {
        delete this.attributes.useAnimation;
      }

      updateChild(this);
    } catch (e) {
      // ignore
    }
  }

  removeAttribute(key: string) {
    delete this.attributes[key];
  }

  /* istanbul ignore next */
  setStyle(property: string, value: string | number | Transform, isBatchUpdate: boolean = false) {
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
    if (!isBatchUpdate) {
      updateChild(this);
    }
  }

  /**
   * set native style props
   */
  setNativeProps(nativeProps: NativePropsStyle) {
    if (nativeProps) {
      const { style } = nativeProps;
      if (style) {
        const styleProps = (style as NativePropsStyle);
        Object.keys(styleProps).forEach((key) => {
          this.setStyle(key, styleProps[key], true);
        });
        updateChild(this);
      }
    }
  }

  setText(text: string) {
    if (typeof text !== 'string') {
      try {
        text = (text as any).toString();
      } catch (err) {
        throw new Error('Only string type is acceptable for setText');
      }
    }
    text = text.trim();
    if (!text && !this.getAttribute('text')) {
      return null;
    }
    text = unicodeToChar(text);
    text = text.replace(/&nbsp;/g, ' ').replace(/Â/g, ' ');  // FIXME: Â is a template compiler error.
    // Hacking for textarea, use value props to instance text props
    if (this.tagName === 'textarea') {
      return this.setAttribute('value', text);
    }
    return this.setAttribute('text', text);
  }
}

export default ElementNode;

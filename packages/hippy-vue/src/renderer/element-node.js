/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import ViewNode from './view-node';
import { updateChild, updateWithChildren } from './native';
import { getViewMeta, normalizeElementName } from '../elements';
import { Event, EventEmitter } from './native/event';
import { Text } from './native/components';
import {
  unicodeToChar,
  tryConvertNumber,
  setsAreEqual,
  endsWith,
  getBeforeLoadStyle,
} from '../util';
import Native from '../runtime/native';

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


  hasAttribute(key) {
    return !!this.attributes[key];
  }

  getAttribute(key) {
    return this.attributes[key];
  }

  /* istanbul ignore next */
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
          this.attributes[key] = tryConvertNumber(value);
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

  setStyle(property_, value_) {
    if (value_ === undefined) {
      delete this.style[property_];
      return;
    }
    // Preprocess the style
    const { property, value } = this.beforeLoadStyle({
      property: property_,
      value: value_,
    });
    let v = value;

    // Process the specifc style value
    switch (property) {
      case 'fontWeight':
        if (typeof v !== 'string') {
          v = v.toString();
        }
        break;
      case 'caretColor':
        this.attributes['caret-color'] = Native.parseColor(value);
        break;
      default: {
        if (typeof v === 'string') {
          v = value.trim();
          // Convert inline color style to int
          if (property.toLowerCase().indexOf('color') >= 0) {
            v = Native.parseColor(v);
          // Convert inline length style, drop the px unit
          } else if (endsWith(v, 'px')) {
            v = parseFloat(value.slice(0, value.length - 2));
          } else {
            v = tryConvertNumber(v);
          }
        }
      }
    }

    if (v === undefined || v === null || this.style[property] === v) {
      return;
    }
    this.style[property] = v;
    updateChild(this);
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

    updateChild(this);
  }

  removeEventListener(eventNames, callback, options) {
    if (!this._emitter) {
      return null;
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
  scrollToPosition(x = 0, y = 0, duration = 1000)  {
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

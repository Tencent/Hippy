/**
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This source code is based on react-native-web project.
 * https://github.com/necolas/react-native-web/blob/0.11.7//packages/react-native-web/src/modules/applyLayout/index.js
 *
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */

import debounce from 'debounce';
import UIManager from '../modules/ui-manager-module';
import findNodeHandle from './find-node';

interface Registry {
  [key: string]: any;
}

interface LayoutElement extends Element {
  layoutId: string;
  handleLayout(): void;
}

const emptyObject = {};
const registry: Registry = {};

let id = 1;
// const guid = () => `r-${id += 1}`;

let resizeObserver: any;
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  console.warn('onLayout relies on ResizeObserver which is not supported by your browser. '
    + 'Please include a polyfill, e.g., https://github.com/que-etc/resize-observer-polyfill. '
    + 'Falling back to window.onresize.');
}

const triggerAll = () => {
  Object.keys(registry)
    .forEach((key) => {
      const instance = registry[key];
      instance.handleLayout();
    });
};

if (typeof window === 'object') {
  window.addEventListener('resize', debounce(triggerAll, 16), false);
}

function observe(instance: LayoutElement) {
  id += 1;
  const newId = `r-${id}`;
  registry[newId] = instance;

  if (resizeObserver) {
    const node = findNodeHandle(instance) as LayoutElement;
    if (node) {
      (node as LayoutElement).layoutId = newId;
      resizeObserver.observe(node);
    }
  } else {
    instance.layoutId = newId;
    instance.handleLayout();
  }
}

function unobserve(instance: LayoutElement) {
  if (resizeObserver) {
    const node = findNodeHandle(instance) as LayoutElement;
    if (node) {
      delete registry[node.layoutId];
      delete node.layoutId;
      resizeObserver.unobserve(node);
    }
  } else {
    delete registry[instance.layoutId];
    delete instance.layoutId;
  }
}

function safeOverride(original: Function, next: Function) {
  if (original) {
    return function prototypeOverride() {
      /* eslint-disable prefer-rest-params */
      original.call(this, arguments);
      next.call(this, arguments);
      /* eslint-enable prefer-rest-params */
    };
  }
  return next;
}

function applyLayout(Component: any) {
  const { componentDidMount, componentDidUpdate, componentWillUnmount } = Component.prototype;

  Component.prototype.componentDidMount = safeOverride(
    componentDidMount,
    function componentDidMount() {
      this.layoutState = emptyObject;
      this.hasMounted = true;
      if (this.props.onLayout) {
        observe(this);
      }
    },
  );

  Component.prototype.componentDidUpdate = safeOverride(
    componentDidUpdate,
    function componentDidUpdate(prevProps: any) {
      if (this.props.onLayout && !prevProps.onLayout) {
        observe(this);
      } else if (!this.props.onLayout && prevProps.onLayout) {
        unobserve(this);
      }
    },
  );

  Component.prototype.componentWillUnmount = safeOverride(
    componentWillUnmount,
    function componentWillUnmount() {
      this.hasMounted = false;
      if (this.props.onLayout) {
        unobserve(this);
      }
    },
  );

  Component.prototype.handleLayout = function handleLayout() {
    const layout = this.layoutState;
    const { onLayout } = this.props;

    if (onLayout) {
      const node = findNodeHandle(this);
      UIManager.measure(node, (x: number, y: number, width: number, height: number) => {
        if (this.hasMounted) {
          if (
            layout.x !== x
            || layout.y !== y
            || layout.width !== width
            || layout.height !== height
          ) {
            this.layoutState = {
              x,
              y,
              width,
              height,
            };
            const nativeEvent = {
              layout: this.layoutState,
            };
            Object.defineProperty(nativeEvent, 'target', {
              enumerable: true,
              get: () => findNodeHandle(this),
            });
            onLayout({
              layout: this.layoutState,
            });
          }
        }
      });
    }
  };

  return Component;
}

export default applyLayout;

/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import {
  type CssNodeType,
  type CssDeclarationType,
  parseCSS,
  translateColor,
  getCssMap,
} from '@hippy-vue-next-style-parser/index';
import {
  type Component,
  type ComponentPublicInstance,
  type App,
  createRenderer,
  createHydrationRenderer,
} from '@vue/runtime-core';
import { isFunction } from '@vue/shared';

import type { NeedToTyped, CallbackType, CommonMapParams, NativeInterfaceMap, SsrNode, SsrNodeProps } from './types';
import { BackAndroid } from './android-back';
import BuiltInComponent from './built-in-component';
import { drawIphoneStatusBar } from './iphone';
import HippyNativeComponents, { isNativeTag, type AnimationInstance } from './native-component';
import { nodeOps } from './node-ops';
import { patchProp } from './patch-prop';
import { getTagComponent, registerElement, type TagComponent, type ElementComponent } from './runtime/component';
import { HippyDocument } from './runtime/document/hippy-document';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyInputElement } from './runtime/element/hippy-input-element';
import type { HippyListElement } from './runtime/element/hippy-list-element';
import { EventBus } from './runtime/event/event-bus';
import { Native } from './runtime/native';
import type { NativeApiType, MeasurePosition, DOMRect } from './runtime/native';
import './runtime/event/hippy-event-dispatcher';
import './runtime/websocket/websocket';
import type { HippyNode } from './runtime/node/hippy-node';
import {
  setBeforeLoadStyle,
  setSilent,
  setTrimWhitespace,
  trace,
  setBeforeRenderToNative,
} from './util';
import type { HippyCachedInstanceType } from './util/instance';
import {
  getHippyCachedInstance,
  setHippyCachedInstance,
  setHippyCachedInstanceParams,
} from './util/instance';
import { setScreenSize } from './util/screen';
import { convertToHippyElementTree } from './hydration';

/**
 * Hippy App type, override the mount method of Vue
 *
 * @public
 */
export type HippyApp = App & {
  $start: (
    afterCallback?: CallbackType
  ) => Promise<{ superProps: NeedToTyped; rootViewId: number }>;
};

/**
 * Additional configuration information for iPhone
 *
 * @public
 */
export interface IphoneOptions {
  // status bar configuration
  statusBar?: {
    // disable status bar autofill
    disabled?: boolean;

    // The background color of the status bar, if not set, will use 4282431619, which is #40b883 - theme color of Vue
    // Because the runtime only supports the actual conversion of styles and attributes,
    // you need to use the following converter to convert the color values in advance
    // hippy-vue-css-loader/src/compiler/style/color-parser.js
    // backgroundColor: 4294309626,
    backgroundColor?: number;

    // Status bar background image, note that this will stretch according to the size of the container
    backgroundImage?: string;
  };
}

/**
 * options type of initialization parameters
 *
 * @public
 */
export interface HippyAppOptions {
  // The app name registered by the Hippy native needs to be applied to the Hippy party
  appName: string;
  // iPhone configuration
  iPhone?: IphoneOptions;
  // style configuration
  styleOptions?: {
    // hook method for style loading
    beforeLoadStyle?: (decl: CssDeclarationType) => CssDeclarationType;
    // base screen width, the default value is 750, which is usually used in the design draft.
    ratioBaseWidth?: number;
  };
  // do not print trace info if set to true
  silent?: boolean;
  // set whether to trim text whitespace
  trimWhitespace?: boolean;
  // ssr render node list
  ssrNodeList?: SsrNode[];
}

// base screen width
const defaultRatioBaseWidth = 750;

const componentName = ['%c[Hippy-Vue-Next process.env.HIPPY_VUE_VERSION]%c', 'color: #4fc08d; font-weight: bold', 'color: auto; font-weight: auto'];

/**
 * set the status bar for iOS
 *
 * @param options - hippy app initialization parameters
 * @param instance - instance of Vue app
 */
function setIOSNativeBar(
  options: HippyAppOptions,
  instance: ComponentPublicInstance,
) {
  // need to set the status bar for iPhone
  if (Native.isIOS()) {
    const statusBar = drawIphoneStatusBar(options);
    if (statusBar) {
      const rootNode = instance.$el.parentNode;

      if (!rootNode.childNodes.length) {
        rootNode.appendChild(statusBar);
      } else {
        rootNode.insertBefore(statusBar, rootNode.childNodes[0]);
      }
    }
  }
}

/**
 * create root node
 */
function createRootNode(rootContainer: string): HippyElement {
  // Create the root node as the root of the entire hippy tree
  const root: HippyElement = HippyDocument.createElement('div');
  // The id value of the root node is set to the incoming parameter rootContainer
  root.id = rootContainer;
  // The root node flex is set to 1 by default
  root.style.flex = 1;

  return root;
}

/**
 * Create Hippy Vue instance, support ssr
 *
 * @param app - instance of vue app
 * @param options - initialization parameters
 *
 * @public
 */
const createHippyApp = (
  app: App,
  options: HippyAppOptions,
): HippyApp => {
  // hippy app instance
  const hippyApp: HippyApp = app as HippyApp;
  const isHydrate = Boolean(options?.ssrNodeList?.length);

  // register built-in label components, such as div, span, etc., to enable HippyNode to support built-in labels
  // these built-in tags will be converted to component types recognized by Native,
  // registered with default properties, added additional event processing, etc.
  hippyApp.use(BuiltInComponent);

  // register native components, such as waterfall, etc.
  // Because vue does not know these components, it needs to be registered as vue component
  hippyApp.use(HippyNativeComponents);

  if (typeof options?.styleOptions?.beforeLoadStyle === 'function') {
    // If a style loading hook is set, save the custom style loading hook
    setBeforeLoadStyle(options.styleOptions.beforeLoadStyle);
  }

  // do not print trace info
  if (options.silent) {
    setSilent(options.silent);
  }

  // set whether to trim whitespace
  setTrimWhitespace(options.trimWhitespace);

  // save the original mount method
  const { mount } = hippyApp;

  // rewrite mount method of vue
  hippyApp.mount = (rootContainer) => {
    // cache rootContainer first, used to determine whether it is the root node
    setHippyCachedInstanceParams('rootContainer', rootContainer);
    // create the root node
    // 1. return an empty node when the hydrate is false
    // 2. return a root node for a hippy element tree, when the hydrate is true
    const root = options?.ssrNodeList?.length
      ? convertToHippyElementTree(options.ssrNodeList)
      : createRootNode(rootContainer);
    // mount and get the instance
    const instance = mount(root, isHydrate, false);
    // cache Vue instance
    setHippyCachedInstanceParams('instance', instance);
    // set the status bar for iOS
    if (!isHydrate) {
      // in hydrate mode, insert status bar async, will cause hydration mismatch
      setIOSNativeBar(options, instance);
    }

    return instance;
  };

  // return instance of HippyApp instance
  hippyApp.$start = async (afterCallback?: CallbackType) => new Promise((resolve) => {
    // call the interface provided by Native to register hippy
    Native.hippyNativeRegister.regist(
      options.appName,
      (superProps: NeedToTyped) => {
        // get the initialization parameters passed in by the native, login parameters
        const { __instanceId__: rootViewId } = superProps;

        trace(...componentName, 'Start', options.appName, 'with rootViewId', rootViewId, superProps);
        // when refreshing the app, need to remove the old instance first
        const oldInstance = getHippyCachedInstance();
        if (oldInstance?.app) {
          oldInstance.app.unmount();
        }

        // cache initialization parameters
        setHippyCachedInstance({
          rootViewId, // id of root view returned by native, do not forget set style for root view
          superProps, // initialization parameters returned by native
          app: hippyApp,
          ratioBaseWidth:
              options?.styleOptions?.ratioBaseWidth ?? defaultRatioBaseWidth, // base screen width
        });

        const globalInitParams = {
          superProps,
          rootViewId,
        };

        // the initialization is complete, and return the initialization parameters returned
        // by native. support callback && promise
        if (isFunction(afterCallback)) {
          afterCallback(globalInitParams);
        } else {
          resolve(globalInitParams);
        }
      },
    );
  });

  // return hippy vue instance
  return hippyApp;
};

/**
 * create client side render vue app instance
 *
 * @param vueRootComponent - vue root component
 * @param options - hippy init options
 *
 * @public
 */
export const createApp = (
  vueRootComponent: Component,
  options: HippyAppOptions,
): HippyApp => {
  // create client side custom renderer for vue app
  const app: App = createRenderer({
    patchProp,
    ...nodeOps,
  }).createApp(vueRootComponent);

  // create hippy app
  return createHippyApp(app, options);
};

/**
 * create server side render vue app instance
 *
 * @param vueRootComponent - vue root component
 * @param options - hippy init options
 *
 * @public
 */
export const createSSRApp = (
  vueRootComponent: Component,
  options: HippyAppOptions,
): HippyApp => {
  // create hydrate custom renderer for vue app
  const app: App = createHydrationRenderer({
    patchProp,
    ...nodeOps,
  } as NeedToTyped).createApp(vueRootComponent);

  return createHippyApp(app, options);
};

/*
 * used to validate beforeRenderToNative hook
 * when ElementNode or ViewNode have breaking changes, add version number to disable
 * beforeRenderToNative hook
 */
const BEFORE_RENDER_TO_NATIVE_HOOK_VERSION = 1;
export const _setBeforeRenderToNative = (hook, version) => {
  if (isFunction(hook)) {
    if (BEFORE_RENDER_TO_NATIVE_HOOK_VERSION === version) {
      setBeforeRenderToNative(hook);
    } else {
      console.error('_setBeforeRenderToNative API had changed, the hook function will be ignored!');
    }
  }
};

export type {
  NativeApiType,
  HippyCachedInstanceType,
  HippyElement,
  HippyNode,
  HippyInputElement,
  HippyListElement,
  CssNodeType,
  TagComponent,
  ElementComponent,
  CallbackType,
  CommonMapParams,
  NeedToTyped,
  NativeInterfaceMap,
  SsrNode,
  SsrNodeProps,
  MeasurePosition,
  DOMRect,
  AnimationInstance,
};

export * from './config';
export * from './runtime/event/hippy-event';

export {
  EventBus,
  Native,
  BackAndroid,
  translateColor,
  parseCSS,
  getCssMap,
  setScreenSize,
  getTagComponent,
  registerElement,
  isNativeTag,
};

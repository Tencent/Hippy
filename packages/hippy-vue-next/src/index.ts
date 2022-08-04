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

import type { NeedToTyped } from '@hippy-shared/index';
import {
  type CssNodeType,
  type CssDeclarationType,
  parseCSS,
  translateColor,
} from '@style-parser/index';
import {
  type Component,
  type ComponentPublicInstance,
  type App,
  createRenderer,
} from '@vue/runtime-core';

import { BackAndroid } from './android-back';
import BuiltInComponent from './built-in-component';
import { drawIphoneStatusBar } from './iphone';
import HippyNativeComponents from './native-component';
import { nodeOps } from './node-ops';
import { patchProp } from './patch-prop';
import { HippyDocument } from './runtime/document/hippy-document';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyInputElement } from './runtime/element/hippy-input-element';
import type { HippyListElement } from './runtime/element/hippy-list-element';
import { EventBus } from './runtime/event/event-bus';
import {
  type HippyEvent,
  HippyKeyboardEvent,
} from './runtime/event/hippy-event';
import { Native } from './runtime/native';
import type { NativeApiType } from './runtime/native';
import './runtime/event/hippy-event-dispatcher';
import './runtime/websocket/websocket';
import { NativeInterfaceMap } from './runtime/native/modules';
import type { HippyNode } from './runtime/node/hippy-node';
import { setBeforeLoadStyle } from './util';
import type { HippyCachedInstanceType } from './util/instance';
import {
  getHippyCachedInstance,
  setHippyCachedInstance,
  setHippyCachedInstanceParams,
} from './util/instance';
import { setScreenSize } from './util/screen';

/**
 * Hippy App type, override the mount method of Vue
 *
 * @public
 */
export type HippyApp = App & {
  $start: () => Promise<{ superProps: NeedToTyped; rootViewId?: number }>;
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
}

// base screen width
const defaultRatioBaseWidth = 750;

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
function createRootNode(rootContainer: string): HippyNode {
  // Create the root node as the root of the entire hippy tree
  const root: HippyElement = HippyDocument.createElement('div');
  // The id value of the root node is set to the incoming parameter rootContainer
  root.id = rootContainer;
  // The root node flex is set to 1 by default
  root.style.flex = 1;

  return root;
}

/**
 * Create Hippy Vue instance
 *
 * @param vueRootComponent - instance of vue root component
 * @param options - initialization parameters
 *
 * @public
 */
export const createApp = (
  vueRootComponent: Component,
  options: HippyAppOptions,
): HippyApp => {
  // Create a custom renderer and get the vue app instance
  const app: App = createRenderer({
    patchProp,
    ...nodeOps,
  }).createApp(vueRootComponent);
  // hippy app instance
  const hippyApp: HippyApp = app as HippyApp;

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

  // save the original mount method
  const { mount } = hippyApp;

  // rewrite mount method of vue
  hippyApp.mount = (rootContainer) => {
    // cache rootContainer, used to determine whether it is the root node
    setHippyCachedInstanceParams('rootContainer', rootContainer);
    // create the root node
    const root = createRootNode(rootContainer);
    // mount and get the instance
    const instance = mount(root, false, false);
    // cache Vue instance
    setHippyCachedInstanceParams('instance', instance);
    // set the status bar for iOS
    setIOSNativeBar(options, instance);

    return instance;
  };

  // return instance of HippyApp instance
  hippyApp.$start = async () => new Promise((resolve) => {
    // call the interface provided by Native to register hippy
    Native.hippyNativeRegister.regist(
      options.appName,
      (superProps: NeedToTyped) => {
        // get the initialization parameters passed in by the native, login parameters
        const { __instanceId__: rootViewId } = superProps;

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

        // the initialization is complete, and return the initialization parameters returned by native
        resolve({
          superProps,
          rootViewId,
        });
      },
    );
  });

  // return hippy vue instance
  return hippyApp;
};

export type {
  NativeApiType,
  HippyCachedInstanceType,
  HippyEvent,
  HippyElement,
  HippyNode,
  HippyInputElement,
  HippyListElement,
  CssNodeType,
};

export * from './config';

export {
  EventBus,
  Native,
  BackAndroid,
  translateColor,
  parseCSS,
  NativeInterfaceMap,
  setScreenSize,
  HippyKeyboardEvent,
};

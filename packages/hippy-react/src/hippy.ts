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

import React, { FunctionComponent, ComponentClass } from 'react';
import Document from './dom/document-node';
import renderer from './renderer';
import * as Native from './native';
import { setRootContainer } from './utils/node';
import { trace, warn, setSilent, setBubbles } from './utils';

const {
  createContainer,
  updateContainer,
  getPublicRootInstance,
} = renderer;

interface HippyReactConfig {
  /**
   * Hippy app name, it's will register to `__GLOBAL__.appRegister` object,
   * waiting the native load instance event for start the app.
   */
  appName: string;

  /**
   * Entry component of Hippy app.
   */
  entryPage: string | FunctionComponent<any> | ComponentClass<any, any>;

  /**
   * Disable trace output
   */
  silent?: boolean;

  /**
   * enable global bubbles
   */
  bubbles?: boolean;

  /**
   * The callback after rendering.
   */
  callback?: () => void | undefined | null;
}

interface SuperProps {
  __instanceId__: number;
}

const componentName = ['%c[Hippy-React process.env.HIPPY_REACT_VERSION]%c', 'color: #61dafb', 'color: auto'];

interface HippyReact {
  config: HippyReactConfig;
  rootContainer: any;
  // Keep foward comaptatble.
  regist: () => void;
}

class HippyReact implements HippyReact {
  // version
  static version = process.env.HIPPY_REACT_VERSION;

  // Native methods
  static get Native() {
    warn('HippyReact.Native interface is not stable yet. DO NOT USE IT');
    return Native;
  }

  /**
   * Create new Hippy instance
   *
   * @param {Object} config - Hippy config.
   * @param {string} config.appName - The name of Hippy app.
   * @param {Component} config.entryPage - The Entry page of Hippy app.
   * @param {function} config.callback - The callback after rendering.
   */
  constructor(config: HippyReactConfig) {
    if (!config.appName || !config.entryPage) {
      throw new TypeError('Invalid arguments');
    }
    this.config = config;
    this.regist = this.start; // Forward compatible alias
    this.render = this.render.bind(this);

    // Start Render
    const rootDocument = new Document();
    this.rootContainer = createContainer(rootDocument, false, false);
  }

  /**
   * Start hippy app execution.
   */
  public start() {
    Native.HippyRegister.regist(this.config.appName, this.render);
  }

  /**
   * Native rendering callback
   * @param {Object} superProps - The props passed by native start the app.
   */
  private render(superProps: SuperProps) {
    const {
      appName,
      entryPage,
      silent = false,
      bubbles = false,
      callback = () => {},
    } = this.config;
    const { __instanceId__: rootViewId } = superProps;
    trace(...componentName, 'Start', appName, 'with rootViewId', rootViewId, superProps);

    // Update nodeId for container
    this.rootContainer.containerInfo.nodeId = rootViewId;
    if (silent) {
      setSilent(silent);
    }
    if (bubbles) {
      setBubbles(bubbles);
    }
    // Save the root container
    setRootContainer(rootViewId, this.rootContainer);

    // Render to screen.
    const rootElement = React.createElement(entryPage, superProps);
    updateContainer(rootElement, this.rootContainer, null, callback);
    return getPublicRootInstance(this.rootContainer);
  }
}

export default HippyReact;

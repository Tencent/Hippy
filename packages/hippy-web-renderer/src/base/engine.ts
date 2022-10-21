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

import global from '../get-global';
import { HippyBaseViewConstructor } from '../types';
import { HippyWebModule } from './base-unit';
import { HippyWebEngineContext } from './context';
import { createCallNatives } from './create-call-natives';
import { HippyWebEventBus } from './event-bus';
import { scriptLoader } from './script-loader';

export interface HippyWebEngineCreatorOptions {
  modules?: { [key: string]: (typeof HippyWebModule) };
  components?: { [key: string]: HippyBaseViewConstructor };
}

export interface HippyWebEngineStartOptions {
  id: string;
  name: string;
  params?: any;
}

export class HippyWebEngine {
  static coreModules: { [key: string]: typeof HippyWebModule } = {};
  static coreComponents: { [key: string]: HippyBaseViewConstructor };
  static create(options?: HippyWebEngineCreatorOptions) {
    // load core modules
    if (Hippy.web.engine === undefined) {
      const engine = new HippyWebEngine(options);

      Hippy.web.engine = engine;
    }
    return Hippy.web.engine;
  };

  modules: { [key: string]: HippyWebModule } = {};
  components: { [key: string]: HippyBaseViewConstructor } = {};
  context: HippyWebEngineContext;
  instance?: HippyWebEngineStartOptions;
  eventBus = new HippyWebEventBus();

  pendingQueue: { [key: string]: any[] } = {};

  pendingModules = {};

  constructor(options?: HippyWebEngineCreatorOptions) {
    this.context = new HippyWebEngineContext(this);

    const { modules, components } = options || {};

    this.registerCore();
    this.registerModules(modules);
    this.registerComponents(components);

    // bind global methods
    global.hippyCallNatives = createCallNatives(this);

    // engine is ready
    this.eventBus.publish('ready');
  }

  registerCore() {
    this.registerModules(HippyWebEngine.coreModules);
    this.registerComponents(HippyWebEngine.coreComponents);
  }

  registerModules(modules?: { [key: string]: typeof HippyWebModule }) {
    Object.keys(modules || {}).forEach((key) => {
      const ModuleCtor = modules![key];
      const mod = new ModuleCtor(this.context);
      const moduleName = mod.name === '' ? key : mod.name;
      this.modules[moduleName] = mod;
    });
  }

  registerComponents(components?: HippyBaseViewConstructor[] | { [key: string]: HippyBaseViewConstructor }) {
    if (components === undefined) {
      return;
    }
    if (Array.isArray(components)) {
      components.forEach((cmpCtor) => {
        this.components[cmpCtor.name] = cmpCtor;
      });
    } else {
      const keys = Object.keys(components as { [key: string]: HippyBaseViewConstructor });
      for (const key of keys) {
        this.registerComponent(key, (components as { [key: string]: HippyBaseViewConstructor })[key]);
      }
    }
  }

  registerComponent(name: string, componentCtor: HippyBaseViewConstructor) {
    this.components[name] = componentCtor;
  }


  start(options: HippyWebEngineStartOptions) {
    const newOptions = options;
    if (!newOptions.params) {
      newOptions.params = {};
    }
    this.instance = newOptions;
    Object.keys(this.modules).forEach((key) => {
      this.modules[key]?.init();
    });
    hippyBridge('loadInstance', newOptions);
    this.eventBus.publish('loaded');
  }

  stop() {
    this.eventBus.publish('beforeDestroy');
    if (this.instance) {
      hippyBridge('destoryInstance', this.instance.id);
    }
  }

  pause() {
    hippyBridge('pauseInstance');
  }

  resume() {
    hippyBridge('resumeInstance');
  }

  load(urls: string[]) {
    return scriptLoader(urls);
  }

  async invokeModuleMethod(moduleName: string, methodName: string, callId: string, params: any[] = []) {
    const mod = this.modules[moduleName];
    if (mod?.[methodName]) {
      if (mod.mode === 'sequential') {
        if (!this.pendingQueue[moduleName]) {
          this.pendingQueue[moduleName] = [];
        }
        const queue = this.pendingQueue[moduleName];
        queue.push([moduleName, methodName, callId, params]);
        if (this.pendingModules[moduleName] === true) {
          return;
        }
        while (queue.length > 0) {
          this.pendingModules[moduleName] = true;
          const para = queue[0];
          await this.invokeModuleMethodImmediately(para[0], para[1], para[2], para[3]);
          queue.shift();
        }
        this.pendingModules[moduleName] = false;
      } else {
        await this.invokeModuleMethodImmediately(moduleName, methodName, callId, params);
      }
    }
  }

  async invokeModuleMethodImmediately(moduleName: string, methodName: string, callId: string, params: any[] = []) {
    const mod = this.modules[moduleName];
    const addonPara = (callId !== null && callId !== undefined)
      ? createPromise(moduleName, methodName, callId)
      : undefined;
    const para = [...params, addonPara];
    const method = mod[methodName];
    try {
      await method.apply(mod, para);
    } catch (e) {
      console.error(e);
    }
  }
}


// Util

const createPromise = (moduleName: string, methodName: string, callId: string) => ({
  resolve: (params) => {
    hippyBridge('callBack', {
      callId,
      methodName,
      moduleName,
      params,
      result: 0,
    });
  },
  reject: (params) => {
    hippyBridge('callBack', {
      callId,
      methodName,
      moduleName,
      params,
      result: -1,
    });
  },
});

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
    if (options === undefined) {
      return;
    }
    const { modules, components } = options;

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
      this.modules[mod.name] = mod;
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
    this.instance = options;
    hippyBridge('loadInstance', options);

    Object.keys(this.modules).forEach((key) => {
      this.modules[key]?.init();
    });
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

  // flushPendingQueue(moduleName: string) {
  //   this.pendingModules[moduleName] = false;
  //   const queue = this.pendingQueue.filter(para => para[0] === moduleName);
  //   while (queue.length > 0) {
  //     const para = queue.shift();
  //     // resend commands
  //     global.hippyCallNatives(para[0], para[1], para[2], para[3]);
  //   }
  // }
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

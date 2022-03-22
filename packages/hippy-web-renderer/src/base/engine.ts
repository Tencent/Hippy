import global from '../get-global';
import { CORE_MODULES, registerComponent } from '../module';
import { HippyWebComponent, HippyWebModule } from './base-unit';
import { HippyWebEngineContext } from './context';
import { createCallNatives } from './create-call-natives';
import { HippyWebEventBus } from './event-bus';
import { scriptLoader } from './script-loader';
import { BaseView } from '../types';

export interface HippyWebEngineCreatorOptions {
  modules?: (typeof HippyWebModule)[];
  components?: (new () => HippyWebComponent)[];
}

export interface HippyWebEngineStartOptions {
  id: string;
  name: string;
  params?: any;
}

export class HippyWebEngine {
  static create(options?: HippyWebEngineCreatorOptions) {
    // load core modules
    if (Hippy.web.engine == null) {
      const engine = new HippyWebEngine(options);

      Hippy.web.engine = engine;
    }
    return Hippy.web.engine;
  };

  modules: { [key: string]: HippyWebModule } = {};
  components: { [key: string]: HippyWebComponent } = {};
  context: HippyWebEngineContext;
  instance?: HippyWebEngineStartOptions;
  eventBus = new HippyWebEventBus();

  pendingQueue: { [key: string]: any[] } = {};

  pendingModules = {};

  constructor(options?: HippyWebEngineCreatorOptions) {
    this.context = new HippyWebEngineContext(this);
    if (options == null) {
      return;
    }
    const { modules, components } = options;

    // add core modules and components
    const coreModules = CORE_MODULES;

    this.registerModules(coreModules);

    this.registerModules(modules);
    // this.registerComponents(components);

    // bind global methods
    global.hippyCallNatives = createCallNatives(this);

    // engine is ready
    this.eventBus.publish('ready');
  }

  registerModules(modules?: (typeof HippyWebModule)[]) {
    modules?.forEach((moduleCtor) => {
      const mod = new moduleCtor(this.context);
      this.modules[mod.name] = mod;
    });
  }

  registerComponents(components?) {
    components?.forEach((cmpCtor) => {
      const cmp = new cmpCtor();
      this.components[cmp.name] = cmp;

      registerComponent(cmp.name, cmpCtor);
    });
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
    if (mod != null && mod[methodName] != null) {
      if (mod.mode === 'sequential') {

        if (this.pendingQueue[moduleName] == null) {
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
    const para = [...params, callId != null ? createPromise(moduleName, methodName, callId) : undefined];
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

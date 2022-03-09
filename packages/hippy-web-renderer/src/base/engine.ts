import global from '../get-global';
import { HippyWebComponent, HippyWebModule } from './base-unit';
import { HippyWebEngineContext } from './context';
import { createCallNatives } from './create-call-natives';
import { HippyWebEventBus } from './event-bus';
import { scriptLoader } from './script-loader';

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

  constructor(options?: HippyWebEngineCreatorOptions) {
    this.context = new HippyWebEngineContext(this);
    if (options == null) {
      return;
    }
    const { modules, components } = options;

    modules?.forEach((moduleCtor) => {
      const mod = new moduleCtor(this.context);
      this.modules[mod.name] = mod;
    });

    components?.forEach((cmpCtor) => {
      const cmp = new cmpCtor();
      this.components[cmp.name] = cmp;
    });

    // bind global methods
    global.hippyCallNatives = createCallNatives(this);

    // engine is ready
    this.eventBus.publish('ready');
  }


  start(options: HippyWebEngineStartOptions) {
    this.instance = options;
    hippyBridge('loadInstance', options);

    Object.keys(this.modules).forEach((key) => {
      this.modules[key].init?.();
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
}

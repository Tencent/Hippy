import { HippyWebEngineContext } from './context';

export class HippyWebUnit {
  context?: HippyWebEngineContext;
  name = '';
  constructor() {
  }
}

export class HippyWebModule extends HippyWebUnit {
  constructor(context: HippyWebEngineContext) {
    super();
    this.context = context;
  }

  context: HippyWebEngineContext;
  mode: 'sequential' | 'normal' = 'normal';
  init() {};
}

export class HippyWebComponent extends HippyWebUnit {

}

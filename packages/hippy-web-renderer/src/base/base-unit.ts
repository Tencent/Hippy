import { HippyWebEngineContext } from './context';

export class HippyWebUnit {
  context?: HippyWebEngineContext;
  name = '';
  constructor() {
  }
}

export class HippyWebModule extends HippyWebUnit {
  context: HippyWebEngineContext;
  mode: 'sequential' | 'normal' = 'normal';
  constructor(context: HippyWebEngineContext) {
    super();
    this.context = context;
  }
  init?: () => void;
}

export class HippyWebComponent extends HippyWebUnit {

}

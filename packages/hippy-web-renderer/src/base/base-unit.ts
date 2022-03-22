import { HippyWebEngineContext } from './context';

export class HippyWebUnit {
  name = '';
}

export class HippyWebModule extends HippyWebUnit {
  context: HippyWebEngineContext;
  mode: 'sequential' | 'normal' = 'normal';
  constructor(context: HippyWebEngineContext) {
    super();
    this.context = context;
  }
  init() { };
}
export class HippyWebComponent extends HippyWebUnit {

}

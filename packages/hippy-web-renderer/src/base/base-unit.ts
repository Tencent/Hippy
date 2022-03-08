import { HippyWebEngineContext } from "./context";

export class HippyWebUnit {
  context?: HippyWebEngineContext;
  name: string = '';
  constructor() {
  }
}

export class HippyWebModule extends HippyWebUnit {
  context: HippyWebEngineContext;
  constructor(context: HippyWebEngineContext) {
    super();
    this.context = context;
  }
  init?: () => void;

}

export class HippyWebComponent extends HippyWebUnit {

}

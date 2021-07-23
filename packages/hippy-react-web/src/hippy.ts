import React, { FunctionComponent, ComponentClass } from 'react';
import ReactDOM from 'react-dom';
import { warn } from './utils';
import * as Native from './native';

interface HippyReactConfig {
  appName: string;
  entryPage: string | FunctionComponent<any> | ComponentClass<any, any>;
  container?: Element | null;
}

interface HippyReact {
  config: HippyReactConfig;
  rootContainer: Element | null;
  regist: () => void;
}

class HippyReact implements HippyReact {
  // version
  static version = process.env.HIPPY_REACT_WEB_VERSION;

  // Native methods
  static get Native() {
    warn('HippyReact.Native interface is not stable yet. DO NOT USE IT');
    return Native;
  }

  constructor(config: HippyReactConfig) {
    if (typeof config !== 'object' || !config.appName || !config.entryPage) {
      throw new TypeError('Invalid arguments');
    }
    this.config = config;
    if (!this.config.container) {
      this.config.container = document.getElementById('root');
    }
    this.regist = this.start; // Forward compatible alias
  }

  start(superProps = {}) {
    const { container, entryPage } = this.config;
    if (!entryPage || !container) {
      throw new Error('container and entryPage are both required for hippy-react');
    }
    ReactDOM.render(
      React.createElement(entryPage, superProps),
      container,
    );
  }
}

export default HippyReact;

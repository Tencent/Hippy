import React from 'react';
import ReactDOM from 'react-dom';

interface HippyInstanceConfig {
  appName: string;
  entryPage: React.ReactNode;
  container: Element;
}

interface Hippy {
  config: HippyInstanceConfig;
  rootContainer: any;
  regist: () => void;
}

class Hippy implements Hippy {
  constructor(config: HippyInstanceConfig) {
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
    ReactDOM.render(
      React.createElement(entryPage, superProps),
      container,
    );
  }
}

export default Hippy;

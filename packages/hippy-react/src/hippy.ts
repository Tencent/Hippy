import React, { FunctionComponent, ComponentClass } from 'react';
import Document from './dom/document-node';
import renderer from './renderer';
import { HippyRegister } from './native';
import { setRootContainer } from './utils/node';
import { trace, setSilent } from './utils';

const {
  createContainer,
  updateContainer,
  getPublicRootInstance,
} = renderer;

interface HippyInstanceConfig {
  /**
   * Hippy app name, it's will register to `__GLOBAL__.appRegister` object,
   * waiting the native load instance event for start the app.
   */
  appName: string;

  /**
   * Entry component of Hippy app.
   */
  entryPage: string | FunctionComponent<any> | ComponentClass<any, any>;

  /**
   * Disable trace output
   */
  silent?: boolean;

  /**
   * The callback after rendering.
   */
  callback?: () => void | undefined | null;
}

interface SuperProps {
  __instanceId__: number;
}

const componentName = ['%c[Hippy-React process.env.HIPPY_REACT_VERSION]%c', 'color: #61dafb', 'color: auto'];

interface Hippy {
  config: HippyInstanceConfig;
  rootContainer: any;
  // Keep foward comaptatble.
  regist: () => void;
}

class Hippy implements Hippy {
  /**
   * Create new Hippy instance
   *
   * @param {Object} config - Hippy config.
   * @param {string} config.appName - The name of Hippy app.
   * @param {Component} config.entryPage - The Entry page of Hippy app.
   * @param {function} config.callback - The callback after rendering.
   */
  constructor(config: HippyInstanceConfig) {
    if (!config.appName || !config.entryPage) {
      throw new TypeError('Invalid arguments');
    }
    this.config = config;
    this.regist = this.start; // Forward compatible alias
    this.render = this.render.bind(this);

    // Start Render
    const rootDocument = new Document();
    this.rootContainer = createContainer(rootDocument, false, false);
  }

  /**
   * Start hippy app execution.
   */
  public start() {
    HippyRegister.regist(this.config.appName, this.render);
  }

  /**
   * Native rendering callback
   */
  private render(superProps: SuperProps) {
    const {
      appName,
      entryPage,
      silent = false,
      callback = () => {},
    } = this.config;
    const { __instanceId__: rootViewId } = superProps;
    trace(...componentName, 'Start', appName, 'with rootViewId', rootViewId, superProps);

    // Update nodeId for contaienr
    this.rootContainer.containerInfo.nodeId = rootViewId;
    if (silent) {
      setSilent(silent);
    }

    // Save the root container
    setRootContainer(rootViewId, this.rootContainer);

    // Render to screen.
    const rootElement = React.createElement(entryPage, superProps);
    updateContainer(rootElement, this.rootContainer, null, callback);
    return getPublicRootInstance(this.rootContainer);
  }
}

export default Hippy;

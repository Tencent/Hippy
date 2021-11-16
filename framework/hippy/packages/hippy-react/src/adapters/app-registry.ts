import { Component } from 'react';
import Hippy from '../hippy';

const AppRegistry = {
  registerComponent(appName: string, entryPage: typeof Component) {
    const hippy = new Hippy({
      appName,
      entryPage,
    });
    hippy.start();
  },
};

export default AppRegistry;

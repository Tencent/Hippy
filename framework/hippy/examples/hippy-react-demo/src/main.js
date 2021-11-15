import { Hippy } from '@hippy/react';
import App from './app';

new Hippy({
  appName: 'Demo',
  entryPage: App,
  // set bubbles, default is false
  bubbles: true,
  // set log output, default is false
  silent: false,
}).start();

import { Hippy } from '@hippy/react';
import App from './app';

global.Hippy.on('uncaughtException', (err) => {
  console.error('uncaughtException error', err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on('unhandledRejection', (err) => {
  console.error('unhandledRejection error', err.stack, err.message);
});

new Hippy({
  appName: 'Demo',
  entryPage: App,
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();

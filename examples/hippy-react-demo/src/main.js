import { ConsoleModule, Hippy, NetworkModule } from '@hippy/react';
import App from './app';
import {
  getTurboConfig,
  printTurboConfig,
} from './externals/Turbo/demoTurbo';

global.Hippy.on('uncaughtException', (err) => {
  console.error('uncaughtException error', err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection reason', reason);
});

global.Hippy.on('destroyInstance', () => {
  console.error('on Hippy destroyInstance !!!');
  // test call turbo module
  printTurboConfig(getTurboConfig());
  // test call c++ module
  ConsoleModule.log('on Hippy destroyInstance !!!');
  // test call native module
  NetworkModule.setCookie('https://hippyjs.org', 'name=hippy;network=mobile');
});

new Hippy({
  appName: 'Demo',
  entryPage: App,
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();

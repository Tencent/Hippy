import { Hippy } from '@hippy/react';
import App from './app';
import '../public/index.css';

new Hippy({
  appName: 'Demo',
  entryPage: App,
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();

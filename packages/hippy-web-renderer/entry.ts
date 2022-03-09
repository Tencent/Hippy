import { HippyWebEngine } from './src';
import {MODULES} from './src/module';
(async () => {
  const engine = HippyWebEngine.create({
    modules: [
      // TODO: add
      ...MODULES
    ],
    components: [

    ]
  });


  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/Gallery' }
  });

})();

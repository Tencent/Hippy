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

  await engine.load([
                      'http://localhost:38988/index.bundle?platform=android&dev=1&hot=1&minify=0',
                    ]);

  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/Gallery' }
  });

})();

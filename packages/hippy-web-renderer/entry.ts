import { HippyWebEngine } from './src';

(async () => {
  const engine = HippyWebEngine.create({
    modules: [
      UIMana
    ]
  });



  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/Gallery' }
  });

})();

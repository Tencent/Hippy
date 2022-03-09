import { HippyWebEngine } from './src';

(async () => {
  const engine = HippyWebEngine.create({
    modules: [
      // TODO: add

    ],
    components: [

    ]
  });

  // TODO: add business js bundle

  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/Gallery' }
  });

})();

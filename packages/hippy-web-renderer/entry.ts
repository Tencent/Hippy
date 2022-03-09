import { HippyWebEngine } from './src';

(async () => {
  const engine = HippyWebEngine.create({
    modules: [
      // TODO: add

    ],
    components: [

    ]
  });

  await engine.load([
                      'https://camp.qq.com/test/hippy/vendor.android.js',
                    ]);

  await engine.load([
                      'https://camp.qq.com/test/hippy/index.android.js',
                    ]);

  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/Gallery' }
  });

})();

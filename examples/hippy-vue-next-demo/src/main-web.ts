import {
  HippyWebEngine,
} from '@hippy/web-renderer';

const engine = HippyWebEngine.create({
  modules: {},
  components: {},
});

import('./main-native').then(() => {
  engine.start({
    id: 'app',
    name: 'Demo',
    params: {
      path: '/home',
      business: 'Demo',
      data: {
        username: 'test', // Example of passing parameters
      },
    },
  });
});

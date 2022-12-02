import {
  HippyWebEngine,
} from '@hippy/web-renderer';

import './main-native';

const engine = HippyWebEngine.create({
  modules: {},
  components: {},
});

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

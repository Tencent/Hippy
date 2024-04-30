import {
  HippyWebEngine,
} from '@hippy/web-renderer';
import './main';

const engine = HippyWebEngine.create({
  modules: {},
  components: {},
});


engine.start({
  id: 'root',
  name: 'Demo',
  params: {
    path: '/home',
    business: 'Demo',
    data: {
      username: 'test', // Example of passing parameters
    },
  },
});

import {
  HippyWebEngine,
} from '@tencent/camp-hippy-web-renderer';
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
      username: 'test', // 传参 例子
    },
  },
});

import {
  HippyWebEngine,
} from '@tencent/camp-hippy-web-renderer';
import './main';
import { getAllUrlParams } from './main.web.utils';


const params = getAllUrlParams();
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
    data: { ...params },
  },
});
setTimeout(() => {
  engine.context.sendEvent('lifecycle', { type: 'lifecycle_resume' });
}, 16);


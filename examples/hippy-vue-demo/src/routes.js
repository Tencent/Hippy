import Menu from './pages/menu.vue';
import demos from './components/demos';
import nativeDemos from './components/native-demos';
import RemoteDebug from './pages/remote-debug.vue';

export default {
  /**
   * 阻止 Android 上 Back 键触发页面返回
   * 默认值为 false，就是开启 Back 键返回。
   */
  disableAutoBack: false,

  /**
   * 定义路由
   * 这里偷了个懒直接做了个大数组，跟 Menu.vue 里互相匹配动态加载。
   */
  routes: [
    {
      path: '/',
      component: Menu,
    },
    {
      path: '/remote-debug',
      component: RemoteDebug,
      name: '调试',
    },
    ...Object.keys(demos).map(demoId => ({
      path: `/demo/${demoId}`,
      name: demos[demoId].name,
      component: demos[demoId].component,
    })),
    ...Object.keys(nativeDemos).map(demoId => ({
      path: `/demo/${demoId}`,
      name: nativeDemos[demoId].name,
      component: nativeDemos[demoId].component,
    })),
  ],
};

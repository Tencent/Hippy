

import * as components from './components';
import * as modules from './modules';
import * as externals from './externals';

const PAGE_LIST = {
  ...components,
  ...modules,
  ...externals,
};

export default [
  {
    path: '/View',
    name: 'View 组件',
    component: PAGE_LIST.View,
    meta: {
      style: 1,
    },
  },
  {
    path: '/Clipboard',
    name: 'Clipboard 组件',
    component: PAGE_LIST.Clipboard,
    meta: {
      style: 1,
    },
  },
  {
    path: '/Text',
    name: 'Text 组件',
    component: PAGE_LIST.Text,
    meta: {
      style: 1,
    },
  },
  {
    path: '/Image',
    name: 'Image 组件',
    component: PAGE_LIST.Image,
    meta: {
      style: 1,
    },
  },
  {
    path: '/ListView',
    name: 'ListView 组件',
    component: PAGE_LIST.ListView,
    meta: {
      style: 1,
    },
  },
  {
    path: '/PullHeader',
    name: 'PullHeader 组件',
    component: PAGE_LIST.PullHeader,
    meta: {
      style: 1,
    },
  },
  {
    path: '/RefreshWrapper',
    name: 'RefreshWrapper 组件',
    component: PAGE_LIST.RefreshWrapper,
    meta: {
      style: 1,
    },
  },
  {
    path: '/ScrollView',
    name: 'ScrollView 组件',
    component: PAGE_LIST.ScrollView,
    meta: {
      style: 1,
    },
  },
  {
    path: '/ViewPager',
    name: 'ViewPager 组件',
    component: PAGE_LIST.ViewPager,
    meta: {
      style: 1,
    },
  },
  {
    path: '/TextInput',
    name: 'TextInput 组件',
    component: PAGE_LIST.TextInput,
    meta: {
      style: 1,
    },
  },
  {
    path: '/Modal',
    name: 'Modal 组件',
    component: PAGE_LIST.Modal,
    meta: {
      style: 1,
    },
  },
  {
    path: '/Slider',
    name: 'Slider 组件',
    component: PAGE_LIST.Slider,
    meta: {
      style: 1,
    },
  },
  {
    path: '/TabHost',
    name: 'TabHost 组件',
    component: PAGE_LIST.TabHost,
    meta: {
      style: 1,
    },
  },
  {
    path: '/WebView',
    name: 'WebView 组件',
    component: PAGE_LIST.WebView,
    meta: {
      style: 1,
    },
  },
  {
    path: '/MyView',
    name: 'MyView 组件',
    component: PAGE_LIST.MyView,
    meta: {
      style: 1,
    },
  },
  {
    path: '/SetNativeProps',
    name: 'setNativeProps能力',
    component: PAGE_LIST.SetNativeProps,
    meta: {
      style: 1,
    },
  },
  {
    path: '/WebSocket',
    name: 'WebSocket 模块',
    component: PAGE_LIST.WebSocket,
    meta: {
      style: 2,
    },
  },
  {
    path: '/Animation',
    name: 'Animation 组件',
    component: PAGE_LIST.Animation,
    meta: {
      style: 2,
    },
  },
  {
    path: '/NetInfo',
    name: 'NetInfo 能力',
    component: PAGE_LIST.NetInfo,
    meta: {
      style: 2,
    },
  },
  {
    path: '/UIManagerModule',
    name: 'UIManagerModule 模块',
    component: PAGE_LIST.UIManagerModule,
    meta: {
      style: 2,
    },
  },
];

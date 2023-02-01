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
    path: '/BoxShadow',
    name: 'BoxShadow 范例',
    component: PAGE_LIST.BoxShadow,
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
    path: '/WaterfallView',
    name: 'WaterfallView 组件',
    component: PAGE_LIST.WaterfallView,
    meta: {
      style: 1,
    },
  },
  {
    path: '/PullHeader',
    name: 'PullHeader/Footer组件',
    component: PAGE_LIST.PullHeaderFooter,
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
    path: '/NestedScroll',
    name: 'Nested Scroll 示例',
    component: PAGE_LIST.NestedScroll,
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
    path: '/RippleViewAndroid',
    name: 'RippleViewAndroid 组件',
    component: PAGE_LIST.RippleViewAndroid,
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
    name: 'Network 能力',
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
  {
    path: '/SetNativeProps',
    name: 'setNativeProps能力',
    component: PAGE_LIST.SetNativeProps,
    meta: {
      style: 2,
    },
  },
  {
    path: '/DynamicImport',
    name: 'DynamicImport 能力',
    component: PAGE_LIST.DynamicImport,
    meta: {
      style: 2,
    },
  },
  {
    path: '/Localization',
    name: 'Localization 信息',
    component: PAGE_LIST.Localization,
    meta: {
      style: 2,
    },
  },
  {
    path: '/Turbo',
    name: 'Turbo',
    component: PAGE_LIST.Turbo,
    meta: {
      style: 2,
    },
  },
];

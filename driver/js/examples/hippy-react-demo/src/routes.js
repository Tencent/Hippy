import * as components from './components';
import * as modules from './modules';
import * as externals from './externals';

const PAGE_LIST = {
  ...components,
  ...modules,
  ...externals,
};

export const Type = {
  TITLE: 0,
  COMPONENT: 1,
  MODULE: 2,
  OTHER: 3,
};

export default [
  {
    path: '/Components',
    name: 'Componemts',
    meta: {
      type: Type.TITLE,
      mapType: Type.COMPONENT,
    },
  },
  {
    path: '/View',
    name: '<View> 组件',
    component: PAGE_LIST.View,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/Text',
    name: '<Text> 组件',
    component: PAGE_LIST.Text,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/Image',
    name: '<Image> 组件',
    component: PAGE_LIST.Image,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/ListView',
    name: '<ListView> 组件',
    component: PAGE_LIST.ListView,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/WaterfallView',
    name: '<WaterfallView> 组件',
    component: PAGE_LIST.WaterfallView,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/PullHeader',
    name: '<PullHeader/Footer> 组件',
    component: PAGE_LIST.PullHeaderFooter,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/RefreshWrapper',
    name: '<RefreshWrapper> 组件',
    component: PAGE_LIST.RefreshWrapper,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/ScrollView',
    name: '<ScrollView> 组件',
    component: PAGE_LIST.ScrollView,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/ViewPager',
    name: '<ViewPager> 组件',
    component: PAGE_LIST.ViewPager,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/TextInput',
    name: '<TextInput> 组件',
    component: PAGE_LIST.TextInput,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/Modal',
    name: '<Modal> 组件',
    component: PAGE_LIST.Modal,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/Slider',
    name: '<Slider> 组件',
    component: PAGE_LIST.Slider,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/TabHost',
    name: '<TabHost> 组件',
    component: PAGE_LIST.TabHost,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/WebView',
    name: '<WebView> 组件',
    component: PAGE_LIST.WebView,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/RippleViewAndroid',
    name: '<RippleViewAndroid> 组件',
    component: PAGE_LIST.RippleViewAndroid,
    meta: {
      type: Type.COMPONENT,
    },
  },
  {
    path: '/Moduels',
    name: 'Modules',
    meta: {
      type: Type.TITLE,
      mapType: Type.MODULE,
    },
  },
  {
    path: '/Animation',
    name: 'Animation 模块',
    component: PAGE_LIST.Animation,
    meta: {
      type: Type.MODULE,
    },
  },
  {
    path: '/WebSocket',
    name: 'WebSocket 模块',
    component: PAGE_LIST.WebSocket,
    meta: {
      type: Type.MODULE,
    },
  },
  {
    path: '/NetInfo',
    name: 'Network 模块',
    component: PAGE_LIST.NetInfo,
    meta: {
      type: Type.MODULE,
    },
  },
  {
    path: '/UIManagerModule',
    name: 'UIManagerModule 模块',
    component: PAGE_LIST.UIManagerModule,
    meta: {
      type: Type.MODULE,
    },
  },
  {
    path: '/Others',
    name: 'Others',
    meta: {
      type: Type.TITLE,
      mapType: Type.OTHER,
    },
  },
  {
    path: '/NestedScroll',
    name: 'NestedScroll 范例',
    component: PAGE_LIST.NestedScroll,
    meta: {
      type: Type.OTHER,
    },
  },
  {
    path: '/BoxShadow',
    name: 'BoxShadow 范例',
    component: PAGE_LIST.BoxShadow,
    meta: {
      type: Type.OTHER,
    },
  },
  {
    path: '/SetNativeProps',
    name: 'setNativeProps 范例',
    component: PAGE_LIST.SetNativeProps,
    meta: {
      type: Type.OTHER,
    },
  },
  {
    path: '/DynamicImport',
    name: 'DynamicImport 范例',
    component: PAGE_LIST.DynamicImport,
    meta: {
      type: Type.OTHER,
    },
  },
  {
    path: '/Localization',
    name: 'Localization 范例',
    component: PAGE_LIST.Localization,
    meta: {
      type: Type.OTHER,
    },
  },
  {
    path: '/Turbo',
    name: 'Turbo 范例',
    component: PAGE_LIST.Turbo,
    meta: {
      type: Type.OTHER,
    },
  },
];

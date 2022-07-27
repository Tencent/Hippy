import {
  type Component,
  type ComponentPublicInstance,
  type App,
  createRenderer,
} from '@vue/runtime-core';
import type { CssDeclarationType, CssNodeType } from '@next-css-loader/index';
import { BackAndroid } from './android-back';
import BuiltInComponent from './built-in-component';
import { drawIphoneStatusBar } from './iphone';
import HippyNativeComponents from './native-component';
import { nodeOps } from './node-ops';
import { patchProp } from './patch-prop';
import { HippyDocument } from './runtime/document/hippy-document';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyInputElement } from './runtime/element/hippy-input-element';
import type { HippyListElement } from './runtime/element/hippy-list-element';
import { EventBus } from './runtime/event/event-bus';
import type { HippyEvent } from './runtime/event/hippy-event';
import { Native } from './runtime/native';
import type { NativeApiType } from './runtime/native';
import './runtime/event/hippy-event-dispatcher';
import './runtime/websocket/websocket';
import { NativeInterfaceMap } from './runtime/native/modules';
import type { HippyNode } from './runtime/node/hippy-node';
import { setBeforeLoadStyle } from './util';
import type { HippyCachedInstanceType } from './util/instance';
import {
  getHippyCachedInstance,
  setHippyCachedInstance,
  setHippyCachedInstanceParams,
} from './util/instance';
import { setScreenSize } from './util/screen';

/**
 * Hippy App 类型，对 Vue 的 mount 方法进行重载
 *
 * @public
 */
export type HippyApp = App & {
  $start: () => Promise<{ superProps: any }>;
};

/**
 * Iphone额外配置信息
 *
 * @public
 */
export interface IphoneOptions {
  // 状态栏配置
  statusBar?: {
    // 禁用状态栏自动填充
    disabled?: boolean;

    // 状态栏背景色，如果不配的话，会用 4282431619，也就是 #40b883 - Vue 的绿色
    // 因为运行时只支持样式和属性的实际转换，所以需要用下面的转换器将颜色值提前转换，可以在 Node 中直接运行。
    // hippy-vue-css-loader/src/compiler/style/color-parser.js
    // backgroundColor: 4294309626,
    backgroundColor?: number;

    // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
    backgroundImage?: string;
  };
}

/**
 * 创建Hippy App的参数类型
 *
 * @public
 */
export interface HippyAppOptions {
  // Hippy终端注册的app名称，需要向Hippy方申请
  appName: string;
  // iPhone配置
  iPhone?: IphoneOptions;
  // 样式配置
  styleOptions?: {
    // 样式加载的钩子方法
    beforeLoadStyle?: (decl: CssDeclarationType) => CssDeclarationType;
    // 屏幕宽度比例计算 base 值，默认750，这样对于rem的情况，设计稿基于多少的，就直接写即可
    ratioBaseWidth?: number;
  };
}

// 设计稿基准宽度
const defaultRatioBaseWidth = 750;

/**
 * 设置iOS的状态栏
 *
 * @param options - hippy app 初始化参数
 * @param instance - Vue app 实例
 */
function setIOSNativeBar(
  options: HippyAppOptions,
  instance: ComponentPublicInstance,
) {
  // 如果是iOS，则需要设置iPhone的状态栏
  if (Native.isIOS()) {
    const statusBar = drawIphoneStatusBar(options);
    if (statusBar) {
      const rootNode = instance.$el.parentNode;

      if (!rootNode.childNodes.length) {
        rootNode.appendChild(statusBar);
      } else {
        rootNode.insertBefore(statusBar, rootNode.childNodes[0]);
      }
    }
  }
}

/**
 * 创建根节点
 */
function createRootNode(rootContainer: string): HippyNode {
  // 创建root container，作为整个hippy树的根
  // 类似Dom中的document.getElementById('root')拿到的root container
  const root: HippyElement = HippyDocument.createElement('div');
  // 将节点id设为options传入的rootView
  root.id = rootContainer;
  // 根节点 flex 默认设置为 1
  root.style.flex = 1;

  return root;
}

/**
 * 创建 Hippy Vue 实例，成功后返回 Vue App 和 全局初始化参数
 *
 * @param vueRootComponent - vue根组件的实例
 * @param options - hippy-vue初始化参数对象
 *
 * @public
 */
export const createHippyApp = (
  vueRootComponent: Component,
  options: HippyAppOptions,
): HippyApp => {
  // 创建自定义渲染器，并得到vue app实例
  const app: App = createRenderer({
    patchProp,
    ...nodeOps,
  }).createApp(vueRootComponent);
  // hippy app 实例
  const hippyApp: HippyApp = app as HippyApp;

  // 注册内置标签组件，如div，span等，使HippyNode能够支持内置标签
  // 这些内置标签vue会当作原生标签传给hippy，然后这里将其转为Native
  // 认识的组件类型，以及注册默认属性和额外的事件处理等
  hippyApp.use(BuiltInComponent);

  // 注册终端组件，如waterfall等，因为vue并不认识这些组件，因此需要将其注册为vue component
  // 然后转成hippy支持的组件格式
  hippyApp.use(HippyNativeComponents);

  if (typeof options?.styleOptions?.beforeLoadStyle === 'function') {
    // 如果设置了样式加载钩子，则保存自定义的样式加载钩子
    setBeforeLoadStyle(options.styleOptions.beforeLoadStyle);
  }

  // 保存原 mount 方法
  const { mount } = hippyApp;

  // 重写 vue 的 mount，做一些 hippy 的工作
  hippyApp.mount = (rootContainer) => {
    // 这里要先缓存rootContainer，因为创建节点需要判断是否是根节点
    setHippyCachedInstanceParams('rootContainer', rootContainer);
    // 创建根节点作为container
    const root = createRootNode(rootContainer);
    // mount vue，得到vue渲染后的实例
    const instance = mount(root, false, false);
    // 缓存Vue的component实例
    setHippyCachedInstanceParams('instance', instance);
    // 进行iOS状态栏设置
    setIOSNativeBar(options, instance);

    return instance;
  };

  // 返回 HippyApp 实例
  hippyApp.$start = async () => new Promise((resolve) => {
    // 调用Native提供的接口注册hippy
    Native.hippyNativeRegister.regist(
      options.appName,
      (superProps: any) => {
        // 获取终端传入的初始化参数，登录态参数等
        const { __instanceId__: rootViewId } = superProps;

        // 刷新app时需要先移除旧实例
        const oldInstance = getHippyCachedInstance();
        if (oldInstance?.app) {
          // 如果有安装了实例，则先卸载
          oldInstance.app.unmount();
        }

        // 将初始化参数等缓存
        setHippyCachedInstance({
          rootViewId, // Native初始化的根view的id，用于Native节点操作等
          superProps, // Native传入的项目初始化参数
          // 业务传入的模版的根节点的id，一般是root，用来创建container的id，业务方注意需要给rootView写样式
          app: hippyApp, // Vue的app实例
          ratioBaseWidth:
              options?.styleOptions?.ratioBaseWidth ?? defaultRatioBaseWidth, // 设计稿基准宽度
        });

        // 初始化完成，将mount实例返回
        resolve({
          superProps,
        });
      },
    );
  });

  // 返回 hippy vue app
  return hippyApp;
};

// 导出供外部使用的类型
export type {
  NativeApiType,
  HippyCachedInstanceType,
  HippyEvent,
  HippyElement,
  HippyNode,
  HippyInputElement,
  HippyListElement,
  CssNodeType,
};

// 导出配置方法
export * from './config';

// 导出外部调用的方法
export {
  EventBus,
  Native,
  BackAndroid,
  NativeInterfaceMap,
  setScreenSize,
};

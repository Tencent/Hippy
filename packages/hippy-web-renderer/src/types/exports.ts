import { HippyTransferData } from './hippy-internal-types';

export interface UIProps {
  [key: string]: any
}

export interface BaseView {
  tagName: InnerNodeTag|string;
  id: number;
  pId: number;
  index: number;
  props: UIProps;
  dom: HTMLElement|null;
  onAttachedToWindow?: () => void;
  onLayout?: () => void;
  updateProps?: (data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) => void;
  beforeMount?: (parent: BaseView, position: number) => Promise<void>;
  beforeChildMount?: (child: BaseView, childPosition: number) => Promise<void>;
  beforeRemove?: () => Promise<void>;
  beforeChildRemove?: (child: BaseView) => void;
  insertChild?: (child: BaseView, childPosition: number) => void;
  removeChild?: (child: BaseView) => void;
  destroy?: () => void;
  mounted?: () => void;
}

export type BaseViewConstructor = new (context: ComponentContext, id, pId) => BaseView;

export type HippyCallBack={resolve: (params: any) => void, reject: (params: any) => void };

export interface NodeData {
  id: number,
  pId: number,
  props: any,
  index: number,
  name: string,
}

export interface ModuleContext {
  receiveNativeEvent: (eventName: string, params: any) => void
  getModuleByName: (moduleName: string) => any|null
}

export interface BaseModule {
  initialize?: () => void;
  destroy?: () => void;
}

export interface ComponentContext {
  sendEvent: (type: string, params: any) => void;
  sendUiEvent: (nodeId: number, type: string, params: any) => void;
  sendGestureEvent: (e: HippyTransferData.NativeGestureEvent) => void;
  subscribe: (evt: string, callback: Function) => void;
  getModuleByName: (moduleName: string) => void;
}

export type BaseModuleConstructor = new (context: ModuleContext) => BaseModule;

export enum InnerNodeTag {
  VIEW = 'View',
  TEXT = 'Text',
  IMAGE = 'Image',
  LIST_ITEM = 'ListViewItem',
  LIST = 'ListView',
  REFRESH = 'RefreshWrapper',
  REFRESH_ITEM = 'RefreshWrapperItemView',
  SCROLL_VIEW = 'ScrollView',
  VIEW_PAGER = 'ViewPager',
  VIEW_PAGER_ITEM = 'ViewPagerItem',
  TEXT_INPUT = 'TextInput',
  MODAL = 'Modal',
  WEB_VIEW = 'WebView'
}

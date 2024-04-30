/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HippyTransferData } from './hippy-internal-types';

export interface UIProps {
  [key: string]: any
}
export type DefaultPropsProcess = (component: HippyBaseView, data: UIProps) => void;
export interface HippyBaseView {
  tagName: InnerNodeTag|string;
  id: number;
  pId: number;
  index: number;
  props: UIProps;
  dom: HTMLElement|null;
  onAttachedToWindow?: () => void;
  onLayout?: boolean;
  updateProps?: (data: UIProps, defaultProcess: DefaultPropsProcess) => void;
  updateProperty?: (key: string, value: any) => void;
  beforeMount?: (parent: HippyBaseView, position: number) => Promise<void>;
  beforeChildMount?: (child: HippyBaseView, childPosition: number) => Promise<void>;
  beforeRemove?: () => Promise<void>;
  beforeChildRemove?: (child: HippyBaseView) => void;
  insertChild?: (child: HippyBaseView, childPosition: number) => void;
  removeChild?: (child: HippyBaseView) => Promise<void>;
  destroy?: () => void;
  mounted?: () => void;
}

export type HippyBaseViewConstructor = new (context: ComponentContext, id, pId) => HippyBaseView;

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
  sendUiEvent: (id: number, type: string, params: any) => void;
  sendGestureEvent: (e: HippyTransferData.NativeGestureEvent) => void;
  subscribe: (evt: string, callback: Function) => void;
  getModuleByName: (moduleName: string) => any;
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

/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import { HippyWebEngineContext, HippyWebModule } from '../base';
import {
  HippyBaseView, HippyCallBack,
  InnerNodeTag,
  NodeData,
  UIProps,
} from '../types';
import { setElementStyle } from '../common';

export class UIManagerModule extends HippyWebModule {
  public name = 'UIManagerModule';

  private viewDictionary: { [key in string | number]: HippyBaseView } = {};
  private rootDom: HTMLElement | undefined;
  private contentDom: HTMLElement | undefined;
  constructor(context) {
    super(context);
    this.mode = 'sequential';
  }

  public init() {
    this.stylePolyfill();
  }

  public destroy() {

  }

  public startBatch() {

  }

  public async createNode(rootViewId: any, data: Array<NodeData>) {
    if (!this.rootDom) {
      this.rootDom = document.getElementsByTagName('body')[0];
    }
    if (!window.document.getElementById(rootViewId)) {
      this.contentDom = this.createRoot(rootViewId);
      this.rootDom?.appendChild(this.contentDom);
      this.viewDictionary[rootViewId] = {
        id: rootViewId as number, pId: -1, index: this.rootDom.childNodes.length,
        props: {}, dom: this.contentDom, tagName: 'View',
      };
    }
    const theUpdateComponentIdSet = new Set;
    for (let c = 0; c < data.length; c++) {
      const nodeItemData = data[c];
      const { id } = nodeItemData;
      const { pId } = nodeItemData;
      const { index } = nodeItemData;
      const tagName = nodeItemData.name;
      const { props } = nodeItemData;
      const component = mapComponent(this.context, tagName, id, pId);
      if (!component) {
        debugger;
        throw `create component failed, can't find ${tagName}' constructor`;
      }
      if (theUpdateComponentIdSet.has(id)) {
        continue;
      }
      if (tagName === InnerNodeTag.LIST) {
        theUpdateComponentIdSet.add(id);
      }
      if (this.findViewById(pId)?.tagName === InnerNodeTag.LIST) {
        theUpdateComponentIdSet.add(pId);
      }
      await this.componentInitProcess(component, props, index);
    }
    for (const id of theUpdateComponentIdSet) {
      const component = this.findViewById(id as number);
      if (component) {
        (component as any)?.endBatch();
      }
    }
  }

  public async deleteNode(rootViewId: string, data: Array<{ id: number }>) {
    for (let i = 0; i < data.length; i++) {
      const deleteItem = data[i];
      const deleteComponent = this.findViewById(deleteItem.id);
      await this.componentDeleteProcess(deleteComponent);
    }
  }

  public updateNode(rootViewId: string, data: Array<{ id: number, props: UIProps }>) {
    for (let i = 0; i < data.length; i++) {
      const updateItem = data[i];
      const updateComponent = this.findViewById(updateItem.id);
      this.componentUpdateProcess(updateComponent, updateItem.props);
    }
  }

  public flushBatch() {

  }

  public endBatch() {

  }

  public callUIFunction(params: Array<any>, callBack: HippyCallBack) {
    if (!params || params.length < 3) {
      return;
    }
    const [nodeId, functionName, paramList] = params;
    if (!nodeId || !this.findViewById(nodeId)) {
      return;
    }

    this.componentFunctionCallProcess(this.findViewById(nodeId), functionName, paramList, callBack);
  }

  public measureInWindow(nodeId, callBack: HippyCallBack) {
    if (!nodeId || !this.findViewById(nodeId)) {
      return;
    }
    const component = this.findViewById(nodeId);
    if (component!.dom) {
      const rect = component!.dom.getBoundingClientRect();
      callBack.resolve({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        statusBarHeight: 0,
      });
    }
  }

  public findViewById(id: number): HippyBaseView | null {
    if (this.viewDictionary[id]) {
      return this.viewDictionary[id];
    }
    return null;
  }

  public appendChild(parent: HippyBaseView, child: HippyBaseView, index: number) {
    if (parent.dom && child.dom) parent.dom.insertBefore(child.dom, parent.dom!.childNodes[index] ?? null);
    this.viewDictionary[child.id] = child;
  }

  public removeChild(parent: HippyBaseView, childId: number) {
    const childView = this.findViewById(childId);
    if (childView?.dom) {
      parent.dom?.removeChild(childView.dom);
    }
    delete this.viewDictionary[childId];
  }

  public defaultUpdateComponentProps(component: HippyBaseView, props: any) {
    if (props) {
      mergeDeep(component.props, props);
      if (!props) {
        return;
      }
      const keys = Object.keys(props);
      if (props.style) {
        setElementStyle(component.dom!, props.style, (key: string, value: any) => {
          this.animationProcess(key, value, component);
        });
        if (props.style.position === 'absolute' && !this.findViewById(component.pId)?.props?.style?.position) {
          setElementStyle(this.findViewById(component.pId)!.dom!, { position: 'relative' });
        }
      }
      for (const key of keys) {
        if (key === 'style' || key === 'attributes' || key.indexOf('__bind__') !== -1) {
          continue;
        }
        if (typeof component[key] === 'function' && key.indexOf('on') === 0) {
          continue;
        }
        component[key] = props[key];
      }
    }
  }

  private createRoot(id: string) {
    const root = window.document.createElement('div');
    root.setAttribute('id', id);
    root.id = id;
    setElementStyle(root, {
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      width: '100vw',
      flexDirection: 'column',
      position: 'relative',
    });
    return root;
  }

  private updateComponentProps(component: HippyBaseView, props: any) {
    if (component.updateProps) {
      component.updateProps(props, this.defaultUpdateComponentProps.bind(this));
    } else {
      this.defaultUpdateComponentProps(component, props);
    }
  }

  private animationProcess(key: string, value: any, component: HippyBaseView) {
    const animationModule = this.context.getModuleByName('AnimationModule') as any;
    if (!animationModule) {
      return;
    }
    if (value.animationId) {
      animationModule.linkAnimation2Element(value.animationId, component, key);
      return;
    }
    if (key !== 'transform') {
      return;
    }

    const style: any = {};
    let valueString = '';
    for (const item of value) {
      for (const itemKey of Object.keys(item)) {
        if (item[itemKey].animationId) {
          animationModule.linkAnimation2Element(item[itemKey].animationId, component, itemKey);
          continue;
        }
        valueString += `${itemKey}(${item[itemKey]}${isNaN(item[itemKey]) || itemKey === 'scale' ? '' : 'px'}) `;
      }
    }
    style.transform = valueString;
    setElementStyle(component.dom!, style);
  }

  private async componentInitProcess(component: HippyBaseView, props: any, index: number) {
    this.updateComponentProps(component, props);
    const parent = this.findViewById(component.pId);
    if (!parent) {
      return;
    }
    let realIndex = index;
    if (!parent.insertChild && parent.dom?.childNodes?.length !== undefined && index > parent.dom?.childNodes?.length) {
      realIndex = parent.dom?.childNodes?.length;
    }
    await component.beforeMount?.(parent, realIndex);
    await parent.beforeChildMount?.(component, realIndex);
    if (parent.insertChild) {
      parent.insertChild(component, index);
      this.viewDictionary[component.id] = component;
    } else {
      this.appendChild(parent, component, realIndex);
    }
    component.dom!.id = String(component.id);
    component.mounted?.();
  }

  private async componentDeleteProcess(component: HippyBaseView | undefined | null) {
    const parentComponent = component ? this.findViewById(component.pId) : null;
    if (parentComponent) {
      await component!.beforeRemove?.();
      await parentComponent.beforeChildRemove?.(component!);
      if (parentComponent.removeChild) {
        parentComponent.removeChild(component!);
      } else {
        this.removeChild(parentComponent, component!.id);
      }
      component!.destroy?.();
    }
  }

  private componentUpdateProcess(component: HippyBaseView | undefined | null, props: UIProps) {
    if (component) {
      this.updateComponentProps(component, props);
    }
  }

  private componentFunctionCallProcess(
    component: HippyBaseView | undefined | null, callName: string,
    params: Array<any>, callBack: HippyCallBack,
  ) {
    const executeParam = params ?? [];
    if (callName && component?.[callName]) {
      component?.[callName](...executeParam, callBack);
      return;
    }
    throw `call ui function failed,${component?.tagName} component not implement ${callName}()`;
  }

  private stylePolyfill() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '*::-webkit-scrollbar {\n'
      + '  display: none;\n'
      + '}';

    document.getElementsByTagName('head')[0].appendChild(style);
  }
}

function mapComponent(context: HippyWebEngineContext, tagName: string, id: number, pId: number):
HippyBaseView | undefined {
  if (context.engine.components[tagName]) {
    return new context.engine.components[tagName](context, id, pId);
  }
}
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

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

import { HippyWebModule } from '../base';
import {
  BaseView,
  BaseViewConstructor, ComponentContext, HippyCallBack,
  NodeData,
  UIProps,
} from '../../types';
import { setElementStyle } from '../common';

export class UIManagerModule extends HippyWebModule {
  public static moduleName = 'UIManagerModule';
  public name = 'UIManagerModule';

  private viewDictionary: {[key in string|number]: BaseView} = {};
  private rootDom: HTMLElement|undefined;
  private contentDom: HTMLElement|undefined;

  public initialize() {

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
      this.viewDictionary[rootViewId] = { id: rootViewId as number, pId: -1, index: this.rootDom.childNodes.length,
        props: {}, dom: this.contentDom, tagName: 'View' };
    }
    for (let c = 0; c < data.length; c++) {
      const nodeItemData = data[c];
      const { id } = nodeItemData;
      const { pId } = nodeItemData;
      const { index } = nodeItemData;
      const tagName = nodeItemData.name;
      const { props } = nodeItemData;
      const component = mapComponent(this.context, tagName, id, pId);
      if (!component) {
        throw `create component failed, can't find ${tagName}' constructor`;
      }
      await this.componentInitProcess(component, props, index);
    }
  }

  public async deleteNode(rootViewId: string, data: Array<{id: number}>) {
    for (let i = 0; i < data.length; i++) {
      const deleteItem = data[i];
      const deleteComponent = this.findViewById(deleteItem.id);
      await this.componentDeleteProcess(deleteComponent);
    }
  }

  public updateNode(rootViewId: string, data: Array<{id: number, props: UIProps}>) {
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
    if (!nodeId ||  !this.findViewById(nodeId)) {
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

  public findViewById(id: number): BaseView|null {
    if (this.viewDictionary[id]) {
      return this.viewDictionary[id];
    }
    return null;
  }

  public appendChild(parent: BaseView, child: BaseView, index: number) {
    if (parent.dom && child.dom) parent.dom.insertBefore(child.dom, parent.dom!.childNodes[index] ?? null);
    this.viewDictionary[child.id] = child;
  }

  public removeChild(parent: BaseView, childId: number) {
    const childView = this.findViewById(childId);
    if (childView?.dom) {
      parent.dom?.removeChild(childView.dom);
    }
    delete this.viewDictionary[childId];
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

  private updateComponentProps(component: BaseView, props: any) {
    if (component.updateProps) {
      component.updateProps(props, this.defaultUpdateComponentProps.bind(this));
    } else {
      this.defaultUpdateComponentProps(component, props);
    }
  }

  private defaultUpdateComponentProps(component: BaseView, props: any) {
    if (props) {
      Object.assign(component.props, props);
      if (!props) {
        return;
      }
      const keys = Object.keys(props);
      if (props.style) {
        setElementStyle(component.dom!, props.style, (key: string, value: any) => {
          this.animationProcess(key, value, component);
        });
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

  private animationProcess(key: string, value: any,  component: BaseView) {
    const animationModule = this.context.getModuleByName('AnimationModule') as any;
    if (!animationModule) {
      return;
    }
    const style: any = {};
    if (value.animationId) {
      animationModule.linkAnimation2Element(value.animationId, component, key);
      const animationStartValue = animationModule.getAnimationStartValue(value.animationId);
      if (animationStartValue !== null) {
        style[key] = animationStartValue;
      }
    } else if (key === 'transform') {
      let valueString = '';
      for (const item of value) {
        for (const itemKey of Object.keys(item)) {
          if (item[itemKey].animationId) {
            animationModule.linkAnimation2Element(item[itemKey].animationId, component, itemKey);
            const animationStartValue = animationModule.getAnimationStartValue(value.animationId);
            if (animationStartValue !== null) {
              valueString += `${animationStartValue} `;
            }
            continue;
          }
          valueString += `${itemKey}(${item[itemKey]}${isNaN(item[itemKey]) || itemKey === 'scale' ? '' : 'px'}) `;
        }
      }
      style.transform = valueString;
    }
    setElementStyle(component.dom!, style);
  }

  private async componentInitProcess(component: BaseView, props: any, index: number) {
    this.updateComponentProps(component, props);
    const parent = this.findViewById(component.pId);
    if (!parent) {
      return;
    }
    let realIndex = index;
    if (parent.dom?.childNodes?.length !== undefined && index > parent.dom?.childNodes?.length) {
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

  private async componentDeleteProcess(component: BaseView|undefined|null) {
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

  private componentUpdateProcess(component: BaseView|undefined|null, props: UIProps) {
    if (component) {
      this.updateComponentProps(component, props);
    }
  }

  private componentFunctionCallProcess(
    component: BaseView|undefined|null, callName: string,
    params: Array<any>, callBack: HippyCallBack,
  ) {
    const executeParam = params ?? [];
    if (callName && component?.[callName]) {
      component?.[callName](...executeParam, callBack);
      return;
    }
    throw `call ui function failed,${component?.tagName} component not implement ${callName}()`;
  }
}

export const componentDictionary: {
  [key: string]: BaseViewConstructor
} = {};

export function registerComponent(name: string, viewConstructor: BaseViewConstructor) {
  if (componentDictionary[name]) {
    throw `register component error, the name has registered ${name}`;
  }
  componentDictionary[name] = viewConstructor;
}
function mapComponent(context: ComponentContext, tagName: string, id: number, pId: number): BaseView|undefined {
  if (componentDictionary[tagName]) {
    return new componentDictionary[tagName](context, id, pId);
  }
}

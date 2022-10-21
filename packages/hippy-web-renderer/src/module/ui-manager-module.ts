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

import { HippyWebEngineContext, HippyWebModule, HippyWebView } from '../base';
import { HippyBaseView, HippyCallBack, InnerNodeTag, NodeData, UIProps } from '../types';
import { setElementStyle, warn, error } from '../common';


export class UIManagerModule extends HippyWebModule {
  public name = 'UIManagerModule';

  private viewDictionary: { [key in string | number]: HippyBaseView } = {};
  private rootDom: HTMLElement | undefined;
  private contentDom: HTMLElement | undefined;
  private afterCreateAction: Array<() => void> = [];
  constructor(context) {
    super(context);
    this.mode = 'sequential';
  }

  public init() {
    stylePolyfill();
  }

  public startBatch() {}

  public async createNode(rootViewId: any, data: Array<NodeData>) {
    this.createNodePreCheck(rootViewId);
    const updateComponentIdSet = new Set();
    for (let c = 0; c < data.length; c++) {
      const nodeItemData = data[c];
      const { id, pId, index, props, name: tagName } = nodeItemData;
      const component = mapComponent(this.context, tagName, id, pId);
      if (!component) {
        warn(`create component failed, not support the component ${tagName}`);
        continue;
      }
      if (updateComponentIdSet.has(id)) {
        continue;
      }
      if (tagName === InnerNodeTag.LIST || tagName === InnerNodeTag.VIEW_PAGER) {
        updateComponentIdSet.add(id);
      }
      if (this.findViewById(pId)?.tagName === InnerNodeTag.LIST) {
        updateComponentIdSet.add(pId);
      }
      try {
        await this.componentInitProcess(component, props, index);
      } catch (e) {
        error(e);
      }
    }
    for (const id of updateComponentIdSet) {
      const component = this.findViewById(id as number);
      (component as any)?.endBatch();
    }
    this.afterCreateAction.forEach(item => item());
    this.afterCreateAction = [];
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

  public flushBatch() {}

  public endBatch() {}

  public callUIFunction(params: Array<any>, callBack: HippyCallBack) {
    if (!params || params.length < 3) {
      return;
    }
    const [nodeId, functionName, paramList] = params;
    if (!nodeId || !this.findViewById(nodeId)) {
      return;
    }
    componentFunctionCallProcess(this.findViewById(nodeId), functionName, paramList, callBack);
  }

  public measureInWindow(nodeId, callBack: HippyCallBack) {
    if (!nodeId || !this.findViewById(nodeId)?.dom) {
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

  public async removeChild(parent: HippyBaseView, childId: number) {
    const child = this.findViewById(childId);
    const nodeList: string[] = [];
    let currentNode: any;
    currentNode = child!.dom;
    const treeWalker = document.createTreeWalker(
      child!.dom as Node,
      NodeFilter.SHOW_ALL,
      null,
    );

    while (currentNode) {
      currentNode.id && nodeList.push(currentNode.id);
      currentNode = treeWalker.nextNode();
    }

    for (const id of nodeList.reverse()) {
      if (id === String(childId)) {
        continue;
      }
      const willRemoveComponent = this.findViewById(parseInt(id, 10));
      if (!willRemoveComponent) {
        continue;
      }
      await willRemoveComponent.beforeRemove?.();
      this.findViewById(willRemoveComponent.pId)?.beforeChildRemove?.(willRemoveComponent);
      willRemoveComponent.destroy?.();
      delete this.viewDictionary[willRemoveComponent.id];
    }

    if (child?.dom && parent.dom && !parent.removeChild) {
      parent.dom?.removeChild(child.dom);
    }
    delete this.viewDictionary[childId];
  }

  public defaultUpdateComponentProps(component: HippyBaseView, props: any) {
    if (!component.dom) {
      error(`component update props process failed ,component's dom must be exited ${component.tagName ?? ''}`);
    }

    const keys = Object.keys(props);
    if (props.style) {
      const oldPosition = component.props?.style?.position;
      setElementStyle(component.dom!, props.style, (key: string, value: any) => {
        this.animationProcess(key, value, component);
      });
      const parent = this.findViewById(component.pId) as HippyWebView<any>;
      if (props.style.position === 'absolute' && !this.findViewById(component.pId)?.props?.style?.position
        && !parent?.defaultStyle().position) {
        setElementStyle(parent!.dom!, { position: 'relative' });
      }
      if (props.style.position === 'absolute' && !props.style.width && !props.style.height && !props.style.overflow) {
        setElementStyle(component.dom!, { overflow: 'visible' });
      }
      component.updateProperty?.('style', props.style);

      if ((props.style.position === 'absolute' ||  props.style.position === 'relative') && oldPosition !== props.style.position) {
        parent?.changeStackContext(true);
        (component as HippyWebView<any>).updateSelfStackContext(true);
      } else if (oldPosition !== props.style.position && !props.style.position) {
        parent?.changeStackContext(false);
        (component as HippyWebView<any>).updateSelfStackContext(false);
      } else if (parent?.exitChildrenStackContext && props.style.zIndex === undefined) {
        (component as HippyWebView<any>).updateSelfStackContext(true);
      }
    }
    for (const key of keys) {
      if (key === 'style' || key === 'attributes' || key.indexOf('__bind__') !== -1) {
        continue;
      }
      component.updateProperty?.(key, props[key]);
    }
  }

  public addAfterCreateAction(callBack: () => void) {
    this.afterCreateAction.push(callBack);
  }

  private createNodePreCheck(rootViewId: any) {
    if (!this.rootDom) {
      [this.rootDom] = document.getElementsByTagName('body');
    }

    if (!this.contentDom) {
      let position = 0;
      if (!window.document.getElementById(rootViewId)) {
        this.contentDom = createRoot(rootViewId);
        this.rootDom.appendChild(this.contentDom);
        position = this.rootDom.childNodes.length - 1;
      } else {
        this.contentDom = window.document.getElementById(rootViewId)!;
      }
      this.contentDom.parentNode!.childNodes.forEach((item, index) => {
        if (item === this.contentDom) {
          position = index;
        }
      });
      setRootDefaultStyle(this.contentDom);
      this.viewDictionary[rootViewId] = {
        id: rootViewId as number, pId: -1, index: position,
        props: {}, dom: this.contentDom, tagName: 'View',
      };
    }
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
      animationModule.linkInitAnimation2Element(value.animationId, component, key);
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
          animationModule.linkInitAnimation2Element(item[itemKey].animationId, component, itemKey);
          continue;
        }
        valueString += `${itemKey}(${item[itemKey]}${isNaN(item[itemKey]) || itemKey.startsWith('scale') ? '' : 'px'}) `;
      }
    }
    if (!valueString) {
      return;
    }
    style.transform = valueString;
    setElementStyle(component.dom!, style);
  }

  private async componentInitProcess(component: HippyBaseView, props: any, index: number) {
    if (!component.dom) {
      throw Error(`component init process failed ,component's dom must be exit after component create ${component.tagName ?? ''}`);
    }
    const { dom } = component;
    dom.id = String(component.id);
    this.updateComponentProps(component, props);
    const parent = this.findViewById(component.pId);
    if (!parent || !parent.dom) {
      warn(`component init process failed ,component's parent not exist or dom not exist, pid: ${component.pId}`);
      return;
    }
    let realIndex = index;
    if (!parent.insertChild && parent.dom?.childNodes?.length !== undefined && index > parent.dom?.childNodes?.length) {
      realIndex = parent.dom?.childNodes?.length ?? index;
    }
    await component.beforeMount?.(parent, realIndex);
    await parent.beforeChildMount?.(component, realIndex);
    if (parent.insertChild) {
      parent.insertChild(component, index);
      this.viewDictionary[component.id] = component;
    } else {
      this.appendChild(parent, component, realIndex);
    }
    component.mounted?.();
  }

  private async componentDeleteProcess(component: HippyBaseView | undefined | null) {
    const parentComponent = component ? this.findViewById(component.pId) : null;
    if (!parentComponent) {
      return;
    }
    await component!.beforeRemove?.();
    await parentComponent.beforeChildRemove?.(component!);
    if (parentComponent.removeChild) {
      await parentComponent.removeChild(component!);
    } else {
      await this.removeChild(parentComponent, component!.id);
    }
    component!.destroy?.();
    delete this.viewDictionary[component!.id];
  }

  private componentUpdateProcess(component: HippyBaseView | undefined | null, props: UIProps) {
    component && this.updateComponentProps(component, props);
  }
}

function componentFunctionCallProcess(
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

function mapComponent(
  context: HippyWebEngineContext, tagName: string,
  id: number, pId: number,
): HippyBaseView | undefined {
  if (context.engine.components[tagName]) {
    return new context.engine.components[tagName](context, id, pId);
  }
}

function createRoot(id: string) {
  const root = window.document.createElement('div');
  root.setAttribute('id', id);
  root.id = id;
  return root;
}
function setRootDefaultStyle(element: HTMLElement) {
  setElementStyle(element, {
    height: `${window.innerHeight}px`,
    overflow: 'hidden',
    display: 'flex',
    width: '100vw',
    flexDirection: 'column',
    position: 'relative',
  });
}
function stylePolyfill() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '*::-webkit-scrollbar {\n'
    + '  display: none;\n'
    + '}'
    + ' img[src=""],img:not([src]){\n'
    + '     opacity: 0;\n'
    + '     visibility: hidden;\n'
    + ' }';

  document.getElementsByTagName('head')[0].appendChild(style);
}

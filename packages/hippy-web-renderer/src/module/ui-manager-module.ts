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
import { setElementStyle, warn, error, positionAssociate, zIndexAssociate } from '../common';
import { AnimationModule } from './animation-module';

let ENV_STYLE_INIT_FLAG = false;
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
    !ENV_STYLE_INIT_FLAG && stylePolyfill();
    ENV_STYLE_INIT_FLAG = true;
  }

  public async createNode(rootViewId: any, data: Array<NodeData>) {
    this.createNodePreCheck(rootViewId);
    const updateViewIdSet = new Set();
    for (let c = 0; c < data.length; c++) {
      const nodeItemData = data[c];
      const { id, pId, index, props, name: tagName } = nodeItemData;
      const view = mapView(this.context, tagName, id, pId);
      if (!view) {
        warn(`create component failed, not support the component ${tagName}`);
        continue;
      }
      try {
        await this.viewInit(view, props, index);
      } catch (e) {
        error(e);
      }
      if (updateViewIdSet.has(id)) {
        continue;
      }
      if (tagName === InnerNodeTag.LIST || tagName === InnerNodeTag.VIEW_PAGER) {
        updateViewIdSet.add(id);
      }
      if (this.findViewById(pId)?.tagName === InnerNodeTag.LIST) {
        updateViewIdSet.add(pId);
      }
    }
    for (const id of updateViewIdSet) {
      const view = this.findViewById(id as number);
      (view as any)?.endBatch();
    }
    this.afterCreateAction.forEach(item => item());
    this.afterCreateAction = [];
  }

  public async deleteNode(rootViewId: string, data: Array<{ id: number }>) {
    for (let i = 0; i < data.length; i++) {
      const deleteItem = data[i];
      const deleteView = this.findViewById(deleteItem.id);
      await this.viewDelete(deleteView);
    }
  }

  public updateNode(rootViewId: string, data: Array<{ id: number, props: UIProps }>) {
    for (let i = 0; i < data.length; i++) {
      const updateItem = data[i];
      const updateView = this.findViewById(updateItem.id);
      this.viewUpdate(updateView, updateItem.props);
    }
  }

  public callUIFunction(params: Array<any>, callBack: HippyCallBack) {
    if (!params || params.length < 3) {
      return;
    }
    const [nodeId, functionName, paramList] = params;
    if (!nodeId || !this.findViewById(nodeId)) {
      return;
    }
    viewFunctionInvoke(this.findViewById(nodeId), functionName, paramList, callBack);
  }

  public measureInWindow(nodeId, callBack: HippyCallBack) {
    if (!nodeId || !this.findViewById(nodeId)?.dom) {
      return;
    }
    const view = this.findViewById(nodeId);
    if (view!.dom) {
      const rect = view!.dom.getBoundingClientRect();
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
    if (parent.dom && child.dom) {
      parent.dom.insertBefore(child.dom, parent.dom.childNodes[index] ?? null);
    }
    this.viewDictionary[child.id] = child;
  }

  public async removeChild(parent: HippyBaseView, childId: number) {
    const child = this.findViewById(childId);
    const nodeList: number[] = [];
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
      if (id === childId) {
        continue;
      }
      const willRemoveView = this.findViewById(id);
      if (!willRemoveView || willRemoveView === child) {
        continue;
      }
      await willRemoveView.beforeRemove?.();
      this.findViewById(willRemoveView.pId)?.beforeChildRemove?.(willRemoveView);
      willRemoveView.destroy?.();
      delete this.viewDictionary[willRemoveView.id];
    }

    if (child?.dom && parent.dom && !parent.removeChild) {
      parent.dom?.removeChild(child.dom);
    }
    delete this.viewDictionary[childId];
  }

  public defaultUpdateViewProps(view: HippyBaseView, props: any) {
    if (!view.dom) {
      error(`component update props process failed ,component's dom must be exited ${view.tagName ?? ''}`);
    }
    const keys = Object.keys(props);
    const [diffStyle, diffSize] = diffObject(props.style, view.props?.style ?? {});
    if (props.style && diffSize > 0) {
      setElementStyle(view.dom!, diffStyle, (key: string, value: any) => {
        this.animationProcess(key, value, view);
      });
      const parent = this.findViewById(view.pId) as HippyWebView<any>;
      positionAssociate(diffStyle, view, parent);
      const styleCopy = {};
      Object.assign(styleCopy, props.style);
      view.updateProperty?.('style', styleCopy);
      zIndexAssociate(diffStyle, view, parent);
    }
    for (const key of keys) {
      if (key === 'style' || key === 'attributes' || key.indexOf('__bind__') !== -1) {
        continue;
      }
      view.updateProperty?.(key, props[key]);
    }
  }

  public addAfterCreateAction(callBack: () => void) {
    this.afterCreateAction.push(callBack);
  }

  public async viewInit(view: HippyBaseView, props: any, index: number) {
    if (!view.dom) {
      throw Error(`component init process failed ,component's dom must be exit after component create ${view.tagName ?? ''}`);
    }
    const { dom } = view;
    dom.id = String(view.id);
    this.updateViewProps(view, props);
    const parent = this.findViewById(view.pId);
    if (!parent || !parent.dom) {
      warn(`component init process failed ,component's parent not exist or dom not exist, pid: ${view.pId}`);
      return;
    }
    let realIndex = index;
    if (!parent.insertChild && parent.dom?.childNodes?.length !== undefined && index > parent.dom?.childNodes?.length) {
      realIndex = parent.dom?.childNodes?.length ?? index;
    }
    await view.beforeMount?.(parent, realIndex);
    await parent.beforeChildMount?.(view, realIndex);
    if (parent.insertChild) {
      parent.insertChild(view, index);
      this.viewDictionary[view.id] = view;
    } else {
      this.appendChild(parent, view, realIndex);
    }
    view.mounted?.();
  }

  public async viewDelete(view: HippyBaseView | undefined | null) {
    const parentView = view ? this.findViewById(view.pId) : null;
    if (!parentView) {
      return;
    }
    await view!.beforeRemove?.();
    await parentView.beforeChildRemove?.(view!);
    if (parentView.removeChild) {
      await parentView.removeChild(view!);
    } else {
      await this.removeChild(parentView, view!.id);
    }
    view!.destroy?.();
    delete this.viewDictionary[view!.id];
  }

  public viewUpdate(view: HippyBaseView | undefined | null, props: UIProps) {
    view && this.updateViewProps(view, props);
  }

  public updateViewProps(view: HippyBaseView, props: any) {
    if (view.updateProps) {
      view.updateProps(props, this.defaultUpdateViewProps.bind(this));
    } else {
      this.defaultUpdateViewProps(view, props);
    }
  }

  private createNodePreCheck(rootViewId: any) {
    if (!this.rootDom) {
      [this.rootDom] = document.getElementsByTagName('body');
    }

    if (!this.contentDom) {
      let position = 0;
      if (!window.document.getElementById(rootViewId ?? '')) {
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

  private animationProcess(key: string, value: any, view: HippyBaseView) {
    const animationModule = this.context.getModuleByName('AnimationModule') as AnimationModule;
    if (!animationModule) {
      return;
    }
    if (value.animationId) {
      animationModule.linkInitAnimation2Element(value.animationId, view, key);
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
          animationModule.linkInitAnimation2Element(item[itemKey].animationId, view, itemKey);
          continue;
        }
        valueString += `${itemKey}(${item[itemKey]}${isNaN(item[itemKey])
        || itemKey.startsWith('scale') ? '' : 'px'}) `;
      }
    }
    if (!valueString) {
      return;
    }
    style.transform = valueString;
    setElementStyle(view.dom!, style);
  }
}

function viewFunctionInvoke(
  view: HippyBaseView | undefined | null, callName: string,
  params: Array<any>, callBack: HippyCallBack,
) {
  const executeParam = params ?? [];
  if (callName && view?.[callName]) {
    view?.[callName](...executeParam, callBack);
    return;
  }
  throw `call ui function failed,${view?.tagName} component not implement ${callName}()`;
}

function mapView(
  context: HippyWebEngineContext, tagName: string,
  id: number, pId: number,
): HippyBaseView | undefined {
  if (context.engine.components[tagName]) {
    return new context.engine.components[tagName](context, id, pId);
  }
}

function diffObject(newObject: Object, oldObject: Object): [{[prop: string]: any}, number] {
  const diff: {[prop: string]: any} = {};
  let diffSize = 0;
  Object.keys(newObject).forEach((key) => {
    if (!oldObject[key] || oldObject[key] !== newObject[key]) {
      diff[key] = newObject[key];
      diffSize += 1;
    }
  });
  const deleteKeys = Object.keys(newObject).concat(Object.keys(oldObject))
    .filter(v => !Object.keys(oldObject).includes(v));
  deleteKeys.forEach((item) => {
    if (!newObject[item] && oldObject[item] !== undefined) {
      diff[item] = null;
      diffSize += 1;
    }
  });
  return [diff, diffSize];
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

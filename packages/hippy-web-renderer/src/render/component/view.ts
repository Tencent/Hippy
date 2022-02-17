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
import { BaseView, NodeTag, UIProps } from '../../types';
import { setElementStyle } from '../common';
const ViewDictionary: {[key: string|number]: BaseView} = {};
export class View<T extends HTMLElement> implements BaseView {
  public tagName!: NodeTag;
  public id!: number;
  public pId!: number;
  public index!: number;
  public dom!: T|null;
  public props: any = {};

  public constructor(id: number, pId: number) {
    this.id = id;
    this.pId = pId;
  }

  public defaultStyle(): {[key: string]: any} {
    return { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' };
  }

  public onAttachedToWindow() {

  }

  public onLayout() {

  }

  public updateProps(data: UIProps) {
    if (data) {
      Object.assign(this.props, data);
      if (!data) {
        return;
      }
      const keys = Object.keys(data);
      if (data.style) {
        setElementStyle(this.dom!, data.style);
      }
      for (const key of keys) {
        if (key === 'style') {
          continue;
        }
        if (typeof this[key] === 'function' && key.indexOf('on') === 0) {
          continue;
        }
        this[key] = data[key];
      }
    }
  }

  public beforeMount(parent: BaseView, position: number) {
    this.index = position;
  }

  public beforeChildMount(parent: BaseView, childPosition: number) {
  }

  public mounted(): void {
  }

  public beforeChildRemove(child: BaseView): void {
  }

  public beforeRemove(): void {
  }

  public findViewById(id: number): BaseView|null {
    if (ViewDictionary[id]) {
      return ViewDictionary[id];
    }
    return null;
  }

  public appendChild(child: BaseView, index: number) {
    if (this.dom && child.dom) {
      let realIndex = index;
      if (index > this.dom!.childNodes.length) {
        realIndex = this.dom!.childNodes.length;
      }
      this.dom.insertBefore(child.dom, this.dom!.childNodes[realIndex] ?? null);
    }
    ViewDictionary[child.id] = child;
  }

  public removeChild(childId: number) {
    const childView = this.findViewById(childId);
    if (childView && childView.dom) {
      this.dom?.removeChild(childView.dom);
    }
    delete ViewDictionary[childId];
  }
  public destroy() {
    this.dom = null;
  }
}

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
const ViewDictionary: {[key in string|number]: BaseView} = {};
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

  public async beforeMount(parent: BaseView, position: number) {
    this.index = position;
  }

  public async beforeChildMount(child: BaseView, childPosition: number) {
  }

  public mounted(): void {
  }

  public beforeChildRemove(child: BaseView): void {
  }

  public async beforeRemove() {
  }

  public destroy() {
    this.dom = null;
  }
}

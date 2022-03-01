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

import { BaseView, InnerNodeTag, UIProps } from '../../types';
export class HippyView<T extends HTMLElement> implements BaseView {
  public tagName!: InnerNodeTag;
  public id!: number;
  public pId!: number;
  public index!: number;
  public dom!: T|null;
  public props: any = {};
  public firstUpdateStyle = true;

  public constructor(id: number, pId: number) {
    this.id = id;
    this.pId = pId;
  }
  public updateProps(data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
    }
    defaultProcess(this, data);
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

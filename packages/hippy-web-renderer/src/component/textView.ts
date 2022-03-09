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
import { EllipsizeMode } from '../types';
import { setElementStyle } from '../common';
import { InnerNodeTag } from '../../types';
import { HippyView } from './hippy-view';
const HippyEllipsizeModeMap = {
  head: { 'text-overflow': 'ellipsis', direction: 'rtl' },
  clip: { 'text-overflow': 'clip' },
  middle: { 'text-overflow': 'ellipsis' },
  tail: { 'text-overflow': 'ellipsis' },
};
export class TextView extends HippyView<HTMLSpanElement> {
  private lines: number | undefined;
  private ellipsis: EllipsizeMode | undefined;
  private content = '';
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.TEXT;
    this.dom = document.createElement('span');
  }

  public set numberOfLines(value: number|undefined) {
    this.lines = value;
  }

  public get numberOfLines() {
    return this.lines;
  }

  public set ellipsizeMode(value) {
    this.ellipsis = value;
    if (this.dom && this.ellipsis) setElementStyle(this.dom, HippyEllipsizeModeMap[this.ellipsis]);
  }

  public get ellipsizeMode() {
    return this.ellipsis;
  }

  public set text(value) {
    this.content = value;
    if (this.dom!.childNodes.length > 0) {
      let textNode: Text | null = null;
      this.dom!.childNodes.forEach((item) => {
        if (item instanceof Text) {
          textNode = item;
        }
      });
      if (textNode && (textNode as Text).textContent !== value) {
        (textNode as Text).textContent = value;
      }
      return;
    }
    const textNode = document.createTextNode(value);
    if (this.dom!.childNodes.length > 0) {
      this.dom!.removeChild(this.dom!.childNodes[0]);
    }
    this.dom!.appendChild(textNode);
  }

  public get text() {
    return this.content;
  }
}

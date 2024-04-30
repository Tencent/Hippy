/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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
import { EllipsizeMode, InnerNodeTag, NodeProps } from '../types';
import { setElementStyle } from '../common';
import { HippyWebView } from './hippy-web-view';
const HippyEllipsizeModeMap = {
  head: { 'text-overflow': 'ellipsis', direction: 'rtl' },
  clip: { 'text-overflow': 'clip' },
  middle: { 'text-overflow': 'ellipsis' },
  tail: { 'text-overflow': 'ellipsis' },
};
export class TextView extends HippyWebView<HTMLSpanElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.TEXT;
    this.dom = document.createElement('span');
    this.props[NodeProps.ELLIPSIZE_MODE] = EllipsizeMode.TAIL;
  }
  public defaultStyle(): { [p: string]: any } {
    return { boxSizing: 'border-box', zIndex: 0, ...HippyEllipsizeModeMap[this.ellipsizeMode] };
  }

  public set numberOfLines(value: number|undefined) {
    this.props[NodeProps.NUMBER_OF_LINES] = value;
    if (value === 1) {
      this.dom && setElementStyle(this.dom, { 'white-space': 'nowrap', 'word-break': 'keep-all', display: 'initial',
        '-webkit-box-orient': '', '-webkit-line-clamp': '', overflow: '' });
    } else {
      this.dom && setElementStyle(this.dom, { 'white-space': 'normal', 'word-break': 'break-all', display: '-webkit-box',
        '-webkit-box-orient': 'vertical', '-webkit-line-clamp': `${value}`, overflow: 'hidden' });
    }
  }

  public get numberOfLines() {
    return this.props[NodeProps.NUMBER_OF_LINES];
  }

  public set ellipsizeMode(value) {
    this.props[NodeProps.ELLIPSIZE_MODE] = value;
    if (this.dom && value) setElementStyle(this.dom, { ...HippyEllipsizeModeMap[value],
      overflow: 'hidden', 'white-space': 'nowrap' });
  }

  public get ellipsizeMode() {
    return this.props[NodeProps.ELLIPSIZE_MODE];
  }

  public set text(value) {
    this.props[NodeProps.VALUE] = value;
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
    return this.props[NodeProps.VALUE];
  }
}

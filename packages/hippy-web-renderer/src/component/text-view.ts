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
import { DefaultPropsProcess, EllipsizeMode, InnerNodeTag, NodeProps, UIProps } from '../types';
import { setElementStyle } from '../common';
import {iOSVersion, isIos} from '../get-global';
import { HippyWebView } from './hippy-web-view';
const HippyEllipsizeModeMap = {
  head: { 'text-overflow': 'ellipsis', direction: 'rtl' },
  clip: { 'text-overflow': 'clip' },
  middle: { 'text-overflow': 'ellipsis' },
  tail: { 'text-overflow': 'ellipsis' },
};
export class TextView extends HippyWebView<HTMLSpanElement> {
  public static SCALE_SIZE = 4;
  public static SALE_RANGE = 0.2;

  private innerTextDom: HTMLSpanElement|null = null;

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.TEXT;
    this.dom = document.createElement('span');
    this.props[NodeProps.ELLIPSIZE_MODE] = EllipsizeMode.TAIL;
  }

  public defaultStyle(): { [p: string]: any } {
    return { boxSizing: 'border-box', zIndex: 0, whiteSpace: 'pre-line',
      ...HippyEllipsizeModeMap[this.ellipsizeMode],
      overflow: 'hidden' };
  }

  public updateProps(data: UIProps, defaultProcess: DefaultPropsProcess) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
      this.firstUpdateStyle = false;
    }
    const { style } = data;
    if (style.height && !style.lineHeight) {
      style.lineHeight = style.height;
      delete style.height;
    }
    !this.innerTextDom && this.buildInnerText();
    if (style.fontSize && style.fontSize < 12 && !isIos()) {
      setElementStyle(this.innerTextDom!, { zoom: (TextView.SCALE_SIZE
            - Math.min(12 - style.fontSize, TextView.SCALE_SIZE))
          / TextView.SCALE_SIZE * TextView.SALE_RANGE + (1 - TextView.SALE_RANGE) });
    }
    defaultProcess(this, data);
  }

  public set numberOfLines(value: number|undefined) {
    this.props[NodeProps.NUMBER_OF_LINES] = value;
    if (value === 1) {
      this.dom && setElementStyle(this.dom, { 'white-space': 'nowrap', 'word-break': 'keep-all', display: 'initial',
        '-webkit-box-orient': '', '-webkit-line-clamp': '' });
    } else {
      const whiteSpace = this.props.style.whiteSpace ?? 'pre-line';
      this.dom && setElementStyle(this.dom, { 'white-space': whiteSpace, 'word-break': 'break-all', display: '-webkit-box',
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

    if (this.textContentNode) {
      this.textContentNode.textContent = value;
      return;
    }

    const textNode = document.createTextNode(value);
    this.appendTextNode(textNode);
  }

  public get text() {
    return this.props[NodeProps.VALUE];
  }

  public buildInnerText() {
    this.innerTextDom = document.createElement('span');
    if ((isIos() && iOSVersion() === 12) || !isIos()) {
      setElementStyle(this.innerTextDom, { 'vertical-align': 'middle' });
    }
    this.dom?.appendChild(this.innerTextDom);
    const textNode: Text | null = this.textContentNode;
    if (textNode) {
      textNode.parentNode?.removeChild(textNode);
      this.innerTextDom.appendChild(textNode);
      return;
    }
  }

  public appendTextNode(textNode: Text) {
    if (this.innerTextDom) {
      this.innerTextDom.appendChild(textNode);
      return;
    }
    if (this.dom!.childNodes.length > 0) {
      this.dom!.removeChild(this.dom!.childNodes[0]);
    }
    this.dom!.appendChild(textNode);
  }

  private get textContentNode() {
    if (this.innerTextDom && this.innerTextDom.childNodes.length > 0) {
      return this.innerTextDom.childNodes[0] as Text;
    }
    let textNode: Text | null = null;
    this.dom!.childNodes.forEach((item) => {
      if (item instanceof Text) {
        textNode = item;
      }
    });
    return textNode;
  }
}

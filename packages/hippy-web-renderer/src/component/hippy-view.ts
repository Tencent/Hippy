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

/* eslint-disable @typescript-eslint/no-unused-vars*/

import ResizeObserver from 'resize-observer-polyfill';
import { BaseView, ComponentContext, InnerNodeTag, UIProps } from '../../types';
import { NodeProps } from '../types';
import { HippyTransferData } from '../types/hippy-internal-types';

export class HippyView<T extends HTMLElement> implements BaseView {
  public tagName!: InnerNodeTag;
  public id!: number;
  public pId!: number;
  public index!: number;
  public dom!: T|null;
  public props: any = {};
  public firstUpdateStyle = true;
  public context!: ComponentContext;
  public resizeObserver: ResizeObserver|undefined;
  public layoutCache: {x: number, y: number, height: number, width: number}|null = null;
  public constructor(context, id, pId) {
    this.id = id;
    this.pId = pId;
    this.context = context;
    this.handleOnTouchStart = this.handleOnTouchStart.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnTouchCancel = this.handleOnTouchCancel.bind(this);
    this.handleOnTouchEnd = this.handleOnTouchEnd.bind(this);
    this.handleOnTouchMove = this.handleOnTouchMove.bind(this);
  }

  public set onClick(value: boolean) {
    this.props[NodeProps.ON_CLICK] = value;
    if (value) {
      this.dom?.addEventListener('click', this.handleOnClick);
    }
  }

  public get onClick() {
    return !!this.props[NodeProps.ON_CLICK];
  }

  public set onTouchDown(value: boolean) {
    this.props[NodeProps.ON_TOUCH_DOWN] = value;
    if (value) {
      this.dom?.addEventListener('touchstart', this.handleOnTouchStart);
    }
  }

  public get onTouchDown() {
    return this.props[NodeProps.ON_TOUCH_DOWN];
  }

  public get onTouchMove() {
    return this.props[NodeProps.ON_TOUCH_MOVE];
  }

  public set onTouchMove(value: boolean) {
    this.props[NodeProps.ON_TOUCH_MOVE] = value;
    if (value) {
      this.dom?.addEventListener('touchmove', this.handleOnTouchMove);
    }
  }

  public get onTouchEnd() {
    return this.props[NodeProps.ON_TOUCH_END];
  }

  public set onTouchEnd(value: boolean) {
    this.props[NodeProps.ON_TOUCH_END] = value;
    if (value) {
      this.dom?.addEventListener('touchend', this.handleOnTouchEnd);
    }
  }

  public get onTouchCancel() {
    return this.props[NodeProps.ON_TOUCH_CANCEL];
  }

  public set onTouchCancel(value: boolean) {
    this.props[NodeProps.ON_TOUCH_CANCEL] = value;
    if (value) {
      this.dom?.addEventListener('touchcancel', this.handleOnTouchCancel);
    }
  }

  public set onLayout(value: boolean) {
    this.props[NodeProps.ON_LAYOUT] = value;
    if (value) {
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(this.handleReLayout.bind(this));
      }
      this.resizeObserver.observe(this.dom!);
    } else {
      this.resizeObserver?.disconnect();
    }
  }

  public get onLayout() {
    return this.props[NodeProps.ON_LAYOUT];
  }

  public updateProps(data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
      this.firstUpdateStyle = false;
    }
    defaultProcess(this, data);
  }

  public defaultStyle(): {[key: string]: any} {
    return { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', outline: 'none', fontFamily: '' };
  }

  public onAttachedToWindow() {
    if (!this.props[NodeProps.ON_ATTACHED_TO_WINDOW]) {
      return;
    }
    this.context.sendUiEvent(this.id, 'onAttachedToWindow', null);
  }

  public async beforeMount(parent: BaseView, position: number) {
    this.index = position;
  }

  public async beforeChildMount(child: BaseView, childPosition: number) {
  }

  public mounted(): void {
    this.onAttachedToWindow();
    if (this.onLayout) {
      const rect = this.dom!.getBoundingClientRect();
      this.context.sendUiEvent(this.id, 'onLayout', { layout: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      target: this.id });
    }
  }

  public beforeChildRemove(child: BaseView): void {
  }

  public async beforeRemove() {
    this.resizeObserver?.disconnect();
  }

  public destroy() {
    this.dom = null;
  }

  public handleReLayout(entries: ResizeObserverEntry[]) {
    const [entry] = entries;
    if (!entry) {
      return;
    }
    const { left, top, width, height } = entry.contentRect;
    if ((this.layoutCache && this.layoutCache.width === width && this.layoutCache.height === height)
        || (!this.dom || !this.dom.parentNode || !(this.id && document.getElementById(String(this.id)))
        )) {
      return;
    }
    if (height == 0) {
      debugger;
    }
    this.layoutCache =  {
      x: left,
      y: top,
      width,
      height,
    };

    this.context.sendUiEvent(this.id, 'onLayout', { layout: this.layoutCache,
      target: this.id });
  }

  private handleOnClick(event) {
    if (!this.onClick) {
      return;
    }
    this.context.sendUiEvent(this.id, NodeProps.ON_CLICK, event);
    event.stopPropagation();
  }

  private handleOnTouchStart(event) {
    if (!this.onTouchDown) {
      return;
    }
    this.context.sendGestureEvent(buildHippyTouchEvent(event, 'onTouchDown', this.id));
    event.stopPropagation();
  }
  private handleOnTouchMove(event) {
    if (!this.onTouchMove) {
      return;
    }
    this.context.sendGestureEvent(buildHippyTouchEvent(event, 'onTouchMove', this.id));
    event.stopPropagation();
  }

  private handleOnTouchCancel(event) {
    if (!this.onTouchCancel) {
      return;
    }
    this.context.sendGestureEvent(buildHippyTouchEvent(event, 'onTouchCancel', this.id));
    event.stopPropagation();
  }

  private handleOnTouchEnd(event) {
    if (!this.onTouchEnd) {
      return;
    }
    this.context.sendGestureEvent(buildHippyTouchEvent(event, 'onTouchEnd', this.id));
    event.stopPropagation();
  }
}

function buildHippyTouchEvent(event: TouchEvent, name: HippyTransferData.NativeGestureEventTypes, id: number) {
  const touch = event.touches[0]; // 获取第一个触点
  const x = Number(touch.pageX); // 页面触点X坐标
  const y = Number(touch.pageY);
  return {
    name, id, page_x: x, page_y: y,
  };
}


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

/* eslint-disable @typescript-eslint/no-unused-vars*/

import ResizeObserver from 'resize-observer-polyfill';
import * as Hammer from 'hammerjs';
import {
  NodeProps,
  HippyBaseView,
  ComponentContext,
  InnerNodeTag,
  UIProps,
  HippyTransferData,
  DefaultPropsProcess,
} from '../types';
import { setElementStyle } from '../common';

export class HippyWebView<T extends HTMLElement> implements HippyBaseView {
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
  public hammer;
  public exitChildrenStackContext = false;
  private mountedLayoutDispatch = false;
  private updatedZIndex = false;
  public constructor(context, id, pId) {
    this.id = id;
    this.pId = pId;
    this.context = context;
    this.handleOnTouchStart = this.handleOnTouchStart.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnTouchCancel = this.handleOnTouchCancel.bind(this);
    this.handleOnTouchEnd = this.handleOnTouchEnd.bind(this);
    this.handleOnTouchMove = this.handleOnTouchMove.bind(this);
    this.handleOnLongClick = this.handleOnLongClick.bind(this);
  }

  public updateProperty(key: string, value: any) {
    if (typeof this[key] === 'function' || key === 'style') {
      this.props[key] = value;
      return;
    }
    if (key in this && this[key] !== value) {
      this[key] = value;
      return;
    }
    this.props[key] = value;
  }

  public initHammer() {
    if (!this.hammer) {
      this.hammer =  new Hammer.Manager(this.dom!, { inputClass: Hammer.TouchInput });
    }
  }

  public set onClick(value: boolean) {
    this.props[NodeProps.ON_CLICK] = value;
    this.initHammer();
    this.hammer.remove('tap');
    this.hammer.off('tap', this.handleOnClick);
    if (value) {
      const tap = new Hammer.Tap({ time: 200 });
      this.hammer.add(tap);
      this.hammer.on('tap', this.handleOnClick);
    }
  }

  public get onClick() {
    return !!this.props[NodeProps.ON_CLICK];
  }

  public set onLongClick(value: boolean) {
    this.props[NodeProps.ON_LONG_CLICK] = value;
    this.initHammer();
    this.hammer.remove('press');
    this.hammer.off('press', this.handleOnLongClick);
    if (value) {
      const press = new Hammer.Press({ time: 200 });
      this.hammer.add(press);
      this.hammer.on('press', this.handleOnLongClick);
    }
  }

  public get onLongClick() {
    return !!this.props[NodeProps.ON_LONG_CLICK];
  }

  public set onTouchDown(value: boolean) {
    this.props[NodeProps.ON_TOUCH_DOWN] = value;
    if (value) {
      this.dom!.addEventListener('touchstart', this.handleOnTouchStart);
    } else {
      this.dom!.removeEventListener('touchstart', this.handleOnTouchStart);
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
      this.dom!.addEventListener('touchmove', this.handleOnTouchMove);
    } else {
      this.dom!.removeEventListener('touchmove', this.handleOnTouchMove);
    }
  }

  public get onTouchEnd() {
    return this.props[NodeProps.ON_TOUCH_END];
  }

  public set onTouchEnd(value: boolean) {
    this.props[NodeProps.ON_TOUCH_END] = value;
    if (value) {
      this.dom!.addEventListener('touchend', this.handleOnTouchEnd);
    } else {
      this.dom!.removeEventListener('touchend', this.handleOnTouchEnd);
    }
  }

  public get onTouchCancel() {
    return this.props[NodeProps.ON_TOUCH_CANCEL];
  }

  public set onTouchCancel(value: boolean) {
    this.props[NodeProps.ON_TOUCH_CANCEL] = value;
    if (value) {
      this.dom!.addEventListener('touchcancel', this.handleOnTouchCancel);
    } else {
      this.dom!.removeEventListener('touchcancel', this.handleOnTouchCancel);
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

  public changeStackContext(value: boolean) {
    if (!value && this.exitChildrenStackContext) {
      let hasOtherStackContext = false;
      this.dom?.childNodes.forEach((item) => {
        if ((item as HTMLElement).style.position === 'absolute' || (item as HTMLElement).style.position === 'relative') {
          hasOtherStackContext = true;
        }
      });
      if (!hasOtherStackContext) {
        this.exitChildrenStackContext = false;
        this.updateChildzIndex();
      }
    } else if (value && !this.exitChildrenStackContext) {
      this.exitChildrenStackContext = true;
      this.updateChildzIndex();
    }
  }

  public updateChildzIndex() {
    this.dom?.childNodes.forEach((item) => {
      const childDom = this.context.getModuleByName('UIManagerModule').findViewById((item as HTMLElement).id);
      if (this.exitChildrenStackContext
        && !childDom.props.style.zIndex !== undefined) {
        childDom.updateSelfStackContext();
      }
      if (!this.exitChildrenStackContext && childDom.updatedZIndex) {
        childDom.updateSelfStackContext(false);
      }
    });
  }

  public updateSelfStackContext(value = true) {
    if (value) {
      this.props.style.zIndex = 0;
      setElementStyle(this.dom as HTMLElement, { zIndex: 0 });
      this.updatedZIndex = true;
      return;
    }
    delete this.props.style.zIndex;
    setElementStyle(this.dom as HTMLElement, { zIndex: 'auto' });
    this.updatedZIndex = false;
  }

  public updateProps(data: UIProps, defaultProcess: DefaultPropsProcess) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
      this.firstUpdateStyle = false;
    }
    defaultProcess(this, data);
  }

  public defaultStyle(): {[key: string]: any} {
    return { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' };
  }

  public onAttachedToWindow() {
    if (!this.props[NodeProps.ON_ATTACHED_TO_WINDOW]) {
      return;
    }
    this.context.sendUiEvent(this.id, 'onAttachedToWindow', null);
  }

  public async beforeMount(parent: HippyBaseView, position: number) {
    this.index = position;
  }

  public async beforeChildMount(child: HippyBaseView, childPosition: number) {
  }

  public mounted(): void {
    this.onAttachedToWindow();
    if (this.onLayout) {
      this.context.getModuleByName('UIManagerModule').addAfterCreateAction(() => {
        this.mountedLayoutDispatch = true;
        const rect = this.dom!.getBoundingClientRect();
        let eventParam = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
        if (rect.width !== this.dom!.clientWidth || rect.height !== this.dom!.clientHeight) {
          eventParam = {
            x: this.dom!.offsetLeft,
            y: this.dom!.offsetTop,
            width: this.dom!.clientWidth,
            height: this.dom!.clientHeight,
          };
        }
        this.context.sendUiEvent(this.id, 'onLayout', { layout: eventParam, target: this.id });
      });
      return;
    }
    this.mountedLayoutDispatch = true;
  }

  public beforeChildRemove(child: HippyBaseView): void {
  }

  public async beforeRemove() {
    this.resizeObserver?.disconnect();
  }

  public destroy() {
    this.dom = null;
  }

  public handleReLayout(entries: ResizeObserverEntry[]) {
    const [entry] = entries;
    if (!entry || !this.mountedLayoutDispatch) {
      return;
    }
    const { left, top, width, height } = entry.contentRect;
    if ((this.layoutCache && this.layoutCache.width === width && this.layoutCache.height === height)
        || (!this.dom || !this.dom.parentNode || !(this.id && document.getElementById(String(this.id)))
        )) {
      return;
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

  private handleOnLongClick(event) {
    if (!this.onLongClick) {
      return;
    }
    this.context.sendUiEvent(this.id, NodeProps.ON_LONG_CLICK, event);
    event.srcEvent.stopPropagation();
  }

  private handleOnClick(event) {
    if (!this.onClick) {
      return;
    }
    this.context.sendUiEvent(this.id, NodeProps.ON_CLICK, event);
    event.srcEvent.stopPropagation();
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
    event.preventDefault();
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
  const touch = event.changedTouches[0];
  const x = Number(touch.pageX);
  const y = Number(touch.pageY);
  return {
    name, id, page_x: x, page_y: y,
  };
}


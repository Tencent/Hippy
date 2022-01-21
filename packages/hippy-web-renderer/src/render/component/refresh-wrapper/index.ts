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

import { setElementStyle } from '../../common';
import {
  EVENT_CHILD_NODE_WILL_INSERT,
  EVENT_CHILD_NODE_WILL_REMOVE,
  HIPPY_COMPONENT_METHOD,
  NodeProps,
  NodeTag,
  ORIGIN_TYPE,
} from '../../module/node-def';
import { HippyRefreshWrapperProps, initProps } from './process';
export * from './process';

const BounceBackTime = 200;
const BounceBackEasingFunction = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
const PullOverThreshold = 55;
const PullOverStage = [
  { threshold: [0, 50], damp: 1 },
  { threshold: [50, 100], damp: 0.6 },
  { threshold: [100, Number.MAX_SAFE_INTEGER], damp: 0.2 },
];

export function createHippyRefreshWrapper(): HTMLElement {
  const refreshWrapperElement = document.createElement('div');
  const initStyle = { style: { display: 'flex', flexDirection: 'column', overflow: ' hidden' } };
  initProps(refreshWrapperElement);
  setElementStyle(refreshWrapperElement, initStyle.style);
  initHook(refreshWrapperElement);
  return refreshWrapperElement;
}
function initHook(element: HTMLElement) {
  element[EVENT_CHILD_NODE_WILL_INSERT] = (child: HTMLElement, _sortIndex: number) => {
    if (child[ORIGIN_TYPE] && child[ORIGIN_TYPE] === NodeTag.LIST) {
      setElementStyle(child, { position: 'relative', zIndex: 2 });
      const refreshHeader = new PullRefresh(child, element, () => {
        if (element[HippyRefreshWrapperProps][NodeProps.ON_REFRESH]) {
          element[HippyRefreshWrapperProps][NodeProps.ON_REFRESH]?.();
          return;
        }
        refreshHeader.finish();
      });
      element[HIPPY_COMPONENT_METHOD][NodeProps.REFRESH_COMPLETED] = () => {
        refreshHeader.finish();
      };
      element[HIPPY_COMPONENT_METHOD][NodeProps.START_REFRESH] = () => {
        refreshHeader.start();
      };
      refreshHeader.init();
    }
  };
  element[EVENT_CHILD_NODE_WILL_REMOVE] = (child: HTMLElement, _sortIndex: number) => {
    if (child[ORIGIN_TYPE] && child[ORIGIN_TYPE] === NodeTag.LIST) {
    }
  };
}
class PullRefresh {
  public refreshItemElement: HTMLElement;
  public listElement: HTMLElement;
  public listStyleCache: any;
  public lastPosition = 0;
  public lastRefreshTime: number = Date.now();
  public startPosition = 0;
  public touchMove = 0;
  public moveLengthRecord = 0;
  public refreshStatus = false;
  public refreshHeadHeight = 0;
  public handleCallBack: () => void;
  public isPullFirst = false;
  public constructor(target: HTMLElement, scrollContainer: HTMLElement, pullCallback: () => void) {
    this.refreshItemElement = scrollContainer.childNodes[0] as HTMLElement;
    this.listElement = target;
    this.listStyleCache = target.style;
    this.refreshStatus = false;
    this.handleCallBack = pullCallback;
  }
  public get overScrollThreshold() {
    return this.refreshHeadHeight > PullOverThreshold ? this.refreshHeadHeight : PullOverThreshold;
  }
  public init() {
    this.listStyleCache = this.listElement.style;
    this.listElement.addEventListener('touchstart', this.touchStartHandler.bind(this));
    this.listElement.addEventListener('touchmove', this.touchMoveHandler.bind(this));
    this.listElement.addEventListener('touchend', this.touchEndHandler.bind(this));
  }
  public finish() {
    setElementsStyle([this.listElement, this.refreshItemElement], {
      transform: buildTranslate(0, 0),
      transition: buildTransition(
        'transform',
        `${BounceBackTime / 1000}`,
        BounceBackEasingFunction,
      ),
    });
  }
  public start() {
    if (!this.isPullFirst) this.pullHandler(0);
    setElementsStyle([this.listElement, this.refreshItemElement], {
      transform: buildTranslate(0, `${this.overScrollThreshold}px`),
      transition: buildTransition(
        'transform',
        `${BounceBackTime / 1000}`,
        BounceBackEasingFunction,
      ),
    });
    this.moveLengthRecord = this.overScrollThreshold;
    this.refreshStatus = true;
    setTimeout(() => {
      this.handleCallBack?.();
    }, BounceBackTime);
  }
  private pullHandler(moveLen) {
    const realMove = simulationBounce(moveLen);
    if (this.moveLengthRecord >= 0) {
      this.isPullFirst = true;
      setElementStyle(this.listElement, { transform: buildTranslate(0, `${realMove}px`) });
      if (
        this.refreshItemElement
        && this.refreshItemElement[ORIGIN_TYPE] === NodeTag.REFRESH_ITEM
        && (this.refreshItemElement.style.top === undefined
          || this.refreshItemElement.style.top === '')
      ) {
        this.refreshHeadHeight = this.refreshItemElement.clientHeight;
        setElementStyle(this.refreshItemElement, { top: -this.refreshItemElement.clientHeight });
      }
      setElementStyle(this.refreshItemElement, { transform: buildTranslate(0, `${realMove}px`) });
      this.refreshStatus = this.moveLengthRecord >= this.overScrollThreshold;
    }
    return realMove;
  }
  private touchStartHandler(e: TouchEvent) {
    this.startPosition = e.touches[0].pageY;
    setElementsStyle([this.listElement, this.refreshItemElement], {
      transition: buildTransition('transform', 0),
    });
  }
  private touchMoveHandler(e: TouchEvent) {
    if (this.listElement.scrollTop > 0) {
      return;
    }
    if (!this.lastPosition) {
      this.lastPosition = e.touches[0].pageY;
    }
    if (
      Math.abs(e.touches[0].pageY - this.lastPosition) < 1
      || Date.now() - this.lastRefreshTime < 16
    ) {
      return;
    }
    this.lastRefreshTime = Date.now();
    this.touchMove += e.touches[0].pageY - this.lastPosition;
    this.lastPosition = e.touches[0].pageY;
    this.moveLengthRecord = this.pullHandler(this.touchMove);
  }
  private touchEndHandler() {
    if (this.moveLengthRecord > 0) {
      setElementsStyle([this.listElement, this.refreshItemElement], {
        transition: buildTransition(
          'transform',
          `${BounceBackTime / 1000}`,
          BounceBackEasingFunction,
        ),
      });
      if (this.refreshStatus) {
        this.handleCallBack?.();
        setElementsStyle([this.listElement, this.refreshItemElement], {
          transform: buildTranslate(0, `${this.overScrollThreshold}px`),
        });
      } else {
        setElementsStyle([this.listElement, this.refreshItemElement], {
          transform: buildTranslate(0, 0),
        });
        setTimeout(() => {
          this.moveLengthRecord = 0;
          this.touchMove = 0;
        }, BounceBackTime);
        return;
      }
    }
    this.moveLengthRecord = 0;
    this.touchMove = 0;
    this.lastPosition = 0;
  }
}
function simulationBounce(scrollLength: number) {
  let needMoveLength = 0;
  for (let i = 0; i < PullOverStage.length; i++) {
    const stage = PullOverStage[i];
    if (scrollLength < stage.threshold[1] && scrollLength >= stage.threshold[0]) {
      needMoveLength += (scrollLength - stage.threshold[0]) * stage.damp;
    }
    if (scrollLength >= stage.threshold[1]) {
      needMoveLength += (stage.threshold[1] - stage.threshold[0]) * stage.damp;
    }
  }
  return needMoveLength;
}
function buildTranslate(x: number | string, y: number | string) {
  return `translate(${x}, ${y})`;
}
function buildTransition(propsName: string, time: string | number, timeFunction = 'ease-out') {
  return `${propsName} ${time}s ${timeFunction}`;
}
function setElementsStyle(elements: Array<HTMLElement>, style: any) {
  elements.forEach((item) => {
    setElementStyle(item, style);
  });
}

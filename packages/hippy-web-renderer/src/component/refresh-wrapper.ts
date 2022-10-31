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
import { NodeProps, HippyBaseView, InnerNodeTag } from '../types';

import { setElementStyle } from '../common';
import { HippyWebView } from './hippy-web-view';

const BounceBackTime = 200;
const BounceBackEasingFunction = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
const PullOverThreshold = 55;
const PullOverStage = [
  { threshold: [0, 50], damp: 1 },
  { threshold: [50, 100], damp: 0.6 },
  { threshold: [100, Number.MAX_SAFE_INTEGER], damp: 0.2 },
];

export class RefreshWrapper extends HippyWebView<HTMLDivElement> {
  private pullRefresh!: PullRefresh;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.REFRESH;
    this.dom = document.createElement('div');
  }

  public defaultStyle() {
    return { display: 'flex', flexDirection: 'column', overflow: ' hidden', boxSizing: 'border-box', position: 'relative' };
  }

  public get bounceTime() {
    return this.props[NodeProps.BOUNCE_TIME];
  }

  public set bounceTime(value: number) {
    this.props[NodeProps.BOUNCE_TIME] = value;
  }

  public onRefresh() {
    this.props[NodeProps.ON_REFRESH]
    && this.context.sendUiEvent(this.id, NodeProps.ON_REFRESH, null);
  }

  public refreshComplected() {
    this.pullRefresh?.finish();
  }

  public startRefresh() {
    this.pullRefresh?.start();
  }

  public async beforeChildMount(child: HippyBaseView, childPosition: number) {
    await super.beforeChildMount(child, childPosition);
    if (child.tagName === InnerNodeTag.LIST) {
      setElementStyle(child.dom!, { position: 'relative', zIndex: 2 });
      this.pullRefresh = new PullRefresh(
        child.dom!, this.dom!.childNodes[0] as HTMLElement,
        this.handlePull.bind(this),
      );
      this.pullRefresh.init();
    }
  }

  public async beforeRemove(): Promise<void> {
    await super.beforeRemove();
    this.pullRefresh?.destroy();
  }

  private handlePull() {
    if (this.props[NodeProps.ON_REFRESH]) {
      this.onRefresh();
      return;
    }
    setTimeout(() => {
      this.pullRefresh?.finish();
    }, 500);
  }
}
export class RefreshWrapperItemView extends HippyWebView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.REFRESH_ITEM;
    this.dom = document.createElement('div');
  }
}
class PullRefresh {
  private refreshContent: HTMLElement;
  private scrollContent: HTMLElement;
  private contentStyleCache: any;
  private lastPosition = 0;
  private lastRefreshTime: number = Date.now();
  private startPosition = 0;
  private touchMove = 0;
  private moveLengthRecord = 0;
  private refreshStatus = false;
  private refreshHeadHeight = 0;
  private handleCallBack: () => void;
  private isPullFirst = false;
  public constructor(scrollContent: HTMLElement, refreshContent: HTMLElement, pullCallback: () => void) {
    this.refreshContent = refreshContent;
    this.scrollContent = scrollContent;
    this.contentStyleCache = scrollContent.style;
    this.refreshStatus = false;
    this.handleCallBack = pullCallback;
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handlerTouchMove = this.handlerTouchMove.bind(this);
    this.handlerTouchEnd = this.handlerTouchEnd.bind(this);
  }

  public get overScrollThreshold() {
    return this.refreshHeadHeight > PullOverThreshold ? this.refreshHeadHeight : PullOverThreshold;
  }

  public get endYOffset() {
    return 0 - this.refreshContent?.clientHeight;
  }

  public init() {
    this.contentStyleCache = this.scrollContent.style;
    this.scrollContent.addEventListener('touchstart', this.handleTouchStart);
    this.scrollContent.addEventListener('touchmove', this.handlerTouchMove);
    this.scrollContent.addEventListener('touchend', this.handlerTouchEnd);
    this.resetRefreshContentTop();
  }

  public resetRefreshContentTop() {
    setElementsStyle([this.refreshContent], { transform:
        buildTranslate(0, `${(-this.refreshContent.clientHeight) ?? 0}px`) });
  }

  public finish() {
    setElementsStyle([this.refreshContent], {
      transform: buildTranslate(0, `${this.endYOffset}px`),
      transition: buildTransition(
        'transform',
        `${BounceBackTime / 1000}`,
        BounceBackEasingFunction,
      ),
    });
    setElementsStyle([this.scrollContent], {
      transform: buildTranslate(0, 0),
      transition: buildTransition(
        'transform',
        `${BounceBackTime / 1000}`,
        BounceBackEasingFunction,
      ),
    });
  }

  public start() {
    if (!this.isPullFirst) this.handlePull(0);
    setElementsStyle([this.scrollContent, this.refreshContent], {
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

  public destroy() {
    this.scrollContent.removeEventListener('touchstart', this.handleTouchStart);
    this.scrollContent.removeEventListener('touchmove', this.handlerTouchMove);
    this.scrollContent.removeEventListener('touchend', this.handlerTouchEnd);
  }

  private handlePull(moveLen) {
    const realMove = simulationBounce(moveLen);
    if (this.moveLengthRecord >= 0) {
      this.isPullFirst = true;
      setElementStyle(this.scrollContent, { transform: buildTranslate(0, `${realMove}px`) });
      if (
        this.refreshContent
        && this.refreshContent.tagName === InnerNodeTag.REFRESH_ITEM
        && (this.refreshContent.style.top === undefined
          || this.refreshContent.style.top === '')
      ) {
        this.refreshHeadHeight = this.refreshContent.clientHeight;
        setElementStyle(this.refreshContent, { top: -this.refreshContent.clientHeight });
      }
      setElementStyle(this.refreshContent, { transform:
          buildTranslate(0, `${(realMove - this.refreshContent.clientHeight) ?? 0}px`) });
      this.refreshStatus = this.moveLengthRecord >= this.overScrollThreshold;
    }
    return realMove;
  }

  private handleTouchStart(e: TouchEvent) {
    this.startPosition = e.touches[0].pageY;
    setElementsStyle([this.scrollContent, this.refreshContent], {
      transition: buildTransition('transform', 0),
    });
  }

  private handlerTouchMove(e: TouchEvent) {
    if (this.scrollContent && this.scrollContent.scrollTop > 0) {
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
    this.moveLengthRecord = this.handlePull(this.touchMove);
  }

  private handlerTouchEnd() {
    if (this.moveLengthRecord > 0) {
      setElementsStyle([this.scrollContent, this.refreshContent], {
        transition: buildTransition(
          'transform',
          `${BounceBackTime / 1000}`,
          BounceBackEasingFunction,
        ),
      });
      if (this.refreshStatus) {
        this.handleCallBack?.();
        setElementsStyle([this.scrollContent], {
          transform: buildTranslate(0, `${this.overScrollThreshold}px`),
        });
        setElementsStyle([this.refreshContent], {
          transform: buildTranslate(0, `${(this.overScrollThreshold - this.refreshContent.clientHeight) ?? 0}px`),
        });
      } else {
        this.finish();
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

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

import { Property } from 'csstype';
import { ComponentContext, HippyBaseView } from '../types';
import { convertHexToRgba, setElementStyle, warn } from '../common';
import { HippyWebModule } from '../base';
import AnimationFillMode = Property.AnimationFillMode;
import AnimationIterationCount = Property.AnimationIterationCount;
import AnimationPlayState = Property.AnimationPlayState;
export class AnimationModule extends HippyWebModule {
  public name = 'AnimationModule';
  private animationPool: {[key: string]: SimpleAnimation|null} = {};
  private animationSetPool: {[key: string]: SimpleAnimationSet|null} = {};
  public createAnimation(animationId: number, mode = 'timing', params: AnimationOptions) {
    if (this.animationPool[animationId]) {
      return;
    }
    if (!mode) {
      this.animationPool[animationId] = null;
    }
    if (mode === 'timing') {
      this.animationPool[animationId] = new SimpleAnimation(
        this.context,
        animationId, params as AnimationOptions, mode,
      );
    }
  }

  public createAnimationSet(animationId: number, params: AnimationSetOptions) {
    if (this.animationSetPool[animationId]) {
      return;
    }
    this.animationSetPool[animationId] = new SimpleAnimationSet(
      this.context,
      animationId, params,
    );
  }

  public updateAnimation(animationId: number, param: AnimationOptions) {
    if (!this.isValidAnimationId(animationId)) {
      warn('hippy', 'animation update failed, animationId not find animation object', animationId);
      return;
    }
    this.animationPool[animationId]?.update(param);
  }

  public startAnimation(animationId: number) {
    if (!this.isValidAnimationId(animationId)) {
      warn('hippy', 'animation start failed, animationId not find animation object', animationId);
      return;
    }
    this.animationSetPool[animationId]?.start();
    this.animationPool[animationId]?.start();
  }

  public pauseAnimation(animationId: number) {
    if (!this.isValidAnimationId(animationId)) {
      warn('hippy', 'animation stop failed, animationId not find animation object', animationId);
      return;
    }
    this.animationSetPool[animationId]?.stop();
    this.animationPool[animationId]?.stop();
  }

  public resumeAnimation(animationId: number) {
    if (!this.isValidAnimationId(animationId)) {
      warn('hippy', 'animation resume failed, animationId not find animation object', animationId);
      return;
    }
    this.animationSetPool[animationId]?.resume();
    this.animationPool[animationId]?.resume();
  }

  public destroyAnimation(animationId: number) {
    if (!this.isValidAnimationId(animationId)) {
      warn('hippy', 'animation destroy failed, animationId not find animation object', animationId);
      return;
    }
    this.animationSetPool[animationId]?.destroy();
    this.animationPool[animationId]?.destroy();
  }

  public linkInitAnimation2Element(animationId: number, view: HippyBaseView, animationProperty: string|object) {
    if (this.linkAnimation2Element(animationId, view, animationProperty)) {
      return;
    }
    this.animationPool[animationId]!.initAnimation(view.dom!);
  }

  public linkAnimation2Element(animationId: number, view: HippyBaseView, animationProperty: string|object) {
    if (!this.animationPool[animationId] && !this.animationSetPool[animationId]) {
      return true;
    }
    if (this.animationSetPool[animationId]) {
      this.linkAnimationSet2Element(animationId, view, animationProperty);
      return true;
    }
    this.linkAnimationCheck(view, animationProperty);
    this.animationPool[animationId]!.nodeId = view.id;
    this.animationPool[animationId]!.animationProperty = animationProperty;
    return false;
  }

  public linkAnimationSet2Element(animationId: number, view: HippyBaseView, animationProperty: string|object) {
    if (!this.animationSetPool[animationId]) {
      return;
    }
    this.animationSetPool[animationId]!.nodeId = view.id;
    this.animationSetPool[animationId]!.initAnimationSet(animationId, view, animationProperty);
  }

  public getAnimationStartValue(animationId: number) {
    if (!this.animationPool[animationId]) {
      return null;
    }
    return this.animationPool[animationId]!.animationBeginValue;
  }

  public findAnimation(animationId: number) {
    return this.animationPool[animationId];
  }

  private isValidAnimationId(animationId: number) {
    return this.animationPool[animationId] || this.animationSetPool[animationId];
  }

  private linkAnimationCheck(view: HippyBaseView, animationProperty: string|object) {
    for (const key of Object.keys(this.animationPool)) {
      const animation = this.animationPool[key];
      if (animation?.hasLinkedView(view.id) && animation.refCssProperty === animationProperty && animation.state !== 'end' && !this.isAnimationSetChild(animation?.id)) {
        animation.clearLinkNode();
      }
    }
  }

  private isAnimationSetChild(animationId) {
    for (const key of Object.keys(this.animationSetPool)) {
      const animationSet = this.animationSetPool[key];
      const isBelongToAnimation = animationSet?.containAnimationId(animationId);
      if (isBelongToAnimation) {
        return isBelongToAnimation;
      }
    }
    return false;
  }
}

export type HippyAnimationValue = number | { animationId: number };
enum HippyAnimationEvent {
  START = 'onHippyAnimationStart',
  END = 'onHippyAnimationEnd',
  CANCEL = 'onHippyAnimationCancel',
  REPEAT = 'onHippyAnimationRepeat',
}

const TransformList = {
  perspective: 1,
  rotate: 1,
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  translateX: 1,
  translateY: 1,
  skewX: 1,
};

type AnimationDirection = 'left' | 'right' | 'top' | 'bottom' | 'center';

interface AnimationOptions {
  startValue: HippyAnimationValue;
  toValue: HippyAnimationValue;
  duration: number;
  mode?: 'timing'; // TODO: fill more options
  delay?: number;
  valueType?: 'deg'; // TODO: fill more options
  direction?: AnimationDirection;
  timingFunction?:
  | 'linear'
  | 'ease'
  | 'bezier'
  | 'in'
  | 'ease-in'
  | 'out'
  | 'ease-out'
  | 'inOut'
  | 'ease-in-out';
  repeatCount?: number;
  inputRange?: any[];
  outputRange?: any[];
}
interface AnimationSetOptions {
  repeatCount: number,
  virtual: undefined|boolean,
  children: Array<{animationId: number, follow: boolean}>
}

class SimpleAnimation {
  public id: string | number;
  public context: ComponentContext;
  public timeMode: string | undefined;
  public animationInfo: AnimationOptions;
  public refCssProperty: string | null = null;
  public animationStamp = Date.now();
  private refNodeIds: Set<number> = new Set();
  private domes: { [key: string]: HTMLElement } = {};
  private animationState: 'play'|'end'|'wait' = 'wait';
  private beginListener: Array<() => void> = [];
  private endListener: Array<() => void> = [];
  private cleared = false;

  public constructor(
    context: ComponentContext, animationId: string | number,
    options: AnimationOptions, mode?: string,
  ) {
    this.animationInfo = options;
    this.timeMode = mode;
    this.id = animationId;
    this.context = context;
    this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
    this.handleAnimationStart = this.handleAnimationStart.bind(this);
  }

  public get state() {
    return this.animationState;
  }

  public set nodeId(nodeId: number) {
    this.refNodeIds.add(nodeId);
  }

  public get animationBeginValue() {
    return this.buildAnimationValue(this.animationInfo.startValue);
  }

  public get animationEndValue() {
    return this.buildAnimationValue(this.animationInfo.toValue);
  }

  public get animationTime() {
    return `${this.animationInfo.duration / 1000}s`;
  }

  public get delayTime() {
    return this.animationInfo.delay ? `${this.animationInfo.delay / 1000}s` : '0s';
  }

  public get animationUseTime() {
    return this.animationInfo.duration + (this.animationInfo.delay !== undefined ? this.animationInfo.delay : 0);
  }

  public get animationName() {
    return `${this.animationNamePrefix}-${this.animationStamp}`;
  }

  public get animationNamePrefix() {
    return `hippy-keyframe-${this.id}`;
  }

  public get iteration() {
    if (this.animationInfo.repeatCount !== undefined && this.animationInfo.repeatCount < 0) {
      return 'infinite';
    }
    if (!this.animationInfo || !this.animationInfo.repeatCount) {
      return '1';
    }
    return String(this.animationInfo.repeatCount);
  }

  public set animationProperty(name: string| { [key: string]: any}) {
    if (typeof name === 'string') {
      this.refCssProperty = name;
      return;
    }
    const [item] = Object.keys(name);
    if (TransformList[item]) {
      this.refCssProperty = item;
    }
  }

  public get useForSetProperty() {
    if (!this.refCssProperty) {
      return '';
    }
    if (TransformList[this.refCssProperty]) {
      return 'transform';
    }
    return camel2Kebab(this.refCssProperty);
  }

  public hasLinkedView(id: number) {
    return this.refNodeIds.has(id);
  }

  public getDomByNodeId(id: number) {
    if (this.domes[id]) {
      return this.domes[id];
    }
    const dom = document.getElementById(String(id));
    if (dom) {
      this.domes[id] = dom;
    }
    return dom;
  }

  public initAnimation(element: HTMLElement) {
    if (this.cleared) {
      return;
    }
    let data = this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue());
    if (this.animationState === 'end' || this.animationState === 'play') {
      data = this.createAnimationKeyFrame(this.createAnimationEndAndEndValue());
    }
    this.updateAnimationInfoToPageStyle(data);
    const animation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, 'paused', this.iteration, 'both',
    );
    this.animationUpdate2Css(animation, element);
  }

  public start() {
    if (this.cleared) {
      return;
    }
    const data = this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue());
    this.updateAnimationInfoToPageStyle(data);
    this.changeAnimationStatus('running');
    this.animationState = 'play';
    setTimeout(() => {
      this.handleAnimationStart({ animationName: this.animationName, elapsedTime: 0, pseudoElement: '' } as AnimationEvent);
    }, this.animationInfo.delay ?? 0);
    setTimeout(() => {
      this.handleAnimationEnd({ animationName: this.animationName, elapsedTime: 0, pseudoElement: '' } as AnimationEvent);
      this.animationState = 'end';
    }, (this.animationInfo.delay ?? 0) + this.animationInfo.duration);
  }

  public stop() {
    this.changeAnimationStatus('paused');
  }

  public resume() {
    this.changeAnimationStatus('running');
  }

  public destroy() {
    this.changeAnimationStatus('paused');
    this.batchUpdateCss(null);
  }

  public update(param: AnimationOptions) {
    this.cleared = false;
    this.animationState = 'wait';
    this.animationInfo = param;
    this.animationStamp = Date.now();
    this.updateAnimationInfoToPageStyle(this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue()));
    const animation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, 'paused', this.iteration, 'both',
    );
    this.batchUpdateCss(animation);
  }

  public addEventListener(type: string, callBack: () => void) {
    switch (type) {
      case 'begin':
        this.beginListener.push(callBack);
        break;
      case 'end':
        this.endListener.push(callBack);
        break;
    }
  }

  public clearLinkNode() {
    this.cleared = true;
    this.batchUpdateCss(null);
  }

  private createAnimationBeginAndEndValue() {
    const animationCssBeginValue = this.buildCssValue(this.animationBeginValue);
    const animationCssEndValue = this.buildCssValue(this.animationEndValue);
    const beginFrame = {};
    const endFrame = {};
    beginFrame[this.useForSetProperty!] = animationCssBeginValue;
    endFrame[this.useForSetProperty!] = animationCssEndValue;
    return { beginFrame, endFrame };
  }

  private createAnimationEndAndEndValue() {
    const animationCssBeginValue = this.buildCssValue(this.animationEndValue);
    const animationCssEndValue = animationCssBeginValue;
    const beginFrame = {};
    const endFrame = {};
    beginFrame[this.useForSetProperty!] = animationCssBeginValue;
    endFrame[this.useForSetProperty!] = animationCssEndValue;
    return { beginFrame, endFrame };
  }

  private createAnimationKeyFrame({ beginFrame, endFrame }) {
    const keyFrameData = createAnimationKeyFrame(beginFrame, endFrame, this.animationName);
    const keyFrame = getKeyFrameFromCssStyle(this.animationName);
    return { keyFrame, keyFrameData };
  }

  private updateAnimationInfoToPageStyle({ keyFrame, keyFrameData }) {
    if (!keyFrame.cssRule) {
      appendAnimationKeyFrame(keyFrameData);
    } else {
      updateAnimationKeyFrame(this.animationName, keyFrameData);
    }
  }

  private changeAnimationStatus(status: AnimationPlayState) {
    const keyFrame = getKeyFrameFromCssStyle(this.animationName);
    if (!keyFrame.cssRule) {
      return;
    }
    const pauseAnimation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, status, this.iteration, 'both',
    );
    this.batchUpdateCss(pauseAnimation);
  }

  private batchUpdateCss(animation: string|null) {
    this.refNodeIds.forEach((id) => {
      const dom = this.getDomByNodeId(id);
      if (dom) {
        this.animationUpdate2Css(animation, dom);
      }
    });
  }

  private animationUpdate2Css(animation: string|null, dom: HTMLElement) {
    const element = dom;
    if (!element) {
      return;
    }
    let oldAnimationList = element.style.animation ? element.style.animation.split(',') : [];
    if (!oldAnimationList && animation !== null) {
      oldAnimationList = [];
      oldAnimationList.push(animation);
    } else {
      const index = oldAnimationList.findIndex((value: string) => value.indexOf(this.animationNamePrefix) !== -1) ?? -1;
      if (index === -1 && animation) {
        oldAnimationList.push(animation);
      }
      if (index !== -1 && animation !== null) {
        oldAnimationList[index] = animation;
      }
      if (index !== -1 && animation === null) {
        oldAnimationList.splice(index, 1);
      }
    }
    setElementStyle(element, { animation: oldAnimationList.join(',') });
  }

  private dispatchEvent(eventName: HippyAnimationEvent) {
    this.context.sendEvent(eventName, this.id);
  }

  private buildCssValue(value: string) {
    if (this.useForSetProperty === 'transform') {
      return `${this.refCssProperty}(${value})`;
    }
    return value;
  }

  private buildAnimationValue(value: any) {
    let unit = 'px';
    if (this.animationInfo.valueType) {
      unit = this.animationInfo.valueType;
    }
    if (this.refCssProperty === 'scale' || this.refCssProperty === 'opacity' || this.refCssProperty === 'color' || this.refCssProperty === 'backgroundColor') {
      unit = '';
    }
    if (this.refCssProperty === 'color' || this.refCssProperty === 'backgroundColor') {
      return `${convertHexToRgba(value)}`;
    }
    return `${value}${unit}`;
  }

  private handleAnimationStart(event: AnimationEvent) {
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.START);
    }
    this.beginListener.forEach((item) => {
      item();
    });
  }

  private handleAnimationEnd(event: AnimationEvent) {
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.END);
    }
    this.changeAnimationStatus('paused');
    this.endListener.forEach((item) => {
      item();
    });
  }
}
class SimpleAnimationSet {
  public id: string | number;
  public context: ComponentContext;
  public setOption: AnimationSetOptions;
  private refNodeIds: Set<number> = new Set();

  public constructor(
    context: ComponentContext, animationId: string | number,
    options: AnimationSetOptions,
  ) {
    this.id = animationId;
    this.context = context;
    this.setOption = options;
    this.handleAnimationStart = this.handleAnimationStart.bind(this);
    this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
  }
  public set nodeId(id: number) {
    this.refNodeIds.add(id);
  }

  public hasLinkedView(nodeId: number) {
    return this.refNodeIds.has(nodeId);
  }

  public start() {
    const animationTimelineList = this.calculateAnimationTime();
    for (let i = 0;i < this.setOption.children.length;i++) {
      const child = this.setOption.children[i];
      const animation = (this.context.getModuleByName('AnimationModule') as AnimationModule).findAnimation(child.animationId);
      if (i === 0) {
        window.requestAnimationFrame(() => {
          animation!.start();
        });
        continue;
      }
      const preChild = this.setOption.children[i - 1];
      const preAnimation = (this.context.getModuleByName('AnimationModule') as AnimationModule).findAnimation(preChild.animationId);
      preAnimation?.addEventListener('end', () => {
        preAnimation.destroy();
        animation?.start();
      });
    }
    const maxTime = Math.max.apply(null, animationTimelineList);
    setTimeout(this.handleAnimationStart, 0);
    setTimeout(this.handleAnimationEnd, maxTime);
  }

  public stop() {
  }

  public resume() {
  }

  public destroy() {
  }

  public findFirstAnimation() {
    const [firstChild] = this.setOption.children;
    const animationModule = this.context.getModuleByName('AnimationModule') as AnimationModule;
    return animationModule.findAnimation(firstChild.animationId);
  }

  public initAnimationSet(animationId: number, view: HippyBaseView, animationProperty: string|object) {
    const animationModule = this.context.getModuleByName('AnimationModule') as AnimationModule;
    this.setOption.children.forEach((item, index) => {
      if (index === 0) {
        animationModule.linkInitAnimation2Element(item.animationId, view, animationProperty);
        return;
      }
      animationModule.linkAnimation2Element(item.animationId, view, animationProperty);
    });
  }

  public containAnimationId(animationId: number) {
    return this.setOption.children.findIndex(item => item.animationId === animationId) !== -1;
  }

  private calculateAnimationTime() {
    const animationEndTime: Array<number> = [];
    const animationModule = this.context.getModuleByName('AnimationModule') as AnimationModule;
    for (let i = 0;i < this.setOption.children.length;i++) {
      const child = this.setOption.children[i];
      if (i === 0) {
        animationEndTime[i] = animationModule.findAnimation(child.animationId)!.animationUseTime;
        continue;
      }
      animationEndTime[i] = animationEndTime[i - 1]
          + (animationModule.findAnimation(child.animationId)?.animationUseTime ?? 0);
    }
    return animationEndTime;
  }
  private handleAnimationStart() {
    this.dispatchEvent(HippyAnimationEvent.START);
  }

  private handleAnimationEnd() {
    this.dispatchEvent(HippyAnimationEvent.END);
  }

  private dispatchEvent(eventName: HippyAnimationEvent) {
    this.context.sendEvent(eventName, this.id);
  }
}
function object2Style(object: {[key: string]: string}) {
  const keys = Object.keys(object);
  let styleString = '';
  for (const key of keys) {
    styleString += `${key}:${object[key]}`;
  }
  return styleString;
}

function createAnimationKeyFrame(
  beginKeyFrame: {[key: string]: string},
  endKeyFrame: {[key: string]: string}, keyFrameName: string,
) {
  return ` @keyframes ${keyFrameName}{
    from {${object2Style(beginKeyFrame)}}
    to {${object2Style(endKeyFrame)}}
  }`;
}

function appendAnimationKeyFrame(keyFrame: string) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = keyFrame;
  document.getElementsByTagName('head')[0].appendChild(style);
}

function updateAnimationKeyFrame(keyFrameName: string, newKeyFrame: string) {
  const oldKeyFrameStyle = getKeyFrameFromCssStyle(keyFrameName);
  oldKeyFrameStyle.styleSheet.rules.length && oldKeyFrameStyle.styleSheet.deleteRule(0);
  oldKeyFrameStyle.styleSheet.insertRule(newKeyFrame);
}

function getKeyFrameFromCssStyle(name) {
  const keyFrameStyle: any = {};
  const ss = document.styleSheets;
  for (let i = 0; i < ss.length; ++i) {
    const item = ss[i];
    if ((item.cssRules[0] as CSSKeyframesRule)?.name === name) {
      const [rule] = item.cssRules;
      keyFrameStyle.cssRule = rule;
      keyFrameStyle.styleSheet = ss[i];
      keyFrameStyle.index = 0;
    }
  }
  return keyFrameStyle;
}

function createCssAnimation(
  duration: string, name: string, timeFunction = 'linear', delay = '0s', state: AnimationPlayState = 'running',
  repeat: AnimationIterationCount = '1', fillMode: AnimationFillMode = 'forwards',
) {
  return `${duration} ${timeFunction} ${delay} ${repeat} normal ${fillMode} ${state} ${name}`;
}
function camel2Kebab(str: string) {
  return str.replace(/[A-Z]/g, item => `-${item.toLowerCase()}`);
}

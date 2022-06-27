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
import { HippyBaseView, ComponentContext } from '../types';
import { setElementStyle } from '../common';
import { HippyWebModule } from '../base';
import AnimationFillMode = Property.AnimationFillMode;
import AnimationIterationCount = Property.AnimationIterationCount;
import AnimationPlayState = Property.AnimationPlayState;
export class AnimationModule extends HippyWebModule {
  public name = 'AnimationModule';
  private animationPool: {[key: string]: SimpleAnimation|null} = {};
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

  public updateAnimation(animationId: number, param: AnimationOptions) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation update failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.update(param);
  }

  public startAnimation(animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation start failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.start();
  }

  public pauseAnimation(animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation stop failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.stop();
  }

  public resumeAnimation(animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation resume failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.resume();
  }

  public destroyAnimation(animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation destroy failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.destroy();
  }

  public linkAnimation2Element(animationId: number, component: HippyBaseView, animationProperty: string|object) {
    if (!this.animationPool[animationId]) {
      return;
    }
    this.animationPool[animationId]!.refNodeId = component.id;
    this.animationPool[animationId]!.animationProperty = animationProperty;
    this.animationPool[animationId]!.initAnimation(component.dom!);
  }

  public getAnimationStartValue(animationId: number) {
    if (!this.animationPool[animationId]) {
      return null;
    }
    return this.animationPool[animationId]!.animationBeginValue;
  }
}

export type HippyAnimationValue = number | { animationId: number };
enum HippyAnimationEvent {
  START = 'onHippyAnimationStart',
  END = 'onHippyAnimationEnd',
  CANCEL = 'onHippyAnimationCancel',
  REPAET = 'onHippyAnimationRepeat',
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

class SimpleAnimation {
  public id: string | number;
  public context: ComponentContext;
  public timeMode: string | undefined;
  public animationInfo: AnimationOptions;
  public refCssProperty: string | null = null;
  public refNodeId: string | number | undefined;
  public dom: HTMLElement | null = null;
  public animationStamp = Date.now();
  private animationState: 'play'|'end'|'wait' = 'wait';

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

  public set nodeId(nodeId: string | number) {
    this.refNodeId = nodeId;
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

  public get animationDom() {
    if (this.dom) {
      return this.dom;
    }
    if (this.refNodeId) {
      this.dom = document.getElementById(String(this.refNodeId));
    }
    return this.dom;
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
      return String(1);
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
    if (this.refCssProperty && TransformList[this.refCssProperty]) {
      return 'transform';
    }
    return this.refCssProperty;
  }

  public initAnimation(element: HTMLElement) {
    this.dom = element;
    let data = this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue());
    if (this.animationState === 'end' || this.animationState === 'play') {
      data = this.createAnimationKeyFrame(this.createAnimationEndAndEndValue());
    }
    this.updateAnimationInfoToPageStyle(data);
    const animation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, 'paused', this.iteration, 'both',
    );
    this.animationUpdate2Css(animation);
    element.addEventListener('animationend', this.handleAnimationEnd);
  }

  public start() {
    this.changeAnimationStatus('running');
    const data = this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue());
    this.updateAnimationInfoToPageStyle(data);
    this.animationState = 'play';
    setTimeout(() => {
      this.handleAnimationStart({ animationName: this.animationName, elapsedTime: 0, pseudoElement: '' } as AnimationEvent);
      this.animationState = 'end';
    }, this.animationInfo.delay ?? 0);
  }

  public stop() {
    this.changeAnimationStatus('paused');
  }

  public resume() {
    this.changeAnimationStatus('running');
  }

  public destroy() {
    this.changeAnimationStatus('paused');
    this.animationUpdate2Css(null);
    this.dom?.removeEventListener?.('animationstart', this.handleAnimationStart);
    this.dom?.removeEventListener?.('animationend', this.handleAnimationEnd);
  }

  public update(param: AnimationOptions) {
    this.animationState = 'wait';
    this.animationInfo = param;
    this.animationStamp = Date.now();
    this.updateAnimationInfoToPageStyle(this.createAnimationKeyFrame(this.createAnimationBeginAndEndValue()));
    const animation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, 'paused', this.iteration, 'both',
    );
    this.animationUpdate2Css(animation);
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
    const element = this.dom;
    if (!element) {
      return;
    }
    const keyFrame = getKeyFrameFromCssStyle(this.animationName);
    if (!keyFrame.cssRule) {
      return;
    }
    const pauseAnimation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, status, this.iteration, 'both',
    );
    this.animationUpdate2Css(pauseAnimation);
  }

  private animationUpdate2Css(animation: string|null) {
    const element = this.dom;
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
    if (this.refCssProperty === 'scale' || this.refCssProperty === 'opacity') {
      unit = '';
    }
    return `${value}${unit}`;
  }

  private handleAnimationStart(event: AnimationEvent) {
    console.log('begin animation');
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.START);
    }
  }

  private handleAnimationEnd(event: AnimationEvent) {
    console.log('end animation');
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.END);
    }
    event.stopPropagation();
    this.changeAnimationStatus('paused');
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

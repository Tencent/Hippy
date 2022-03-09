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

import {  BaseView } from '../../types';
import { dispatchModuleEventToHippy, setElementStyle } from '../common';
import { HippyWebModule } from '../base';

export class AnimationModule extends HippyWebModule {
  public static moduleName = 'AnimationModule';
  private animationPool: {[key: string]: SimpleAnimation|null} = {};


  public createAnimation(callBackId: number, animationId: number, params: AnimationOptions, mode?: string) {
    if (this.animationPool[animationId]) {
      return;
    }
    if (!mode) {
      this.animationPool[animationId] = null;
    }
    if (mode === 'timing') {
      this.animationPool[animationId] = new SimpleAnimation(animationId, params as AnimationOptions, mode);
    }
  }

  public updateAnimation(callBackId: number, animationId: number, param: AnimationOptions) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation update failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.update(param);
  }

  public startAnimation(callBackId: number, animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation start failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.start();
  }

  public stopAnimation(callBackId: number, animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation stop failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.stop();
  }

  public resumeAnimation(callBackId: number, animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation resume failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.resume();
  }

  public destroyAnimation(callBackId: number, animationId: number) {
    if (!this.animationPool[animationId]) {
      console.log('hippy', 'animation destroy failed, animationId not find animation object');
      return;
    }
    this.animationPool[animationId]!.destroy();
  }

  public initialize() {

  }

  public destroy() {
  }

  public linkAnimation2Element(animationId: number, component: BaseView, animationProperty: string) {
    if (!this.animationPool[animationId]) {
      return;
    }
    this.animationPool[animationId]!.refNodeId = component.id;
    this.animationPool[animationId]!.animationProperty = animationProperty;
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
  public refNodeId: string | number | undefined;
  public animationInfo: AnimationOptions;
  public timeMode: string | undefined;
  public transformName: string | null = null;

  public constructor(animationId: string | number, options: AnimationOptions, mode?: string) {
    this.animationInfo = options;
    this.timeMode = mode;
    this.id = animationId;
  }

  public static buildTransformSingleValue(value: string) {
    return `${value} `;
  }

  public static buildTransitionSingleValue(value: string) {
    return `${value},`;
  }

  public static transitionStringFormat(value: string) {
    let formatValue = value;
    if (value.length > 0 && value.charAt(value.length - 1) === ',') {
      formatValue = value.substring(0, value.length - 1);
    }
    return formatValue;
  }

  public set nodeId(nodeId: string | number) {
    this.refNodeId = nodeId;
  }

  public set animationProperty(name: string) {
    this.transformName = name;
  }

  public get realAnimationPropertyName() {
    if (this.transformName && TransformList[this.transformName]) {
      return 'transform';
    }
    return this.transformName;
  }

  public get transitionPropertyName() {
    if (this.transformName && TransformList[this.transformName]) {
      return 'transform';
    }
    return Camel2Kebab(this.transformName);
  }

  public get transitionValue() {
    return `${this.transitionPropertyName} ${this.animationTime},`;
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

  // TODO optimization
  public get initStartValue() {
    return `${this.transformName}(${this.animationBeginValue})`;
  }

  public start() {
    if (!this.refNodeId) {
      return;
    }
    const element = document.getElementById(String(this.refNodeId));
    if (!element) {
      return;
    }
    const animationCssEndValue = this.buildCssValue(this.animationEndValue);
    this.updateElementTransition(element, this.transitionValue);
    setTimeout(() => {
      this.dispatchEvent(HippyAnimationEvent.START);
      this.updateElementAnimationValue(element, animationCssEndValue);
      setTimeout(() => {
        this.dispatchEvent(HippyAnimationEvent.END);
      }, this.animationInfo.duration);
    }, 16);
  }

  public stop() {}

  public update(param: AnimationOptions) {
    this.animationInfo = param;
  }

  public resume() {}

  public destroy() {}

  private dispatchEvent(eventName: HippyAnimationEvent) {
    dispatchModuleEventToHippy([eventName, this.id]);
  }

  private buildCssValue(value: string) {
    if (this.realAnimationPropertyName === 'transform') {
      return `${this.transformName}(${value})`;
    }
    return value;
  }

  private buildAnimationValue(value: any) {
    let unit = 'px';
    if (this.animationInfo.valueType) {
      unit = this.animationInfo.valueType;
    }
    if (this.transformName === 'scale') {
      unit = '';
    }
    return `${value}${unit}`;
  }

  private updateElementAnimationValue(element: HTMLElement, animationCssValue: string) {
    if (!this.realAnimationPropertyName) {
      return;
    }
    const oldAnimationValue = element.style[this.realAnimationPropertyName];
    let newAnimationValue = animationCssValue;
    if (
      oldAnimationValue
      && this.realAnimationPropertyName === 'transform'
      && oldAnimationValue.indexOf(this.transformName) !== -1
    ) {
      newAnimationValue = '';
      const oldAnimationKey = oldAnimationValue.split(' ');
      for (const value of oldAnimationKey) {
        if (!value || value.trim().length === 0) {
          return;
        }
        let tempValue = SimpleAnimation.buildTransformSingleValue(animationCssValue);
        if (value.length > 0 && value.indexOf(this.transformName) === -1) {
          tempValue = SimpleAnimation.buildTransformSingleValue(value);
        }
        newAnimationValue += tempValue;
      }
    }
    const style = {};
    style[this.realAnimationPropertyName] = newAnimationValue;
    setElementStyle(element, style);
  }

  private updateElementTransition(element: HTMLElement, transitionValue: string) {
    const oldTransition = element.style.transition;
    let newTransition = transitionValue;
    if (oldTransition && oldTransition.indexOf(this.transitionPropertyName) !== -1) {
      newTransition = '';
      oldTransition.split(',').map((value) => {
        let tempValue = SimpleAnimation.buildTransitionSingleValue(transitionValue);
        if (value.length > 0 && value.indexOf(this.transitionPropertyName) !== -1) {
          tempValue = SimpleAnimation.buildTransitionSingleValue(value);
        }
        newTransition += tempValue;
      });
    }
    setElementStyle(element, { transition: SimpleAnimation.transitionStringFormat(newTransition) });
  }
}

function Camel2Kebab(str) {
  return str.replace(/[A-Z]/g, item => `-${item.toLowerCase()}`);
}

function Kebab2Camel(str) {
  return str.replace(/-([a-z])/g, (_keb, item) => item.toUpperCase());
}

function createKeyFrame() {

}

function updateKeyFrame() {

}


class SimpleAnimation2 {
  public id: string | number;
  public refNodeId: string | number | undefined;
  public animationInfo: AnimationOptions;
  public timeMode: string | undefined;
  public transformName: string | null = null;

  public constructor(animationId: string | number, options: AnimationOptions, mode?: string) {
    this.animationInfo = options;
    this.timeMode = mode;
    this.id = animationId;
  }

  public static buildTransformSingleValue(value: string) {
    return `${value} `;
  }

  public static buildTransitionSingleValue(value: string) {
    return `${value},`;
  }

  public static transitionStringFormat(value: string) {
    let formatValue = value;
    if (value.length > 0 && value.charAt(value.length - 1) === ',') {
      formatValue = value.substring(0, value.length - 1);
    }
    return formatValue;
  }

  public set nodeId(nodeId: string | number) {
    this.refNodeId = nodeId;
  }

  public set animationProperty(name: string) {
    this.transformName = name;
  }

  public get realAnimationPropertyName() {
    if (this.transformName && TransformList[this.transformName]) {
      return 'transform';
    }
    return this.transformName;
  }

  public get transitionPropertyName() {
    if (this.transformName && TransformList[this.transformName]) {
      return 'transform';
    }
    return Camel2Kebab(this.transformName);
  }

  public get transitionValue() {
    return `${this.transitionPropertyName} ${this.animationTime},`;
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

  // TODO optimization
  public get initStartValue() {
    return `${this.transformName}(${this.animationBeginValue})`;
  }

  public get animationName() {
    return `hippy-keyframe-${this.id}`;
  }

  public start() {
    if (!this.refNodeId) {
      return;
    }
    const element = document.getElementById(String(this.refNodeId));
    if (!element) {
      return;
    }
    const animationCssBeginValue = this.buildCssValue(this.animationBeginValue);
    const animationCssEndValue = this.buildCssValue(this.animationEndValue);
    const beginFrame = {};
    const endFrame = {};
    beginFrame[this.animationProperty] = animationCssBeginValue;
    endFrame[this.animationProperty] = animationCssEndValue;
    const keyFrameData = createAnimationKeyFrame(beginFrame, endFrame, this.animationName);
    const keyFrame = getKeyFrame(this.animationName);
    if (!keyFrame.cssRule) {
      appendAnimationKeyFrame(keyFrameData);
    } else {
      updateAnimationKeyFrame(this.animationName, keyFrameData);
    }
    const animation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime,
    );
    this.animationUpdate2Css(animation);
    element.addEventListener('animationstart', this.handleAnimationStart.bind(this));
  }

  public stop() {
    if (!this.refNodeId) {
      return;
    }
    const element = document.getElementById(String(this.refNodeId));
    if (!element) {
      return;
    }
    const keyFrame = getKeyFrame(this.animationName);
    if (!keyFrame.cssRule) {
      return;
    }
    const pauseAnimation = createCssAnimation(
      this.animationTime, this.animationName,
      this.animationInfo.timingFunction, this.delayTime, 'paused',
    );
    this.animationUpdate2Css(pauseAnimation);
  }

  public update(param: AnimationOptions) {
    this.animationInfo = param;
  }

  public animationUpdate2Css(animation: string) {
    const element = document.getElementById(String(this.refNodeId));
    if (!element) {
      return;
    }
    let oldAnimationList = element.style.animation ? element.style.animation.split(',') : [];
    if (!oldAnimationList) {
      oldAnimationList = [];
      oldAnimationList.push(animation);
    } else {
      const index = oldAnimationList.findIndex((value: string) => value.indexOf(this.animationName) !== -1) ?? -1;
      if (index !== -1) {
        oldAnimationList[index] = animation;
      } else {
        oldAnimationList.push(animation);
      }
    }
    setElementStyle(element, { animation: oldAnimationList.join(',') });
  }

  public resume() {}

  public destroy() {}

  private dispatchEvent(eventName: HippyAnimationEvent) {
    dispatchModuleEventToHippy([eventName, this.id]);
  }

  private buildCssValue(value: string) {
    if (this.realAnimationPropertyName === 'transform') {
      return `${this.transformName}(${value})`;
    }
    return value;
  }

  private buildAnimationValue(value: any) {
    let unit = 'px';
    if (this.animationInfo.valueType) {
      unit = this.animationInfo.valueType;
    }
    if (this.transformName === 'scale') {
      unit = '';
    }
    return `${value}${unit}`;
  }

  private updateElementAnimationValue(element: HTMLElement, animationCssValue: string) {
    if (!this.realAnimationPropertyName) {
      return;
    }
    const oldAnimationValue = element.style[this.realAnimationPropertyName];
    let newAnimationValue = animationCssValue;
    if (
      oldAnimationValue
      && this.realAnimationPropertyName === 'transform'
      && oldAnimationValue.indexOf(this.transformName) !== -1
    ) {
      newAnimationValue = '';
      const oldAnimationKey = oldAnimationValue.split(' ');
      for (const value of oldAnimationKey) {
        if (!value || value.trim().length === 0) {
          return;
        }
        let tempValue = SimpleAnimation.buildTransformSingleValue(animationCssValue);
        if (value.length > 0 && value.indexOf(this.transformName) === -1) {
          tempValue = SimpleAnimation.buildTransformSingleValue(value);
        }
        newAnimationValue += tempValue;
      }
    }
    const style = {};
    style[this.realAnimationPropertyName] = newAnimationValue;
    setElementStyle(element, style);
  }

  private updateElementTransition(element: HTMLElement, transitionValue: string) {
    const oldTransition = element.style.transition;
    let newTransition = transitionValue;
    if (oldTransition && oldTransition.indexOf(this.transitionPropertyName) !== -1) {
      newTransition = '';
      oldTransition.split(',').map((value) => {
        let tempValue = SimpleAnimation.buildTransitionSingleValue(transitionValue);
        if (value.length > 0 && value.indexOf(this.transitionPropertyName) !== -1) {
          tempValue = SimpleAnimation.buildTransitionSingleValue(value);
        }
        newTransition += tempValue;
      });
    }
    setElementStyle(element, { transition: SimpleAnimation.transitionStringFormat(newTransition) });
  }

  private handleAnimationStart(event: AnimationEvent) {
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.START);
    }
  }

  private handleAnimationEnd(event: AnimationEvent) {
    if (event.animationName === this.animationName) {
      this.dispatchEvent(HippyAnimationEvent.END);
    }
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
    from:${object2Style(beginKeyFrame)},
    to:${object2Style(endKeyFrame)}
  }`;
}

function appendAnimationKeyFrame(keyFrame: string) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = keyFrame;
  document.getElementsByTagName('head')[0].appendChild(style);
}

function updateAnimationKeyFrame(keyFrameName: string, newKeyFrame: string) {
  const oldKeyFrameStyle = getKeyFrame(keyFrameName);
  if (oldKeyFrameStyle.cssRule && oldKeyFrameStyle.styleSheet) {
    oldKeyFrameStyle.styleSheet.deleteRule(oldKeyFrameStyle.index);
  }
  oldKeyFrameStyle.styleSheet.insertRule(newKeyFrame, oldKeyFrameStyle.index);
}

function getKeyFrame(name) {
  const keyFrameStyle: any = {};
  const ss = document.styleSheets;
  for (let i = 0; i < ss.length; ++i) {
    const item = ss[i];
    if (item.cssRules[0] && (item.cssRules[0] as CSSKeyframesRule).name
      && (item.cssRules[0] as CSSKeyframesRule).name === name) {
      keyFrameStyle.cssRule = item.cssRules[0];
      keyFrameStyle.styleSheet = ss[i];
      keyFrameStyle.index = 0;
    }
  }
  return keyFrameStyle;
}

function createCssAnimation(duration: string, name: string, timeFunction = 'linear', delay = '0s', state = 'paused', repeat = '0', fillMode = 'forwards') {
  return `${duration} ${timeFunction} ${delay} ${repeat} normal ${fillMode} ${state} ${name}`;
}

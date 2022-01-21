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

import { dispatchModuleEventToHippy, setElementStyle } from '../../common';

export function createAnimation(animationId: number, params: { [key: string]: any }, mode: string) {
  if (AnimationPools[animationId]) {
    console.error('animation build error,animation id exits');
    return;
  }
  AnimationPools[animationId] = new SimpleAnimation(animationId, params as AnimationOptions, mode);
}
export function updateAnimation(animationId: number, params: { [key: string]: any }) {
  AnimationPools[animationId]?.update(params);
}
export function startAnimation(animationId: number) {
  AnimationPools[animationId]?.start();
}
export function createAnimationSet(_animationId: number, _params: { [key: string]: any }) {}
export function stopAnimation(animationId: number) {
  AnimationPools[animationId]?.start();
}
export function pauseAnimation(_animationId: number) {}
export function resumeAnimation(_animationId: number) {}
export function destroyAnimation(_animationId: number) {}
export function findAnimation(animationId: number | string): SimpleAnimation | null {
  if (AnimationPools[animationId]) {
    return AnimationPools[animationId];
  }
  return null;
}
export type AnimationValue = number | { animationId: number };
enum AnimationEvent {
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
const AnimationPools = {};
type AnimationDirection = 'left' | 'right' | 'top' | 'bottom' | 'center';
interface AnimationOptions {
  startValue: AnimationValue;
  toValue: AnimationValue;
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
      this.dispatchEvent(AnimationEvent.START);
      this.updateElementAnimationValue(element, animationCssEndValue);
      setTimeout(() => {
        this.dispatchEvent(AnimationEvent.END);
      }, this.animationInfo.duration);
    }, 16);
  }
  public stop() {}

  public update(param: AnimationOptions) {
    this.animationInfo = param;
  }

  private dispatchEvent(eventName: AnimationEvent) {
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

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

import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';
import type { NeedToTyped, CommonMapParams, AnimationStyle } from '../types';

import { EventBus as HippyEventBus } from '../runtime/event/event-bus';
import { Native } from '../runtime/native';
import { getNormalizeEventName } from '../util';

type NodeStyle = CommonMapParams;

/**
 * register an animated Vue component
 *
 * @param vueApp - Vue APP instance
 */
export function registerAnimation(vueApp: App): void {
  // Constants for animations
  const MODULE_NAME = 'AnimationModule';
  const DEFAULT_OPTION = {
    valueType: undefined,
    delay: 0,
    startValue: 0,
    toValue: 0,
    duration: 0,
    direction: 'center',
    timingFunction: 'linear',
    repeatCount: 0,
    inputRange: [],
    outputRange: [],
  };

  /**
   * parse value of special value type
   *
   * @param valueType - the type of value
   * @param value - the value of color
   */
  function parseValue(valueType, value: NeedToTyped): NeedToTyped {
    if (
      valueType === 'color'
      && ['number', 'string'].indexOf(typeof value) >= 0
    ) {
      return Native.parseColor(value);
    }
    return value;
  }

  function repeatCountDict(repeatCount: string | number): string | number {
    if (repeatCount === 'loop') {
      return -1;
    }
    return repeatCount;
  }

  /**
   * Create the standalone animation
   *
   * @param option - options
   */
  function createAnimation(option): AnimationStyle {
    const {
      mode = 'timing',
      valueType,
      startValue,
      toValue,
      ...others
    } = option;
    const fullOption = {
      ...DEFAULT_OPTION,
      ...others,
    };
    if (valueType !== undefined) {
      fullOption.valueType = option.valueType;
    }
    fullOption.startValue = parseValue(fullOption.valueType, startValue);
    fullOption.toValue = parseValue(fullOption.valueType, toValue);
    fullOption.repeatCount = repeatCountDict(fullOption.repeatCount);
    const animationId = Native.callNativeWithCallbackId(
      MODULE_NAME,
      'createAnimation',
      true,
      mode,
      fullOption,
    );
    return {
      animationId,
    };
  }

  /**
   * Create the animationSet
   */
  function createAnimationSet(children, repeatCount: string | number = 0) {
    return Native.callNativeWithCallbackId(
      MODULE_NAME,
      'createAnimationSet',
      true,
      {
        children,
        repeatCount,
      },
    );
  }

  /**
   * Generate the styles from animation and animationSet Ids.
   */
  function createStyle(actions, childAnimationIdList: number[] = []): NodeStyle {
    const style = {};
    Object.keys(actions).forEach((key) => {
      if (Array.isArray(actions[key])) {
        // Process AnimationSet from Array.
        const actionSet = actions[key];
        const { repeatCount } = actionSet[actionSet.length - 1];
        const animationSetActions = actionSet.map((a) => {
          const action = createAnimation({ ...a, repeatCount: 0 });
          childAnimationIdList.push(action.animationId);
          action.follow = true;
          return action;
        });
        const animationSetId = createAnimationSet(
          animationSetActions,
          repeatCountDict(repeatCount),
        );
        style[key] = {
          animationId: animationSetId,
        };
      } else {
        // Process standalone Animation.
        const action = actions[key];
        const animation = createAnimation(action);
        const { animationId } = animation;
        style[key] = {
          animationId,
        };
      }
    });
    return style;
  }

  /**
   * Get animationIds from style for start/pause/destroy actions.
   */
  function getAnimationIds(style) {
    const { transform, ...otherStyles } = style;
    let animationIds = Object.keys(otherStyles).map(key => style[key].animationId);
    if (Array.isArray(transform) && transform.length > 0) {
      const transformIds: number[] = [];
      transform.forEach(entity => Object.keys(entity).forEach((key) => {
        if (entity[key]) {
          const { animationId } = entity[key];
          if (typeof animationId === 'number' && animationId % 1 === 0) {
            transformIds.push(animationId);
          }
        }
      }));
      animationIds = [...animationIds, ...transformIds];
    }
    return animationIds;
  }

  /**
   * register the animation component.
   */
  vueApp.component('Animation', {
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      playing: {
        type: Boolean,
        default: false,
      },
      actions: {
        type: Object,
        required: true,
      },
      props: Object,
    },
    data() {
      return {
        style: {},
        animationIds: [],
        animationEventMap: {},
        childAnimationIdList: [],
      };
    },
    watch: {
      playing(to, from) {
        if (!from && to) {
          this.start();
        } else if (from && !to) {
          this.pause();
        }
      },
      actions() {
        this.destroy();
        this.create();
        // trigger actionsDidUpdate in setTimeout callback to make sure node style updated
        setTimeout(() => {
          const actionsDidUpdateFunc = this.$attrs[getNormalizeEventName('actionsDidUpdate')];
          if (typeof actionsDidUpdateFunc === 'function') {
            actionsDidUpdateFunc();
          }
        });
      },
    },
    beforeMount() {
      let animationEventName = 'onAnimation';
      // If running in Android, change it.
      if (Native.isAndroid()) {
        animationEventName = 'onHippyAnimation';
      }
      this.childAnimationIdList = [];
      this.animationEventMap = {
        start: `${animationEventName}Start`,
        end: `${animationEventName}End`,
        repeat: `${animationEventName}Repeat`,
        cancel: `${animationEventName}Cancel`,
      };
      this.create();
    },
    mounted() {
      const { playing } = this.$props;
      if (playing) {
        setTimeout(() => {
          this.start();
        }, 0);
      }
    },
    beforeDestroy() {
      this.destroy();
    },
    deactivated() {
      // for keep-alive deactivated
      this.pause();
    },
    activated() {
      // for keep-alive activated
      this.resume();
    },
    methods: {
      create() {
        const {
          actions: { transform, ...actions },
        } = this.$props;
        const style = createStyle(actions, this.childAnimationIdList);
        if (transform) {
          const transformAnimations = createStyle(
            transform,
            this.childAnimationIdList,
          );
          style.transform = Object.keys(transformAnimations).map(key => ({
            [key]: transformAnimations[key],
          }));
        }

        // Turn to be true at first startAnimation, and be false again when destroyed.
        this.$alreadyStarted = false;
        // Generated style
        this.style = style;
      },
      removeAnimationEvent() {
        Object.keys(this.animationEventMap).forEach((key) => {
          if (typeof this.$attrs[getNormalizeEventName(key)] !== 'function') return;
          const eventName = this.animationEventMap[key];
          if (eventName && typeof this[`${eventName}`] === 'function') {
            HippyEventBus.$off(eventName, this[`${eventName}`]);
          }
        });
      },
      addAnimationEvent() {
        Object.keys(this.animationEventMap).forEach((key) => {
          if (typeof this.$attrs[getNormalizeEventName(key)] !== 'function') return;
          const eventName = this.animationEventMap[key];
          if (eventName) {
            this[`${eventName}`] = (animationId) => {
              if (this.animationIds.indexOf(animationId) >= 0) {
                if (key !== 'repeat') {
                  HippyEventBus.$off(eventName, this[`${eventName}`]);
                }
                this.$emit(key);
              }
            };
            HippyEventBus.$on(eventName, this[`${eventName}`]);
          }
        });
      },
      reset() {
        this.$alreadyStarted = false;
      },
      start() {
        if (!this.$alreadyStarted) {
          const animationIds = getAnimationIds(this.style);
          this.animationIds = animationIds;
          this.$alreadyStarted = true;
          this.removeAnimationEvent();
          this.addAnimationEvent();
          animationIds.forEach(animationId => Native.callNative(MODULE_NAME, 'startAnimation', animationId));
        } else {
          this.resume();
        }
      },
      resume() {
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach(animationId => Native.callNative(MODULE_NAME, 'resumeAnimation', animationId));
      },
      pause() {
        if (!this.$alreadyStarted) {
          return;
        }
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach(animationId => Native.callNative(MODULE_NAME, 'pauseAnimation', animationId));
      },
      destroy() {
        this.removeAnimationEvent();
        this.$alreadyStarted = false;
        const animationIds = getAnimationIds(this.style);
        this.childAnimationIdList.forEach(animationId => Number.isInteger(animationId)
            && Native.callNative(MODULE_NAME, 'destroyAnimation', animationId));
        animationIds.forEach(animationId => Native.callNative(MODULE_NAME, 'destroyAnimation', animationId));
        this.childAnimationIdList = [];
      },
    },
    render() {
      return h(
        this.tag,
        {
          useAnimation: true,
          style: this.style,
          tag: this.$props.tag,
          ...this.$props.props,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });
}

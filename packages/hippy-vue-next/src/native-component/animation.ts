import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import type { CommonMapParams } from '../../global';
import { EventBus as HippyEventBus } from '../runtime/event/event-bus';
import { Native } from '../runtime/native';

/** 各类节点样式类型 */
type NodeStyle = CommonMapParams;

/** 动画样式类型 */
export interface AnimationStyle {
  animationId: number;
  follow?: boolean;
}

/**
 * 注册动画Vue组件
 *
 * @param vueApp - Vue APP 实例
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
   * @param valueType - 值类型
   * @param value - 要处理的颜色值
   */
  function parseValue(valueType, value: any): any {
    if (
      valueType === 'color'
      && ['number', 'string'].indexOf(typeof value) >= 0
    ) {
      return Native.parseColor(value);
    }
    return value;
  }

  /**
   * Create the standalone animation
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
  function createAnimationSet(children, repeatCount = 0) {
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
  function getStyle(actions, childAnimationIdList: number[] = []): NodeStyle {
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
          repeatCount,
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
   * Register the animation component.
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
        // FIXME: Should diff the props and use updateAnimation method to update the animation.
        //        Hard restart the animation is no correct.
        this.destroy();
        this.create();
      },
    },
    created() {
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
    },
    beforeMount() {
      this.create();
    },
    mounted() {
      const { playing } = this.$props;
      if (playing) {
        this.start();
      }
    },
    beforeDestroy() {
      this.destroy();
    },
    methods: {
      create() {
        const {
          actions: { transform, ...actions },
        } = this.$props;
        const style = getStyle(actions, this.childAnimationIdList);
        if (transform) {
          const transformAnimations = getStyle(
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
          const eventName = this.animationEventMap[key];
          if (eventName && this[`${eventName}`]) {
            HippyEventBus.$off(eventName, this[`${eventName}`]);
          }
        });
      },
      addAnimationEvent() {
        Object.keys(this.animationEventMap).forEach((key) => {
          const eventName = this.animationEventMap[key];
          if (eventName) {
            this[`${eventName}`] = (animationId) => {
              if (this.animationIds.indexOf(animationId) >= 0) {
                if (key !== 'repeat') {
                  HippyEventBus.$off(eventName, this[`${eventName}`]);
                }
                HippyEventBus.$emit(key);
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
      // vue3子节点slot做了更改，需要判断是否有slot
      return h(
        this.tag,
        {
          useAnimation: true,
          style: this.style,
          ...this.props,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });
}

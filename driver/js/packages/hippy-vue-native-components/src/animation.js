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

function registerAnimation(Vue) {
  // Constants for animations
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
   * @param {string} valueType
   * @param {*} originalValue
   */
  function parseValue(valueType, originalValue) {
    if (valueType === 'color' && ['number', 'string'].indexOf(typeof originalValue) >= 0) {
      return Vue.Native.parseColor(originalValue);
    }
    return originalValue;
  }

  /**
   * Create the standalone animation
   */
  function createAnimation(option) {
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
    fullOption.mode = mode;
    const animation = new global.Hippy.Animation(fullOption);
    const animationId = animation.getId();
    return {
      animation,
      animationId,
    };
  }

  /**
   * Create the animationSet
   */
  function createAnimationSet(children, repeatCount = 0) {
    const animation = new global.Hippy.AnimationSet({
      children,
      repeatCount,
    });
    const animationId = animation.getId();
    return {
      animation,
      animationId,
    };
  }

  function repeatCountDict(repeatCount) {
    if (repeatCount === 'loop') {
      return -1;
    }
    return repeatCount;
  }

  /**
   * Generate the styles from animation and animationSet Ids.
   */
  function createStyle(actions,  animationIdsMap = {}) {
    const style = {};
    Object.keys(actions).forEach((key) => {
      if (Array.isArray(actions[key])) {
        // Process AnimationSet from Array.
        const actionSet = actions[key];
        const { repeatCount } = actionSet[actionSet.length - 1];
        const animationSetActions = actionSet.map((animationChild) => {
          const { animationId, animation } = createAnimation(Object.assign({}, animationChild, { repeatCount: 0 }));
          Object.assign(animationIdsMap, {
            [animationId]: animation,
          });
          return { animationId, follow: true };
        });
        const { animationId, animation } = createAnimationSet(animationSetActions, repeatCountDict(repeatCount));
        style[key] = {
          animationId,
        };
        Object.assign(animationIdsMap, {
          [animationId]: animation,
        });
      } else {
        // Process standalone Animation.
        const action = actions[key];
        const { animationId, animation } = createAnimation(action);
        Object.assign(animationIdsMap, {
          [animationId]: animation,
        });
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
      const transformIds = [];
      transform.forEach(entity => Object.keys(entity)
        .forEach((key) => {
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
  Vue.component('Animation', {
    inheritAttrs: false,
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
        animationIdsMap: {},
        animationEventMap: {},
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
          if (typeof this.$listeners.actionsDidUpdate === 'function') {
            this.$listeners.actionsDidUpdate();
          }
        });
      },
    },
    created() {
      this.animationEventMap = {
        start: 'animationstart',
        end: 'animationend',
        repeat: 'animationrepeat',
        cancel: 'animationcancel',
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
        const { actions: { transform, ...actions } } = this.$props;
        this.animationIdsMap = {};
        const style = createStyle(actions, this.animationIdsMap);
        if (transform) {
          const transformAnimations = createStyle(transform, this.animationIdsMap);
          style.transform = Object.keys(transformAnimations).map(key => ({
            [key]: transformAnimations[key],
          }));
        }
        // Turn to be true at first startAnimation, and be false again when destroy.
        this.$alreadyStarted = false;
        // Generated style
        this.style = style;
      },
      removeAnimationEvent() {
        this.animationIds.forEach((animationId) => {
          const animation = this.animationIdsMap[animationId];
          if (!animation) return;
          Object.keys(this.animationEventMap).forEach((key) => {
            if (typeof this.$listeners[key] !== 'function') return;
            const eventName = this.animationEventMap[key];
            if (!eventName) return;
            animation.removeEventListener(eventName);
          });
        });
      },
      addAnimationEvent() {
        this.animationIds.forEach((animationId) => {
          const animation = this.animationIdsMap[animationId];
          if (!animation) return;
          Object.keys(this.animationEventMap).forEach((key) => {
            if (typeof this.$listeners[key] !== 'function') return;
            const eventName = this.animationEventMap[key];
            if (!eventName) return;
            animation.addEventListener(eventName, () => {
              this.$emit(key);
            });
          });
        });
      },
      reset() {
        this.$alreadyStarted = false;
      },
      start() {
        if (!this.$alreadyStarted) {
          this.animationIds = getAnimationIds(this.style);
          this.$alreadyStarted = true;
          this.removeAnimationEvent();
          this.addAnimationEvent();
          this.animationIds.forEach((animationId) => {
            const animation = this.animationIdsMap[animationId];
            animation && animation.start();
          });
        } else {
          this.resume();
        }
      },
      resume() {
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach((animationId) => {
          const animation = this.animationIdsMap[animationId];
          animation && animation.resume();
        });
      },
      pause() {
        if (!this.$alreadyStarted) {
          return;
        }
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach((animationId) => {
          const animation = this.animationIdsMap[animationId];
          animation && animation.pause();
        });
      },
      destroy() {
        this.removeAnimationEvent();
        this.$alreadyStarted = false;
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach((animationId) => {
          const animation = this.animationIdsMap[animationId];
          animation && animation.destroy();
        });
      },
    },
    template: `
      <component :is="tag" :useAnimation="true" :style="style" v-bind="props">
        <slot />
      </component>
    `,
  });
}

export default registerAnimation;

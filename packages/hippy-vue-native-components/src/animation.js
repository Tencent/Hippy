
function registerAnimation(Vue) {
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
   * Create the standalone animation
   */
  function createAnimation(option) {
    const {
      mode = 'timing',
      valueType,
      ...others
    } = option;
    const fullOption = {
      ...DEFAULT_OPTION,
      ...others,
    };
    if (valueType !== undefined) {
      fullOption.valueType = option.valueType;
    }
    const animationId = Vue.Native.callNativeWithCallbackId(MODULE_NAME, 'createAnimation', true, mode, fullOption);
    return {
      animationId,
    };
  }

  /**
   * Create the animationSet
   */
  function createAnimationSet(children, repeatCount = 0) {
    return Vue.Native.callNativeWithCallbackId(MODULE_NAME, 'createAnimationSet', true, {
      children,
      repeatCount,
    });
  }

  /**
   * Generate the styles from animation and animationSet Ids.
   */
  function getStyle(actions, childAnimationIdList = []) {
    const style = {};
    Object.keys(actions).forEach((key) => {
      if (Array.isArray(actions[key])) {
        // Process AnimationSet from Array.
        const actionSet = actions[key];
        const { repeatCount } = actionSet[actionSet.length - 1];
        const animationSetActions = actionSet.map((a) => {
          const action = createAnimation(Object.assign({}, a, { repeatCount: 0 }));
          childAnimationIdList.push(action.animationId);
          action.follow = true;
          return action;
        });
        const animationSetId = createAnimationSet(animationSetActions, repeatCount);
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
  Vue.component('animation', {
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
        animationEventMap: {},
        childAnimationIdList: [],
      };
    },
    created() {
      let animationEventName = 'onAnimation';
      // If running in Android, change it.
      if (Vue.Native.Platform === 'android') {
        animationEventName = 'onHippyAnimation';
      }
      this.childAnimationIdList = [];
      this.animationEventMap = {
        start: `${animationEventName}Start`,
        end: `${animationEventName}End`,
        repeat: `${animationEventName}Repeat`,
        cancel: `${animationEventName}Cancel`,
      };
      if (Vue.getApp) {
        this.app = Vue.getApp();
      }
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
        const style = getStyle(actions, this.childAnimationIdList);
        if (transform) {
          const transformAnimations = getStyle(transform, this.childAnimationIdList);
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
        Object.keys(this.animationEventMap).forEach((key) => {
          const eventName = this.animationEventMap[key];
          if (eventName && this.app && this[`${eventName}`]) {
            this.app.$off(eventName, this[`${eventName}`]);
          }
        });
      },
      addAnimationEvent() {
        Object.keys(this.animationEventMap).forEach((key) => {
          const eventName = this.animationEventMap[key];
          if (eventName && this.app) {
            this[`${eventName}`] = function eventHandler(animationId) {
              if (this.animationIds.indexOf(animationId) >= 0) {
                if (key !== 'repeat') {
                  this.app.$off(eventName, this[`${eventName}`]);
                }
                this.$emit(key);
              }
            }.bind(this);
            this.app.$on(eventName, this[`${eventName}`]);
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
          animationIds.forEach(animationId => Vue.Native.callNative(MODULE_NAME, 'startAnimation', animationId));
        } else {
          this.resume();
        }
      },
      resume() {
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach(animationId => Vue.Native.callNative(MODULE_NAME, 'resumeAnimation', animationId));
      },
      pause() {
        if (!this.$alreadyStarted) {
          return;
        }
        const animationIds = getAnimationIds(this.style);
        animationIds.forEach(animationId => Vue.Native.callNative(MODULE_NAME, 'pauseAnimation', animationId));
      },
      destroy() {
        this.removeAnimationEvent();
        this.$alreadyStarted = false;
        const animationIds = getAnimationIds(this.style);
        this.childAnimationIdList.forEach(animationId => Number.isInteger(animationId)
            && Vue.Native.callNative(MODULE_NAME, 'destroyAnimation', animationId));
        animationIds.forEach(animationId => Vue.Native.callNative(MODULE_NAME, 'destroyAnimation', animationId));
        this.childAnimationIdList = [];
      },
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
    template: `
      <component :is="tag" :useAnimation="true" :style="style" v-bind="props">
        <slot />
      </component>
    `,
  });
}

export default registerAnimation;

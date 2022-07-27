import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import type { CallbackType, CommonMapParams } from '../../global';
import { registerHippyTag } from '../runtime/component';
import type {
  HippyEvent,
  EventsUnionType,
  HippyLayoutEvent,
  HippyTouchEvent,
} from '../runtime/event/hippy-event';
import { Native } from '../runtime/native';

const PULLING_EVENT = 'pulling';
const IDLE_EVENT = 'idle';

/**
 * 注册pull header和footer组件
 *
 * @param vueApp - vue app 实例
 */
export function registerPull(vueApp: App): void {
  const { callUIFunction } = Native;

  [
    ['Header', 'header'],
    ['Footer', 'footer'],
  ].forEach(([capitalCase, lowerCase]) => {
    /**
     * PullView native component
     *
     * Methods：
     * expandPull() - Expand the PullView and display the content
     * collapsePull() - collapse the PullView and hide the content
     *
     * Events：
     * onReleased - Trigger when release the finger after pulling gap larger than the content height
     * onPulling - Trigger when pulling, will use it to trigger idle and pulling method
     */
    registerHippyTag(`hi-pull-${lowerCase}`, {
      name: `Pull${capitalCase}View`,
      processEventData(
        evtData: EventsUnionType,
        nativeEventParams: CommonMapParams,
      ) {
        const { handler: event, __evt: nativeEventName } = evtData;

        switch (nativeEventName) {
          case `on${capitalCase}Released`:
          case `on${capitalCase}Pulling`:
            Object.assign(event, nativeEventParams);
            break;
          default:
        }
        return event;
      },
    });

    vueApp.component(`pull-${lowerCase}`, {
      methods: {
        /**
         * Expand the PullView and display the content
         */
        [`expandPull${capitalCase}`]() {
          callUIFunction(this.$refs.instance, `expandPull${capitalCase}`);
        },
        /**
         * Collapse the PullView and hide the content
         * @param options - additional config for pull header
         *  options.time - time left to hide pullHeader after collapsePullHeader() called, unit is ms
         */
        [`collapsePull${capitalCase}`](options: { time: number }) {
          if (capitalCase === 'Header') {
            // options: { time }
            if (Native.isAndroid()) {
              callUIFunction(
                this.$refs.instance,
                `collapsePull${capitalCase}`,
                [options],
              );
            } else if (typeof options !== 'undefined') {
              callUIFunction(
                this.$refs.instance,
                `collapsePull${capitalCase}WithOptions`,
                [options],
              );
            } else {
              callUIFunction(this.$refs.instance, `collapsePull${capitalCase}`);
            }
          } else {
            callUIFunction(this.$refs.instance, `collapsePull${capitalCase}`);
          }
        },
        /**
         * Get the refresh height by layout event
         *
         * @param evt - 事件对象
         */
        onLayout(evt: HippyLayoutEvent) {
          this.$contentHeight = evt.height;
        },
        /**
         * Trigger when release the finger after pulling gap larger than the content height
         * Convert to `released` event.
         */
        [`on${capitalCase}Released`](evt: HippyEvent) {
          this.$emit('released', evt);
        },

        /**
         * Trigger when pulling
         * Convert to `idle` event if dragging gap less than content height
         * Convert to `pulling` event if dragging gap larger than content height
         *
         * @param evt - Event Object
         *   evt.contentOffset Dragging gap, either horizontal and vertical direction.
         */
        [`on${capitalCase}Pulling`](evt: HippyTouchEvent) {
          if ((evt.contentOffset as number) > this.$contentHeight) {
            if (this.$lastEvent !== PULLING_EVENT) {
              this.$lastEvent = PULLING_EVENT;
              this.$emit(PULLING_EVENT, evt);
            }
          } else if (this.$lastEvent !== IDLE_EVENT) {
            this.$lastEvent = IDLE_EVENT;
            this.$emit(IDLE_EVENT, evt);
          }
        },
      },
      render() {
        const {
          onReleased: released,
          onPulling: pulling,
          onIdle: idle,
        } = this.$attrs;
        // const { released, pulling, idle } = this.$listeners;
        const on: {
          [key: string]: CallbackType;
        } = {
          onLayout: this.onLayout,
        };
        if (typeof released === 'function') {
          on[`on${capitalCase}Released`] = this[`on${capitalCase}Released`];
        }
        if (typeof pulling === 'function' || typeof idle === 'function') {
          on[`on${capitalCase}Pulling`] = this[`on${capitalCase}Pulling`];
        }
        return h(
          `hi-pull-${lowerCase}`,
          {
            ...on,
            ref: 'instance',
          },
          this.$slots.default ? this.$slots.default() : null,
        );
      },
    });
  });
}

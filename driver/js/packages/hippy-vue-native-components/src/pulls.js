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

const PULLING_EVENT = 'pulling';
const IDLE_EVENT = 'idle';

function registerPull(Vue) {
  const { callUIFunction } = Vue.Native;
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
    Vue.registerElement(`hi-pull-${lowerCase}`, {
      component: {
        name: `Pull${capitalCase}View`,
        processEventData(event, nativeEventName, nativeEventParams) {
          switch (nativeEventName) {
            case `on${capitalCase}Released`:
            case `on${capitalCase}Pulling`:
              Object.assign(event, nativeEventParams);
              break;
            default:
          }
          return event;
        },
      },
    });

    Vue.component(`pull-${lowerCase}`, {
      methods: {
        /**
         * Expand the PullView and display the content
         */
        [`expandPull${capitalCase}`]() {
          callUIFunction(this.$refs.instance, `expandPull${capitalCase}`);
        },
        /**
         * Collapse the PullView and hide the content
         * @param {Object} [options] additional config for pull header
         * @param {number} [options.time] time left to hide pullHeader after collapsePullHeader() called, unit is ms
         */
        [`collapsePull${capitalCase}`](options) {
          if (capitalCase === 'Header') {
            // options: { time }
            if (Vue.Native.Platform === 'android') {
              callUIFunction(this.$refs.instance, `collapsePull${capitalCase}`, [options]);
            } else {
              if (typeof options !== 'undefined') {
                callUIFunction(this.$refs.instance, `collapsePull${capitalCase}WithOptions`, [options]);
              } else {
                callUIFunction(this.$refs.instance, `collapsePull${capitalCase}`);
              }
            }
          } else {
            callUIFunction(this.$refs.instance, `collapsePull${capitalCase}`);
          }
        },
        /**
         * Get the refresh height by @layout event
         * @param {Object} evt
         */
        onLayout(evt) {
          this.$contentHeight = evt.height;
        },
        /**
         * Trigger when release the finger after pulling gap larger than the content height
         * Convert to `released` event.
         */
        [`on${capitalCase}Released`](evt) {
          this.$emit('released', evt);
        },
        /**
         * Trigger when pulling
         * Convert to `idle` event if dragging gap less than content height
         * Convert to `pulling` event if dragging gap larger than content height
         *
         * @param {Object} evt Event Object
         * @param {number} evt.contentOffset Dragging gap, either horizion and vertical direction.
         */
        [`on${capitalCase}Pulling`](evt) {
          if (evt.contentOffset > this.$contentHeight) {
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
      render(h) {
        const { released, pulling, idle } = this.$listeners;
        const on = {
          layout: this.onLayout,
        };
        if (typeof released === 'function') {
          on[`${lowerCase}Released`] = this[`on${capitalCase}Released`];
        }
        if (typeof pulling === 'function' || typeof idle === 'function') {
          on[`${lowerCase}Pulling`] = this[`on${capitalCase}Pulling`];
        }
        return h(`hi-pull-${lowerCase}`, {
          on,
          ref: 'instance',
        }, this.$slots.default);
      },
    });
  });
}

export default registerPull;

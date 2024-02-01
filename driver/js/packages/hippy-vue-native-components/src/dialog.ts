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

const getFirstComponent = (elements: any) => {
  if (!elements) return null;
  if (Array.isArray(elements)) return elements[0];
  if (elements) return elements;
};

function registerDialog(Vue: any) {
  Vue.registerElement('hi-dialog', {
    component: {
      name: 'Modal',
      defaultNativeStyle: {
        position: 'absolute',
      },
    },
  });
  Vue.component('Dialog', {
    inheritAttrs: false,
    props: {
      collapsable: {
        type: Boolean,
        default: false,
      },
      transparent: {
        type: Boolean,
        default: true,
      },
      immersionStatusBar: {
        type: Boolean,
        default: true,
      },
      autoHideStatusBar: {
        type: Boolean,
        default: false,
      },
      autoHideNavigationBar: {
        type: Boolean,
        default: false,
      },
    },
    render(h: any) {
      const firstChild = getFirstComponent(this.$slots.default);
      if (firstChild) {
        // __modalFirstChild__  marked to remove absolute position to be compatible with hippy 2.0
        if (!firstChild.data.attrs) {
          firstChild.data.attrs = {
            __modalFirstChild__: true,
          };
        } else {
          Object.assign(firstChild.data.attrs, {
            __modalFirstChild__: true,
          });
        }
      }
      const { collapsable, transparent, immersionStatusBar, autoHideStatusBar, autoHideNavigationBar } = this;
      return h(
        'hi-dialog',
        {
          on: { ...this.$listeners },
          attrs: {
            collapsable,
            transparent,
            immersionStatusBar,
            autoHideStatusBar,
            autoHideNavigationBar,
          },
        },
        this.$slots.default,
      );
    },
  });
}

export default registerDialog;

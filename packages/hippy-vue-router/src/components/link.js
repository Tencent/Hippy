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

import { createRoute, isSameRoute, isIncludedRoute } from '../util/route';

// work around weird flow bug
const toTypes = [String, Object];
const eventTypes = [String, Array];

function guardEvent(e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return false;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return false;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return false;
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return false;
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true;
}

function findAnchor(children) {
  if (!children) {
    return null;
  }
  return children.find((child) => {
    if (child.tag === 'a') {
      return true;
    }
    if (child.children) {
      const c = findAnchor(child.children);
      return !!c;
    }
    return false;
  });
}

export default {
  name: 'RouterLink',
  props: {
    to: {
      type: toTypes,
      required: true,
    },
    tag: {
      type: String,
      default: 'a',
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click',
    },
  },
  render(h) {
    const router = this.$router;
    const current = this.$route;
    const { location, route, href } = router.resolve(this.to, current, this.append);
    const classes = {};
    const globalActiveClass = router.options.linkActiveClass;
    const globalExactActiveClass = router.options.linkExactActiveClass;
    // Support global empty active class
    // eslint-disable-next-line eqeqeq
    const activeClassFallback = globalActiveClass == null
      ? 'router-link-active'
      : globalActiveClass;
    // eslint-disable-next-line eqeqeq
    const exactActiveClassFallback = globalExactActiveClass == null
      ? 'router-link-exact-active'
      : globalExactActiveClass;
    // eslint-disable-next-line eqeqeq
    const activeClass = this.activeClass == null
      ? activeClassFallback
      : this.activeClass;
    // eslint-disable-next-line eqeqeq
    const exactActiveClass = this.exactActiveClass == null
      ? exactActiveClassFallback
      : this.exactActiveClass;
    const compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route;
    classes[exactActiveClass] = isSameRoute(current, compareTarget);
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget);
    const handler = (e) => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location);
        } else {
          router.push(location);
        }
      }
    };
    const on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach((e) => {
        on[e] = handler;
      });
    } else {
      on[this.event] = handler;
    }
    const data = {
      class: classes,
    };
    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href };
    } else {
      // find the first <a> child and apply listener and href
      const a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        const aData = { ...a.data };
        a.data = aData;
        aData.on = on;
        const aAttrs = { ...a.data.attrs };
        a.data.attrs = aAttrs;
        aAttrs.href = href;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default);
  },
};

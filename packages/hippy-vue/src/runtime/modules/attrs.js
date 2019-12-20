/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { extend } from 'shared/util';

function updateAttrs(oldVNode, vNode) {
  if (!oldVNode.data.attrs && !vNode.data.attrs) {
    return;
  }
  let cur;
  let old;
  const { elm } = vNode;
  const oldAttrs = oldVNode.data.attrs || {};
  let attrs = vNode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = extend({}, attrs);
    vNode.data.attrs = attrs;
  }
  Object.keys(attrs).forEach((key) => {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      elm.setAttribute(key, cur);
    }
  });
  Object.keys(oldAttrs).forEach((key) => {
    if (attrs[key] == null) {
      elm.setAttribute(key);
    }
  });
}

export default {
  create: updateAttrs,
  update: updateAttrs,
};

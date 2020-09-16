/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { extend, cached, camelize } from 'shared/util';

const normalize = cached(camelize);

function toObject(arr) {
  const res = {};
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}


function updateStyle(oldVNode, vNode) {
  if (!oldVNode.data.style && !vNode.data.style) {
    return;
  }
  let cur;
  const { elm } = vNode;
  const oldStyle = oldVNode.data.style || {};
  let style = vNode.data.style || {};

  const needClone = style.__ob__;

  // handle array syntax
  if (Array.isArray(style)) {
    style = toObject(style);
    vNode.data.style = style;
  }

  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = extend({}, style);
    vNode.data.style = style;
  }
  // Remove the removed styles at first
  Object.keys(oldStyle).forEach((name) => {
    if (style[name] === undefined) {
      elm.setStyle(normalize(name), undefined);
    }
  });
  // Then set the new styles.
  Object.keys(style).forEach((name) => {
    cur = style[name];
    elm.setStyle(normalize(name), cur);
  });
}


function createStyle(oldVNode, vNode) {
  // console.log(`\t\t ===> createStyle(${oldVNode}, ${vNode})`)
  if (!vNode.data.staticStyle) {
    updateStyle(oldVNode, vNode);
    return;
  }
  const { elm } = vNode;
  const { staticStyle } = vNode.data;
  Object.keys(staticStyle).forEach((name) => {
    if (staticStyle[name]) {
      elm.setStyle(normalize(name), staticStyle[name]);
    }
  });
  updateStyle(oldVNode, vNode);
}

export default {
  create: createStyle,
  update: updateStyle,
};

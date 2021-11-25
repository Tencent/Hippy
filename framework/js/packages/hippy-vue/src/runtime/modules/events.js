/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { updateListeners } from 'framework/js/core/vdom/helpers/update-listeners';

let target;

function remove(event, handler, capture, _target) {
  (_target || target).removeEventListener(event);
}

function add(event, handler, once, capture) {
  if (capture) {
    return;
  }
  if (once) {
    const oldHandler = handler;
    const _target = target; // save current target element in closure
    handler = (ev) => {
      const res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler(...arguments);
      if (res !== null) {
        remove(event, null, null, _target);
      }
    };
  }
  target.addEventListener(event, handler);
}

function updateDOMListeners(oldVNode, vNode) {
  if (!oldVNode.data.on && !vNode.data.on) {
    return;
  }
  const on = vNode.data.on || {};
  const oldOn = oldVNode.data.on || {};
  target = vNode.elm;
  updateListeners(on, oldOn, add, remove, vNode.context);
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
};

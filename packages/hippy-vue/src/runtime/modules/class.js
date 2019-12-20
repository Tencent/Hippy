/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { genClassForVnode, concat, stringifyClass } from 'web/util/index';

function updateClass(oldVNode, vNode) {
  const { elm, data } = vNode;
  const oldData = oldVNode.data;
  if (
    !data.staticClass
    && !data.class
    && (!oldData || (!oldData.staticClass && !oldData.class))
  ) {
    return;
  }

  let cls = genClassForVnode(vNode);

  // handle transition classes
  const transitionClass = elm._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== elm._prevClass) {
    elm.setAttribute('class', cls);
    elm._prevClass = cls;
  }
}

export default {
  create: updateClass,
  update: updateClass,
};

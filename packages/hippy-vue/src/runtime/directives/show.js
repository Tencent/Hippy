/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

// TODO: Transition support.

function toggle(el, value, vNode, originalDisplay) {
  if (value) {
    vNode.data.show = true;
    el.setStyle('display', originalDisplay);
  } else {
    el.setStyle('display', value ? originalDisplay : 'none');
  }
}

const show = {
  bind(el, { value }, vNode) {
    // Set the display be block when undefined
    if (el.style.display === undefined) {
      el.style.display = 'block';
    }
    const originalDisplay = el.style.display === 'none' ? '' : el.style.display;
    el.__vOriginalDisplay = originalDisplay;
    toggle(el, value, vNode, originalDisplay);
  },
  update(el, { value, oldValue }, vNode) {
    if (!value === !oldValue) {
      return;
    }
    toggle(el, value, vNode, el.__vOriginalDisplay);
  },
  unbind(el, binding, vNode, oldVNode, isDestroy) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  },
};

export {
  show,
};

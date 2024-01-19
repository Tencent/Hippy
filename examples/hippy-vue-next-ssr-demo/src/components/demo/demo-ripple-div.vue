<template>
  <div
    ref="ripple1"
    :style="wrapperStyle"
    :nativeBackgroundAndroid="{ ...nativeBackgroundAndroid }"
    @layout="onLayout"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { type HippyElement, Native } from '@hippy/vue-next';
import { defineComponent, watch, ref, toRefs } from '@vue/runtime-core';

import defaultImage from '../../assets/defaultSource.jpg';

const defaultRippleConfig = {
  borderless: false,
};

const demo1Style = {
  display: 'flex',
  height: '40px',
  width: '200px',
  backgroundImage: `${defaultImage}`,
  backgroundRepeat: 'no-repeat',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '10px',
  marginBottom: '10px',
};

export default defineComponent({
  name: 'DemoRippleDiv',
  props: {
    nativeBackgroundAndroid: {
      default: defaultRippleConfig,
    },
    wrapperStyle: {
      type: Object,
      default: () => demo1Style,
    },
    positionY: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const { positionY } = toRefs(props);
    const ripple1 = ref(null);
    const scrollOffsetY = ref(positionY.value);
    let viewX = 0;
    let viewY = 0;

    watch(positionY, (to) => {
      scrollOffsetY.value = to;
    });

    const onLayout = () => {
      if (ripple1.value) {
        Native.measureInAppWindow(ripple1.value).then((rect) => {
          viewX = rect.left;
          viewY = rect.top;
        });
      }
    };

    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (ripple1.value) {
        (ripple1.value as HippyElement).setHotspot(
          t.clientX - viewX,
          t.clientY + scrollOffsetY.value - viewY,
        );
        (ripple1.value as HippyElement).setPressed(true);
      }
    };

    const onTouchEnd = () => {
      if (ripple1.value) {
        (ripple1.value as HippyElement).setPressed(false);
      }
    };

    return {
      scrollOffsetY: props.positionY,
      demo1Style,
      ripple1,
      onLayout,
      onTouchStart,
      onTouchEnd,
    };
  },
});
</script>

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

<script>
import Vue from 'vue';
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

export default {
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
      default: 0,
    },
  },
  data() {
    return {
      scrollOffsetY: this.positionY,
      viewX: 0,
      viewY: 0,
      demo1Style,
    };
  },
  watch: {
    positionY(to) {
      this.scrollOffsetY = to;
    },
  },
  mounted() {
    this.rippleRef = this.$refs.ripple1;
  },
  methods: {
    async onLayout() {
      const rect = await Vue.Native.measureInAppWindow(this.rippleRef);
      this.viewX = rect.left;
      this.viewY = rect.top;
    },
    onTouchStart(e) {
      const t = e.touches[0];
      this.rippleRef.setHotspot(t.clientX - this.viewX, t.clientY + this.scrollOffsetY - this.viewY);
      this.rippleRef.setPressed(true);
    },
    onTouchEnd() {
      this.rippleRef.setPressed(false);
    },
  },
};
</script>

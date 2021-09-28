<template>
  <div
    :style="[wrapperStyle]"
  >
    <div
      ref="ripple1"
      :style="contentStyle"
      :nativeBackgroundAndroid="{ ...nativeBackgroundAndroid }"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <p :class="['div-demo-1-text', textClass]">
        {{ title }}
      </p>
    </div>
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
  /**
    *  inline style 'backgroundImage': `url(${DefaultImage})` with 'url()' syntax only supported above 2.6.1.
    *  declaration css style supports 'background-image': `url('https://xxxx')` format and remote address only.
    */
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
    textClass: {
      default: '',
    },
    contentStyle: {
      default: () => ({
        // alignItems: 'center',
        // justifyContent: 'center',
        // width: 150,
        // height: 150,
        // position: 'absolute',
      }),
    },
    rippleClass: {
      default: '',
    },
    title: {
      default: '',
    },
  },
  data() {
    /**
     * demo1 needs to use variable base64 DefaultImage，so inline style mode is a must.
     * if image path is remote address, declaration style class .div-demo-1 can be used.
     */
    return {
      demo1Style,
      Platform: Vue.Native.Platform,
    };
  },
  mounted() {
    this.demon2 = this.$refs.ripple1;
  },
  methods: {
    onTouchStart(e) {
      console.log('onTouchStart====>', e);
      if (this.Platform === 'ios') {
        return;
      }
      this.demon2.setPressed(true);
      const t = e.touches[0];
      this.demon2.setHotspot(t.clientX, t.clientY);
    },
    onTouchEnd(e) {
      console.log('onTouchEnd====>', e);
      if (this.Platform === 'ios') {
        return;
      }
      this.demon2.setPressed(false);
    },
  },
};
</script>

<style scoped>

  /* Common CSS Styles */

  #div-demo {
    flex: 1;
    overflow-y: scroll;
  }

  .display-flex {
    display: flex;
  }

  .flex-row {
    flex-direction: row;
  }

  .flex-column {
    flex-direction: column;
  }

  .div-demo-1-text {
    color: black;
    margin-left: 10px;
  }

</style>

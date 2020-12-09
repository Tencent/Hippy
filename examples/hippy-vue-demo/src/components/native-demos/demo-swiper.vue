<template>
  <div id="demo-swiper">
    <swiper-common />
    <swiper-extension />
  </div>
</template>

<script>
import SwiperCommon from './demo-swiper-common.vue';
import SwiperExtension from './demo-swiper-extension.vue';

export default {
  name: 'demo-swiper',
  components: {
    SwiperCommon,
    SwiperExtension,
  },
};
</script>

<style scoped>
#demo-swiper {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
</style>

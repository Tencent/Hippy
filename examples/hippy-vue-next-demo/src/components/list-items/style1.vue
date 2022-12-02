<template>
  <div class="list-view-item style-one">
    <p
      :numberOfLines="2"
      :enableScale="true"
      class="article-title"
    >
      {{ itemBean.title }}
    </p>
    <div class="style-one-image-container">
      <img
        v-for="(pic, index) in itemBean.picList"
        :key="index"
        :src="pic"
        alt=""
        class="image style-one-image"
      >
    </div>
    <div :style="{ alignSelf: 'flex-start', marginTop: '5px' }">
      <p class="normal-text">
        {{ itemBean.subInfo.join('') }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

export default defineComponent({
  inheritAttrs: false,
  props: {
    itemBean: {
      type: Object,
      default: () => {},
    },
  },
});
</script>

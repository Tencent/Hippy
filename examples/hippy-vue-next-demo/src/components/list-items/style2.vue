<template>
  <div class="list-view-item style-two">
    <div class="style-two-left-container">
      <p
        class="article-title"
        :numberOfLines="2"
        :enableScale="true"
      >
        {{ itemBean.title }}
      </p>
      <div :style="{ alignSelf: 'flex-start', marginTop: '5px' }">
        <p class="normal-text">
          {{ itemBean.subInfo.join('') }}
        </p>
      </div>
    </div>
    <div class="style-two-image-container">
      <img
        :src="itemBean.picUrl"
        alt=""
        class="image style-two-image"
      >
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

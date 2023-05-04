<template>
  <div class="list-view-item style-five">
    <p
      :numberOfLines="2"
      :enableScale="true"
      class="article-title"
    >
      {{ itemBean.title }}
    </p>
    <div class="style-five-image-container">
      <img
        :src="itemBean.picUrl"
        alt=""
        class="image"
      >
    </div>
    <div :style="{ alignSelf: 'flex-start', marginTop: '5px' }">
      <p class="normal-text">
        {{ itemBean.subInfo.join(' ') }}
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

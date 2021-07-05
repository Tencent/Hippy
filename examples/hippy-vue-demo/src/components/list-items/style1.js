import Vue from 'vue';

export default Vue.component('style-one', {
  inheritAttrs: false,
  props: ['itemBean'],
  template: `
  <div class="list-view-item style-one">
    <p :numberOfLines="2" :enableScale="true" class="article-title">
      {{ itemBean.title }}
    </p>
    <div class="style-one-image-container">
      <img v-for="(pic, index) in itemBean.picList" :key="index" :src="pic" class="image style-one-image" />
    </div>
    <div class="tag-line">
      <p class="normal-text">
        {{ itemBean.subInfo.join('') }}
      </p>
    </div>
  </div>
  `,
});

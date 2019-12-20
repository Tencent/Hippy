import Vue from 'vue';

Vue.component('style-two', {
  inheritAttrs: false,
  props: ['itemBean'],
  template: `
  <div class="list-view-item style-two">
    <div class="style-two-left-container">
      <p class="article-title" numberOfLines="2" enableScale="true">
        {{ itemBean.title }}
      </p>
      <div class="tag-line">
        <p class="normal-text">
          {{ itemBean.subInfo.join('') }}
        </p>
      </div>
    </div>
    <div class="style-two-image-container">
      <img :src="itemBean.picUrl" class="image style-two-image" />
    </div>
  </div>
  `,
});

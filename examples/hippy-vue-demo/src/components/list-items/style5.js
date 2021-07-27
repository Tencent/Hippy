import Vue from 'vue';

export default Vue.component('StyleFive', {
  inheritAttrs: false,
  props: ['itemBean'],
  template: `
  <div class="list-view-item style-five">
    <p numberOfLines="2" enableScale="true" class="article-title">
        {{ itemBean.title }}
    </p>
    <div class="style-five-image-container">
        <img :src="itemBean.picUrl" class="image" />
    </div>
    <div class="tag-line">
      <p class="normal-text">
        {{ itemBean.subInfo.join(' ') }}
      </p>
    </div>
  </div>
  `,
});

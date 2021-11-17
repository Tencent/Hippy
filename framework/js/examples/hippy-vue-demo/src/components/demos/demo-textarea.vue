<template>
  <div id="demo-textarea">
    <label>多行文本:</label>
    <textarea
      v-model="content"
      :rows="10"
      placeholder="多行文本编辑器"
      class="textarea"
      @contentSizeChange="contentSizeChange"
    />
    <div class="output-container">
      <p class="output">
        输入的文本为：{{ content }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      content: 'The quick brown fox jumps over the lazy dog，快灰狐狸跳过了懒 🐕。',
    };
  },
  methods: {
    contentSizeChange(evt) {
      console.log(evt);
    },
  },
};
</script>

<style scope>
#demo-textarea {
  display: flex;
  align-items: center;
  flex-direction: column;
}

#demo-textarea .textarea {
  width: 300px;
  height: 170px;
  color: #242424;
  text-align: left;
  border-width: 1px;
  border-color: #ccc;
  underline-color-android: #40b883;
  placeholder-text-color: #666;
}

.demo-textarea .output {
  word-break: break-all;
}
</style>

<template>
  <!-- 使用div层的方案，div需要指定高度，用来撑开scroll内容高度 -->
  <!--
  <MyScrollView id="demo-native-scroll" @layout="onLayout">
    <div id="demo-content" :style="{ height: layoutHeight + 150 }">
      <MyTopView id="demo-native-top" :style="{ height: 150 }"></MyTopView>
      <MyTabBarView id="demo-native-nav" :style="{ height: 30 }"></MyTabBarView>
      <MyBottomView id="demo-native-bottom" :style="{ height: layoutHeight - 30 }"></MyBottomView>
    </div>
  </MyScrollView>
  -->
  <!-- 推荐方案：不使用div层的方案，和Android/iOS写法更对齐，外层自定义组件需要指定native-scroll-ohos属性，方便Hippy内部按列布局撑开scroll内容高度 -->
  <MyScrollView id="demo-native-scroll" @layout="onLayout" native-scroll-ohos="column">
    <MyTopView id="demo-native-top" :style="{ height: 150 }"></MyTopView>
    <MyTabBarView id="demo-native-nav" :style="{ height: 30 }"></MyTabBarView>
    <MyBottomView id="demo-native-bottom" :style="{ height: layoutHeight - 30 }"></MyBottomView>
  </MyScrollView>
</template>

<script>
export default {
  data() {
    return {
      layoutHeight: 0,
    };
  },
  methods: {
    onLayout(e) {
      this.layoutHeight = e.height;
    },
  },
};
</script>

<style scoped>
#demo-native-scroll {
    flex: 1;
}

#demo-content {
    background-color: gray;
}

#demo-native-top {
    background-color: green;
}

#demo-native-nav {
    background-color: orange;
}

#demo-native-bottom {
    background-color: white;
}
</style>

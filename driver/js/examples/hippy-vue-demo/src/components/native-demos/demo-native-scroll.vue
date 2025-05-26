<template>
  <MyScrollView id="demo-native-scroll" @layout="onLayout">
    <div id="demo-content" :style="{ height: layoutHeight + 150 }">
      <MyTopView id="demo-native-top" :style="{ height: 150 }"></MyTopView>
      <MyTabBarView id="demo-native-nav" :style="{ height: 30 }"></MyTabBarView>
      <MyBottomView id="demo-native-bottom" :style="{ height: layoutHeight - 30 }"></MyBottomView>
    </div>
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

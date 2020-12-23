<template>
  <div id="shadow-demo">
    <div>
      <div class="cube shadow">
        <p>阴影样式</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #shadow-demo {
    flex: 1;
    overflow-y: scroll;
  }

  #shadow-demo .cube {
    width: 120px;
    height: 120px;
  }

  #shadow-demo .cube p {
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }

  #shadow-demo .shadow {
    box-shadow-offset: 60px 10px;
    /*box-shadow-offset-x: 60px;*/
    /*box-shadow-offset-y: 10px;*/
    box-shadow-opacity: .3;
    box-shadow-radius: 4px;
    box-shadow-spread: 15px;
    box-shadow-color: #098a29;
  }
</style>

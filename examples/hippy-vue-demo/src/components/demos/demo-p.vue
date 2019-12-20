<template>
  <div class="p-demo">
    <label>不带样式：</label>
    <p class="p-demo-content">这是最普通的一行文字</p>
    <label>颜色：</label>
    <p class="p-demo-1 p-demo-content">这行文字改变了颜色</p>
    <label>尺寸：</label>
    <p class="p-demo-2 p-demo-content">这行改变了大小</p>
    <label>粗体：</label>
    <p class="p-demo-3 p-demo-content">这行加粗了</p>
    <label>下划线：</label>
    <p class="p-demo-4 p-demo-content">这里有条下划线</p>
    <label>删除线：</label>
    <p class="p-demo-5 p-demo-content">这里有条删除线</p>
  </div>
</template>

<style scope>
.p-demo .p-demo-content {
  margin: 20px;
}

.p-demo .p-demo-1 {
  color: #f44837;
}
.p-demo .p-demo-2 {
  font-size: 30px;
}
.p-demo .p-demo-3 {
  font-weight: bold;
}

.p-demo .p-demo-4 {
  text-decoration-line: underline;
  text-decoration: underline;
}

.p-demo .p-demo-5 {
  text-decoration: line-through;
}
</style>

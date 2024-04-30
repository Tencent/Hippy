# Snapshot

Snapshot 是 v8 提供的一种快速创建 isolate 和 context 的技术方案。它能极大的加快 v8 的启动速度。

---

## 使用 v8 Snapshot 示例

### 1. 创建 Snapshot 文件

修改 MyActivity.java 文件的 onCreate，将 

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.NoSnapshot; 
``` 

改为 

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.CreateSnapshot;
```

运行 example，生成对应的 Snapshot 文件

### 2. 使用生成的 Snapshot 文件

修改 MyActivity.java 文件的 onCreate，将

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.CreateSnapshot; 
``` 

改为

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.UseSnapshot;
```

运行 example，即可使用刚刚生成的 Snapshot 加速启动 example

## Snapshot 原理简介

Snapshot 是一种使用内存数据快速创建 isolate 和 context 的技术。它会将创建 Snapshot 时刻的 v8 js 堆上数据序列化并储存。
当使用 Snapshot 的时候，只需要把相应内容反序列化并载入内存。这样可以显著减少初始化 isolate 和 context 的时间，从而加速启动过程。

## Snapshot 限制说明

v8 可以将创建 Snapshot 时候 js 数据序列化，但是 Hippy 向 js 绑定的 c++ 方法 v8 不知道怎么序列化，因此需要 Hippy 配合。
需要在创建和还原 Snapshot isolate 的时机传入对应的 external_references。如果是在 Hippy 启动阶段能够确定的外部地址，SDK 会负责收集和注入。
而业务扩展的第三方 Module SDK 无法提前确定该 Module 绑定的 c++ 地址。因此使用业务使用 Snapshot 存在一定限制。

## Snapshot 限制

1. 创建 Snapshot 之前不能有 Bridge 调用。因为 Bridge 地址无法提前确定，一旦有 Bridge 调用则会导致不确定的外部地址导致 v8 Crash。因此创建 Snapshot
是特殊的启动流程，一旦有 Bridge 的调用都会导致异常，从而创建 Snapshot 失败。
2. 创建 Snapshot 之前不能有未执行延时任务，包含 SetTimeout 和 SetInterval、RequestIdleCallback 等。
因为还原 Snapshot 时无法还原延时任务，可能会导致业务逻辑异常。
3. 创建 Snapshot 的 Hippy 版本要和使用 Snapshot 的 Hippy 版本一致。一旦 SDK 版本变化，可能引发外部地址变化导致 v8 无法正常映射，引发 Crash
4. 创建 Snapshot 的 业务 Bundle 版本和使用 Snapshot 的 业务 Bundle 版本需要一致。
5. 如果业务有使用动态加载 Bundle 能力，则创建 Snapshot 时必须传入正确的主 Bundle 所在目录地址（注意带上协议头）。
否则使用 Snapshot 时，由于缺少主 Bundle 目录路径，SDK 无法确定分包的实际地址。


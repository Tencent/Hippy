# **Hippy 业务冷启动性能优化指引**

## **背景**

经常有业务咨询 Hippy 有哪些优化手段，以及业务性能问题应该怎么分析，有哪些监控工具，本篇文档则系统的介绍了 Hippy 冷启动的性能优化的最佳实践。



## **冷启动阶段：**

介绍一下Hippy应用冷启动有哪些阶段

​            1.     Hippy 运行环境启动 - 终端耗时 （启动）

​            2.     加载 Bundle的 JS 文件 - JS 引擎耗时 （自执行）

​            3.     应用实例的执行 - JS 引擎耗时（JS运行）

​            a.     业务代码逻辑执行

​            b.     业务 IO（网络、JS API）等待

​            c.     React/Vue 框架 DIFF 耗时

​            d.     Hippy JS SDK计算耗时

​            4.     上屏显示 - 终端耗时 （渲染）

​            a.     Hippy DOM 构建、排版耗时

​            b.     Hippy 渲染上屏耗时

详细介绍参考：[Hippy冷启动核心逻辑和数据梳理](https://doc.weixin.qq.com/doc/w3_AJcAmQbdAFwmCbIe8OPScGUN6amkw?scode=AJEAIQdfAAo1QKXNGAAJcAmQbdAFw)

我们把启动阶段分为 4个阶段：Hippy 启动、Bundle加载、**应用实例执行**、渲染上屏。

不同规模的 Hippy 业务，这些阶段耗时不尽相同，大家可以先测试各阶段耗时占比，再针对性的来分析。



Hippy 团队过去有一些经验可供参考：

​            1.     一般耗时大头是阶段 3 （一半耗时占比超过 50%）

业务可重点排查 **业务 JS 执行耗时**、**IO（网络、JS API）等待耗时。**此外，**节点数过多、CSS 属性比较复杂**，也会影响 Hippy SDK的计算耗时

​            2.     JS Bundle包过大，会影响阶段 2 的耗时

​            3.     节点数过多，节点层级比较深，渲染样式比较复杂，会影响阶段 3 的耗时



## **如何监控定位：**

### **1.**      **线上监控：**

​在 Hippy 3.0，我们设计了用于性能分析的 Performance API: 

[Hippy 性能监控设计文档](https://doc.weixin.qq.com/doc/w3_ANsAsgZ1ACcBlbHY905RpW7Qj1vij?scode=AJEAIQdfAAosjxQAlNANsAsgZ1ACc)  



Performance API 冷启动打点指标：

| **指标**             | **对应 Key**             |
| -------------------- | ------------------------ |
| Hippy 引擎加载开始   | hippyNativeInitStart     |
| JS 引擎加载开始      | hippyJsEngineInitStart   |
| JS 引擎加载结束      | hippyJsEngineInitEnd     |
| Hippy 引擎加载结束   | hippyNativeInitEnd       |
| JS Bundle 自执行耗时 | bundleInfo[]             |
| 业务入口执行开始     | hippyRunApplicationStart |
| 业务入口执行结束     | hippyRunApplicationEnd   |
| 首帧绘制开始         | hippyFirstFrameStart     |
| 首帧绘制结束         | hippyFirstFrameEnd       |
| 启动耗时             | duration                 |



监控方式：

​            1.     Hippy 3.x版本：可以接入最新 aegis-sdk （腾讯内部咨询 端框架小助手），已经基于 performance api，可以直接获取打点数据 



​            2.     Hippy 2.x 版本可以基于业务代码打点，获取启动阶段的近似耗时数据。可参考：https://km.woa.com/articles/show/557810?kmref=search&from_page=1&no=1



### **2.**      **Profile 工具：**

​            1.     Perfdog

​            a.     可查看 FPS, CPU, GPU, 内存等变化情况

​            2.     安卓系统自带工具：

​            a.     GPU 渲染模式分析： 通过在 Android 设备的设置 APP 的开发者选项里打开 “ GPU 渲染模式分析” 选项，选择 ” 在屏幕上显示为条形图 “ 。

​            b.     过度绘制：Android 设备的设置 APP 的开发者选项里打开 “ 调试 GPU 过度绘制 ”

​            c.     查看界面边界：系统设置 – 开发者选项 – 绘图 --显示布局边界

​            3.     iOS系统 simulator 模拟器

​            a.     Debug 下自带分析工具 Color Blended Layers 图层绘制 Color Off-screen Rendered 离屏渲染

​            4.     Profile工具

​            a.     Android Studio Profiler

​            b.     Xcode Instruments

​            **c.**     **Hippy Devtools （也在进一步完善中，欢迎大家提需求），如下示例：**



**如何优化：**

定位到耗时点，接下来就可以针对性分析。

先简单介绍常用的优化：

​            1.     预加载：大幅降低 1-2 阶段耗时

​            2.     预渲染/SSR/Native-Vue：大幅降低 1-3阶段耗时

​            3.     数据预拉取：降低 3阶段 IO 等待耗时

​            4.     JSI、动态加载、节点数优化：降低 3 阶段耗时

​            5.     节点缓存/渲染优化/图片缓存：降低 4 阶段耗时

​            6.     骨架屏优化/Loading：优化交互体验

... 



接下来详细介绍这些优化点：



### **1.**     **预加载**

通过提前执行1+2阶段逻辑优化首屏耗时。

这两个阶段耗时主要被封装在HippyBridge中，因此可以通过提前初始化HippyBridge达成目的。



iOS 代码示例：

``` javascript
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:nil bundleURL:url moduleProvider:^NSArray<id<HippyBridgeModule>> * {
        return nil; // 或返回希望替换的module实例
} launchOptions:option executorKey:nil];

// 将bridge保存起来
```

安卓代码示例：

``` javascript
mHippyEngine.initEngine(new HippyEngine.EngineListener() {
    @Override
    public void onInitialized(EngineInitStatus statusCode, String msg) {
        if (statusCode == EngineInitStatus.STATUS_OK) {
            HippyBundleLoader loader = ...;
            // e.g.:
            // new HippyAssetBundleLoader(context, assetName, true, "demo");
            // new HippyFileBundleLoader(filePath, true, "demo");
            mHippyEngine.preloadModule(loader);
        }
    }
}
```


优点：

​            1.     不依赖页面数据，在任何页面都可考虑使用预加载

​            2.     前端也可以在预加载时提前fetch数据

缺点：

​            1.     优化效果相对预渲染不够明显



### **2.**     **预渲染**

如果还希望在预加载基础上继续优化体验，还可以进一步提前执行步骤 3 的逻辑。

优点：

​            1.     优化效果十分明显

缺点：

​            1.     内存开销大

​            2.     无法对动态数据的页面使用

​            3.     页面发版会导致命中率降低

​            4.     预渲染时的Dimension可能与访问时不一致，导致布局异常

​            5.     在Android上预渲染只能使用AppContext，导致页面打开后也无法使用依赖Activity的能力，例如Modal（Dialog）组件



接入代码示例：

iOS 代码示例



``` javascript
HippyRootView *hippyRootView = [[HippyRootView alloc]    
                            initWithBridge:bridge
                               businessURL:businessURL
                                moduleName:appName                  
                         initialProperties:properties         
                                  delegate:delegate];
// 将hippyRootView保存起来
```





执行这一步后，HippyRootView内部将会执行实例的加载，但由于rootView未被真正挂在到VC的UI树上，所以暂时不可见。

当需要显示的时候可以在VC的view上将hippyRootView加为子view。



``` javascript
[parent addSubview:hippyRootView];

// 必要时可以更新一下frame
hippyRootView.frame = newFrame;

// 如果在addSubview后还有其他的subview的添加，可以考虑通过bringSubviewToFront将hippyRootView改为最前方显示
[parent bringSubviewToFront:hippyRootView];
```







安卓代码示例：

除了需要把 ModuleLoadParams.context 设置为 AppContext 外，其余步骤和常规加载一致。



``` javascript
HippyEngine.ModuleLoadParams loadParams = new HippyEngine.ModuleLoadParams();
loadParams.context = getApplicationContext();
...
mHippyView = mHippyEngine.loadModule(loadParams, listener, null);
```





### **3.**     **SSR**

SSR 代替预渲染方案的另一选择。

方案原理：把 1-3 阶段放在服务端执行，解析成最终的 Hippy指令 的字符串，启动时直接反序列化 Hippy指令，下发Hippy终端执行渲染。

优化效果：性能数据与预渲染接近

详见QQ游戏中心优化 https://km.woa.com/articles/show/564026?kmref=search&from_page=1&no=1



优点：

​            1.     可不依赖终端方案方案，前端执行

​            2.     相比预渲染方案更节省内存

缺点：

​            1.     需要执行事件挂载逻辑，可交互时间会延迟

​            2.     会带来服务器的运营成本


### **4.**     **数据预请求：**

在不方便应用 预渲染/SSR/Native-Vue的场景。可以考虑提前下载数据，节省 3阶段 网络 IO 耗时：

​            1.     可以在终端预请求，在启动Hippy后，把数据传给前端

​            2.     可以结合预加载，在前端 JS 自执行阶段，前端预请求数据。等待组件渲染时直接使用。 



### **5.**     **节点缓存**

​            1.     Dom Node 缓存（安卓）

接入方案详见：https://doc.openhippy.com/#/feature/feature2.0/dom-cache

​            2.     RenderNode 缓存（3.0 安卓）

接入方案详见：https://doc.openhippy.com/#/feature/feature3.0/render-node-snapshot





### **6.**     **JS 引擎优化**

在不方便做 JS 预加载的场景，如果要优化 JS 自执行耗时，可以考虑对 JS 引擎本身做优化：

#### **6.1.**     **V8 编译开启 Code Cache**

把编译和解析的结果缓存下来，等到下次遇到相同的文件，直接跳过这个过程，把直接缓存好的数据拿来使用；

​Hippy 2.0: Hermes 接入指引文档：https://iwiki.woa.com/p/4007348225

​Hippy 3.0 Hermes会直接集成，文档待补充。





### **7.**     **bundle 包动态加载**

接入文档指引：https://iwiki.woa.com/p/491739348

Hippy 打包插件只支持一个jsbundle包的生成。随着业务逻辑越来越复杂，jsbundle越来越大、包的加载时间越来越长。为了解决这个问题，Hippy 在 2.2.0 版本增添了动态加载能力，Hippy 的开发人员可以按照业务需求来动态引入 JS。

Hippy 在 2.5.5 版本增加了远程网络加载模式的支持，业务可对每个bundle自定义不同的加载模式。



webpack打包脚本中引入插件：HippyDynamicImportPlugin



``` javascript
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');

module.exports = {
  ...
  plugins: [
    new HippyDynamicImportPlugin(),
  ],
};
```







​     （1）加载本地 JS 包：

​        与 Web 开发动态加载能力一样，直接使用  import()  语法即可



​     （2）加载远程 JS 包：

 i. webpack打包脚本配置全局 publicPath(可选)



``` javascript
 // webpack output 配置
 output: {
    ...
    publicPath: 'https://xxxx/hippy/hippyVueDemo/',
},
```





ii. 在业务代码引用分包的入口配置 magic comment的 webpackChunkName（必须） 和 customChunkPath（可选），如果没有配置customChunkPath，会默认使用全局 publicPath； 以 Hippy-Vue 为例：



``` javascript
 // Hippy-Vue 配置
 AsyncComponentFromHttp: () => import(/* customChunkPath: "https://xxx/hippy/hippyVueDemo/", webpackChunkName: "asyncComponentFromHttp" */'./dynamicImport/async-component-http.vue')
  .then(res => res)
  .catch(err => console.error('import async remote component error', err))
```









### **8.**     **JS API 优化**

#### **8.1.**     **JS Bridge -> JSI**

​接入方案详见：https://doc.openhippy.com/#/feature/feature2.0/jsi

​优化效果：

Android 代码示例：



``` javascript
// 初始化引擎开启 enableTurbo
val initParams = HippyEngine.EngineInitParams()
initParams.enableTurbo = true

// 定义 module
@HippyNativeModule(name = "demoTurbo")
class DemoTurboModule(context: HippyEngineContext?) : HippyNativeModuleBase(context) {
    ...
    @HippyMethod(isSync = true)
    fun getNum(num: Double): Double = num
    ...
}
```





​iOS 代码示例：



``` javascript
// 方式一：bridge初始化时通过配置参数设置生效
NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                  bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                             moduleProvider:nil
                                              launchOptions:launchOptions
                                                executorKey:@"demoTurbo"];

// 方式二：bridge初始化完成后，设置属性生效
HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:nil
                                                    businessURL:nil
                                                     moduleName:@"demoTurbo" 
                                              initialProperties:@{@"isSimulator": @(isSimulator)} 
                                                  launchOptions:nil 
                                                   shareOptions:nil 
                                                      debugMode:YES 
                                                       delegate:nil];
rootView.bridge.enableTurbo = YES;
```







``` javascript
@implementation TurboConfig

...

// 注册模块
HIPPY_EXPORT_TURBO_MODULE(TurboConfig)

// 注册交互函数
HIPPY_EXPORT_TURBO_METHOD(getInfo) {
    return self.strInfo;
}
HIPPY_EXPORT_TURBO_METHOD(setInfo:(NSString *)string) {
    self.strInfo = string;
    return @(YES);
}

...

@end
```







Hippy-React 代码示例：

https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/Turbo/demoTurbo.js

Hippy-Vue 代码示例：

https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demoTurbo.js



#### **8.2.**     **减少首屏 JS API 调用次数**



### **9.**     **Hippy-Vue 优化**

​            1.     减少 getElemCss 方法的调用



``` javascript
Vue.Native.getElemCss()
```





​            2.     减少 scoped 的使用

vue scoped 能力是 2.15.0 版本引入，scoped会转换为 属性选择器，因此解析性能会比较差；

在 Hippy 3.0 版本，我们使用 css-module的方案优化了 scoped的解析方式，性能得到提升。

​            3.     减少 CSS 属性选择器、伪类等样式的使用

​            4.     升级 Hippy-Vue-Next（Vue3）

Vue3 升级指引：https://hippyjs.org/#/hippy-vue/vue3

Vue3 相比 Vue2 做了 Diff算法优化、静态提升、事件缓存等优化，从Vue框架层面会带来性能提升。实测了 Vue3 和 Vue2 在Hippy框架下的数据对比：



### **10. Hippy-React 优化**

​            1.     Hippy React节点更新优化：

https://iwiki.woa.com/p/1335183393

@hippy/react 在 2.12.0 版本应用上了最新的渲染优化，针对 react 16 和 react 17，先删除原来的 react-reconciler 包依赖，再分别引入 



``` javascript
"@hippy/react-reconciler": "react16"
"@hippy/react-reconciler": "react17"
```





​

### **11.**     **渲染优化：**

#### 1. 减少首屏节点数、节点层级

- 可以借助客户端 IDE 来直观地查看 "DOM" 树，使用前端的 DevTools 的 View 树来检查冗余节点。

#### 2. 减少节点重复渲染的次数

- 可以在高频渲染节点的 `render` 函数中打点统计。
- 使用 `shouldComponentUpdate`、`PureComponent` 等优化重复渲染。

#### 3. 节点优化：节点合并，扁平化（触发 Hippy 引擎优化）

- 减少冗余事件挂载。

#### 4. 圆角、裁剪、描边等渲染性能较差，尽量减少使用

#### 5. 减少过度绘制

- 移除重复的背景色。
- 减少图层覆盖。

#### 6. ListView

- 尽量使用 `ListView` 代替 `ScrollView`，`ListView` 通过 View 的缓存与重用大大提升渲染性能。
- 使用 `getRowType`，将 item 按类型合理拆分，同一类型的 item 的 `RowType` 相同，可复用。
- 严格保持 `ListView` item 的 DOM 结构一致：
  - **hippy-vue**：item 中的节点可以用 `v-show`，不要用 `v-if`。
  - **hippy-react**：item 中的节点尽量不要用 `if` 条件来改变节点结构。

#### 7. ViewPager

- `ViewPager` 的子节点尽量不要全加载，实现懒加载。

#### 8. Image

- 图片压缩。
- 图片按需加载。
- 避免同时使用 `src` 和 `background`。
- 大图放 CDN。
- 减少 base64 图片使用。
- 图片缓存（内存缓存、磁盘缓存）。

​    代码示例：在自定义ImageLoader中实现自己的缓存逻辑，也可使用第三方图片加载库，如 slide 等。



``` javascript
HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
// 必须：宿主（Hippy的使用者）的Context
// 若存在多个Activity加载多个业务jsbundle的情况，则这里初始化引擎时建议使用Application的Context
initParams.context = this;
...
// 必须：图片加载器
initParams.imageLoader = new MyImageLoader(this.getApplicationContext());
```







### **12.**     **业务逻辑执行优化**

此外，也要检查业务代码自身的耗时，并做针对性优化。

​            1.     防抖节流：对滚动事件、数据上报等进行防抖节流，避免频繁触发计算

​            2.     耗时逻辑检查是否可以放在首屏后执行



### **13.**     **交互优化**

除了上面的优化手段，交互优化在一些场景也是十分重要的，可以提升打开体验，让页面视觉上更流畅。

​            1.     骨架屏优化

​            2.     Loading

​            3.     切换动画



## **总结：**

优化总结、是否需要 终端/前端 同学支持。

| 优化方案             | 方案介绍                       | 接入成本 | 优化效果   | 终端/前端工作  |
| -------------------- | ------------------------------ | -------- | ---------- | -------------- |
| 预加载               | 优化 JS Bundle包加载           | 中       | 中         | 终端工作       |
| 预渲染               | 基于预加载，进一步优化渲染耗时 | 中       | 好         | 终端工作       |
| SSR                  | 预渲染的替代方案               | 中       | 好         | 前端工作       |
| Native-Vue           | 预渲染的另一种替代方案         | 高       | 好         | 前端工作       |
| 数据预请求           | 节省 IO 耗时                   | 低       | 中         | 终端或前端工作 |
| 节点缓存             | 仅安卓支持，优化渲染耗时明显   | 低       | 中         | 终端工作       |
| JS引擎优化（Hermes） | 性能比JSC优化明显              | 高       | 好         | 终端工作       |
| Bundle动态加载       | 分包加载，节省 JS 执行耗时     | 中       | 中         | 前端工作       |
| JS API优化（JSI）    | JSI 接口同步调用，等待耗时降低 | 低       | 中         | 前端工作       |
| Hippy-Vue 逻辑优化   | 优化 css 解析耗时              | 低       | 好         | 前端工作       |
| Hippy-React 逻辑优化 | 渲染队列优化                   | 低       | 中         | 前端工作       |
| 渲染优化             | 组件使用的渲染耗时优化         | 低       | 中         | 前端工作       |
| 业务逻辑优化         | 业务自身逻辑优化               | 无       | 中         | 前端工作       |
| 交互优化             | 业务自身优化交互               | 无       | 体验上优化 | 前端工作       |



## **参考资料：**

​            1.     K歌 Hippy性能优化分享（一）

https://km.woa.com/articles/show/511822?kmref=search&from_page=1&no=7

​            2.     k歌 Hippy性能优化分享（二）

https://km.woa.com/articles/show/484172?kmref=search&from_page=1&no=5

​            3.     k歌 Hippy性能优化分享 （三）

https://km.woa.com/articles/show/504866?kmref=search&from_page=1&no=3

​            4.     k歌渲染优化

https://km.woa.com/articles/show/465625?kmref=search&from_page=1&no=2

​            5.     小说 Hippy性能优化

https://km.woa.com/articles/show/484172?kmref=search&from_page=1&no=5

​            6.     浏览器小说阅读器内存优化

https://km.woa.com/articles/show/468088?kmref=search&from_page=1&no=6

​            7.     QQ 增值Hippy性能优化

https://km.woa.com/articles/show/516658?kmref=search&from_page=1&no=4

​            8.     QQ直播Hippy性能优化

https://km.woa.com/articles/show/557810?kmref=search&from_page=1&no=1

​            9.     QQ游戏中心Hippy SSR优化

https://km.woa.com/articles/show/564026?kmref=search&from_page=1&no=1

​            10.     QQ 音乐Hippy性能监控工具建设

https://km.woa.com/articles/show/494153?kmref=search&from_page=1&no=6

​            11.     浏览器 Hermes 引擎优化性能

https://km.woa.com/articles/show/567715?kmref=search&from_page=1&no=4

​            12.     QB长视频业务优化-接入Hermes引擎

https://km.woa.com/articles/show/564575?kmref=search&from_page=1&no=7

​            13.     Hippy 内存、CPU性能优化

https://km.woa.com/articles/show/484158?kmref=search&from_page=1&no=8

​            14.     闪现社区首屏优化

https://km.woa.com/articles/show/474636?kmref=search&from_page=1&no=9

​            15.     NativeVue：解决Hippy等类RN框架首屏白屏的极致方案

https://km.woa.com/articles/show/527262?kmref=search&from_page=1&no=10

​            16.     Hippy profile工具实现的思考

https://km.woa.com/articles/show/397231?kmref=search&from_page=1&no=6

https://km.woa.com/articles/show/445938

​            17.     记一次Hippy-React优化

https://km.woa.com/articles/show/431695?kmref=search&from_page=1&no=9

​            18.     Flutter性能优化最佳实践

[Flutter 应用性能优化最佳实践 - Flutter 中文文档 - Flutter 中文开发者网站 - Flutter](https://flutter.cn/docs/perf/best-practices)

​            19.     React Native 性能综述

[性能综述 · React Native 中文网](https://reactnative.cn/docs/performance)

​            20.     营地性能优化

https://km.woa.com/articles/show/599930?kmref=search&from_page=1&no=10



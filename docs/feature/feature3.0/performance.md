# Performance API

## 背景

过去 Hippy SDK 缺乏对关键性能指标的获取和监控机制，各个业务都需自行打点或者魔改 SDK 进行统计，导致 Hippy 团队和接入业务均没有一个针对性能指标的统一基准，数据解读混乱，因此由 SDK 统一提供标准化的性能监控和指标显得非常有必要。

## 指标

### 2\.1 启动耗时

Web 设计了 Performance API ，其中包含了 PerformanceResourceTiming 和 PerformanceNavigationTiming 接口，用于检索和分析有关加载应用程序资源的详细网络计时数据和首屏加载耗时数据

<img src="assets/img/3.0-performance0.png" alt="0" width="50%"/>
<img src="assets/img/3.0-performance1.png" alt="1" width="50%"/>

Hippy 3\.0 新架构参考 Web 标准设计了新的性能 API:

<img src="assets/img/3.0-performance-start.png" alt="start" width="50%"/>

性能数据获取示例：

global\.performance\.getEntries\(\):  获取所有的性能指标对象 （PerformanceResource、PerformanceNavigation等）

global\.performance\.getEntriesByType\('navigation'\):  获取启动加载性能指标对象

global\.performance\.getEntriesByType\('resource'\)： 获取资源加载性能指标对象

<img src="assets/img/3.0-performance2.png" alt="2" width="30%"/>

>PerformanceNavigationTiming：

| 指标             | 对应 Key                |
|----------------|---------------------|
| Hippy 引擎加载开始  | hippyNativeInitStart |
| JS 引擎加载开始    | hippyJsEngineInitStart |
| JS 引擎加载结束    | hippyJsEngineInitEnd   |
| Hippy 引擎加载结束 | hippyNativeInitEnd    |
| JS Bundle 自执行耗时 | bundleInfo[]          |
| 业务入口执行开始    | hippyRunApplicationStart |
| 业务入口执行结束    | hippyRunApplicationEnd   |
| 首帧绘制开始       | hippyFirstFrameStart    |
| 首帧绘制结束       | hippyFirstFrameEnd      |
| 启动耗时           | duration               |
| 指标名称           | name                   |
| 指标类型           | entryType              |

>bundleInfo: 

| 指标             | 对应 Key                |
|----------------|---------------------|
| 主包/分包地址  | url |
| 执行js包开始时间    | executeSourceStart |
| 执行js包结束时间    | executeSourceEnd   |

>PerformanceResourceTiming：

| 指标             | 对应 Key                |
|----------------|---------------------|
| 资源地址  | name |
| 请求资源开始时间    | loadSourceStart |
| 请求资源结束时间    | loadSourceEnd   |
| 请求耗时 | duration |
| 指标类型 | entryType |


- 适用版本：3\.1

### 2\.2 内存

- 现状：2\.0 已支持 JS 层通过 Performance\.memory 获取到 V8 引擎的内存数据（Hermes 待定）

<img src="assets/img/3.0-performance-memory.png" alt="memory" width="50%"/>

- 适用版本：2\.0、3\.1

### 2\.3 流畅度

流畅度可通过 FPS 和 Janky Frame 指标来衡量

浏览器里提供了 requestAnimationFrame API，浏览器会在屏幕刷新（一帧）时机调用回调函数，JS 可在回调函数中执行动画等逻辑，也可用来计算 FPS 和 janky frame。Hippy 由于 JS 线程与 UI 线程独立，渲染异步执行，若通过终端实现 requestAnimationFrame 无法做到与浏览器一致的数据精确度（JS 层获取到的帧率会小于终端的真实帧率），但也可作为一个通用能力提供给业务作为参考。

<img src="assets/img/3.0-performance-fps.png" alt="fps" width="20%"/>

- Hippy 3\.0 基于vsync信号重新实现了 requestAnimationFrame API
- 适用版本：3\.1

## 三、Aegis\-Hippy 接入

aegis\-sdk：1\.42\.4


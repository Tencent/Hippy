# Hippy Ohos SDK集成指引

这篇教程，讲述了如何将 Hippy SDK 集成到一个现有的 Ohos 工程。

> 注：以下文档都是假设您已经具备一定的 Ohos 开发经验。

---

## 前期准备

- 已经安装 DevEco Studio 最新版本

## Demo 体验

- Ohos Har Demo：Har 包方式依赖 Hippy。 体验方法：DevEco 打开 hippy 项目根目录运行 entry_har。
- Ohos Demo：源码依赖 Hippy。体验方法：DevEco 打开 hippy 项目根目录直接运行 entry。

> 注：一定是打开 Hippy 项目根目录，不是 Demo 的根目录

## 接入方式一：Har包快速接入

### 1. 创建一个 Ohos 工程

### 2. Har 包集成

- 配置 oh-package.json5，依赖 Hippy har 包

依赖远程 [ohpm](https://ohpm.openharmony.cn/) 上 Har 包：

 ```json
  "dependencies": {
    "hippy": "3.3.2"
  }
 ```

或者依赖本地 Har 包：

 ```json
  "dependencies": {
    "hippy": "file:./libs/hippy.har"
  }
 ```

- Hippy har包产物构建方法：
  - DevEco Studio 打开 Hippy 根目录
  - DevEco Studio 里 Build Mode 选择 release 或 debug
  - DevEco Studio 里选择 Hippy 模块下文件，比如选择 /framework/ohos/src/main/cpp/CMakeLists.txt
  - DevEco Studio 菜单里 Build - Make Module 'hippy'
  - 目录 /framework/ohos/build/default/outputs/default/ 里生成 hippy.har

### 3. 初始化代码

- 获取 libhippy.so 接口对象和 UIAbility context

  ```TypeScript
  import libHippy from 'libhippy.so' // libhippy.so下面可能会有红线提示，可忽略
  AppStorage.setOrCreate("libHippy", libHippy)
  AppStorage.setOrCreate("abilityContext", this.context)
  ```

> 注：App 直接集成 Hippy，context 使用 UIAbility context；如果 App 在一个模块里集成 Hippy，js 等资源也集成在模块里，context 使用 getContext().createModuleContext("moduleName")，否则会找不到 js 等资源。

- 创建 HippyEngine、初始化 HippyEngine、加载业务 bundle

  ```TypeScript
  this.hippyEngine = createHippyEngine(params)
  this.hippyEngine.initEngine()
  this.hippyEngine?.loadModule()
  ```

> 注：loadModule 需要在 initEngine 成功后调用，即回调结果返回 EngineInitStatus.STATUS_OK 后

- 组装 HippyRoot 组件

 ```TypeScript
  HippyRoot({
      hippyEngine: this.hippyEngine,
      rootViewWrapper: this.rootViewWrapper,
      onRenderException: (exception: HippyException) => {
        this.exception = `${exception.message}\n${exception.stack}`
      },
  })
  ```

> 注：确保这里 this.hippyEngine 和 this.rootViewWrapper 是有效值

### 4. 销毁代码

Hippy页面退出时，需要释放资源。 destroyModule 用来释放对应 loadModule 的页面资源，destroyEngine 用来释放对应 initEngine 的引擎环境资源。
一定要先 destroyModule，返回后再 destroyEngine。

 ```TypeScript
  hippyEngine?.destroyModule(rootId, () => {
    hippyEngine?.destroyEngine();
  });
  ```

具体可以参考 [Har Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-har-demo) 工程中 `EntryAbility.ets` `Index.ets` 实现

## 接入方式二：源码接入

> 源码接入主要为了方便在 App 项目里直接调试 Hippy 代码（c++ 和 ets 代码）。

### 1. 创建一个 Ohos 工程

### 2. Hippy 代码集成

- 拉取 hippy 代码到项目里（比如：根目录下，IDE 限制 Hippy 源代码一定要在依赖 Hippy 的项目/模块的目录或子目录里，否则编译会报ets文件路径无法解决的错误）

> https://github.com/Tencent/Hippy.git，分支：main

- 配置 oh-package.json5，依赖 Hippy 文件目录

 ```json
  "dependencies": {
     "hippy": "file:../Hippy/framework/ohos/"
  }
 ```

### 3. Hippy C++ 代码编译配置

- 如果业务模块没有使用 C++，需 build-profile.json5 里配置使用，如下

 ```json
  "externalNativeOptions": {
    "path": "./src/main/cpp/CMakeLists.txt",
    "arguments": "",
    "cppFlags": "",
  },
```

- CMakeLists.txt 内容如下

 ```cmake
cmake_minimum_required(VERSION 3.14)
project(hippy)

set(BIZ_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../")
set(HIPPY_ROOT_DIR "${BIZ_ROOT_DIR}/Hippy_src/framework/ohos/")
set(HIPPY_IMPL_CPP_DIR "${HIPPY_ROOT_DIR}/src/main/cpp/impl")

add_subdirectory("${HIPPY_IMPL_CPP_DIR}" ./hippy_impl)

add_library(${PROJECT_NAME} SHARED

)

target_link_libraries(${PROJECT_NAME} PUBLIC hippy_impl)

set(SOURCE_SET
  )
set(PUBLIC_SOURCE_SET
  )
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET} PUBLIC ${PUBLIC_SOURCE_SET})
 ```

### 4. 初始化代码

- 获取 libhippy.so 接口对象和 UIAbility context

  ```TypeScript
  import libHippy from 'libhippy.so'
  AppStorage.setOrCreate("libHippy", libHippy)
  AppStorage.setOrCreate("abilityContext", this.context)
  ```

- 创建 HippyEngine、初始化 HippyEngine、加载业务 bundle

  ```TypeScript
  this.hippyEngine = createHippyEngine(params)
  this.hippyEngine.initEngine()
  this.hippyEngine?.loadModule()
  ```

- 组装 HippyRoot 组件

 ```TypeScript
  HippyRoot({
      hippyEngine: this.hippyEngine,
      rootViewWrapper: this.rootViewWrapper,
      onRenderException: (exception: HippyException) => {
        this.exception = `${exception.message}\n${exception.stack}`
      },
  })
  ```

### 5. 销毁代码

Hippy页面退出时，需要释放资源。 destroyModule 用来释放对应 loadModule 的页面资源，destroyEngine 用来释放对应 initEngine 的引擎环境资源。
一定要先 destroyModule，返回后再 destroyEngine。

 ```TypeScript
  hippyEngine?.destroyModule(rootId, () => {
    hippyEngine?.destroyEngine();
  });
  ```

具体可以参考 [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-demo) 工程中 `EntryAbility.ets` 等实现

## 接入方式三：定制场景接入

- 对于需要直接依赖 hippy c++ 代码编译使用的定制场景，可参考  [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-demo) 工程中 `CMakeLists.txt` 说明

## Hippy Har 包大小

- 最终集成的 Release Har 包大小为1.9M。

> 构建的 Har 包较大说明：
为了方便定位crash，配置了debugSymbol strip为false，构建的har包里so带详细符号，所以size较大，App集成后会自动strip掉符号变小。
比如：har包有3.8M，其中解压后libhippy.so大小为13.9M，strip符号变小后har包大小为1.9M，解压后so大小为6.2M。

## 常见问题

### 页面白屏问题

- 先用 ArkUI Inspector 工具检查界面上是否有元素，其中 Hippy 组件的 id 都是 “HippyId+数字”的形式
- 如果界面上有元素，但看着白屏，可能1:元素 size 为0，进而可能布局更新有问题，可能2:元素无可见属性设置，可能业务没有更新数据
- 如果界面上无元素，可能 JS Bundle 加载失败，检查控制台 Log，搜索 “JSHCtx::RunScript” 关键词，检查附近 JS 文件是否加载到并正确执行

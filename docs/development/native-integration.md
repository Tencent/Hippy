# 环境搭建 

这篇教程，讲述了如何将 Hippy 集成到 Android、iOS 、Flutter、Web(同构) 等平台。
<br/>
<br/>
<br/>

# Android 

> 注：以下文档都是假设您已经具备一定的 Android 开发经验。

---

## 前期准备

- 已经安装了 JDK version>=1.7 并配置了环境变量
- 已经安装 Android Studio 最新版本
- 运行 Demo 工程前需要完成 NDK，CMAKE，gradle 与相关插件的安装

## Demo 体验

若想快速体验，可以直接基于我们的 [Android Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/examples/android-demo) 来开发

## 快速接入

1. 创建一个 Android 工程

2. Maven 集成

   - 查询 [Maven Central Hippy 版本](https://search.maven.org/search?q=com.tencent.hippy)，其中 `hippy-release` 为 `release` 版本（不携带 `inspector`），`hippy-debug` 为 `debug` 版本

   - 配置 build.gradle

     下面引用Hippy最新版本号可在上述链接中查询

   ```java
    // implementation 'com.tencent.hippy:hippy-debug:3.0.1'
    implementation 'com.tencent.hippy:hippy-release:3.0.1'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

3. 本地集成（可选）

   - [hippy-framework](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/android) 工程运行 Gradle Task `other => assembleRelease` 或者 `other => assembleDebug` 后会在 `framework/android/build/outputs/aar` 目录下生成 `release` 或者 `debug` 模式的`android-sdk.aar`，将 `android-sdk.aar` 拷贝到你项目的 `libs` 目录下。

     !> 通过 `assembleRelease` task 生成的 AAR 默认不携带 `inspector` 模块，不能在前端通过 Devtools 对代码进行调试，若需要集成 `inspector`，请执行 `assembleDebug` task

   - 配置 build.gradle

   ```java
    api (name:'android-sdk', ext:'aar')
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

4. 在宿主 APP 工程中增加引擎初始化与 `hippyRootView` 挂载逻辑，具体可以参考 [Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/examples/android-demo) 工程中 `HippyEngineWrapper` 实现

# iOS 

>注：以下文档都是假设您已经具备一定的 iOS 开发经验。

这篇教程，讲述了如何将 Hippy 集成到一个现有的 iOS 工程。

---

## 一、环境准备

- 安装 Xcode

- 安装 [CMake](https://cmake.org/)

  推荐使用Homebrew安装CMake，安装命令如下：

  ```shell
  brew install cmake
  ```

- 安装 [CocoaPods](https://cocoapods.org/)
  
  [CocoaPods](https://cocoapods.org/) 是一个iOS和macOS开发中流行的包管理工具。我们将使用它把Hippy的iOS Framework添加到现有iOS项目中。

  推荐使用Homebrew安装CocoaPods，安装命令如下：

  ```shell
  brew install cocoapods
  ```

 > 若想快速体验，可以直接基于Hippy仓库中的 [iOS Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ios-demo) 来开发

## 二、使用 Cocoapods 集成 iOS SDK

具体的操作步骤如下：

1. 首先，确定要集成的Hippy iOS SDK版本，如3.2.0，将其记录下来，接下来将在Podfile中用到。
   > 可到「[版本查询地址](https://github.com/Tencent/Hippy/releases)」查询最新的版本信息

2. 其次，准备好现有iOS工程的 Podfile 文件

    Podfile 文件是CocoaPods包管理工具的配置文件，如果当前工程还没有该文件，最简单的创建方式是通过CocoaPods init命令，在iOS工程文件目录下执行如下命令：

    ```shell
    pod init
    ```

    生成的Podfile将包含一些demo设置，您可以根据集成的目的对其进行调整。

    为了将Hippy SDK集成到工程，我们需要修改Podfile，将 hippy 添加到其中，并指定集成的版本。修改后的Podfile应该看起来像这样:

    ```text
    #use_frameworks!
    platform :ios, '11.0'

    # TargetName大概率是您的项目名称
    target TargetName do

        # 在此指定步骤1中记录的hippy版本号，可访问 https://github.com/Tencent/Hippy/releases 查询更多版本信息
        pod 'hippy', '3.2.0'

    end
    ```

    > 默认配置下，Hippy SDK使用布局引擎是[Taitank](https://github.com/Tencent/Taitank)，JS引擎是系统的`JavaScriptCore`，如需切换使用其他引擎，请参照下文[《引擎切换（可选）》](#四引擎切换可选)一节调整配置。

    !> 请注意，由于hippy3.x中大量使用了 #include"path/to/file.h" 的方式引用C++头文件，因此如果开启了 CocoaPods 的 framework 格式集成选项（即Podfile中 `use_frameworks!` 配置为开启状态），则必须在 Podfile 文件中加入如下配置：

    ```text
    # 工程开启 use_frameworks! 后需添加此环境变量，用于hippy使用正确设置项
    ENV["use_frameworks"] = "true"
    ```

3. 最后，在命令行中执行

    ```shell
    pod install
    ```

    命令成功执行后，使用 CocoaPods 生成的 `.xcworkspace` 后缀名的工程文件来打开工程。

## 三、编写SDK接入代码，加载本地或远程的Hippy资源包

Hippy SDK的代码接入简单来说只需两步：

1、初始化一个HippyBridge实例，HippyBridge是Hippy最重要的概念，它是终端渲染侧与前端驱动侧进行通信的`桥梁`，同时也承载了Hippy应用的主要上下文信息。

2、通过HippyBridge实例初始化一个HippyRootView实例，HippyRootView是Hippy应用另一个重要概念，Hippy应用将由它显示出来，因此可以说创建业务也就是创建一个 `HippyRootView`。

目前，Hippy 提供了分包加载接口以及不分包加载接口,使用方式分别如下：

### 方式1. 使用分包加载接口

``` objectivec
/** 此方法适用于以下场景：
 * 在业务还未启动时先准备好JS环境，并加载包1，当业务启动时加载包2，减少包加载时间
 * 我们建议包1作为基础包，与业务无关，只包含一些通用基础组件，所有业务通用
 * 包2作为业务代码加载
*/

// 先加载包1，创建出一个HippyBridge实例
// 假设commonBundlePath为包1的路径
// Tips：详细参数说明请查阅头文件: HippyBridge.h
NSURL *commonBundlePath = getCommonBundlePath();
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                  bundleURL:commonBundlePath
                                             moduleProvider:nil
                                              launchOptions:your_launchOptions
                                                executorKey:nil];

// 再通过上述bridge以及包2地址创建HippyRootView实例
// 假设businessBundlePath为包2的路径
// Tips：详细参数说明请查阅头文件: HippyRootView.h
HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge
                                                    businessURL:businessBundlePath
                                                     moduleName:@"Your_Hippy_App_Name"
                                              initialProperties:@{}
                                                   shareOptions:nil
                                                       delegate:nil];

// 最后，给生成的rootView设置好frame，并将其挂载到指定的VC上。
rootView.frame = self.view.bounds;
rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
[self.view addSubview:rootView];

// 至此，您已经完成一个Hippy应用的初始化，SDK内部将自动加载资源并开始运行Hippy应用。
```

### 方式2. 使用不分包加载接口

``` objectivec
// 与上述使用分包加载接口类似，首先需要创建一个HippyBridge实例，
// 区别是在创建HippyRootView实例时，无需再传入业务包，即businessBundlePath，直接使用如下接口创建即可
// Tips：详细参数说明请查阅头文件: HippyRootView.h
- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(nullable NSDictionary *)initialProperties
                  shareOptions:(nullable NSDictionary *)shareOptions
                      delegate:(nullable id<HippyRootViewDelegate>)delegate;
```

> 在Hippy仓库中提供了一个简易示例项目，包含上述全部接入代码，以及更多注意事项。
>
> 建议参考该示例完成SDK到已有项目的集成：[iOS Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ios-demo)，更多设置项及使用方式请查阅上述头文件中的具体API说明。

!> 使用分包加载可以结合一系列策略，比如提前预加载bridge, 全局单bridge等来优化页面打开速度。

到这里，您已经完成了接入一个默认配置下的Hippy iOS SDK的全部过程。

## 四、引擎切换（可选）

Hippy 3.x的一个重要特性是支持了多引擎的便捷切换，目前，可切换的引擎有两个，一是布局引擎，二是JS引擎。默认配置下，Hippy使用布局引擎是[Taitank](https://github.com/Tencent/Taitank)，JS引擎是iOS系统内置的`JavaScriptCore`。

如需使用其他布局引擎，如[Yoga](https://github.com/facebook/yoga)，或使用其他JS引擎，如V8，可参考如下指引调整Hippy接入配置。

> Hippy3.x提供了iOS环境下默认的v8引擎实现，如需使用其他JS引擎需用户自行实现相关napi接口。

### 4.1 切换JS引擎

如需使用V8引擎，在Podfile文件中添加如下环境变量即可：

```ruby
ENV['js_engine'] = 'v8'
```

修改后的Podfile应该看起来像这样:

```text
#use_frameworks!
platform :ios, '11.0'
ENV['js_engine'] = 'v8' #切换为V8引擎

# TargetName大概率是您的项目名称
target TargetName do

    pod 'hippy', 'your_specified_version'

end
```

之后，重新执行`pod install`命令更新项目依赖即可。

如需使用其他第三方JS引擎，需要做如下操作：

#### 1.修改Podfile配置为第三方JS引擎

将Podfile中的js_engine环境变量配置为other，这样在拉取代码时，jsc或者v8的代码将不会被添加到工程中。

```ruby
ENV['js_engine'] = 'other'
```

> Hippy3.0中使用napi抽象了不同JS引擎的接口。其中，JSC与V8的接口进行了实现。用户若使用JSC或者V8，可直接切换，Hippy默认进行了实现。

#### 2.自行实现napi抽象接口

napi将js引擎接口抽象化，由js driver层调用。接入方自行实现napi接口，即可实现对第三方JS引擎的支持。

napi文件位于 `/driver/js/napi*` 目录下。

#### 3.将实现文件添加到工程中

接入方自行将对应的napi实现文件添加到工程中。

## 4.2 切换布局引擎

用户若想使用Yoga布局引擎，直接在Podfile文件中指定layout_engine为Yoga即可：

```ruby
ENV['layout_engine'] = 'Yoga'
```

之后，重新执行`pod install`命令更新项目依赖即可。

# Voltron/Flutter 

> 注：以下文档都是假设您已经具备一定的 Flutter 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Flutter 工程。

---

## 前期准备

- 已经安装了 Flutter version>=3.0 并配置了环境变量

## Demo 体验

若想快速体验，可以直接基于我们的 `Voltron Demo` 来开发，我们提供以下两种 `Demo`

- 如果您的应用完全通过 `Flutter` 进行开发，可以参考[flutter_proj](https://github.com/Tencent/Hippy/tree/master/framework/example/voltron-demo/flutter_proj)，3.0正式发布前，请使用 [flutter_proj](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/example/voltron-demo/flutter_proj)

- 如果您希望将 `Voltron` 集成进您的原生 `IOS` 或 `Android` 应用，可以使用 `flutter module` 进行集成

  - `Android` 应用请参考[android-proj](https://github.com/Tencent/Hippy/tree/master/framework/example/voltron-demo/android-proj)，3.0正式发布前，请使用 [flutter_proj](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/example/voltron-demo/android-proj)
  - `IOS` 应用请参考[IOSProj](https://github.com/Tencent/Hippy/tree/master/framework/example/voltron-demo/IOSProj)，3.0正式发布前，请使用 [flutter_proj](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/example/voltron-demo/IOSProj)

> 注意，使用 `flutter_module` 方式进行开发时，原生工程和 `Flutter` 工程在两个目录，上面所提到的 `android-proj` 和 `IOSProj` 均需要配合 [flutter_module](https://github.com/Tencent/Hippy/tree/master/framework/example/voltron-demo/flutter_module)进行使用，3.0正式发布前，请使用 [flutter_proj](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/example/voltron-demo/flutter_module)

## 快速接入

### 如果您的应用完全通过 `Flutter` 进行开发

1. 创建一个 Flutter 工程

2. Pub 集成

   在 `pubspec.yaml` 中添加 `Voltron` 依赖

   ```yaml
   dependencies:
     voltron: ^0.0.1
   ```

3. 本地集成（可选）

   1. 克隆 Hippy 源码

       ```shell
       git clone https://github.com/Tencent/Hippy.git
       ```

       > 注意使用相应的分支及tag，未合入主干前，请使用v3.0-dev分支

   2. 打开 Flutter 工程根目录下的 `pubspec.yaml`

       在 `dependencies` 下添加 `voltron` 依赖

       ```yaml
       voltron:
         path: Hippy路径/framework/voltron
       ```

4. 安装依赖

    ```shell
    flutter pub get
    ```

5. 使用 `Voltron`
    
    建议参考[flutter_proj](https://github.com/Tencent/Hippy/tree/master/framework/example/voltron-demo/flutter_proj)，3.0正式发布前，请使用 [flutter_proj](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/example/voltron-demo/flutter_proj)

    > Pub 集成方式在 Android 平台默认支持 `arm64-v8a` 和 `armeabi-v7a`，如需支持 `x86` 和 `x86_64`，请使用本地集成，iOS 无影响。

    > 需要注意，如果 **debugMode** 为YES的情况下，会忽略所有参数，直接使用 npm 本地服务加载测试 bundle，

### 如果您希望将 `Voltron` 集成进您的原生 `IOS` 或 `Android` 应用

1. 使用该方式进行集成时，要首先集成 Flutter Module，该部分可直接参考官网[Add Flutter to an existing app](https://docs.flutter.dev/add-to-app)

2. 后续流程与完全通过 `Flutter` 进行开发保持一致即可。也可直接参考我们的[Demo](#demo-体验-1)工程

# Web同构

这篇教程，讲述了如何将 Hippy 集成到 Web 页面中。

> 不同于 @hippy/react-web 和 @hippy/vue-web 方案，本方案（Web Renderer）不会替换 @hippy/react 和 @hippy/vue，而是将运行在原生环境下的 bundle 原封不动运行到 Web 上，与转译 Web 的方案各有利弊，业务可根据具体场景采用合适的方案

---

## 前期准备

- 模板文件：Web 运行需要一个 HTML 文件作为入口
- 入口文件：WebRenderer 是作为 Hippy bundle 的一个运行环境，因此不共享入口 JS 文件，应为其创建独立的入口文件

### npm script

在 demo 项目中，通过 `web:dev` 命令启动 WebRenderer 调试服务，通过 `web:build` 打包编译。

```json
  "scripts": {
    "web:dev": "npm run hippy:dev & node ./scripts/env-polyfill.js webpack serve --config ./scripts/hippy-webpack.web-renderer.dev.js",
    "web:build": "node ./scripts/env-polyfill.js
webpack --config ./scripts/hippy-webpack.web-renderer.js"
  }
```

### 启动调试

执行 `npm run web:dev` 启动 WebRenderer 调试，根据 demo 的 webpack 配置，WebRenderer 的 web 服务运行在`3000`端口，浏览器通过 `http://localhost:3000` 访问页面。

## 快速接入

WebRenderer 的执行应符合以下流程：

1. 导入 WebRenderer：该阶段会初始化 Hippy 代码运行的环境
2. 加载业务 bundle：这个 bundle 与 Native 侧运行的 bundle 包保持一致
3. 启动 WebRenderer：该阶段会加载 Hippy 内置组件和模块，也可以加载自定义组件和模块

### 导入 WebRenderer

#### 以 CDN 方式使用

在模板文件内添加：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>Example</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- web renderer cdn url -->
    <!-- Hippy不提供cdn资源管理，需业务自行上传之类 -->
    <script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
    <script src="src/index.ts"></script>
  </body>
</html>
```

#### 以 NPM 包方式使用

```shell
npm install -S @hippy/web-renderer
```

在入口文件内添加：

```javascript
// 1. 导入 web renderer
import { HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// 2. 导入业务 bundle 的入口文件，需放在 web renderer 导入之后

// 3. 创建 web engine，如果有业务自定义模块和组件，从此处传入
```

### 加载业务 Bundle

加载 bundle 包有多种方式，可根据业务需要灵活选择，只需要确保引入顺序在 WebRenderer 之后即可

#### 在模板文件内引用加载

```html
<script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
<!-- 业务 bundle -->
<script src="//xxx.com/hippy-biz/index.bundle.js"></script>
<!-- 入口文件 -->
<script src="src/index.ts"></script>
```

#### 在入口文件内动态加载

```javascript
import { HippyWebEngine } from '@hippy/web-renderer';

const engine = HippyWebEngine.create();

 engine.load('https://xxxx.com/hippy-bundle/index.bundle.js').then(() => {
  engine.start({
    id: 'root',
    name: 'example',
  });
});
```

#### 业务源码直接引用

```javascript
import { HippyCallBack, HippyWebEngine, HippyWebModule, View } from '@hippy/web-renderer';
// 导入业务 bundle 的入口文件，需放在 web renderer 导入之后
import './main';


const engine = HippyWebEngine.create();
```

### 启动 WebRenderer

加载完业务 bundle 后，调用相关 API 创建并启动 WebRenderer

```js
// 创建 web engine，如果有业务自定义模块和组件，从此处传入
// 如果只使用官方模块和组件，则直接使用 const engine = HippyWebEngine.create() 即可
const engine = HippyWebEngine.create({
  modules: {
    CustomCommonModule,
  },
  components: {
    CustomPageView,
  },
});

// 启动 web renderer
engine.start({
  // 挂载的 dom id
  id: 'root',
  // 模块名
  name: 'module-name',
  // 模块启动参数，业务自定义,
  // hippy-react 可以从 入口文件props里获取，hippy-vue可以从 app.$options.$superProps 里获取
  params: {
    path: '/home',
    singleModule: true,
    isSingleMode: true,
    business: '',
    data: { },
  },
});
```

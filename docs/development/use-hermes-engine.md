# Hippy Hermes JS引擎切换指引（Beta）

## 概述

[Hermes](https://github.com/facebook/hermes) 是 Meta 开发的 JavaScript 引擎，旨在提供更快的执行速度和更小的内存占用。在 Hippy 项目中，你可以选择使用 JSC/V8 或 Hermes 作为 JavaScript 引擎。

Hippy 从 `3.4.0` 版本开始支持 Hermes 引擎。本文档将指导你如何在开发过程中切换到 Hermes 引擎。

具体支持状态：

- **iOS 平台**：支持 Hermes 引擎， 支持与 JSC 引擎并行使用。
- **Android 平台**：支持 Hermes 引擎（Alpha版）， 支持与 V8 引擎并行使用。
- **鸿蒙平台**：暂不支持 Hermes 引擎。

切换过程概览：

1. 终端升级 Hippy SDK 版本到 `3.4.0` 及以上版本，并确保正确集成和开启了Hermes 引擎。
2. 前端项目配置或代码调整，确保前端产物与 Hermes 引擎兼容，并编译为 `HBC (Hermes Bytecode)` 文件。
3. 调整资源下发与加载配置，确保终端能够正确加载和执行 `HBC` 文件。

## 终端切换步骤

### iOS 平台

1. **修改 `Podfile`**：

    打开你的项目目录下的 `Podfile` 文件，添加环境变量以指定使用 Hermes 引擎：

    ```ruby
    ENV['js_engine'] = 'jsc' # js engine configuration for hippy, options are: 'jsc'/'hermes'.
    ```

    同时，在 `Podfile` 文件中添加 Hermes 依赖：

    ```ruby
    # hippy_hermes_full 为带调试能力的 Hermes 库，Hippy 的 podspec 默认依赖该库。

    # Tips 1：可替换为自行编译的 Hermes 库
    if ENV['js_engine'] == 'hermes'
      pod 'hippy_hermes_full', :git => 'https://github.com/hippy-contrib/hippy-hermes-bin.git', :tag => '1.0.3'
    end

    # Tips 2：如需进一步裁减App安装包，可在发布版本使用不带调试能力的 Hermes 库，替换如下：
    # 需注意，使用不带调试能力的 Hermes 库时，Hippy SDK 不能集成 hippy/Devtools 模块。
    if ENV['js_engine'] == 'hermes'
      pod 'hippy_hermes_full', :git => 'https://github.com/hippy-contrib/hippy-hermes-bin.git', :tag => '1.0.3', :configurations => ['Debug']
      pod 'hippy_hermes', :git => 'https://github.com/hippy-contrib/hippy-hermes-bin.git', :tag => '1.0.3', :configurations => ['Release']
    end
    ```

    最终，修改后的Podfile如下所示：

    ```ruby
    platform :ios, '12.0'
    use_frameworks!
    ENV['js_engine'] = 'hermes' # Hippy设置为使用 Hermes 引擎

    target 'YourTargetName' do
      pod 'Hippy', path: '../path/to/hippy'
    
      # Add hippy_hermes_full when using hermes engine
      if ENV['js_engine'] == 'hermes'
        pod 'hippy_hermes_full', :git => 'https://github.com/hippy-contrib/hippy-hermes-bin.git', :tag => '1.0.3'
      end
    end
    ```

2. **安装依赖**：

    在项目根目录下运行以下命令以安装所需的依赖：

    ```bash
    pod install
    ```

3. **在Hippy SDK初始化时配置启用Hermes引擎**：

    调整Hippy SDK的初始化代码，确保在创建实例时启用Hermes引擎。例如，在Objective-C中：

    ```objectivec
    @import hippy;

    @implementation MyHippyViewController

    // 省略一些其他代码...

    // 创建Hippy实例
    - (void)runHippyDemo {
        // Necessary configuration:
        NSString *moduleName = @"Demo";

        // Set launch options for hippy bridge
        HippyLaunchOptions *launchOptions = [HippyLaunchOptions new];
        launchOptions.debugMode = _debugMode;
        launchOptions.useHermesEngine = _useHermesEngine;

        // Prepare initial properties for js side
        NSDictionary *initialProperties = @{ @"isSimulator": @(TARGET_OS_SIMULATOR) };

        // Initialize hippy bridge using the above options.
        NSURL *vendorBundleURL = [self vendorBundleURL];
        NSURL *indexBundleURL = [self indexBundleURL];
        HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                          bundleURL:vendorBundleURL
                                                     moduleProvider:nil
                                                      launchOptions:launchOptions
                                                        executorKey:moduleName];
        
        // Create and configure the root view
        HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge
                                                            businessURL:indexBundleURL
                                                             moduleName:moduleName
                                                      initialProperties:initialProperties
                                                               delegate:self];
        
        // 省略一些其他代码...
    }

    @end
    ```

    至此，你已在 iOS 平台上成功地将一个 Hippy 项目中的 JavaScript 运行环境从默认的 JSC 引擎切换至了 Hermes 引擎。此时你可以尝试编译运行项目，但可能会遇到一些兼容性报错提示，因为 Hermes 引擎与 JSC 引擎在某些方面存在差异。解决这些问题通常需要对JS代码进行适当的调整，我们将在后续章节中详细介绍如何解决这些问题。

    > Tips 1: Hippy 在 iOS 平台支持 JSC 引擎与 Hermes 引擎并行使用，并且支持在运行时根据不同的条件选择使用哪个引擎，即`支持引擎热切换`。
    >
    > Tips 2: `HippyLaunchOptions` 中 `useHermesEngine` 的默认值为 `NO`，因此如果需要启用 Hermes 引擎，则必须显式地将其设置为 `YES`，否则项目将继续使用 JSC 引擎。

### Android 平台 (Alpha版本)

由于 Android 平台的 Hermes 引擎切换目前处于 Alpha 阶段，我们将在未来版本中提供详细指引，请关注后续更新。

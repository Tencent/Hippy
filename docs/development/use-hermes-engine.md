# Hippy Hermes JS引擎切换指引（Beta）

## 概述

[Hermes](https://github.com/facebook/hermes) 是 Meta 开发的 JavaScript 引擎，旨在提供更快的执行速度和更小的内存占用，它的主要特点是能够将 JavaScript 代码编译成字节码（Bytecode），从而提高运行时执行效率。在 Hippy 项目中，你可以选择使用 JSC/V8 或 Hermes 作为 JavaScript 引擎。

Hippy 从 `3.4.0` 版本开始支持 Hermes 引擎。本文档将指导你如何在开发过程中切换到 Hermes 引擎。

具体支持状态：

- **iOS 平台**：支持 Hermes 引擎， 支持与 JSC 引擎并行使用。
- **Android 平台**：支持 Hermes 引擎（Alpha版）， 支持与 V8 引擎并行使用。
- **鸿蒙平台**：暂不支持 Hermes 引擎。

切换过程概览：

1. 终端升级 Hippy SDK 版本到 `3.4.0` 及以上版本，并确保正确集成和开启了Hermes 引擎。
2. 前端项目配置或代码调整，确保前端产物与 Hermes 引擎兼容，并编译为 `HBC (Hermes Bytecode)` 文件。
3. 调整资源下发与加载配置，确保终端能够正确加载和执行 `HBC` 文件。
4. 测试验证，确保应用在不同平台和设备上都能正常运行，并且性能达到预期。

性能参考预期（仅iOS平台）：

- **启动时间**：首帧耗时（FP指标）减少约 50% ～ 60%
- **内存占用**：一般场景内存降低约 20% ～ 40%

> 其他平台性能参考数据将在 Beta 版发布后提供。

## 终端切换步骤

### iOS 平台

1. **修改 `Podfile`**：

    打开你的项目目录下的 `Podfile` 文件，添加环境变量以指定使用 Hermes 引擎：

    ```ruby
    ENV['js_engine'] = 'hermes' # js engine configuration for hippy, options are: 'jsc'/'hermes'.
    ```

    同时，在 `Podfile` 文件中添加 Hermes 依赖：

    ```ruby
    # hippy_hermes_full 为带调试能力的 Hermes 库，Hippy 的 podspec 默认依赖该库。

    # Tips 1：可替换为自行编译的 Hermes 库
    # Hippy 基于 Hermes 仓库下的 'facebook/rn/0.76-stable' 分支构建该库
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

## 前端切换步骤

前端切换到 Hermes 引擎要做的主要工作包括：

1. 调整语法或项目打包配置，确保生成兼容 Hermes 的JS代码。

   > Hermes 引擎的目标是支持 ECMAScript 2015 (ES6)，但有一些例外（比如不支持 `with` 语句、不支持 Local mode `eval()` 函数等），因此有可能需要对现有代码进行调整以适应 Hermes 引擎的要求。
   >
   > 更多语法说明请参考： [Hermes语法支持特性](https://github.com/facebook/hermes/blob/rn/0.76-stable/doc/Features.md)

   推荐使用以下 Babel 预设和插件，以确保项目能够兼容 Hermes 引擎，以 Babel 为例：：

    ```js
    module.exports = {
        presets : [
            ['module:metro-react-native-babel-preset'],
        ],
        plugins : [
            ['@babel/plugin-proposal-class-properties'],
        ],
    };
    ```

    > 具体需使用的插件和预设可能因项目而异，请根据实际情况进行调整，并做好相应的测试。

    ⚠️ 特别注意，如果你使用的是 Hippy-Vue2 框架，由于 Hippy-Vue2 在处理组件模版时依赖 Hermes 不支持的 `with` 语法 ，因此必须调整你的组件源码，以确保在 Hermes 引擎中能够正常运行。举个例子，有如下 Vue2 定义的自定义组件：

    ```js
    Vue.component('my-view', {
        data: function () {
            return {
                count: 0
            }
        },
        template: '
            <div>
                <p>You clicked me {{ count }} times.</p>
            </div>
        '
    })
    ```

    上述 Vue2 代码需修改为使用 render 函数来代替 template：

    ```js
    Vue.component('my-view', {
        data: function () {
            return {
                count: 0
            }
        },
        // 由于 Hermes 引擎不支持 template，因此需要使用 render 函数
        // render 函数接收一个 h 函数作为参数，用于创建虚拟 DOM 节点
        render(h) {
            return h('div', [
                h('p', `You clicked me ${this.count} times.`)
            ])
        }
    })
    ```

    > Tips：使用 Hippy-Vue3 或 Hippy-React 框架时无需进行上述修改。

2. 使用Hermes编译器，生成 Hermes 字节码（HBC）。

   Hermes 编译器可以将 JavaScript 代码转换为 Hermes 字节码（HBC），以便在 Hermes 引擎中运行。可以通过命令行工具或集成到构建系统中来使用 Hermes 编译器。

   Hippy提供了一个编译好的 Hermes compiler npm 包，可以方便地在项目中使用 Hermes 编译器（支持Linux、macOS 和 Windows 系统）。以下是使用步骤：

    - 安装 Hermes compiler npm 包：

    ```bash
    npm install @hippy/hermesc --save-dev
    ```

    - 使用 Hermes compiler 编译 JavaScript 代码：

    ```javascript
    // 1. 获取 Hermes compiler 路径
    const getHippyHermescPath = () => {
        // 请确保在执行此代码之前，已经安装了 Hermes compiler，并且 hermesc 路径正确
        const hermesPath = path.resolve(__dirname, '../node_modules/@hippy/hermesc');
        console.log('hermes package path:', hermesPath);
        let hermesc = `${hermesPath}/%OS%-bin/hermesc`;
        switch (process.platform) {
            case 'win32':
            hermesc = hermesc.replace('%OS%', 'win64');
            break;
            case 'darwin':
            hermesc = hermesc.replace('%OS%', 'osx');
            break;
            default:
            hermesc.replace('%OS%', 'linux64');
            break;
        }
        console.log('hermesc path:', hermesc);
        return hermesc;
    };
    
    // 2. 调用Hermes compiler生成HBC文件
    const { exec } = require('child_process');

    const compileJSToHBC(inputJSPath, outputHBCPath) => {
        let hermesc = getHippyHermescPath();
        exec(`${hermesc} -emit-binary -O -g0 -out ${outputHBCPath} ${inputJSPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行出错: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`错误输出: ${stderr}`);
                return;
            }
            console.log(`成功生成 HBC 文件: ${stdout}`);
        });
    };
    
    // 调用示例：
    compileJSToHBC('path/to/input.js', 'path/to/output.hbc');
    ```

    > 如需在命令行使用自行编译的Hermes compiler，可以使用以下命令：
    >
    > ```bash
    > hermesc -emit-binary -O -g0 -out output.hbc input.js 
    > # 更多参数请查阅 Hermes 官方文档
    > ```

3. 在应用中加载和运行 Hermes 字节码（HBC）。

   至此，你已经成功地将 JavaScript 代码编译为 Hermes 字节码，并在应用中加载和运行。

## 注意事项

- 确保您的项目中正确配置了 Hermes 引擎。
- 根据需要调整编译选项以优化性能。
- 在生产环境中使用时，确保对 Hermes 字节码进行充分的测试。
- 查阅 Hermes 官方文档获取更多详细信息和最佳实践。

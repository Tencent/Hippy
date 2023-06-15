# Voltron 集成

> 注：以下文档都是假设您已经具备一定的 Flutter 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Flutter 工程。

---

# 前期准备

- 已经安装了 Flutter version>=3.0 并配置了环境变量

# Demo 体验

若想快速体验，可以直接基于我们的 [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example) 来开发

> 注意使用相应的分支及tag，3.0正式发布前，请使用 [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example)

# 快速接入

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

    ```dart
    import 'package:flutter/material.dart';
    import 'package:voltron/voltron.dart';
    
    class VoltronPage extends StatefulWidget {
     VoltronPage();
    
     @override
     State<StatefulWidget> createState() {
       return _VoltronPageState();
     }
    }
    
    class _VoltronPageState extends State<VoltronPage> {
     late VoltronJSLoaderManager _loaderManager;
     late VoltronJSLoader _jsLoader;
    
     @override
     void initState() {
       super.initState();
       _initVoltronData();
     }
    
     void _initVoltronData() async {
       var initParams = EngineInitParams();
       initParams.debugMode = false;
       initParams.enableLog = true;
       initParams.coreJSAssetsPath = 'assets/jsbundle/vendor.android.js';
       initParams.codeCacheTag = "common";
       _loaderManager = VoltronJSLoaderManager.createLoaderManager(
         initParams,
         (statusCode, msg) {
           LogUtils.i(
             'loadEngine',
             'code($statusCode), msg($msg)',
           );
         },
       );
       var loadParams = ModuleLoadParams();
       loadParams.componentName = "Demo";
       loadParams.codeCacheTag = "Demo";
       loadParams.jsAssetsPath = 'assets/jsbundle/index.android.js';
       loadParams.jsParams = VoltronMap();
       loadParams.jsParams?.push(
         "msgFromNative",
         "Hi js developer, I come from native code!",
       );
       _jsLoader = _loaderManager.createLoader(
         loadParams,
         moduleListener: (status, msg) {
           LogUtils.i(
             "flutterRender",
             "loadModule status($status), msg ($msg)",
           );
         },
       );
     }
    
     @override
     void dispose() {
       super.dispose();
       _jsLoader.destroy();
       _loaderManager.destroy();
     }
    
     @override
     Widget build(BuildContext context) {
       return WillPopScope(
         onWillPop: () async {
           return !(_jsLoader.back(() {
             Navigator.of(context).pop();
           }));
         },
         child: Scaffold(
           body: VoltronWidget(
             loader: _jsLoader,
           ),
         ),
       );
     }
    }
    ```

    > Pub 集成方式在 Android 平台默认支持 `arm64-v8a` 和 `armeabi-v7a`，如需支持 `x86` 和 `x86_64`，请使用本地集成，iOS 无影响。

    > 需要注意，如果 **debugMode** 为YES的情况下，会忽略所有参数，直接使用 npm 本地服务加载测试 bundle，
    
    > 其他使用说明，可直接参考 [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example/lib/voltron_demo_page.dart)，3.0正式发布前，请查看 [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example/lib/voltron_demo_page.dart)

# Voltron Integration

> Note: The following documents assume that you already have some experience with Flutter development.

This tutorial describes how to integrate Hippy into your Flutter project.

---

# Preliminary Preparation

- Flutter version>=3.0 is installed and environment variables are configured

# Demo Experience

If you want to experience it quickly, you can develop it directly based on our [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example)

> Before the official release of version 3.0, you can use [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example)

# Quick Integration

1. Create a Flutter project

2. Pub integration

    Add `Voltron` to `pubspec.yaml`.

    ```yaml
    dependencies:
      voltron: ^0.0.1
    ```

3. Local integration (optional)

   1. clone the source code

       ```shell
       git clone https://github.com/Tencent/Hippy.git
       ```

       > Note: Pay attention to use the corresponding branch and label. Before merging into the trunk, please use the v3.0-dev branch

   2. Open pubspec.yaml in the root directory of the Flutter project

       Add the voltron under dependencies

       ```yaml
       voltron:
         path: Hippy路径/framework/voltron
       ```

4. Install dependencies

    ```shell
    flutter pub get
    ```

5. Use `Voltron`

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

    > Pub integration supports `arm64-v8a` and `armeabi-v7a` by default on the Android platform. If you need to support `x86` and `x86_64`, please use local integration, and iOS has no effect.

    > It should be noted that if **debugMode** is true, all parameters will be ignored and the test bundle will be loaded directly using npm local service
    
    > For more details, you can find it in [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example/lib/voltron_demo_page.dart). Before the official release of version 3.0, read [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example/lib/voltron_demo_page.dart)
   

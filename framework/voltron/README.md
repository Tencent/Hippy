# voltron

## 💡 Introduction

Voltron is Flutter version of Hippy dynamic framework, which contains almost 100% Hippy features. It also has the characteristics of high performance, cross platform, easy learning, etc.

See [https://hippyjs.org](https://hippyjs.org) for details, based on Hippy 3.0

## 🔨 Getting started

add this line to pubspec.yaml

```yaml
dependencies:
  voltron: ^0.0.1
```

import package
```dart
import 'package:voltron/voltron.dart';
```

simple example
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

# Voltron Integration

> Note: The following documents assume that you already have some experience with Flutter development.

This tutorial describes how to integrate Hippy into your Flutter project.

---

# Use with pub.dev

Developing

# Use with source code

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

    Add the voltron_renderer under dependency_overrides

    ```yaml
    voltron_renderer:
      path: Hippy路径/renderer/voltron
    ```

3. Install dependencies

    ```shell
    flutter pub get
    ```

4. Create VoltronWidget

    Here you can directly refer to the Hippy project path/framework/voltron/example/lib/page_test.dart

    ```dart
    class NewVoltronWidget extends StatefulWidget {
        const NewVoltronWidget({Key? key}) : super(key: key);

        @override
        State<StatefulWidget> createState() {
            return _NewVoltronWidgetState();
        }
    }

    class _NewVoltronWidgetState extends State<NewVoltronWidget> {
        PageStatus pageStatus = PageStatus.init;
        late VoltronJSLoaderManager _loaderManager;
        late VoltronJSLoader _jsLoader;

        @override
        void initState() {
            super.initState();
            var initParams = EngineInitParams();
            // debugMode，After opening, all parameters will be ignored, and the test bundle will be loaded directly using npm local service
            initParams.debugMode = false;
            // enable log
            initParams.enableLog = true;
            // core bundle address
            initParams.coreJSAssetsPath = "assets/jsbundle/vendor.android.js";
            // cache tag
            initParams.codeCacheTag = "common";
            // custom provider
            initParams.providers = [];
            // create loaderManager
            _loaderManager = VoltronJSLoaderManager.createLoaderManager(
                initParams,
                (statusCode, msg) {
                    LogUtils.i(
                    'loadEngine',
                    'code($statusCode), msg($msg)',
                    );
                    if (statusCode == EngineInitStatus.ok) {
                    // success to create engine
                    } else {
                    // fail to create engine
                    }
                },
            );
            var loadParams = ModuleLoadParams();
            // Front-End appName
            loadParams.componentName = "Demo";
            // cache tag
            loadParams.codeCacheTag = "Demo";
            // business bundle address
            loadParams.jsAssetsPath = "assets/jsbundle/index.android.js";
            // Parameters passed to the Front-End
            loadParams.jsParams = VoltronMap();
            loadParams.jsParams?.push(
                "msgFromNative",
                "Hi js developer, I come from native code!",
            );
            // 生成loader
            _jsLoader = _loaderManager.createLoader(
                loadParams,
                moduleListener: (status, msg) {
                    LogUtils.i(
                    "flutterRender",
                    "loadModule status($status), msg ($msg)",
                    );
                    // Monitor module loading
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
            return Material(
                child: Scaffold(
                    body: VoltronWidget(
                        loader: _jsLoader,
                    ),
                ),
            );
        }
    }
    ```

    > It should be noted that if **debugMode** is true, all parameters will be ignored and the test bundle will be loaded directly using npm local service

## Demo for quick start

For quick experience, you can develop directly based on our [Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example)

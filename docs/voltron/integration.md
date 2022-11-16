# Voltron 集成

> 注：以下文档都是假设您已经具备一定的 Flutter 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Flutter 工程。

---

# 使用 pub 集成

正在开发中，请使用源码集成

# 使用源码直接集成

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

    在 `dependency_overrides` 下添加 `voltron_renderer` 依赖

    ```yaml
    voltron_renderer:
      path: Hippy路径/renderer/voltron
    ```

3. 安装依赖

    ```shell
    flutter pub get
    ```

4. 创建 `VoltronWidget`

    这里可以直接参考 Hippy 工程路径`/framework/voltron/example/lib/page_test.dart`

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
            // debugMode，打开后会忽略所有参数，直接使用 npm 本地服务加载测试 bundle
            initParams.debugMode = false;
            // 开启日志
            initParams.enableLog = true;
            // core bundle地址
            initParams.coreJSAssetsPath = "assets/jsbundle/vendor.android.js";
            // 缓存标记
            initParams.codeCacheTag = "common";
            // 自定义 provider
            initParams.providers = [];
            // 生成 loaderManager
            _loaderManager = VoltronJSLoaderManager.createLoaderManager(
                initParams,
                (statusCode, msg) {
                    LogUtils.i(
                    'loadEngine',
                    'code($statusCode), msg($msg)',
                    );
                    if (statusCode == EngineInitStatus.ok) {
                    // 引擎创建成功
                    } else {
                    // 引擎创建失败
                    }
                },
            );
            var loadParams = ModuleLoadParams();
            // 对应前端appName
            loadParams.componentName = "Demo";
            // 缓存标记
            loadParams.codeCacheTag = "Demo";
            // 业务bundle路径
            loadParams.jsAssetsPath = "assets/jsbundle/index.android.js";
            // 传入前端的参数
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
                    // 监听module加载情况
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

    > 需要注意，如果 **debugMode** 为YES的情况下，会忽略所有参数，直接使用 npm 本地服务加载测试 bundle

## Demo体验

若想快速体验，可以直接基于我们的 [Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example) 来开发

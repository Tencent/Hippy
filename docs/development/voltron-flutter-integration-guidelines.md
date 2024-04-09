# Voltron Flutter 集成指引

这篇教程，讲述了如何将 Hippy 3.x SDK 集成到 Flutter 工程。

> 注：以下文档都是假设您已经具备一定的 Flutter 开发经验。

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

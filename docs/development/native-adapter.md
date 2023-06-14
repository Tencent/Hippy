# 终端能力适配

可以把 Native 的一些基础能力接口，抽象为 Adapter，方便业务注入实现。支持 Android、iOS、Flutter平台。
<br/>

# Android

---

Android App 开发中存在很多第三方基础库。

比如图片缓存系统常用的有：Picasso、Glide、Fresco 等。

Hippy SDK 如果在代码中直接集成这些第三方基础库，很有可能与你的项目实际情况冲突。为了解决这个矛盾点，Hippy SDK 将所有基础能力接口化，抽象为 Adapter，方便业务注入实现，同时大多数基础能力我们也默认实现了一个最简单的方案。

Hippy SDK 现在所提供的 Adapter 包括：

- `HippyHttpAdapter`：Http 请求 Adapter。
- `HippyExceptionHandlerAdapter`：引擎和 JS 异常处理 Adapter。
- `HippySharedPreferencesAdapter`：SharedPreferences Adapter。
- `HippyStorageAdapter`：数据库（KEY-VALUE）Adapter。
- `HippyExecutorSupplierAdapter`：线程池 Adapter。
- `HippyEngineMonitorAdapter`：Hippy 引擎状态监控 Adapter。


## HippyHttpAdapter

Hippy SDK 提供默认的实现 `DefaultHttpAdapter`。如果 `DefaultHttpAdapter`无法满足你的需求，请参考 `DefaultHttpAdapter`代码接入 `HippyHttpAdapter` 实现。

## HippyExceptionHandlerAdapter

Hippy SDK 提供默认空实现 `DefaultExceptionHandler`。当你的业务基于 Hippy 上线后，必然会出现一些JS异常，监控这些异常对于线上质量具有很重要的意义。Hippy SDK 会抓取这些 JS 异常，然后通过 `HippyExceptionHandlerAdapter` 抛给使用者。

## handleJsException

处理抓取到的JS异常。JS 异常不会导致引擎不可运行，但可能导致用户感知或者业务逻辑出现问题，是线上质量的最重要衡量标准。

## HippySharedPreferencesAdapter

Hippy SDK 提供默认的实现 `DefaultSharedPreferencesAdapter`。大多数场景也不需要进行扩展。

## HippyStorageAdapter

Hippy SDK 提供默认的实现 `DefaultStorageAdapter`。

## HippyExecutorSupplierAdapter

Hippy SDK 提供默认的实现 `DefaultExecutorSupplierAdapter`。

## HippyEngineMonitorAdapter

Hippy SDK 提供默认空实现 `DefaultEngineMonitorAdapter`。当你需要查看引擎加载速度和模块加载速度时，可以通过此Adapter获取到相关信息。

## ImageDecoderAdapter

用于支持开发者有自定义格式图片的解码需求，需要开发者自行提供接口类实例。



<br/>
<br/>
<br/>

# iOS

---

## HippyImageViewCustomLoader

在Hippy SDK中, 前端 `<Image>` 组件默认对应的 HippyImageView 会根据 source 属性使用默认行为下载图片数据并显示。但是某些情况下，业务方希望使用自定义的图片加载逻辑（比如业务使用了缓存，或者拦截特定URL的数据），为此 SDK 提供了`HippyImageViewCustomLoader` 协议。

用户实现此协议，自行根据图片的URL返回数据即可，HippyImageView将根据返回的数据展示图片。

```objectivec
@protocol HippyImageViewCustomLoader<HippyBridgeModule>
@required
/**
* imageView:
*/
- (void)imageView:(HippyImageView *)imageView
        loadAtUrl:(NSURL *)url
 placeholderImage:(UIImage *)placeholderImage
        context:(void *)context
        progress:(void (^)(long long, long long))progressBlock
        completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock;

- (void)cancelImageDownload:(HippyImageView *)imageView withUrl:(NSURL *)url;
@end
```

## 协议实现

```objectivec
@interface CustomImageLoader : NSObject <HippyImageViewCustomLoader>

@end

@implementation CustomImageLoader
HIPPY_EXPORT_MODULE()
- (void)imageView:(HippyImageView *)imageView loadAtUrl:(NSURL *)url placeholderImage:(UIImage *)placeholderImage context:(void *)context progress:(void (^)(long long, long long))progressBlock completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock {

    NSError *error = NULL;
    // 业务方自行获取图片数据，返回数据或者错误
    NSData *imageData = getImageData(url, &error);
    // 将结果通过block通知
    completedBlock(imageData, url, error);
}
@end
```

业务方需要务必添加 `HIPPY_EXPORT_MODULE()` 代码以便在 Hippy 框架中注册此 ImageLoader 模块，系统将自动寻找实现了`HippyImageViewCustomLoader` 协议的模块当做 ImageLoader。

PS: 若有多个模块实现 `HippyImageViewCustomLoader` 协议，系统只会使用其中一个作为默认 ImageLoader



<br/>
<br/>
<br/>

# Voltron

---

Flutter App 开发中存在很多第三方基础库。

Voltron 将所有基础能力接口化，抽象为 Adapter，方便业务注入实现，同时大多数基础能力我们也默认实现了一个最简单的方案。

Voltron 现在所提供的 Adapter 包括：

- `VoltronHttpAdapter`：Http 请求 Adapter。
- `VoltronExceptionHandlerAdapter`：引擎和 JS 异常处理 Adapter。
- `VoltronStorageAdapter`：数据库（KEY-VALUE）Adapter。

## VoltronHttpAdapter

Voltron SDK 提供默认的实现 `DefaultHttpAdapter`。如果 `DefaultHttpAdapter`无法满足你的需求，请参考 `DefaultHttpAdapter`代码接入 `VoltronHttpAdapter` 实现。

## VoltronExceptionHandlerAdapter

Voltron SDK 提供默认空实现 `DefaultExceptionHandler`。当你的业务基于 Voltron 上线后，必然会出现一些JS异常，监控这些异常对于线上质量具有很重要的意义。Voltron SDK 会抓取这些 JS 异常，然后通过 `VoltronExceptionHandlerAdapter` 抛给使用者。

## VoltronStorageAdapter

Voltron SDK 提供默认的实现 `DefaultStorageAdapter`。




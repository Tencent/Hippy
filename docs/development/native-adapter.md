# 终端能力适配

可以把 Native 的一些基础能力接口，抽象为 Adapter，方便业务注入实现。支持 Android、iOS、Flutter、Web(同构) 等平台。
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

## HippyImageCustomLoaderProtocol

在Hippy SDK中, 前端 `<Image>` 组件默认对应的 HippyImageView 会根据 src 属性使用默认行为下载图片数据并显示。但是某些情况下，业务方希望使用自定义的图片加载逻辑（比如业务使用了缓存，或者拦截特定URL的数据），为此 SDK 提供了`HippyImageCustomLoaderProtocol` 协议。

用户实现此协议，自行根据图片的URL返回数据即可，HippyImageView将根据返回的数据展示图片。注意该支持返回待解码的NSData类型图片数据，也支持直接返回解码后的UIImage图片，请根据需要选择合适方案。

```objectivec
/// A Resource Loader for custom image loading
@protocol HippyImageCustomLoaderProtocol <HippyBridgeModule>

@required

/// Load Image with given URL
/// Note that If you want to skip the decoding process lately,
/// such as using a third-party SDWebImage to decode,
/// Just set the ControlOptions parameters in the CompletionBlock.
/// 
/// - Parameters:
///   - imageUrl: image url
///   - extraInfo: extraInfo
///   - progressBlock: progress block
///   - completedBlock: completion block
- (void)loadImageAtUrl:(NSURL *)imageUrl
             extraInfo:(nullable NSDictionary *)extraInfo
              progress:(nullable HippyImageLoaderProgressBlock)progressBlock
             completed:(nullable HippyImageLoaderCompletionBlock)completedBlock;

@end
```

## 协议实现

```objectivec
@interface CustomImageLoader : NSObject <HippyImageCustomLoaderProtocol>

@end

@implementation CustomImageLoader

HIPPY_EXPORT_MODULE() // 全局注册该模块至Hippy

- (void)loadImageAtUrl:(NSURL *)url
             extraInfo:(NSDictionary *)extraInfo
              progress:(HippyImageLoaderProgressBlock)progressBlock
             completed:(HippyImageLoaderCompletionBlock)completedBlock {

    // 1、如果获取的是NSData数据：
    // 业务方自行获取图片数据，返回数据或者错误
    NSError *error = NULL;
    NSData *imageData = getImageData(url, &error);
    // 将结果通过block回调
    completedBlock(imageData, url, error, nil, kNilOptions);

    // 2、如果可以直接获取UIImage数据，可跳过Hippy内置解码过程，避免重复解码：
    UIImage *image = getImage(xxx);
    // 传入控制参数，跳过内部解码
    HippyImageLoaderControlOptions options = HippyImageLoaderControl_SkipDecodeOrDownsample;
    // 将结果通过block回调
    completedBlock(nil, url, error, image, options);
}
@end
```

## 协议注册

与Hippy框架注册其他模块的方法一样，ImageLoader同样既可以选择通过Hippy框架提供的 `HIPPY_EXPORT_MODULE()` 宏注册到App全局（注意，全局注册的含义是App内的所有HippyBridge实例均会获取和使用该模块），又可通过 `HippyBridge` 初始化参数列表中的 `moduleProvider` 参数来注册到特定bridge。

除此之外，`HippyBridge` 还提供了一个注册方法，便于业务注册ImageLoader实例：

```objectivec
/// Set a custom Image Loader for current `hippyBridge`
/// The globally registered ImageLoader is ignored when set by this method.
///
/// - Parameter imageLoader: id
- (void)setCustomImageLoader:(id<HippyImageCustomLoaderProtocol>)imageLoader;
```

在上述实现代码中，我们使用了 `HIPPY_EXPORT_MODULE()` 宏来实现将此 ImageLoader 模块自动注册至 Hippy 框架中，框架内部将自动寻找实现了`HippyImageCustomLoaderProtocol` 协议的模块作为 ImageLoader。

!> 注意，同时只可有一个ImageLoader生效。若有多个模块实现了 `HippyImageCustomLoaderProtocol` 协议，框架使用最后一个作为生效的 ImageLoader。Hippy框架优先使用通过 `setCustomImageLoader:` 方法注册的ImageLoader。



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




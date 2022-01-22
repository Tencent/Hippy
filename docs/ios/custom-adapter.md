# 定制适配器

# HippyImageViewCustomLoader

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

# 协议实现

```objectivec
@interface CustomImageLoader : NSObject <HippyImageViewCustomLoader>

@end

@implementation CustomImageLoader
HIPPY_EXPORT_MODULE()
- (void)imageView:(HippyImageView *)imageView loadAtUrl:(NSURL *)url placeholderImage:(UIImage *)placeholderImage context:(void *)context progress:(void (^)(long long, long long))progressBlock completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock {

    NSError *error = NULL;
    // 业务方自行获取图片数据，返回数据或者错误
    NSData *imageData = getImageData(url, &error);
    // 将结果通过block通知给
    completedBlock(imageData, url, error);
}
@end
```

业务方需要务必添加 `HIPPY_EXPORT_MODULE()` 代码以便在 hipp y框架中注册此 ImageLoader 模块，系统将自动寻找实现了`HippyImageViewCustomLoader` 协议的模块当做 ImageLoader。

PS: 若有多个模块实现 `HippyImageViewCustomLoader` 协议，系统只会使用其中一个作为默认 ImageLoader

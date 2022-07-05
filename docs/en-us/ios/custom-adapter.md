# Custom Adapters

# HippyImageViewCustomLoader

In the Hippy SDK, the default `HippyImageView` will be used to download and display picture data according to source property. However, in some cases, the business side wants to use custom image loading logic (such as caching, or intercepting data for a specific URL). Thus, the SDK provides a protocol for this called `HippyImageViewCustomLoader`.

Users should implement this protocol and return data according to the URL of the picture by themselves. `HippyImageView` will display the picture according to the returned data consequently.

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

# Protocol implementation

```objectivec
@interface CustomImageLoader : NSObject <HippyImageViewCustomLoader>

@end

@implementation CustomImageLoader
HIPPY_EXPORT_MODULE()
- (void)imageView:(HippyImageView *)imageView loadAtUrl:(NSURL *)url placeholderImage:(UIImage *)placeholderImage context:(void *)context progress:(void (^)(long long, long long))progressBlock completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock {

    NSError *error = NULL;
    // get image data and return data or error
    NSData *imageData = getImageData(url, &error);
    // pass result through block
    completedBlock(imageData, url, error);
}
@end
```

The business side must add `HIPPY_EXPORT_MODULE()` code to register this ImageLoader module in the Hippy framework, and the system will automatically find the module that implements the`HippyImageViewCustomLoader` protocol and use it as the ImageLoader.

P.S. if multiple modules implement the `HippyImageViewCustomLoader` protocol, only one of them will be used as the default ImageLoader.

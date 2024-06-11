# Screenshot for specific views

---

## 背景

过去在一些业务的使用场景中需要针对指定的Hippy view进行截图并做分享，之前截图逻辑都是由开发者自己实现，在3.0中我们针对图片解码使用了Android高版本的api，导致部分开发者自己创建canvas和bitmap，并用draw方法截图的方式无法正常截取图片，为了进一步降低开发者的适配成本，我们把截图能力下沉到了SDK，为开发者提供更为便捷的使用方式。

## 3.0 Screenshot接口定义

### HippyEngine Public methods

```java
/**
 * @throws IllegalArgumentException
 */
public abstract void getScreenshotBitmapForView(@Nullable Context context,
    int id, @NonNull ScreenshotBuildCallback callback);
```

   针对指定id的View进行截图，context非空情况下需要是HippyRootView挂载容器所属的Activity

```java
/**
 * @throws IllegalArgumentException
 */
public abstract void getScreenshotBitmapForView(@Nullable Context context,
    @NonNull View view, @NonNull ScreenshotBuildCallback callback);
```

   针对指定的View进行截图，context非空情况下需要是HippyRootView挂载容器所属的Activity

   > 注意：以上2个接口中的context参数如果传入null，会默认使用view的context，view设置的context是loadModule时候在ModuleLoadParams中传入的context，针对一些预加载场景，开发者有可能设置的是app的context，当context不是Activiy的时候会抛出IllegalArgumentException异常导致截图失败。除了context不满足条件，还有其它view不存在或者执行PixelCopy.request都有可能抛出IllegalArgumentException类型异常，需要开发者自行捕获处理。

```java
public interface ScreenshotBuildCallback {

    void onScreenshotBuildCompleted(Bitmap bitmap, int result);
}
```

   返回截图结果的回调，result为0代表截图成功，非0代表截图失败，失败错误值可以参考系统PixelCopy类中定义的错误码

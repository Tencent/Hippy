# Hippy Android 3.x SDK升级指引

>这篇教程，主要介绍Hippy Android SDK 从2.x升级3.x版本如何进行适配以及2.x和3.x在使用上的一些差异化。
</br>

1. 废弃HippyImageLoader相关实现

   HippyImageLoader在2.0中作为引擎初始化必设项是不合理的，在3.0版本中由于图片数据拉取和解码解耦为不同的子模块，HippyImageLoader已经被移除，图片请求会和其它所有IO相关的资源请求统一走VFS模块进行分发，如果是网络请求最终会由VFS模块会分发到HttpAdapter完成请求的处理。  
   获取到图片数据后，解码模块新增加ImageDecoderAdapter可选项设置（引擎初始化时候新增imageDecoderAdapter参数设置），用于支持开发者有自定义格式图片的解码需求，ImageDecoderAdapter的具体接口描述如下：

   ```java
   // 解码image原始数据，解码的结果可以通过 image data holder提供的setBitmap或者setDrawable接口
   // 置到holder中，如果宿主decode adapter不处理，返回false由SDK走默认解码逻辑
   boolean preDecode(@NonNull byte[] data, 
                     @Nullable Map<String, Object> initProps,
                     @NonNull ImageDataHolder imageHolder, 
                     @NonNull BitmapFactory.Options options);

   // 解码结束后，宿主通过该接口回调还可以获得二次处理bitmap的机会，比如要对bitmap做高斯模糊。
   void afterDecode(@Nullable Map<String, Object> initProps, 
                    @NonNull ImageDataHolder imageHolder, 
                    @NonNull BitmapFactory.Options options);

   // 引擎退出销毁时调用，释放adapter可能占用的资源
   void destroyIfNeeded();
   ```

2. 引擎初始化完成callback线程变更

   2.0中initEngine初始化结果SDK内部会切换到UI线程再callback onInitialized给宿主，但我们发现在很多APP内业务反馈的使用场景下，callback切UI线程执行具有很大的延迟，所以3.0中callback onInitialized直接在子线程回调并继续执行loadModule会有更好的效率，之前2.0在callback中对hippyRootView相关的UI操作需要开发者自己来切UI线程保证。

3. 引擎销毁

    3.0中destroyModule增加了回调接口，destroyEngine需要等destroyModule执行完成回调以后才能调用，否则可能有CRASH的风险，宿主可以参考下面代码示例进行引擎销毁：

    ```java
    fun destroyEngine(hippyEngine: HippyEngine?, hippyRootView: ViewGroup?) {
        hippyEngine?.destroyModule(hippyRootView,
                Callback<Boolean> { result, e -> hippyEngine.destroyEngine() })
    }
    ```

4. HippyEngine中的接口不再直接引用HippyRootView

    destroyModule接口参数以及loadModule接口返回值均使用系统ViewGroup类型替代，尽量减少对SDK的耦合。

5. loadModule接口参数ModuleListener接口有所变更
   - 我们发现之前2.0在onLoadCompleted回调接口中返回的root view参数其实在各多业务场景都不会去用到，所以在3.0中我们简化了这个接口，移除了root view参数的返回
   - 增加onFirstViewAdded接口回调，返回第一view挂载到Hippy root view的回调时机

6. 引擎初始化参数增加资源请求自定义processor的设置

    ```java
    public List<Processor> processors;
    ```

    关于VFS特性以及Processor接口使用的介绍可以详见 [VFS](feature/feature3.0/vfs.md)。

7. 关于UI Component事件发送  
   Hippy终端事件的发送分为全局事件和UI Component事件2种，全局事件和2.0保持一致，使用HippyEngine中暴露的sendEvent接口发送，而UI Component事件的发送可以使用在3.0新增工具类EventUtils中封装的事件发送接口:

    ```java
    @MainThread
    public static void sendComponentEvent(@Nullable View view, 
                                          @NonNull String eventName,
                                          @Nullable Object params);
    ```

8. HippyInstanceContext已经被废弃  
   2.0中基于系统ContextWrapper封了Hippy自己的HippyInstanceContext，并将其作为所有Hippy view的初始化参数，随着3.0 framework和renderer两个子模块的解耦，我们发现HippyInstanceContext设计过于臃肿，已经不再适用于最新的3.0架构，所以我们在最新的3.0版本中废弃了HippyInstanceContext，改用更加轻量化的NativeRenderContext取代，也就是说3.0中所有Hippy相关的view中保存的context都是NativeRenderContext类型。

9. HippyEngine中新增render node缓存特性接口  
   2.0中我们支持了dom node缓存特性，但dom node缓存针对复杂页面场景性能还是存在一定的性能瓶颈，所有我们在3.0重新实现了性能更好的render node缓存特性，关于render node缓存特性与接口使用的介绍可以详见 [RenderNode Snapshot](feature/feature3.0/render-node-snapshot.md)。

10. 关于自定义UI组件的Controller中dispatchFunction参数说明
    在2.0中dispatchFunction接收事件属性的参数类型为HippyArray类型，由于在2.0的后续版本中HippyMap和HippyArray就已经被标记为@Deprecated，所以在3.0的重构中，SDK内部也逐渐替换一些使用HippyMap或HippyArray类型参数的接口，所以针对Controller的dispatchFunction接口SDK内部默认替换成List类型参数

    ```java
    public void dispatchFunction(@NonNull T view, 
                                 @NonNull String functionName,
                                 @NonNull List params);

    public void dispatchFunction(@NonNull T view, 
                                 @NonNull String functionName,
                                 @NonNull List params, 
                                 @NonNull Promise promise)；                             
    ```

   为了减低3.0升级的成本原来使用HippyArray类型的接口还是保留，只是标记为@Deprecated，所以升级3.0对于原来定义的dispatchFunction接口不需要做任何修改，但建议后续升级到3.0版本的同学，定义新UI组件的时候，直接Override使用List参数类型的新接口。

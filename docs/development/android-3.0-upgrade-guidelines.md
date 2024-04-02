# Hippy Android 3.x SDK升级指引

> 这篇教程，主要介绍Hippy Android SDK 从2.x升级3.x版本如何进行适配以及2.x和3.x在使用上的一些差异化。
</br>

---

# Maven依赖项变更

3.0 SDK集成依赖项相对2.0有所变更，开发者可以参照[Hippy Android 3.x SDK集成指引](development/android-3.0-integration-guidelines.md)更新自己工程中的依赖项。
</br>
</br>

# 升级基础适配项（required）

1. 废弃引擎初始化参数HippyImageLoader

   HippyImageLoader在2.0中作为引擎初始化必设项是不合理的，在3.0中已经废弃，开发者需要在引擎初始化中移除HippyImageLoader相关的设置参数与实现。</br>
   3.0图片资源拉取会和其它所有IO相关的资源一样统一走VFS模块进行分发，远程网络资源请求最终会由VFS模块会分发到HttpAdapter进行处理，如果开发者需要将图片请求和其他资源请求进行区分处理，可以参照下面代码示例在自定义的HttpAdapter中Override fetch接口，通过请求参数来判断是否为图片资源的请求：

   ```java
    @Override
    public void fetch(@NonNull final ResourceDataHolder holder,
            @Nullable HashMap<String, Object> nativeParams,
            @NonNull final VfsManager.ProcessorCallback callback) {
        HashMap<String, String> rp = holder.requestParams;
        if (rp != null && rp.containsKey(REQUEST_CONTENT_TYPE)
                && rp.get(REQUEST_CONTENT_TYPE).equals(REQUEST_CONTENT_TYPE_IMAGE)) {
            // 这里处理图片资源请求
        } else {
            // 这里处理其它资源的请求
        }
    }
    ```

2. 引擎初始化完成callback回调线程调整

   2.0中initEngine初始化结果SDK内部会切换到UI线程再callback onInitialized给宿主，但我们发现在一些业务使用场景下，callback切UI线程执行可能具有很大的延迟，所以3.0中callback onInitialized直接在子线程回调并继续执行loadModule会有更好的效率。</br>
   在原2.0引擎初始化callback中如果有对hippyRootView挂载等相关的UI操作，需要开发者自己增加UI线程的切换逻辑来保证。

3. 引擎销毁调用方式与顺序调整

    3.0中destroyModule增加了回调接口，destroyEngine需要等destroyModule执行完成回调以后才能调用，否则可能有CRASH的风险，开发者需要将2.0原有的引擎销毁逻辑按下面的代码示例进行变更：

    ```java
    fun destroyEngine(hippyEngine: HippyEngine?, hippyRootView: ViewGroup?) {
        hippyEngine?.destroyModule(hippyRootView,
                Callback<Boolean> { result, e -> hippyEngine.destroyEngine() })
    }
    ```

4. HippyEngine中的接口不再直接引用HippyRootView

    destroyModule接口参数以及loadModule接口返回值均使用系统ViewGroup类型替代，尽量减少对SDK的耦合，开发者需要对loadModule接口返回值类型做相应的调整。

5. ModuleListener接口定义变更
   开发者需要对loadModule接口参数ModuleListener做以下2点适配
   - 我们发现之前2.0在onLoadCompleted回调接口中返回的root view参数其实在各多业务场景都不会去用到，所以在3.0中我们简化了这个接口，移除了root view参数的返回
   - 增加onFirstViewAdded接口回调，返回第一view挂载到Hippy root view的回调时机

6. UI Component事件发送
   Hippy终端事件的发送分为全局事件和UI Component事件2种，全局事件和2.0保持一致，使用HippyEngine中暴露的sendEvent接口发送，而UI Component事件的发送，开发者需要统一使用使用3.0新增工具类EventUtils中封装的事件发送接口:

    ```java
    @MainThread
    public static void sendComponentEvent(@Nullable View view, 
                                          @NonNull String eventName,
                                          @Nullable Object params);
    ```

7. 废弃HippyInstanceContext定义及其相关实现
   2.0中基于系统ContextWrapper封了Hippy自己的HippyInstanceContext，并将其作为所有Hippy view的初始化参数，随着3.0 framework和renderer两个子模块的解耦，我们发现HippyInstanceContext设计过于臃肿，已经不再适用于最新的3.0架构，所以我们在最新的3.0版本中废弃了HippyInstanceContext，改用更加轻量化的NativeRenderContext取代，所以开发者需要将自定义组件中使用到HippyInstanceContext的相关实现变更为NativeRenderContext。
   </br>

# 新增特性适配项（optional）

1. 引擎初始化参数增加资源请求自定义processor的设置

    ```java
    public List<Processor> processors;
    ```

    关于VFS特性以及Processor接口使用的介绍可以详见 [VFS](feature/feature3.0/vfs.md)。

2. 引擎初始化参数增加ImageDecoderAdapter的设置
   如果开发者有自定义格式图片的解码需求，可以在引擎初始化参数中设置ImageDecoderAdapter，ImageDecoderAdapter的具体接口描述如下：

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

3. HippyEngine中新增render node缓存特性接口  
   2.0中我们支持了dom node缓存特性，但dom node缓存针对复杂页面场景性能还是存在一定的性能瓶颈，所有我们在3.0重新实现了性能更好的render node缓存特性，关于render node缓存特性与接口使用的介绍可以详见 [RenderNode Snapshot](feature/feature3.0/render-node-snapshot.md)。

4. 关于自定义UI组件的Controller中dispatchFunction参数说明
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

   为了减低3.0升级的成本原来使用HippyArray类型的接口还是保留，只是标记为@Deprecated，所以升级3.0对于原来定义的dispatchFunction接口不需要做任何修改，但建议后续升级到3.0版本定义新UI组件的时候，直接Override使用List参数类型的新接口。

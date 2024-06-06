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

8. 废弃support ui下面RecyclerView及其派生类HippyListView相关实现
   随着瀑布流组件重构完成，HippyWaterfallView已经与HippyRecyclerView共同派生于系统androidX的RecyclerView
   老版本的support ui组件已经可以彻底废弃，因此以下2个目录下所有实现文件已经从sdk中移除
   - com/tencent/mtt/supportui/views/recyclerview/
   - com/tencent/mtt/hippy/views/list/
   </br>
   之前开发者如果基于HippyListView派生了自己定义的list view组件，需要修改并适配为继承于HippyRecyclerView
   
9. HippyRootView下面getLaunchParams方法已被废弃，可以使用HippyEngineContext下面getJsParams接口来替代。

10. 简化HippyHttpRequest类实现，移除了以下接口定义:
    - public void setMethod(String method)
    - public void setInstanceFollowRedirects(boolean instanceFollowRedirects)
    - public void setBody(String body)
    - public void setNativeParams(Map<String, Object> nativeParams)
    - public void setInitParams(HippyMap initParams) 
    - public void setInstanceFollowRedirects(boolean instanceFollowRedirects)
    </br>
    由于mInitParams参数在HippyHttpRequest创建的时候就作为初始化参数传入，后续一些依赖mInitParams获取参数的逻辑封装在HippyHttpRequest内部更合理，所以我们移除了相关的set接口，只保留get接口.
    </br>
    该项调整对于之前2.x中开发者定义了继承于DefaultHttpAdapter的自定义HippyHttpAdapter，并且使用到HippyHttpRequest相关接口的需要做一定适配，适配过程中也可以参考我们github工程main分支DefaultHttpAdapter与HippyHttpRequest具体实现。

11. HippyEngineContext下部分接口调整:
    - 新增findViewById(int nodeId)，可以通过node id查找对应的view
    - 移除getDomManager()与getRenderManager()两个接口，之前通过RenderManager查找view的方法通过上述新增接口替代
    - getEngineId()接口转移至HippyEngine类下
    - 废弃getInstance(int id)接口，由新增getRootView()和getRootView(int rootId)两个接口替代，目前多root view支持还未完善，所以两个getRootView接口调用效果一致
    </br>
    如果开发者在之前的2.x版本上使用到以上接口，可以根据自己的需要做相应适配调整

12. HippyViewController下面移除getInnerPath(HippyInstanceContext context, String path)接口实现，暂时不支持开发者Override该接口自定义路径，3.0 image uri local path的转换在ImageComponent中通过convertToLocalPathIfNeeded(String uri)接口实现，暂不支持定制。


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

5. HippyEngine中新增Screenshot截屏特性接口
   过去在一些业务的使用场景中需要针对指定的Hippy view进行截图并做分享，之前截图逻辑都是由开发者自己实现，为了进一步降低开发者的适配成本，我们把截图能力下沉到了SDK，为开发者提供更为便捷的使用方式，关于Screenshot截屏特性与接口使用的介绍可以详见 [Screenshot for specific views](feature/feature3.0/screenshot.md)。

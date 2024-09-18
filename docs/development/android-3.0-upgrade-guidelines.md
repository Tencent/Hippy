# Hippy Android 3.x SDK升级指引

> 这篇教程，主要介绍Hippy Android SDK 从2.x升级3.x版本如何进行适配以及2.x和3.x在使用上的一些差异化。
</br>

---

# 升级依赖项变更

3.0 SDK集成依赖项相对2.0有所变更，开发者可以参照[Hippy Android 3.x SDK集成指引](development/android-3.0-integration-guidelines.md)更新自己工程中的依赖项。
</br>
</br>

# 接入与使用方式变更

**3.0针对终端引擎接入，部分类及接口调用方式上做了以下调整：**

1. 引擎初始化完成callback回调线程调整 <br>
   为了提升引擎初始化效率，3.0中引擎初始化完成callback onInitialized直接在子线程回调并继续执行loadModule。2.0在onInitialized中如果有对hippyRootView挂载等相关的UI操作，需要开发者自己增加UI线程的切换逻辑来保证。

2. 引擎销毁调用方式与顺序调整 <br>
   3.0中destroyModule增加了回调接口，destroyEngine需要等destroyModule执行完成回调以后才能调用，否则可能有CRASH的风险，新的释放流程流程参照以下代码示例：

    ```java
    fun destroyEngine(hippyEngine: HippyEngine?, hippyRootView: ViewGroup?) {
        hippyEngine?.destroyModule(hippyRootView,
                Callback<Boolean> { result, e -> hippyEngine.destroyEngine() })
    }
    ```

3. 废弃引擎初始化参数HippyImageLoader <br>
   HippyImageLoader在2.0中作为引擎初始化必设项是不合理的，在3.0中已经废弃，开发者需要在引擎初始化中移除HippyImageLoader相关的设置参数与实现。</br>
   3.0图片资源拉取会和其它所有IO相关的资源一样统一走VFS模块进行分发，远程网络资源请求最终会由VFS模块会分发到HttpAdapter进行处理。

4. 废弃HippyInstanceContext定义及其相关实现 <br>
   随着3.0 framework和renderer两个子模块的解耦，我们发现HippyInstanceContext设计过于臃肿，已经不再适用于最新的3.0架构，所以我们在最新的3.0版本中废弃了HippyInstanceContext，改用更加轻量化的NativeRenderContext取代。

5. UI Component事件发送 <br>
   3.0 UI Component事件的发送，开发者需要统一使用使用3.0新增工具类EventUtils中封装的事件发送接口:

    ```java
    @MainThread
    public static void sendComponentEvent(@Nullable View view, 
                                          @NonNull String eventName,
                                          @Nullable Object params);
    ```

</br>

# 组件变更

**3.0针对部分组件做了相应的重构，如果开发者基于老组件扩展了自定义组件，需要做以下适配：**

1. 废弃support ui下面RecyclerView及其派生类HippyListView组件 <br>
   3.0的HippyWaterfallView重构后已经不再依赖support ui相关组件，以下2个目录下所有实现文件已经从sdk中移除 </br>
   com/tencent/mtt/supportui/views/recyclerview/ </br>
   com/tencent/mtt/hippy/views/list/ </br>
   之前开发者如果基于HippyListView派生了自己定义的list view组件，需要修改并适配为继承于HippyRecyclerView

</br>

# 接口定义变更

**3.0对部分接口定义及参数了做了调整，如果开发者有使用到以下接口需要做相应适配：**

1. ModuleListener接口定义变更 <br>
   - onLoadCompleted回调接口移除了root view参数的返回
   - 增加onFirstViewAdded接口回调，返回第一view挂载到Hippy root view的回调时机

2. HippyEngineContext类中部分接口调整 <br>
    - 新增findViewById(int nodeId)，可以通过node id查找对应的view
    - 移除getDomManager()与getRenderManager()两个接口
    - getEngineId()接口转移至HippyEngine类下
    - 废弃getInstance(int id)接口，由新增getRootView()接口替代

3. 废弃HippyRootView中getLaunchParams接口 <br>
   使用HippyEngineContext下面getJsParams接口来替代。 

4. HippyEngine类中接口参数调整 <br>
   为尽量减少接入方对SDK的耦合，destroyModule接口参数以及loadModule接口返回值由原来HippyRootView类型改为系统ViewGroup类型替代。

5. HippyHttpRequest类中接口定义变更 <br>
    由于mInitParams参数在HippyHttpRequest创建的时候就作为初始化参数传入，后续一些依赖mInitParams获取参数的逻辑封装在HippyHttpRequest内部更合理，所以我们移除了以下set接口，只保留get接口：
    - public void setMethod(String method)
    - public void setInstanceFollowRedirects(boolean instanceFollowRedirects)
    - public void setBody(String body)
    - public void setNativeParams(Map<String, Object> nativeParams)
    - public void setInitParams(HippyMap initParams) 
    - public void setInstanceFollowRedirects(boolean instanceFollowRedirects)

6. 废弃HippyViewController中onManageChildComplete接口 <br>
   统一使用onBatchComplete接口替代，之前2.x列表滚动过程中，view复用后默认都会调用onManageChildComplete，但3.x中为了减少一些无效的调用逻辑进一步提升列表滚动流畅性，列表滚动view复用的时候默认不会调用onBatchComplete，如果想接续接收onBatchComplete调用需要做以下适配： <br>
   （1） 定义自定义组件对应的RenderNode(类名自定义)，并Override shouldNotifyNonBatchingChange接口

    ```java
    public class CustomRenderNode extends RenderNode {

        public CustomRenderNode(int rootId, int id, 
                @Nullable Map<String, Object> props,
                String className, 
                ControllerManager componentManager, 
                boolean isLazyLoad) {
            super(rootId, id, props, className, componentManager, isLazyLoad);
        }

        @Override
        protected boolean shouldNotifyNonBatchingChange() {
            return !isBatching();
        }
    }
    ```
    
    （2） 在自定义组件Controller中Override createRenderNode接口并增加自定义RenderNode的创建逻辑

    ```java
    @Override
    public RenderNode createRenderNode(int rootId, int id, 
            @Nullable Map<String, Object> props,
            @NonNull String className, 
            @NonNull ControllerManagercontrollerManager, 
            boolean isLazy) {
        return new CustomRenderNode(rootId, id, props, className, controllerManager, isLazy);
    }
    ```

7. HippyDeviceAdapter中reviseDimensionIfNeed接口参数调整 <br>
   由于HippyRootView不再监听onSystemUiVisibilityChange消息，移除shouldUseScreenDisplay和systemUiVisibilityChanged两个无效参数。

</br>

# 新增特性

**3.0中新增以下新特性的支持，开发者可以根据自己的需求进行选择性适配：**

1. 新增统一资源请求处理模块-VFS，具体使用方式可以详见 [VFS](feature/feature3.0/vfs.md) 特性文档介绍。

2. 新增ImageDecoderAdapter支持接入自定义图片解码器，具体使用方式可以详见 [ImageDecoderAdapter](feature/feature3.0/image-decoder-adapter.md) 特性文档介绍。

3. 新增Render Node缓存特性优化启动速度，具体使用方式可以详见 [RenderNode Snapshot](feature/feature3.0/render-node-snapshot.md) 特性文档介绍。

4. 新增Screenshot截屏特性，具体使用方式可以详见 [Screenshot for specific views](feature/feature3.0/screenshot.md) 特性文档介绍。


# Android 集成

> 注：以下文档都是假设您已经具备一定的Android开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Android 工程。

# 前期准备

- 已经安装了JDK version>=1.7 并配置了环境变量
- 已经安装Android SDK 并配置环境变量。
- Android SDK version 23 (compileSdkVersion in build.gradle)
- SDK build tools version 23.0.1 (buildToolsVersion in build.gradle)

# 快速接入

步骤如下：

1. 创建一个Android工程

2. 集成maven版本，版本信息可以在 [版本查询地址](https://bintray.com/beta/#/hippy/Hippy/hippy-release?tab=overview)查询，build.gradle配置如下

```java
    implementation 'com.tencent.hippy:hippy-release:2.1.0'
    implementation 'com.github.bumptech.glide:glide:3.6.1'
    implementation 'com.android.support:support-v4:25.3.1'
```

1. 如果需要自己打包集成的，可以把DEMO工程编译后在android\sdk\build\outputs\aar目录下生成的
   sdk-release.aar直接集成到你的项目工程里面

后面的 glide 与support-v4 主要是用来demo里面拉图，如果你们有自己的拉图库，可以使用自己的拉图代码。
4. 如果要进一步精简包大小，可以添加如下filter，排除掉armeabi-v7a下的so库，这样可以减小hippy 50%的大小：

```java
android {
    ....
    defaultConfig {
        ....
        ndk {
            abiFilters "armeabi"
        }
    }
}
```

# 代码实现

注:附录中有完整代码地址

## 实现图片下载

实现图片下载接口，初始化时设置。

需要实现ImageLoaderAdapter.java和DrawableTarget.java

```java
public class ImageLoaderAdapter implements HippyImageLoaderAdapter {
    @Override
    public void fetchImage(String url, final HippyImageRequestListener requestListener, Object param)
    {
        Glide.with(ContextHolder.getAppContext()).load(url).asBitmap().into(new DrawableTarget(requestListener));
    }

    @Override
    public HippyDrawableTarget getImage(String url, Object param) {
        LocalHippyDrawable localHippyDrawable = new LocalHippyDrawable();
        localHippyDrawable.setUrl(url);
        return localHippyDrawable;
    }
}

public class DrawableTarget extends SimpleTarget<Bitmap> implements HippyDrawableTarget{
    HippyImageRequestListener mListener;
    Bitmap                    mBitmap;

    public DrawableTarget(HippyImageRequestListener listener)
    {
        this.mListener = listener;
    }

    @Override
    public Bitmap getBitmap()
    {
        return mBitmap;
    }

    @Override
    public String getSource()
    {
        return null;
    }

    @Override
    public Object getExtraData()
    {
        return null;
    }

    @Override
    public void onDrawableAttached() {}

    @Override
    public void onDrawableDetached() {}

    @Override
    public void onResourceReady(Bitmap bitmap, GlideAnimation<? super Bitmap> glideAnimation)
    {
        this.mBitmap = bitmap;
        mListener.onRequestSuccess(this);
    }

    @Override
    public void onLoadFailed(Exception e, Drawable errorDrawable)
    {
        mListener.onRequestFail(e, null);
    }
}
```

## 初始化

```java
public class ExampleHippyEngineHost extends HippyEngineHost {
    private Application mApplication;

    public ExampleHippyEngineHost(Application application) {
        super(application);
        this.mApplication = application;
    }

    @Override
    protected List<HippyPackage> getPackages() {
        // return null;
        List<HippyPackage> hippyPackages = new ArrayList<HippyPackage>();
        hippyPackages.add(new ExtendPackages());
        return hippyPackages;
    }

    @Override
    protected HippyBundleLoader getCoreBundleLoader() {
        return new HippyAssetBundleLoader(mApplication, "base.android.jsbundle", true, "common");
    }

    @Override
    public HippyGlobalConfigs getHippyGlobalConfigs() {
        return new HippyGlobalConfigs.Builder().setApplication(mApplication).setImageLoaderAdapter(new ImageLoaderAdapter()).build();
    }
}
```

## 实现渲染

```java
public class TestActivity extends Activity implements HippyEngineEventListener
{
    private ExampleHippyEngineHost mHost;
    private HippyEngineManager     mEngineManager;
    private HippyRootView          mInstance;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        getWindow().requestFeature(Window.FEATURE_NO_TITLE);
        mHost = new ExampleHippyEngineHost(TestActivity.this.getApplication());
        // mEngineManager = mHost.createHippyEngineManager();
        mEngineManager = mHost.createDebugHippyEngineManager("index");
        mEngineManager.addEngineEventListener(this);
        mEngineManager.initEngineInBackground();
    }

    @Override
    protected void onResume()
    {
        super.onResume();
        mEngineManager.onEngineResume();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mEngineManager.onEnginePause();
    }

    @Override
    protected void onDestroy()
    {
        mEngineManager.destroyInstance(mInstance);
        mEngineManager.removeEngineEventListener(this);
        mEngineManager.destroyEngine();
        super.onDestroy();
    }

    @Override
    public void onEngineInitialized(boolean success)
    {
        if (success) {
            HippyRootViewParams.Builder builder = new HippyRootViewParams.Builder();
            HippyMap params = new HippyMap();
            HippyBundleLoader hippyBundleLoader = null;
            if (!mEngineManager.getSupportDev()) {
                hippyBundleLoader = new HippyAssetBundleLoader(getApplicationContext(), "index.android.js", true, "demo");
            }
            builder.setBundleLoader(hippyBundleLoader).setActivity(TestActivity.this).setName("Demo")
                    .setLaunchParams(params);
            mInstance = mEngineManager.loadInstance(builder.build());
            setContentView(mInstance);
        }
    }
}
```

# 附录

[Demo 下载地址](//github.com/Tencent/Hippy/tree/master/examples/android-demo)

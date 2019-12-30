# 自定义适配器

Android App开发中存在很多第三方基础库。

比如图片缓存系统常用的有：Picasso、Glide、Fresco等。

Hippy SDK如果在代码中直接集成这些第三方基础库，很有可能与你的项目实际情况冲突。为了解决这个矛盾点，Hippy SDK将所有基础能力接口化，抽象为Adapter，方便业务注入实现，同时大多数基础能力我们也默认实现了一个最简单的方案。

Hippy SDK现在所提供的Adapter包括：

- `HippyImageLoaderAdapter`：图片加载Adapter。
- `HippyHttpAdapter：Http`请求Adapter。
- `HippyExceptionHandlerAdapter`：引擎和JS异常处理Adapter。
- `HippySharedPreferencesAdapter`：SharedPreferences Adapter。
- `HippyStorageAdapter`：数据库（KEY-VALUE）Adapter。
- `HippyExecutorSupplierAdapter`：线程池Adapter。
- `HippyEngineMonitorAdapter`：Hippy  引擎状态监控Adapter。

# HippyImageLoaderAdapter

 由于图片加载复杂度较高，实现需要增加SDK包大小，而且每个App都有自己的图片加载机制，所以`SDK不提供默认实现`。

## HippyImageRequestListener

图片加载回调接口。主要包括以下方法：

- `onRequestStart`：图片加载开始。
- `onRequestSuccess`：图片加载成功。
- `onRequestFail`：图片加载失败。

## HippyDrawableTarget

图片包装接口。提供的接口主要包括：

- `getBitmap：SDK`会通过此方法回去图片拉取后的Bitmap。
- `onDrawableAttached`：图片渲染上屏后SDK会回调。
- `onDrawableDetached`：图片离屏后SDK会回调。

## fetchImage

异步拉图接口。Url 以 `Http`、`Https`、`File`开头会调用此接口。

参数：

- `url` String : 图片地址。
- `requestListener` HippyImageRequestListener：图片异步拉取回调。
- `param`Object：一些特殊场景定制参数，正常情况下无需关注。

示例如下：

``` java
public class ImageLoaderAdapter implements HippyImageLoaderAdapter
{

    @Override
    public void fetchImage(String url, final HippyImageRequestListener requestListener, Object param)
    {
        // 这里采用Glide库来拉取图片
        Glide
            .with(ContextHolder.getAppContext())
            .load(url)
            .asBitmap()
            .into(new DrawableTarget(requestListener));
    }
}

public class DrawableTarget extends SimpleTarget<Bitmap> implements HippyDrawableTarget
{

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
    public void onDrawableAttached()
    {

    }

    @Override
    public void onDrawableDetached()
    {

    }

    @Override
    public void onResourceReady(Bitmap bitmap, GlideAnimation<? super Bitmap> glideAnimation)
    {
        this.mBitmap = bitmap;
        // 通知Hippy SDK图片拉取成功
        mListener.onRequestSuccess(this);
    }

    @Override
    public void onLoadFailed(Exception e, Drawable errorDrawable)
    {
        // 通知Hippy SDK图片拉取失败
        mListener.onRequestFail(e, null);
    }
}
```

## getImage

同步拉图接口。主要针对 `assets`、`base64`等图片拉取场景会调用此接口。
参数：
`url`String : 图片地址或者base64信息。
`param`Object：一些特殊场景定制参数，正常情况下无需关注。
示例如下：

``` java
@Override
public HippyDrawableTarget getImage(String url, Object param)
{
    LocalHippyDrawable resultHippyDrawable = new LocalHippyDrawable();
    // if use drawable res please set Context
    // resultHippyDrawable.setContext(mContext);
    resultHippyDrawable.setUrl(url);
    return resultHippyDrawable;
}

public class LocalHippyDrawable implements HippyDrawableTarget
{
    String  mUrl;
    Context mContext;

    public void setUrl(String url)
    {
        mUrl = url;
    }

    public void setContext(Context context)
    {
        mContext = context;
    }

    @Override
    public Bitmap getBitmap()
    {
        if (TextUtils.isEmpty(mUrl))
        {
            return null;
        }
        try
        {
            if (mUrl.startsWith("data:"))
            {
                // base64 image
                int base64Index = mUrl.indexOf(";base64,");
                if (base64Index >= 0)
                {
                    base64Index += ";base64,".length();
                    String base64String = mUrl.substring(base64Index);
                    byte[] decode = Base64.decode(base64String, Base64.DEFAULT);
                    return BitmapFactory.decodeByteArray(decode, 0, decode.length);
                }
            }
            else if (mUrl.startsWith("file://"))
            {
                // local file image
                return BitmapFactory.decodeFile(mUrl.substring("file://".length()));
            }
            else
            {
                // local resource image
                if (mContext != null)
                {
                    int id = mContext.getResources().getIdentifier(mUrl, "drawable", mContext.getPackageName());
                    InputStream is = mContext.getResources().openRawResource(id);
                    return BitmapFactory.decodeStream(is);
                }
            }
        }
        catch (Throwable throwable)
        {
            return null;
        }
        return null;
    }

    @Override
    public String getSource()
    {
        return mUrl;
    }

    @Override
    public Object getExtraData()
    {
        return null;
    }

    @Override
    public void onDrawableAttached()
    {

    }

    @Override
    public void onDrawableDetached()
    {

    }
}
```

# HippyHttpAdapter

Hippy SDK`提供默认的实现`，`DefaultHttpAdapter`。如果`DefaultHttpAdapter`无法满足你的需求，请参考`DefaultHttpAdapter`代码接入HippyHttpAdapter实现。

# HippyExceptionHandlerAdapter

Hippy SDK`提供默认空实现`，`DefaultExceptionHandler`。当你的业务基于Hippy上线后，必然会出现一些JS异常，监控这些异常对于线上质量具有很重要的意义。Hippy SDK会抓取这些JS异常，然后通过HippyExceptionHandlerAdapter抛给使用者。

## handleJsException

处理抓取到的JS异常。JS异常不会导致引擎不可运行，但可能导致用户感知或者业务逻辑出现问题，是线上质量的最重要衡量标准。

# HippySharedPreferencesAdapter

Hippy SDK`提供默认的实现`，`DefaultSharedPreferencesAdapter`。大多数场景也不需要进行扩展。

# HippyStorageAdapter

Hippy SDK`提供默认的实现`，`DefaultStorageAdapter`。

# HippyExecutorSupplierAdapter

Hippy SDK`提供默认的实现`，`DefaultExecutorSupplierAdapter`。

# HippyEngineMonitorAdapter

Hippy SDK`提供默认空实现`，`DefaultEngineMonitorAdapter`。当你需要查看引擎加载速度和模块加载速度时，可以通过此Adapter获取到相关信息。

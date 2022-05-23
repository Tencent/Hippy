# Custom Adapters

There are many third-party base libraries in Android App development.

For example, in image caching system: Picasso, Glide, Fresco, etc.

If these third-party base libraries are integrated directly in the Hippy SDK, it is likely to conflict with the actual situation of your project. In order to solve this contradiction, Hippy SDK will interface all the basic capabilities, abstracted as Adapter, to facilitate the implementation of business injection. Meanwhile, for most of the basic capabilities, we also implement a default yet simplest solution.

Hippy SDK now provides these Adapters:

- `HippyImageLoaderAdapter`: image loading Adapter.
- `HippyHttpAdapter`: Http request Adapter.
- `HippyExceptionHandlerAdapter`: engine and JS exception handling Adapter.
- `HippySharedPreferencesAdapter`: SharedPreferences Adapter.
- `HippyStorageAdapter`: database (KEY-VALUE) Adapter.
- `HippyExecutorSupplierAdapter`: thread pool Adapter.
- `HippyEngineMonitorAdapter`: Hippy engine state monitor Adapter.

# HippyImageLoaderAdapter

Due to the high complexity of image loading, the implementation will increase the size of the SDK package. As each App has its own image loading mechanism, **SDK does not provide a default implementation**.

## HippyImageRequestListener

Image loading callback interface. Mainly includes the following methods.

- `onRequestStart`: image loading start.
- `onRequestSuccess`: image loading success.
- `onRequestFail`: image loading failed.

## HippyDrawableTarget

Image wrapper interface. Mainly includes the following methods.

- `getBitmap`: The SDK will get the Bitmap after the image is pulled by this method.
- `onDrawableAttached`: The SDK will call back this method after the image is rendered on the screen.
- `onDrawableDetached`: SDK will call back this method after the image is off-screen.

## fetchImage

Asynchronous pull image interface. url will be called if it starts with `Http`, `Https`, `File`.

Parameters.

- `url` String : The image address.
- `requestListener` HippyImageRequestListener : Image asynchronous pull callback.
- `param` Object : Some special scenario custom parameters, no need to pay attention to under normal circumstances.

Examples are as follows.

``` java
public class ImageLoaderAdapter implements HippyImageLoaderAdapter
{

    @Override
    public void fetchImage(String url, final HippyImageRequestListener requestListener, Object param)
    {
        // Here the Glide library is used to pull images
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
    Bitmap mBitmap;

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
        // notify Hippy SDK image pulling success
        mListener.onRequestSuccess(this);
    }

    @Override
    public void onLoadFailed(Exception e, Drawable errorDrawable)
    {
        // Notify Hippy SDK that the image pull failed
        mListener.onRequestFail(e, null);
    }
}
```

## getImage

Synchronous pulling interface. This interface will be called mainly for `assets`, `base64` and other image pulling scenarios.

Parameters.

- `url` string : the image address or base64 information.
- `param` Object : Some special scenario custom parameters, no need to pay attention under normal circumstances.

Examples are as follows.

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
    String mUrl;
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

Hippy SDK provides a default implementation of `DefaultHttpAdapter`. If `DefaultHttpAdapter` does not meet your needs, please refer to the `DefaultHttpAdapter` code to access the `HippyHttpAdapter` implementation.

# HippyExceptionHandlerAdapter

Hippy SDK provides a default empty implementation of `DefaultExceptionHandler`. Hippy SDK will catch these JS exceptions and then throw them to the user through `HippyExceptionHandlerAdapter`.

## handleJsException

JS exceptions do not cause the engine to be inoperable, but may cause problems with user perception or business logic, and are the most important measure of online quality.

# HippySharedPreferencesAdapter

Hippy SDK provides a default implementation of `DefaultSharedPreferencesAdapter`. Most scenarios also do not need to be extended.

# HippyStorageAdapter

Hippy SDK provides a default implementation of `DefaultStorageAdapter`.

# HippyExecutorSupplierAdapter

Hippy SDK provides a default implementation of `DefaultExecutorSupplierAdapter`.

# HippyEngineMonitorAdapter

Hippy SDK provides a default empty implementation of `DefaultEngineMonitorAdapter`. When you need to see the engine loading speed and module loading speed, you can get the relevant information through this Adapter.


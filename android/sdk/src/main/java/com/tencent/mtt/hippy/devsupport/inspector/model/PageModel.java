package com.tencent.mtt.hippy.devsupport.inspector.model;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.os.Build;
import android.text.TextUtils;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.view.ViewTreeObserver;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.ref.WeakReference;

import org.json.JSONObject;

public class PageModel {

  private static final String TAG = "PageModel";

  private volatile boolean isFramingScreenCast;
  private long lastSessionId;

  private JSONObject paramObj;
  private String format;
  private int quality;
  private int maxWidth;
  private int maxHeight;
  private Bitmap screenBitmap;
  private WeakReference<FrameUpdateListener> mFrameUpdateListenerRef;
  private ViewTreeObserver.OnDrawListener mOnDrawListener;

  public JSONObject startScreenCast(HippyEngineContext context, final JSONObject paramsObj) {
    isFramingScreenCast = true;
    this.paramObj = paramsObj;
    if (paramsObj != null) {
      format = paramsObj.optString("format");
      quality = paramsObj.optInt("quality");
      maxWidth = paramsObj.optInt("maxWidth");
      maxHeight = paramsObj.optInt("maxHeight");
    }

    // 开始截屏时，监听重绘变化
    listenFrameUpdate(context);
    return getScreenCastData(context);
  }

  public boolean canListenFrameUpdate() {
    return Build.VERSION.SDK_INT >= 16;
  }

  private void listenFrameUpdate(final HippyEngineContext context) {
    if (canListenFrameUpdate()) {
      HippyRootView hippyRootView = getHippyRootView(context);
      if (mOnDrawListener == null) {
        mOnDrawListener = new ViewTreeObserver.OnDrawListener() {
          @Override
          public void onDraw() {
            LogUtils.d(TAG, "HippyRootView, onDraw");
            if (mFrameUpdateListenerRef != null) {
              FrameUpdateListener listener = mFrameUpdateListenerRef.get();
              if (listener != null) {
                listener.onFrameUpdate(context);
              }
            }
          }
        };
      }
      hippyRootView.getViewTreeObserver().removeOnDrawListener(mOnDrawListener);
      hippyRootView.getViewTreeObserver().addOnDrawListener(mOnDrawListener);
    }
  }

  public void setFrameUpdateListener(FrameUpdateListener listener) {
    if (listener != null) {
      mFrameUpdateListenerRef = new WeakReference<>(listener);
    } else {
      mFrameUpdateListenerRef = null;
    }
  }

  public void stopScreenCast(HippyEngineContext context) {
    isFramingScreenCast = false;

    if (canListenFrameUpdate()) {
      HippyRootView hippyRootView = getHippyRootView(context);
      hippyRootView.getViewTreeObserver().removeOnDrawListener(mOnDrawListener);
    }
  }

  public void clear() {
    if (screenBitmap != null && !screenBitmap.isRecycled()) {
      screenBitmap.recycle();
      screenBitmap = null;
    }
  }

  public JSONObject screenFrameAck(HippyEngineContext context, int sessionId) {
    if (isFramingScreenCast && sessionId == lastSessionId) {
      return getScreenCastData(context);
    }
    LogUtils.w(TAG, "screenFrameAck, isFramingScreenCast=" + isFramingScreenCast);
    return null;
  }

  private HippyRootView getHippyRootView(HippyEngineContext context) {
    DomManager domManager = context.getDomManager();
    int rootNodeId = domManager.getRootNodeId();
    HippyRootView hippyRootView = context.getInstance(rootNodeId);
    return hippyRootView;
  }

  private JSONObject getScreenCastData(HippyEngineContext context) {
    JSONObject result = new JSONObject();
    try {
      HippyRootView hippyRootView = getHippyRootView(context);
      int viewWidth = hippyRootView.getWidth();
      int viewHeight = hippyRootView.getHeight();
      float scale = 1.0f;
      if (paramObj != null) {
        float scaleX = (float) this.maxWidth / (float) viewWidth;
        float scaleY = (float) this.maxHeight / (float) viewHeight;
        scale = Math.min(scaleX, scaleY);
      }
      Bitmap bitmap = screenBitmap;
      if (bitmap == null) {
        bitmap = Bitmap.createBitmap(viewWidth, viewHeight, Bitmap.Config.ARGB_8888);
        screenBitmap = bitmap;
      }
      Canvas canvas = new Canvas(bitmap);
      hippyRootView.draw(canvas);
      if (scale != 1.0f) {
        Matrix matrix = new Matrix();
        matrix.postScale(scale, scale);
        Bitmap scaledBitmap = Bitmap
          .createBitmap(bitmap, 0, 0, viewWidth, viewHeight, matrix, true);
        bitmap = scaledBitmap;
      }
      String bitmapBase64Str = bitmapToBase64Str(bitmap);
      DisplayMetrics windowDisplayMetrics = hippyRootView.getContext().getResources()
        .getDisplayMetrics();
      final int sessionId = (int) (System.currentTimeMillis() / 1000);
      JSONObject meta = new JSONObject();
      meta.put("offsetTop", 0);
      meta.put("pageScaleFactor", 1);
      meta.put("deviceWidth", windowDisplayMetrics.widthPixels);
      meta.put("deviceHeight", windowDisplayMetrics.heightPixels);
      meta.put("scrollOffsetX", 0);
      meta.put("scrollOffsetY", 0);
      meta.put("timestamp", sessionId);
      result.put("data", TextUtils.isEmpty(bitmapBase64Str) ? "" : bitmapBase64Str);
      result.put("metadata", meta);
      result.put("sessionId", sessionId);
      lastSessionId = sessionId;
    } catch (Exception e) {
      LogUtils.e(TAG, "getScreenCastData, exception=", e);
      return null;
    }
    return result;
  }

  private String bitmapToBase64Str(Bitmap bitmap) {
    String result = null;
    ByteArrayOutputStream baos = null;
    try {
      if (bitmap != null) {
        baos = new ByteArrayOutputStream();
        Bitmap.CompressFormat format = Bitmap.CompressFormat.JPEG;
        int quality = 80;
        // 工具如果没传参数，使用默认值
        if (paramObj != null) {
          if (!TextUtils.isEmpty(this.format)) {
            if ("jpeg".equalsIgnoreCase(this.format)) {
              format = Bitmap.CompressFormat.JPEG;
            } else if ("png".equalsIgnoreCase(this.format)) {
              format = Bitmap.CompressFormat.PNG;
            }
          }
          quality = this.quality;
        }
        bitmap.compress(format, quality, baos);
        baos.flush();
        baos.close();
        byte[] bitmapBytes = baos.toByteArray();
        result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT);
      }
    } catch (IOException e) {
      LogUtils.e(TAG, "screenFrameAck, exception1=", e);
    } finally {
      try {
        if (baos != null) {
          baos.flush();
          baos.close();
        }
      } catch (IOException e) {
        LogUtils.e(TAG, "screenFrameAck, exception2=", e);
      }
    }
    return result;
  }

  public interface FrameUpdateListener {
    void onFrameUpdate(HippyEngineContext context);
  }
}

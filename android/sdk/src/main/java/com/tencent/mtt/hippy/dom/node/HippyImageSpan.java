/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.dom.node;

import static com.tencent.mtt.hippy.views.image.HippyImageView.ImageEvent.ONERROR;
import static com.tencent.mtt.hippy.views.image.HippyImageView.ImageEvent.ONLOAD;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.Paint.FontMetricsInt;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.SystemClock;
import android.text.TextUtils;
import android.text.style.DynamicDrawableSpan;
import android.text.style.ImageSpan;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;
import com.tencent.mtt.hippy.views.image.HippyImageView.ImageEvent;
import java.lang.ref.WeakReference;
import java.lang.reflect.Field;

@SuppressWarnings("deprecation")
public class HippyImageSpan extends ImageSpan {

  public final static int STATE_UNLOAD = 0;
  public final static int STATE_LOADING = 1;
  public final static int STATE_LOADED = 2;

  /*package*/ final static String V_ALIGN_TOP = "top";
  /*package*/ final static String V_ALIGN_MIDDLE = "middle";
  /*package*/ final static String V_ALIGN_BASELINE = "baseline";
  /*package*/ final static String V_ALIGN_BOTTOM = "bottom";

  private final boolean mUseLegacy;
  private final String mVerticalAlign;
  @Deprecated
  private int mLeft;
  @Deprecated
  private int mTop;
  private int mWidth;
  private int mHeight;
  private int mMeasuredWidth;
  private int mMeasuredHeight;
  private String mUrl;
  private final WeakReference<ImageNode> mImageNodeWeakRefrence;
  private int mImageLoadState = STATE_UNLOAD;
  private final HippyImageLoader mImageAdapter;
  private final HippyEngineContext engineContext;
  private Drawable mSrcDrawable = null;
  private Movie mGifMovie = null;
  private long mGifProgress = 0;
  private long mGifLastPlayTime = -1;
  private float mHeightRate = 0;
  @Deprecated
  private LegacyIAlignConfig alignConfig;

  public HippyImageSpan(Drawable d, String source, ImageNode node,
      HippyImageLoader imageAdapter, HippyEngineContext context) {
    super(d, source, node.getVerticalAlignment());
    engineContext = context;
    mImageNodeWeakRefrence = new WeakReference<>(node);
    mImageAdapter = imageAdapter;
    mVerticalAlign = node.getVerticalAlign();
    mUseLegacy = TextUtils.isEmpty(mVerticalAlign);
    mWidth = Math.round(node.getStyleWidth());
    mHeight = Math.round(node.getStyleHeight());
    setUrl(source);
    if (mUseLegacy) {
        alignConfig = LegacyIAlignConfig.fromVerticalAlignment(node.getVerticalAlignment());
    }
  }

  @Deprecated
  public void setDesiredSize(int width, int height) {
      if (mUseLegacy) {
          alignConfig.setDesiredSize(width, height);
      }
  }

  public void setActiveSizeWithRate(float heightRate) {
      mHeightRate = heightRate;
      if (mUseLegacy) {
          alignConfig.setActiveSizeWithRate(heightRate);
      }
  }

  @Deprecated
  public void setMargin(int marginLeft, int marginRight) {
      if (mUseLegacy) {
          alignConfig.setMargin(marginLeft, marginRight);
      }
  }

  private void updateBoundsAttribute() {
    if (mImageNodeWeakRefrence != null) {
      ImageNode node = mImageNodeWeakRefrence.get();
      if (node != null) {
        int width = Math.round(node.getStyleWidth());
        int height = Math.round(node.getStyleHeight());
        float y = node.getPosition(FlexSpacing.TOP);
        float x = node.getPosition(FlexSpacing.LEFT);
        int left = (Float.isNaN(x)) ? 0 : Math.round(x);
        int top = (Float.isNaN(y)) ? 0 : Math.round(y);

        mLeft = left;
        mTop = top;
        mWidth = width;
        mHeight = height;
      }
    }
  }

  protected boolean shouldUseFetchImageMode(String url) {
    return UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url);
  }

  private void loadImageWithUrl(String url) {
    if (!TextUtils.isEmpty(mUrl) && mUrl.equals(url) && mImageLoadState != STATE_UNLOAD) {
      return;
    }

    mUrl = url;
    mImageLoadState = STATE_UNLOAD;

    if (mUseLegacy) {
        updateBoundsAttribute();
    }

    if (mImageAdapter != null) {
      if (shouldUseFetchImageMode(mUrl)) {
        final HippyMap props = new HippyMap();
        props.pushBoolean(NodeProps.CUSTOM_PROP_ISGIF, false);
        props.pushInt(NodeProps.WIDTH, mWidth);
        props.pushInt(NodeProps.HEIGHT, mHeight);

        doFetchImage(mUrl, props, mImageAdapter);
      } else {
        HippyDrawable hippyDrawable = mImageAdapter.getImage(mUrl, null);
        shouldReplaceDrawable(hippyDrawable);
      }
    }
  }

  public void setUrl(final String url) {
    if (TextUtils.isEmpty(url)) {
      return;
    }

    if (UIThreadUtils.isOnUiThread()) {
      loadImageWithUrl(url);
    } else {
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          loadImageWithUrl(url);
        }
      });
    }
  }

  private void updateGifTime() {
    if (mGifMovie == null) {
      return;
    }

    int duration = mGifMovie.duration();
    if (duration == 0) {
      duration = 1000;
    }

    long now = SystemClock.elapsedRealtime();

    if (mGifLastPlayTime != -1) {
      mGifProgress += (now - mGifLastPlayTime);

      if (mGifProgress > duration) {
        mGifProgress = 0;
      }
    }
    mGifLastPlayTime = now;

    int progress = mGifProgress > Integer.MAX_VALUE ? 0 : (int) mGifProgress;
    mGifMovie.setTime(progress);
  }

  private void legacyDrawGIF(Canvas canvas, float left, float top, int width, int height) {
    if (mGifMovie == null) {
      return;
    }
    updateGifTime();

    float mGifScaleX = width / (float) mGifMovie.width();
    float mGifScaleY = height / (float) mGifMovie.height();
    float x = (mGifScaleX != 0) ? left / mGifScaleX : left;
    float y = (mGifScaleY != 0) ? top / mGifScaleY : top;
    canvas.save();
    canvas.scale(mGifScaleX, mGifScaleY);
    mGifMovie.draw(canvas, x, y);
    canvas.restore();
    postInvalidateDelayed(40);
  }

  @Override
  public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
    @Nullable FontMetricsInt fm) {
      if (mUseLegacy) {
          return legacyGetSize(paint, text, start, end, fm);
      }
      if (mHeightRate > 0) {
          if (mHeight == 0) {
              mMeasuredWidth = mMeasuredHeight = 0;
          } else {
              int textSize = (int) paint.getTextSize();
              mMeasuredHeight = (int) (textSize * mHeightRate);
              mMeasuredWidth = mWidth * mMeasuredHeight / mHeight;
          }
      } else {
          mMeasuredWidth = mWidth;
          mMeasuredHeight = mHeight;
      }
      // TODO pel deal margin
      if (fm != null) {
          fm.ascent = -mMeasuredHeight;
          fm.descent = 0;

          fm.top = fm.ascent;
          fm.bottom = 0;
      }

      return mMeasuredWidth;
  }

  private int legacyGetSize(@NonNull Paint paint, CharSequence text, int start, int end,
    @Nullable FontMetricsInt fm) {
    if (mGifMovie!=null) {
      return super.getSize(paint, text, start, end, fm);
    } else {
      Drawable drawable = getDrawable();
      return alignConfig.getSize(paint,
        text, start, end,
        fm, drawable);
    }
  }

  @Override
  public void draw(Canvas canvas, CharSequence text,
      int start, int end, float x,
      int top, int y, int bottom, Paint paint) {
      if (mUseLegacy) {
          legacyDraw(canvas, text, start, end, x, top, y, bottom, paint);
          return;
      }
      if (mMeasuredWidth == 0 || mMeasuredHeight == 0) {
          return;
      }
      canvas.save();
      int transY;
      switch (mVerticalAlign) {
          case V_ALIGN_TOP:
              transY = top;
              break;
          case V_ALIGN_MIDDLE:
              transY = top + (bottom - top) / 2 - mMeasuredHeight / 2;
              break;
          case V_ALIGN_BOTTOM:
              transY = bottom - mMeasuredHeight;
              break;
          case V_ALIGN_BASELINE:
          default:
              transY = y - mMeasuredHeight;
              break;
      }

      canvas.translate(x, transY);
      if (mGifMovie != null) {
          updateGifTime();
          float scaleX = mMeasuredWidth / (float) mGifMovie.width();
          float scaleY = mMeasuredHeight / (float) mGifMovie.height();
          canvas.scale(scaleX, scaleY, 0, 0);
          mGifMovie.draw(canvas, 0, 0);
          postInvalidateDelayed(40);
      } else {
          Drawable drawable = mSrcDrawable == null ? super.getDrawable() : mSrcDrawable;
          Rect rect = drawable.getBounds();
          float scaleX = mMeasuredWidth / (float) rect.right;
          float scaleY = mMeasuredHeight / (float) rect.bottom;
          canvas.scale(scaleX, scaleY, 0, 0);
          drawable.draw(canvas);
      }
      canvas.restore();
  }

  private void legacyDraw(Canvas canvas, CharSequence text,
      int start, int end, float x,
      int top, int y, int bottom, Paint paint) {
    int transY;
    Paint.FontMetricsInt fm = paint.getFontMetricsInt();
    if (mGifMovie != null) {
      int width = (mWidth == 0) ? mGifMovie.width() : mWidth;
      int height = (mHeight == 0) ? mGifMovie.height() : mHeight;

      transY = (y + fm.descent + y + fm.ascent) / 2 - height / 2;
      legacyDrawGIF(canvas, x + mLeft, transY + mTop, width, height);
    } else {
      Drawable drawable = getDrawable();
      alignConfig.draw(canvas,
        text, start, end,
        x, top, y, bottom,
        paint,
        drawable);
    }
  }

  private void postInvalidateDelayed(long delayMilliseconds) {
    if (mImageNodeWeakRefrence != null) {
      ImageNode node = mImageNodeWeakRefrence.get();
      if (node != null) {
        DomNode parent = node.getParent();
        if (parent instanceof TextNode) {
          ((TextNode) parent).postInvalidateDelayed(delayMilliseconds);
        }
      }
    }
  }

  private void shouldReplaceDrawable(HippyDrawable hippyDrawable) {
      if (mUseLegacy) {
          legacyShouldReplaceDrawable(hippyDrawable);
          return;
      }
      mSrcDrawable = null;
      mGifMovie = null;
      if (hippyDrawable != null) {
          Bitmap bitmap = hippyDrawable.getBitmap();
          if (bitmap != null) {
              BitmapDrawable drawable = new BitmapDrawable(bitmap);
              drawable.setBounds(0, 0, mWidth, mHeight);
              mSrcDrawable = drawable;
              mImageLoadState = STATE_LOADED;
          } else if (hippyDrawable.isAnimated()) {
              mGifMovie = hippyDrawable.getGIF();
              mImageLoadState = STATE_LOADED;
          } else {
              mImageLoadState = STATE_UNLOAD;
          }
          postInvalidateDelayed(0);
      } else {
          mImageLoadState = STATE_UNLOAD;
      }
  }

  private void legacyShouldReplaceDrawable(HippyDrawable hippyDrawable) {
    if (hippyDrawable != null) {
      Bitmap bitmap = hippyDrawable.getBitmap();
      if (bitmap != null) {
        BitmapDrawable drawable = new BitmapDrawable(bitmap);

        int w = (mWidth == 0) ? drawable.getIntrinsicWidth() : mWidth;
        int h = (mHeight == 0) ? drawable.getIntrinsicHeight() : mHeight;
        drawable.setBounds(0, 0, w, h);
        try {
          Field mDrawableField;
          Field mDrawableRefField;
          //noinspection JavaReflectionMemberAccess
          mDrawableField = ImageSpan.class.getDeclaredField("mDrawable");
          mDrawableField.setAccessible(true);
          mDrawableField.set(HippyImageSpan.this, drawable);

          //noinspection JavaReflectionMemberAccess
          mDrawableRefField = DynamicDrawableSpan.class.getDeclaredField("mDrawableRef");
          mDrawableRefField.setAccessible(true);
          mDrawableRefField.set(HippyImageSpan.this, null);
        } catch (IllegalAccessException | NoSuchFieldException e) {
          e.printStackTrace();
        }

        mImageLoadState = STATE_LOADED;
      } else if (hippyDrawable.isAnimated()) {
        mGifMovie = hippyDrawable.getGIF();
        mImageLoadState = STATE_LOADED;
      } else {
        mImageLoadState = STATE_UNLOAD;
      }
      postInvalidateDelayed(0);
    } else {
      mImageLoadState = STATE_UNLOAD;
    }
  }

  private void sendImageLoadEvent(ImageEvent eventType) {
    if (mImageNodeWeakRefrence == null) {
      return;
    }

    ImageNode node = mImageNodeWeakRefrence.get();
    if (node == null) {
      return;
    }

    String eventName = null;
    if (eventType == ONLOAD) {
      eventName = "onLoad";
    } else if (eventType == ONERROR) {
      eventName = "onError";
    }

    if (!TextUtils.isEmpty(eventName) && node.isEnableImageEvent(eventType)) {
      HippyViewEvent event = new HippyViewEvent(eventName);
      event.send(node.getId(), engineContext, null);
    }
  }

  private void doFetchImage(String url, HippyMap props, HippyImageLoader imageAdapter) {
    mImageLoadState = STATE_LOADING;

    imageAdapter.fetchImage(url, new HippyImageLoader.Callback() {
      @Override
      public void onRequestStart(HippyDrawable hippyDrawable) {
      }

      @Override
      public void onRequestSuccess(HippyDrawable hippyDrawable) {
        shouldReplaceDrawable(hippyDrawable);
        sendImageLoadEvent(ONLOAD);
      }

      @Override
      public void onRequestFail(Throwable throwable, String source) {
        mImageLoadState = STATE_UNLOAD;
        sendImageLoadEvent(ONERROR);
      }
    }, props);
  }

}

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

  public static final int ALIGN_BOTTOM = 0;
  public static final int ALIGN_BASELINE = 1;
  public static final int ALIGN_CENTER = 2;
  public static final int ALIGN_TOP = 3;

  public final static int STATE_UNLOAD = 0;
  public final static int STATE_LOADING = 1;
  public final static int STATE_LOADED = 2;

  private int mLeft;
  private int mTop;
  private int mWidth;
  private int mHeight;
  private String mUrl;
  private final WeakReference<ImageNode> mImageNodeWeakRefrence;
  private int mImageLoadState = STATE_UNLOAD;
  private int mVerticalAlignment;
  private final HippyImageLoader mImageAdapter;
  private final HippyEngineContext engineContext;
  private Movie mGifMovie = null;
  private int mGifProgress = 0;
  private long mGifLastPlayTime = -1;

  private IAlignConfig alignConfig;

  public HippyImageSpan(Drawable d, String source, ImageNode node,
      HippyImageLoader imageAdapter, HippyEngineContext context) {
    super(d, source, node.getVerticalAlignment());
    engineContext = context;
    mImageNodeWeakRefrence = new WeakReference<>(node);
    mImageAdapter = imageAdapter;
    setUrl(source);
    initAlignConfig(node.getVerticalAlignment());
  }

  private void initAlignConfig(int verticalAlignment) {
    switch (verticalAlignment) {
      case ALIGN_BASELINE:
        alignConfig = new AlignBaselineConfig();
        break;
      case ALIGN_CENTER:
        alignConfig = new AlignCenterConfig();
        break;
      case ALIGN_TOP:
        alignConfig = new AlignTopConfig();
        break;
      case ALIGN_BOTTOM:
      default:
        alignConfig = new AlignBottomConfig();
        break;
    }
  }

  public void setDesiredSize(int width, int height) {
    alignConfig.setDesiredSize(width, height);
  }

  public void setActiveSizeWithRate(float heightRate) {
    alignConfig.setActiveSizeWithRate(heightRate);
  }

  public void setMargin(int marginLeft, int marginRight) {
    alignConfig.setMargin(marginLeft, marginRight);
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
        mVerticalAlignment = node.getVerticalAlignment();
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

    updateBoundsAttribute();

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

  private void drawGIF(Canvas canvas, float left, float top, int width, int height) {
    if (mGifMovie == null) {
      return;
    }

    int duration = mGifMovie.duration();
    if (duration == 0) {
      duration = 1000;
    }

    long now = System.currentTimeMillis();

    if (mGifLastPlayTime != -1) {
      mGifProgress += now - mGifLastPlayTime;

      if (mGifProgress > duration) {
        mGifProgress = 0;
      }
    }
    mGifLastPlayTime = now;

    float mGifScaleX = width / (float) mGifMovie.width();
    float mGifScaleY = height / (float) mGifMovie.height();
    float x = (mGifScaleX != 0) ? left / mGifScaleX : left;
    float y = (mGifScaleY != 0) ? top / mGifScaleY : top;

    mGifMovie.setTime(mGifProgress);
    canvas.save();
    canvas.scale(mGifScaleX, mGifScaleY);
    mGifMovie.draw(canvas, x, y);
    canvas.restore();
    postInvalidateDelayed(40);
  }

  @Override
  public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
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
    int transY;
    Paint.FontMetricsInt fm = paint.getFontMetricsInt();
    if (mGifMovie != null) {
      int width = (mWidth == 0) ? mGifMovie.width() : mWidth;
      int height = (mHeight == 0) ? mGifMovie.height() : mHeight;

      transY = (y + fm.descent + y + fm.ascent) / 2 - height / 2;
      drawGIF(canvas, x + mLeft, transY + mTop, width, height);
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

  private interface IAlignConfig {

    void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight);

    void setActiveSizeWithRate(float heightRate);

    void setMargin(int marginLeft, int marginRight);

    int getSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      Drawable drawable);

    void draw(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lintBottom,
      @NonNull Paint paint,
      Drawable drawable);
  }

  private abstract static class BaseAlignConfig implements IAlignConfig {

    private int desiredDrawableWidth;
    private int desiredDrawableHeight;

    private float heightRate;

    private final int[] size = new int[2];

    private int marginLeft;
    private int marginRight;

    @Override
    public void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight) {
      this.desiredDrawableWidth = desiredDrawableWidth;
      this.desiredDrawableHeight = desiredDrawableHeight;

      heightRate = 0;
    }

    @Override
    public void setActiveSizeWithRate(float heightRate) {
      this.heightRate = heightRate;

      desiredDrawableWidth = 0;
      desiredDrawableHeight = 0;
    }

    @Override
    public void setMargin(int marginLeft, int marginRight) {
      this.marginLeft = marginLeft;
      this.marginRight = marginRight;
    }

    private void calDrawableSize(Rect drawableBounds, Paint paint) {
      int dWidth;
      int dHeight;
      if (heightRate > 0) {
        int textSize = (int) paint.getTextSize();
        dHeight = (int) (textSize * heightRate);
        dWidth = drawableBounds.right * dHeight / drawableBounds.bottom;
      } else {
        dHeight = desiredDrawableHeight;
        dWidth = desiredDrawableWidth;
      }

      if (dWidth <= 0 || dHeight <= 0) {
        dWidth = drawableBounds.right;
        dHeight = drawableBounds.bottom;
      }

      size[0] = dWidth;
      size[1] = dHeight;
    }

    @Override
    public int getSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      Drawable drawable) {

      calDrawableSize(drawable.getBounds(), paint);
      int dWidth = size[0];
      int dHeight = size[1];

      int deltaTop = 0;
      int deltaBottom = 0;
      if (fm != null) {
        deltaTop = fm.top - fm.ascent;
        deltaBottom = fm.bottom - fm.descent;
      }

      int size = getCustomSize(paint,
        text, start, end,
        fm, dWidth, dHeight);
      if (fm != null) {
        fm.top = fm.ascent + deltaTop;
        fm.bottom = fm.descent + deltaBottom;
      }
      return marginLeft + size + marginRight;
    }

    @Override
    public void draw(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lineBottom,
      @NonNull Paint paint,
      Drawable drawable) {
      Rect drawableBounds = drawable.getBounds();

      int dWidth = size[0];
      int dHeight = size[1];

      FontMetricsInt fontMetricsInt = paint.getFontMetricsInt();

      int transY = getTransY(canvas,
        text, start, end,
        baseLineX, lineTop, baselineY, lineBottom,
        paint, fontMetricsInt,
        dWidth, dHeight);
      transY = adjustTransY(transY, lineTop, lineBottom, dHeight);

      float scaleX = (float) dWidth / drawableBounds.right;
      float scaleY = (float) dHeight / drawableBounds.bottom;

      canvas.save();
      canvas.translate(baseLineX + marginLeft, transY);
      canvas.scale(scaleX, scaleY);
      drawable.draw(canvas);
      canvas.restore();
    }

    private static int adjustTransY(
      int transY,
      int lineTop,
      int lineBottom,
      int drawableHeight
    ) {
      if (drawableHeight + transY > lineBottom) {
        transY = lineBottom - drawableHeight;
      }
      if (transY < lineTop) {
        transY = lineTop;
      }
      return transY;
    }

    abstract int getCustomSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      int drawableWidth, int drawableHeight);

    abstract int getTransY(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lineBottom,
      @NonNull Paint paint, FontMetricsInt fontMetricsInt,
      int drawableWidth, int drawableHeight);
  }

  private static class AlignBaselineConfig extends BaseAlignConfig {

    @Override
    public int getCustomSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      int drawableWidth, int drawableHeight) {
      if (fm != null) {
        fm.ascent = -drawableHeight;
      }
      return drawableWidth;
    }

    @Override
    public int getTransY(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lineBottom,
      @NonNull Paint paint, FontMetricsInt fontMetricsInt,
      int drawableWidth, int drawableHeight) {
      return baselineY - drawableHeight;
    }
  }

  private static class AlignBottomConfig extends AlignBaselineConfig {

    @Override
    public int getCustomSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      int drawableWidth, int drawableHeight) {
      if (fm != null) {
        fm.ascent = fm.descent - drawableHeight;
      }
      return drawableWidth;
    }

    @Override
    public int getTransY(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lineBottom,
      @NonNull Paint paint, FontMetricsInt fontMetricsInt,
      int drawableWidth, int drawableHeight) {
      return super.getTransY(canvas,
        text, start, end,
        baseLineX, lineTop, baselineY, lineBottom,
        paint, fontMetricsInt,
        drawableWidth, drawableHeight) + fontMetricsInt.descent;
    }
  }

  private static class AlignCenterConfig extends AlignBottomConfig {

    @Override
    public int getCustomSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      int drawableWidth, int drawableHeight) {
      if (fm != null) {
        int textAreaHeight = fm.descent - fm.ascent;
        if (textAreaHeight < drawableHeight) {
          int oldSumOfAscentAndDescent = fm.ascent + fm.descent;
          fm.ascent = oldSumOfAscentAndDescent - drawableHeight >> 1;
          fm.descent = oldSumOfAscentAndDescent + drawableHeight >> 1;
        }

      }
      return drawableWidth;
    }

    @Override
    public int getTransY(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lineBottom,
      @NonNull Paint paint, FontMetricsInt fontMetricsInt,
      int drawableWidth, int drawableHeight) {
      int transY = super.getTransY(canvas,
        text, start, end,
        baseLineX, lineTop, baselineY, lineBottom,
        paint, fontMetricsInt,
        drawableWidth, drawableHeight);

      int fontHeight = fontMetricsInt.descent - fontMetricsInt.ascent;
      transY = transY - (fontHeight >> 1) + (drawableHeight >> 1);

      return transY;
    }
  }

  private static class AlignTopConfig extends BaseAlignConfig {

    @Override
    public int getCustomSize(@NonNull Paint paint,
      CharSequence text, int start, int end,
      @Nullable FontMetricsInt fm,
      int drawableWidth, int drawableHeight) {
      if (fm != null) {
        fm.descent = drawableHeight + fm.ascent;
      }
      return drawableWidth;
    }

    @Override
    public int getTransY(@NonNull Canvas canvas,
      CharSequence text, int start, int end,
      float baseLineX, int lineTop, int baselineY, int lintBottom,
      @NonNull Paint paint, FontMetricsInt fontMetricsInt,
      int drawableWidth, int drawableHeight) {
      return baselineY + fontMetricsInt.ascent;
    }
  }
}

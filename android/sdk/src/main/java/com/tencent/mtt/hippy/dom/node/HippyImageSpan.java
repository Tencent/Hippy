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

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.text.TextUtils;
import android.text.style.DynamicDrawableSpan;
import android.text.style.ImageSpan;
import android.view.View;

import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;

import java.lang.ref.WeakReference;
import java.lang.reflect.Field;

public class HippyImageSpan extends ImageSpan
{
  public final static int STATE_UNLOAD = 0;
  public final static int STATE_LOADING = 1;
  public final static int STATE_LOADED = 2;
  
  private int mLeft;
  private int mTop;
  private int mWidth;
  private int mHeight;
  private String mUrl;
  private WeakReference<ImageNode> mImageNodeWeakRefrence;
  private int mImageLoadState = 0;
  private int mVerticalAlignment;
  private HippyImageLoader mImageAdapter;
  
  private Movie mGifMovie = null;
  private int mRepeatCount = -1;
  private int mShowCount = 0;
  private int mGifStartX = 0;
  private int mGifStartY = 0;
  private float mGifScaleX = 1;
  private float mGifScaleY = 1;
  private boolean mGifMatrixComputed = false;
  private int		mGifProgress				= 0;
  private long	mGifLastPlayTime			= -1;
  
  public HippyImageSpan(Drawable d, String source, ImageNode node, HippyImageLoader imageAdapter) {
    super(d, source, node.getVerticalAlignment());

    mImageNodeWeakRefrence = new WeakReference<ImageNode> (node);
    mImageAdapter = imageAdapter;
  
    setUrl(source);
  }
  
  private void updateBoundsAttribute() {
    if (mImageNodeWeakRefrence != null) {
      ImageNode node = mImageNodeWeakRefrence.get();
      if (node != null) {
        int width = Math.round(node.getStyleWidth());
        int height = Math.round(node.getStyleHeight());
        float y = node.getPosition(FlexSpacing.TOP);
        float x = node.getPosition(FlexSpacing.LEFT);
        int left = (x == Float.NaN) ? 0 : Math.round(x);
        int top = (y == Float.NaN) ? 0 : Math.round(y);
      
        mLeft = left;
        mTop = top;
        mWidth = width;
        mHeight = height;
        mVerticalAlignment = node.getVerticalAlignment();
      }
    }
  }
  
  protected boolean shouldUseFetchImageMode(String url)
  {
    return UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url);
  }
  
  private void loadImageWithUrl(String url) {
    if (TextUtils.isEmpty(mUrl) || !mUrl.equals(url)) {
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
  }
  
  public void setUrl(final String url) {
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
  
  private boolean drawGIF(Canvas canvas, float left, float top, int width, int height) {
    if (mGifMovie == null)
      return false;
    
    int duration = mGifMovie.duration();
    if (duration == 0) {
      duration = 1000;
    }
    
    long now = System.currentTimeMillis();
  
    if (mGifLastPlayTime != -1)
    {
      mGifProgress += now - mGifLastPlayTime;
    
      if (mGifProgress > duration)
      {
        mGifProgress = 0;
      }
      mGifLastPlayTime = now;
    }
    else
    {
      mGifLastPlayTime = now;
    }
  
    mGifScaleX = width / (float) mGifMovie.width();
    mGifScaleY = height / (float) mGifMovie.height();
    float x = (mGifScaleX != 0) ? left/mGifScaleX : left;
    float y = (mGifScaleY != 0) ? top/mGifScaleY : top;
    
    mGifMovie.setTime(mGifProgress);
    canvas.save();
    canvas.scale(mGifScaleX, mGifScaleY);
    mGifMovie.draw(canvas, x, y);
    canvas.restore();
    postInvalidateDelayed(40);
    
    return false;
  }
  
  @Override
  public void draw(Canvas canvas, CharSequence text,
                   int start, int end, float x,
                   int top, int y, int bottom, Paint paint) {
    int transY = top;
    Paint.FontMetricsInt fm = paint.getFontMetricsInt();
    if (mGifMovie != null) {
      int width = (mWidth == 0) ? mGifMovie.width() : mWidth;
      int height = (mHeight == 0) ? mGifMovie.height() : mHeight;
      
      transY = (y + fm.descent + y + fm.ascent) / 2 - height / 2;
      drawGIF(canvas, x + mLeft, transY + mTop, width, height);
    } else if (mVerticalAlignment == ImageSpan.ALIGN_BASELINE) {
      Drawable b = getDrawable();

      transY = (y + fm.descent + y + fm.ascent) / 2
        - b.getBounds().bottom / 2;
  
      canvas.save();
      canvas.translate(x + mLeft, transY + mTop);
      b.draw(canvas);
      canvas.restore();
    } else {
      super.draw(canvas, text, start, end, x, top, y, bottom, paint);
    }
  }
  
  private void postInvalidateDelayed(long delayMilliseconds) {
    if (mImageNodeWeakRefrence != null) {
      ImageNode node = mImageNodeWeakRefrence.get();
      if (node != null) {
        DomNode parent = node.getParent();
        if (parent != null && parent instanceof TextNode) {
          ((TextNode)parent).postInvalidateDelayed(delayMilliseconds);
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
          mDrawableField = ImageSpan.class.getDeclaredField("mDrawable");
          mDrawableField.setAccessible(true);
          mDrawableField.set(HippyImageSpan.this, drawable);
        
          mDrawableRefField = DynamicDrawableSpan.class.getDeclaredField("mDrawableRef");
          mDrawableRefField.setAccessible(true);
          mDrawableRefField.set(HippyImageSpan.this, null);
        } catch (IllegalAccessException e) {
          e.printStackTrace();
        } catch (NoSuchFieldException e) {
          e.printStackTrace();
        }
      } else if(hippyDrawable.isAnimated()) {
        mGifMovie = hippyDrawable.getGIF();
      }
  
      postInvalidateDelayed(0);
      mImageLoadState = STATE_LOADED;
    }
  }
  
  private void doFetchImage(String url, HippyMap props, HippyImageLoader imageAdapter) {
    mImageLoadState = STATE_LOADING;
    
    imageAdapter.fetchImage(url, new HippyImageLoader.Callback()
    {
      @Override
      public void onRequestStart(HippyDrawable hippyDrawable)
      {
      }
    
      @Override
      public void onRequestSuccess(HippyDrawable hippyDrawable) {
        shouldReplaceDrawable(hippyDrawable);
      }
    
      @Override
      public void onRequestFail(Throwable throwable, String source)
      {
        mImageLoadState = STATE_UNLOAD;
      }
    }, props);
  }
}

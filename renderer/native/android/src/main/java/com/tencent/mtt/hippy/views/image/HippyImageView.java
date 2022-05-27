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

package com.tencent.mtt.hippy.views.image;

import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_END;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_ERROR;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_PROGRESS;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_START;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_ON_LOAD;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Movie;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;
import com.tencent.mtt.hippy.views.common.CommonBackgroundDrawable;
import com.tencent.mtt.hippy.views.common.CommonBorder;
import com.tencent.mtt.hippy.views.list.HippyRecycler;
import com.tencent.mtt.supportui.views.asyncimage.AsyncImageView;
import com.tencent.mtt.supportui.views.asyncimage.BackgroundDrawable;
import com.tencent.mtt.supportui.views.asyncimage.ContentDrawable;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

import com.tencent.renderer.component.image.ImageDataHolder;
import com.tencent.renderer.utils.EventUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
public class HippyImageView extends AsyncImageView implements CommonBorder, HippyViewBase,
        HippyRecycler {

    public static final String IMAGE_TYPE_APNG = "apng";
    public static final String IMAGE_TYPE_GIF = "gif";
    public static final String IMAGE_PROPS = "props";
    public static final String IMAGE_VIEW_OBJ = "viewobj";

    private Map<String, Object> initProps = new HashMap<>();
    private int mCustomBackgroundColor = Color.TRANSPARENT;
    private Movie mGifMovie;
    private int mGifStartX = 0;
    private int mGifStartY = 0;
    private float mGifScaleX = 1;
    private float mGifScaleY = 1;
    private boolean mGifMatrixComputed = false;
    private int mGifProgress = 0;
    private long mGifLastPlayTime = -1;

    @Override
    public void resetProps() {
        HippyViewController.resetTransform(this);
        setAlpha(1.0f);
        mTintColor = 0;
        mBGDrawable = null;
        mContentDrawable = null;
        mScaleType = AsyncImageView.ScaleType.FIT_XY;
        setImagePositionX(0);
        setImagePositionY(0);
        mUrl = null;
        mImageType = null;
        setBackgroundDrawable(null);
    }

    @Override
    public void clear() {
        //先解决图片绘制黑屏的问题。 更完全的改法是调用resetProps.
        mTintColor = 0;
    }

    public enum ImageEvent {
        ON_LOAD,
        ON_LOAD_START,
        ON_LOAD_PROGRESS,
        ON_LOAD_END,
        ON_LOAD_ERROR,
    }

    protected NativeGestureDispatcher mGestureDispatcher;
    private Rect mNinePatchRect;
    private NativeRender nativeRenderer;

    public HippyImageView(Context context) {
        super(context);
        if (context instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) context).getInstanceId();
            nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            if (nativeRenderer != null) {
                setImageAdapter(nativeRenderer.getImageLoaderAdapter());
            }
        }
    }

    public void setInitProps(@NonNull Map<String, Object> props) {
        initProps = props;
    }

    public void setNinePatchCoordinate(boolean shouldClearNinePatch, int left, int top, int right,
            int bottom) {
        if (shouldClearNinePatch) {
            mNinePatchRect = null;
        } else {
            if (mNinePatchRect == null) {
                mNinePatchRect = new Rect();
            }
            mNinePatchRect.set(left, top, right, bottom);
        }
        if (mContentDrawable instanceof HippyContentDrawable) {
            ((HippyContentDrawable) mContentDrawable).setNinePatchCoordinate(mNinePatchRect);
            invalidate();
        }
    }

    @Override
    protected void resetContent() {
        super.resetContent();
        mGifMovie = null;
        mGifProgress = 0;
        mGifLastPlayTime = -1;
    }

    @Override
    protected boolean shouldUseFetchImageMode(String url) {
        return UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url);
    }

    public void setHippyViewDefaultSource(String defaultSourceUrl) {
        setDefaultSource(defaultSourceUrl);
    }

    @Override
    protected void doFetchImage(Object param, final int sourceType) {
        if (mImageAdapter != null) {
            if (param == null) {
                param = new HashMap<String, Object>();
            }

            if (param instanceof Map) {
                if (nativeRenderer != null) {
                    RenderNode node = nativeRenderer.getRenderManager().getRenderNode(getId());
                    if (node != null) {
                        initProps = node.getProps();
                    }
                }

                try {
                    //noinspection unchecked,rawtypes
                    ((Map) param).put(IMAGE_PROPS, initProps);
                    //noinspection unchecked,rawtypes
                    ((Map) param).put(IMAGE_VIEW_OBJ, this);
                } catch (Exception e) {
                    LogUtils.d("HippyImageView", "doFetchImage: " + e);
                }
            }

            // 这里不判断下是取背景图片还是取当前图片怎么行？
            final String url = sourceType == SOURCE_TYPE_SRC ? mUrl : mDefaultSourceUrl;
            //noinspection unchecked
            mImageAdapter.fetchImage(url, new ImageRequestListener() {
                @Override
                public void onRequestStart(ImageDataSupplier supplier) {
                    mSourceDrawable = supplier;
                }

                @Override
                public void onRequestProgress(float total, float loaded) {
                    handleGetImageProgress(total, loaded);
                }

                @Override
                public void onRequestSuccess(ImageDataSupplier supplier) {
                    if (sourceType == SOURCE_TYPE_SRC && !TextUtils.equals(url, mUrl)) {
                        return;
                    }
                    if (sourceType == SOURCE_TYPE_DEFAULT_SRC && !TextUtils
                            .equals(url, mDefaultSourceUrl)) {
                        return;
                    }
                    handleImageRequest(supplier, sourceType, null);
                }

                @Override
                public void onRequestFail(Throwable throwable, String source) {
                    if (sourceType == SOURCE_TYPE_SRC && !TextUtils.equals(url, mUrl)) {
                        return;
                    }
                    if (sourceType == SOURCE_TYPE_DEFAULT_SRC && !TextUtils
                            .equals(url, mDefaultSourceUrl)) {
                        return;
                    }
                    handleImageRequest(null, sourceType, throwable);
                }
            }, param);
        }
    }

    public void setBackgroundColor(int backgroundColor) {
        mCustomBackgroundColor = backgroundColor;
        super.setBackgroundColor(backgroundColor);
    }

    @Override
    protected void onFetchImage(String url) {
        if (mContentDrawable instanceof ContentDrawable &&
                ((ContentDrawable) mContentDrawable).getSourceType() == SOURCE_TYPE_DEFAULT_SRC) {
            return;
        }

        Drawable oldBGDrawable = getBackground();
        resetContent();

        if (url != null && (UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url))) {
            if (oldBGDrawable instanceof CommonBackgroundDrawable) {
                ((CommonBackgroundDrawable) oldBGDrawable)
                        .setBackgroundColor(mCustomBackgroundColor);
                setCustomBackgroundDrawable((CommonBackgroundDrawable) oldBGDrawable);
            } else if (oldBGDrawable instanceof LayerDrawable) {
                LayerDrawable layerDrawable = (LayerDrawable) oldBGDrawable;
                int numberOfLayers = layerDrawable.getNumberOfLayers();

                if (numberOfLayers > 0) {
                    Drawable bgDrawable = layerDrawable.getDrawable(0);
                    if (bgDrawable instanceof CommonBackgroundDrawable) {
                        ((CommonBackgroundDrawable) bgDrawable)
                                .setBackgroundColor(mCustomBackgroundColor);
                        setCustomBackgroundDrawable((CommonBackgroundDrawable) bgDrawable);
                    }
                }
            }
            super.setBackgroundColor(mCustomBackgroundColor);
        }
    }

    @Override
    protected void updateContentDrawableProperty(int sourceType) {
        super.updateContentDrawableProperty(sourceType);
        if (mContentDrawable instanceof HippyContentDrawable && sourceType == SOURCE_TYPE_SRC) {
            ((HippyContentDrawable) mContentDrawable).setNinePatchCoordinate(mNinePatchRect);
        }
    }

    @Override
    protected ContentDrawable generateContentDrawable() {
        return new HippyContentDrawable();
    }

    @Override
    protected BackgroundDrawable generateBackgroundDrawable() {
        return new CommonBackgroundDrawable();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (mGestureDispatcher != null) {
            result |= mGestureDispatcher.handleTouchEvent(event);
        }
        return result;
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }

    @Override
    protected void handleGetImageStart() {
        // send onLoadStart event
        EventUtils.send(this, EVENT_IMAGE_LOAD_START, null);
    }

    @Override
    protected void handleGetImageProgress(float total, float loaded) {
        // send onLoadStart event
        HashMap<String, Object> params = new HashMap<>();
        params.put("loaded", loaded);
        params.put("total", total);
        EventUtils.send(this, EVENT_IMAGE_LOAD_PROGRESS, params);
    }

    @Override
    protected void handleGetImageSuccess() {
        // send onLoad event
        EventUtils.send(this, EVENT_IMAGE_ON_LOAD, null);
        // send onLoadEnd event
        HashMap<String, Object> params = new HashMap<>();
        params.put("success", 1);
        if (mSourceDrawable != null) {
            Bitmap bitmap = mSourceDrawable.getBitmap();
            if (bitmap != null) {
                HashMap<String, Object> imageSize = new HashMap<>();
                imageSize.put("width", bitmap.getWidth());
                imageSize.put("height", bitmap.getHeight());
                params.put("image", imageSize);
            }
        }
        EventUtils.send(this, EVENT_IMAGE_LOAD_END, params);
    }

    @Override
    protected void handleGetImageFail(Throwable throwable) {
        // send onError event
        EventUtils.send(this, EVENT_IMAGE_LOAD_ERROR, null);
        // send onLoadEnd event
        HashMap<String, Object> params = new HashMap<>();
        params.put("success", 0);
        EventUtils.send(this, EVENT_IMAGE_LOAD_END, params);
    }

    private void computeMatrixParams() {
        if (!mGifMatrixComputed) {
            // reset
            mGifStartX = 0;
            mGifStartY = 0;
            mGifScaleX = 1;
            mGifScaleY = 1;
            if (mGifMovie.width() > 0 && mGifMovie.height() > 0 && getWidth() > 0
                    && getHeight() > 0) {
                mGifScaleX = getWidth() / (float) mGifMovie.width();
                mGifScaleY = getHeight() / (float) mGifMovie.height();
            }
            ScaleType type = mScaleType != null ? mScaleType : ScaleType.FIT_XY;
            switch (type) {
                case FIT_XY:
                    // 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
                    break;
                case CENTER:
                    // 居中不拉伸
                    mGifScaleX = 1;
                    mGifScaleY = 1;
                    break;
                case CENTER_INSIDE:
                    // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
                    // 这样图片完全被包裹在容器中，容器中可能留有空白
                    if (mGifScaleX > mGifScaleY) {
                        //noinspection SuspiciousNameCombination
                        mGifScaleX = mGifScaleY;
                    } else {
                        //noinspection SuspiciousNameCombination
                        mGifScaleY = mGifScaleX;
                    }
                    break;
                case CENTER_CROP:
                    // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
                    // 这样图片完全覆盖甚至超出容器，容器中不留任何空白
                    if (mGifScaleX < mGifScaleY) {
                        //noinspection SuspiciousNameCombination
                        mGifScaleX = mGifScaleY;
                    } else {
                        //noinspection SuspiciousNameCombination
                        mGifScaleY = mGifScaleX;
                    }
                    break;
                case ORIGIN:
                    mGifScaleX = mGifScaleY = 1;
                    // 不拉伸，居左上
                    break;
            }
            if (mScaleType != ScaleType.ORIGIN) {
                mGifStartX = (int) ((getWidth() / mGifScaleX - mGifMovie.width()) / 2f);
                mGifStartY = (int) ((getHeight() / mGifScaleY - mGifMovie.height()) / 2f);
            }
            mGifMatrixComputed = true;
        }
    }

    @Override
    protected void handleImageRequest(ImageDataSupplier supplier, int sourceType, Object requestInfo) {
        if (!(supplier instanceof ImageDataHolder)) {
            return;
        }
        ImageDataHolder holder = (ImageDataHolder) supplier;
        if (!TextUtils.isEmpty(holder.getImageType())) {
            mImageType = holder.getImageType();
        }

        if (holder.isAnimated()) {
            mGifMovie = holder.getGIF();
            setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }

        if (!TextUtils.isEmpty(mImageType) && mImageType.equals(IMAGE_TYPE_APNG)
                && sourceType == SOURCE_TYPE_SRC) {
            if (supplier != null) {
                Drawable drawable = supplier.getDrawable();
                if (drawable != null) {
                    mSourceDrawable = null;
                    mContentDrawable = drawable;
                    mUrlFetchState = IMAGE_LOADED;
                    setContent(sourceType);
                    handleGetImageSuccess();
                    return;
                }
            }

            mUrlFetchState = IMAGE_UNLOAD;
            handleGetImageFail(requestInfo instanceof Throwable ? (Throwable) requestInfo : null);
        } else {
            super.handleImageRequest(supplier, sourceType, requestInfo);
        }
    }

    protected boolean drawGIF(Canvas canvas) {
        if (mGifMovie == null) {
            return false;
        }

        int duration = mGifMovie.duration();
        if (duration == 0) {
            duration = 1000;
        }

        long now = System.currentTimeMillis();

        if (!isGifPaused) {
            if (mGifLastPlayTime != -1) {
                mGifProgress += now - mGifLastPlayTime;

                if (mGifProgress > duration) {
                    mGifProgress = 0;
                }
            }
            mGifLastPlayTime = now;
        }

        computeMatrixParams();
        mGifMovie.setTime(mGifProgress);
        canvas.save(); // 保存变换矩阵
        canvas.scale(mGifScaleX, mGifScaleY);
        mGifMovie.draw(canvas, mGifStartX, mGifStartY);
        canvas.restore(); // 恢复变换矩阵

        if (!isGifPaused) {
            postInvalidateDelayed(40);
        }

        return true;
    }

    protected boolean shouldFetchImage() {
        if (mUrlFetchState == IMAGE_LOADING) {
            return false;
        } else if (mUrlFetchState == IMAGE_UNLOAD) {
            return true;
        }

        boolean isGif = false;
        if (initProps != null && initProps.get(NodeProps.CUSTOM_PROP_ISGIF) instanceof Boolean) {
            isGif = (boolean) initProps.get(NodeProps.CUSTOM_PROP_ISGIF);
        }
        if (!isGif) {
            isGif = !TextUtils.isEmpty(mImageType) && mImageType.equals(IMAGE_TYPE_GIF);
        }

        if (!TextUtils.isEmpty(mImageType) && mImageType.equals(IMAGE_TYPE_APNG)
                && mContentDrawable != null && !(mContentDrawable instanceof ContentDrawable)) {
            return false;
        } else if (isGif) {
            return mGifMovie == null;
        } else {
            Bitmap bitmap = getBitmap();
            //noinspection RedundantIfStatement
            if (bitmap == null || bitmap.isRecycled()) {
                return true;
            }
        }

        return false;
    }

    // 图片自绘功能（方便自定义支持gif、webp、tpg等）尚未实现，暂时注释
//	private void drawSelf(Canvas canvas, HippyDrawable drawable) {
//		computeMatrixParams();
//		canvas.save(); // 保存变换矩阵
//
//		canvas.clipRect(new Rect(mGifStartX, mGifStartY, canvas.getWidth(), canvas.getHeight()));
//		canvas.scale(mGifScaleX, mGifScaleY);
//
//		drawable.draw(canvas);
//
//		// canvas.restore(); // 恢复变换矩阵
//		postInvalidateDelayed(40);
//	}

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // 图片自绘功能（方便自定义支持gif、webp、tpg等）尚未实现，暂时注释
//		if (mSourceDrawable instanceof HippyDrawable)
//		{
//			HippyDrawable drawable = (HippyDrawable) mSourceDrawable;
//			if (drawable.isSelfDraw())
//				drawSelf(canvas, drawable);
//		}
//		else
        if (mGifMovie != null) {
            // 如果是GIF，就调用drawGIF()方法播放GIF动画
            drawGIF(canvas);
        }
    }

    private boolean isGifPaused = false;

    public void startPlay() {
        isGifPaused = false;
        invalidate();
    }

    public void pause() {
        isGifPaused = true;
        mGifLastPlayTime = -1;
    }
}

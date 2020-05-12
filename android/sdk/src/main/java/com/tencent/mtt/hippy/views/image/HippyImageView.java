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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UrlUtils;
import com.tencent.mtt.hippy.views.common.CommonBackgroundDrawable;
import com.tencent.mtt.hippy.views.common.CommonBorder;
import com.tencent.mtt.hippy.views.list.HippyRecycler;
import com.tencent.mtt.supportui.adapters.image.IDrawableTarget;
import com.tencent.mtt.supportui.views.asyncimage.AsyncImageView;
import com.tencent.mtt.supportui.views.asyncimage.BackgroundDrawable;
import com.tencent.mtt.supportui.views.asyncimage.ContentDrawable;

/**
 * Created by leonardgong on 2017/12/4 0004.
 * harryguo modified 2019/4/23 support gif
 */

public class HippyImageView extends AsyncImageView implements CommonBorder, HippyViewBase, HippyRecycler
{
  public static final String IMAGE_TYPE_APNG  = "apng";

	private HippyMap mIniProps = new HippyMap();
	private boolean mHasSetTempBackgroundColor = false;
	private boolean mUserHasSetBackgroudnColor = false;
	private int 	mUserSetBackgroundColor = Color.TRANSPARENT;

	/**
	 * 记录动画开始的时间
	 */
	private long mGifMovieStart;
	/**
	 * 播放GIF动画的关键类
	 */
	private Movie mGifMovie;
	private int mRepeatCount = -1;
	private int mShowCount = 0;
	private int mGifStartX = 0;
	private int mGifStartY = 0;
	private float mGifScaleX = 1;
	private float mGifScaleY = 1;
	private boolean mGifMatrixComputed = false;
	private int		mGifProgress				= 0;
	private long	mGifLastPlayTime			= -1;

	public void setRepeatCount(int repeatCount)
	{
		mRepeatCount = repeatCount;
		if(mRepeatCount == 0)
			mRepeatCount = 1;
		mShowCount = 0;
	}

	@Override
	public void resetProps()
	{
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
		for (int i = 0; i < mShouldSendImageEvent.length; i++)
		{
			mShouldSendImageEvent[i] = false;
		}
	}

	@Override
	public void clear()
	{
		//先解决图片绘制黑屏的问题。 更完全的改法是调用resetProps.
		mTintColor = 0;
	}

	enum ImageEvent
	{
		ONLOAD,
		ONLOAD_START,
		ONLOAD_END,
		ONERROR
	}

	protected NativeGestureDispatcher	mGestureDispatcher;

	private OnLoadEvent					mOnLoadEvent;
	private OnLoadEndEvent				mOnLoadEndEvent;
	private OnErrorEvent				mOnErrorEvent;
	private OnLoadStartEvent			mOnLoadStartEvent;
	private boolean[]					mShouldSendImageEvent;
	private Rect						mNinePatchRect;
	protected String 					mHippyImageViewDefalutImgeUrl = null; //如果用戶設置了默認顯示的圖片,在拉完source失败后要用默认图

	public HippyImageView(Context context)
	{
		super(context);
		mShouldSendImageEvent = new boolean[ImageEvent.values().length];
		HippyEngineContext engineContext = ((HippyInstanceContext) context).getEngineContext();
		if (engineContext != null)
		{
			setImageAdapter(engineContext.getGlobalConfigs().getImageLoaderAdapter());
		}
	}

	public void setIniProps(HippyMap iniProps) {
		int width = 0;
		int height = 0;

    mIniProps.clear();

		if (iniProps.containsKey(NodeProps.STYLE)) {
			HippyMap styles = iniProps.getMap(NodeProps.STYLE);
			if (styles != null) {
				if (styles.containsKey(NodeProps.WIDTH)) {
					width = Math.round(PixelUtil.dp2px(styles.getDouble(NodeProps.WIDTH)));
				}

				if (styles.containsKey(NodeProps.HEIGHT)) {
					height = Math.round(PixelUtil.dp2px(styles.getDouble(NodeProps.HEIGHT)));
				}

        if (styles.containsKey(NodeProps.RESIZE_MODE)) {
          mIniProps.pushString(NodeProps.RESIZE_MODE, styles.getString(NodeProps.RESIZE_MODE));
        }
			}
		}

		if (iniProps.containsKey(NodeProps.CUSTOM_PROP_IMAGE_TYPE)) {
      mIniProps.pushString(NodeProps.CUSTOM_PROP_IMAGE_TYPE, iniProps.getString(NodeProps.CUSTOM_PROP_IMAGE_TYPE));
    }

		mIniProps.pushBoolean(NodeProps.CUSTOM_PROP_ISGIF, iniProps.getBoolean(NodeProps.CUSTOM_PROP_ISGIF));
		mIniProps.pushInt(NodeProps.WIDTH, width);
		mIniProps.pushInt(NodeProps.HEIGHT, height);
	}

    /**
     * 前端传递下来的参数
     * left 到左边的距离
     * right 到右边的距离
     * top 到上边的距离
     * botttom 到下边的距离
     * 修复:https://git.code.oa.com/hippy/hippy/issues/23
     * Robinsli
     * */
	public void setNinePatchCoordinate(boolean shouldClearNinePatch, int left, int top, int right, int botttom)
	{
		if (shouldClearNinePatch)
		{
			mNinePatchRect = null;
		}
		else
		{
			if (mNinePatchRect == null)
			{
				mNinePatchRect = new Rect();
			}
			mNinePatchRect.set(left, top, right, botttom);
		}
		if (mContentDrawable instanceof HippyContentDrawable)
		{
			((HippyContentDrawable) mContentDrawable).setNinePatchCoordinate(mNinePatchRect);
			invalidate();
		}
	}

	protected void setImageEventEnable(int index, boolean enable)
	{
		mShouldSendImageEvent[index] = enable;
	}

	@Override
	protected void resetContent() {
		super.resetContent();
		mGifMovie = null;
		mGifProgress = 0;
		mGifLastPlayTime = -1;
	}

	@Override
	protected boolean shouldUseFetchImageMode(String url)
	{
		return UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url);
	}

	public void setHippyViewDefaultSource(String defaultSourceUrl) {
			mHippyImageViewDefalutImgeUrl = defaultSourceUrl;
			setDefaultSource(mHippyImageViewDefalutImgeUrl); //这一句还是要,不要,如果用户没有设置source就没有图
	}
	@Override
	protected void doFetchImage(Object param, final int sourceType)
	{
		if (mImageAdapter != null)
		{
			if (param != null) {
				mIniProps.pushObject("extraData", param);
			}

			// 这里不判断下是取背景图片还是取当前图片怎么行？
			String url = sourceType == SOURCE_TYPE_SRC ? mUrl : mDefaultSourceUrl;
			mImageAdapter.fetchImage(url, new HippyImageLoader.Callback()
			{
				// 在此保存着fetchImage时的url，以备：在onRequestSuccess时，用这个mFetchUrl和HippyImageView里的mUrl做对比，
				// 看看是否同一个url（很可能不相同的。因为HippyImageView会经常复用，所以他的mUrl会经常被重设）
				String mFetchUrl = mUrl;

				@Override
				public void onRequestStart(HippyDrawable drawableTarget)
				{
					mSourceDrawable = drawableTarget;
				}

				@Override
				public void onRequestSuccess(HippyDrawable drawableTarget)
				{
					if (TextUtils.equals(mFetchUrl, mUrl))
						handleImageRequest(drawableTarget, sourceType, null);
				}

				@Override
				public void onRequestFail(Throwable throwable, String source)
				{
					if (TextUtils.equals(mFetchUrl, mUrl))
					{
						//如果用戶設置了默認顯示的圖片,在拉完source失败后要用默认图
						if(sourceType == SOURCE_TYPE_SRC && !TextUtils.isEmpty(mHippyImageViewDefalutImgeUrl))
						{
							mDefaultSourceUrl =null;//吧之前的默认背景清理下
							setDefaultSource(mHippyImageViewDefalutImgeUrl);
						}
						else
						{
						handleImageRequest(null, sourceType, throwable);
						}
					}
				}
			}, mIniProps);
		}
	}
	//用户设置了,Js属性设置背景色
	public void setBackgroundColor(int backgroundColor)
	{
		mUserHasSetBackgroudnColor = true;
		mUserSetBackgroundColor = backgroundColor;
		super.setBackgroundColor(backgroundColor);
	}
	@Override
	protected void onFetchImage(String url)
	{
		Drawable oldBGDrawable = getBackground();
		resetContent();
		if (url != null && (UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url)))
		{
			int defaultBackgroundColor = Color.LTGRAY;
			//如果用户设置了背景颜色,用用户设置的背景色,
            //Fix bug 如果图片过大,拉取事件过长,
			// 会出现ImageView: 灰色背景->父亲背景[restoreBackgroundColorAfterSetContent设置成透明把父亲背景透传上来了]->图 的三个变化
			if(mUserHasSetBackgroudnColor)
			{
				defaultBackgroundColor = mUserSetBackgroundColor;
			}
			if (oldBGDrawable instanceof CommonBackgroundDrawable)
			{
				((CommonBackgroundDrawable) oldBGDrawable).setBackgroundColor(defaultBackgroundColor);
				setCustomBackgroundDrawable((CommonBackgroundDrawable) oldBGDrawable);
			}
			else if (oldBGDrawable instanceof LayerDrawable)
			{
				if (((LayerDrawable) oldBGDrawable).getNumberOfLayers() > 0)
				{
					Drawable lastBgDrawable = ((LayerDrawable) oldBGDrawable).getDrawable(0);
					if (lastBgDrawable instanceof CommonBackgroundDrawable)
					{
						((CommonBackgroundDrawable) lastBgDrawable).setBackgroundColor(defaultBackgroundColor);
						setCustomBackgroundDrawable((CommonBackgroundDrawable) lastBgDrawable);
					}
				}
			}
			super.setBackgroundColor(defaultBackgroundColor);
			mHasSetTempBackgroundColor = true;
		}
	}

	@Override
	protected void afterSetContent(String url)
	{
		restoreBackgroundColorAfterSetContent();
	}

	@Override
	protected void restoreBackgroundColorAfterSetContent()
	{
		if (mBGDrawable != null && mHasSetTempBackgroundColor)
		{
            int defaultBackgroundColor = Color.TRANSPARENT;
			mBGDrawable.setBackgroundColor(defaultBackgroundColor);
			mHasSetTempBackgroundColor = false;
		}
	}

	@Override
	protected void updateContentDrawableProperty()
	{
		super.updateContentDrawableProperty();
    if (mContentDrawable instanceof HippyContentDrawable) {
      ((HippyContentDrawable) mContentDrawable).setNinePatchCoordinate(mNinePatchRect);
    }
	}

	@Override
	protected ContentDrawable generateContentDrawable()
	{
		return new HippyContentDrawable();
	}

	@Override
	protected BackgroundDrawable generateBackgroundDrawable()
	{
		return new CommonBackgroundDrawable();
	}

	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		boolean result = super.onTouchEvent(event);
		if (mGestureDispatcher != null)
		{
			result |= mGestureDispatcher.handleTouchEvent(event);
		}
		return result;
	}

	@Override
	public NativeGestureDispatcher getGestureDispatcher()
	{
		return mGestureDispatcher;
	}

	@Override
	public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
	{
		mGestureDispatcher = dispatcher;
	}

	@Override
	protected void handleGetImageStart()
	{
		// send onLoadStart event
		if (mShouldSendImageEvent[ImageEvent.ONLOAD_START.ordinal()])
		{
			getOnLoadStartEvent().send(this, null);
		}
	}

	@Override
	protected void handleGetImageSuccess()
	{
		// send onLoad event
		if (mShouldSendImageEvent[ImageEvent.ONLOAD.ordinal()])
		{
			getOnLoadEvent().send(this, null);
		}
		// send onLoadEnd event
		if (mShouldSendImageEvent[ImageEvent.ONLOAD_END.ordinal()])
		{
			HippyMap map = new HippyMap();
			map.pushInt("success", 1);
			if (mSourceDrawable != null) {
			    Bitmap bitmap = mSourceDrawable.getBitmap();
			    if (bitmap != null) {
					HippyMap imageSize = new HippyMap();
					imageSize.pushInt("width", bitmap.getWidth());
					imageSize.pushInt("height", bitmap.getHeight());
					map.pushMap("image", imageSize);
				}
			}
			getOnLoadEndEvent().send(this, map);
		}
	}

	@Override
	protected void handleGetImageFail(Throwable throwable)
	{
		// send onError event
		if (mShouldSendImageEvent[ImageEvent.ONERROR.ordinal()])
		{
			getOnErrorEvent().send(this, null);
		}
		// send onLoadEnd event
		if (mShouldSendImageEvent[ImageEvent.ONLOAD_END.ordinal()])
		{
			HippyMap map = new HippyMap();
			map.pushInt("success", 0);
			getOnLoadEndEvent().send(this, map);
		}
	}

	private void computeMatrixParams()
	{
		if (!mGifMatrixComputed)
		{
			// reset
			mGifStartX = 0;
			mGifStartY = 0;
			mGifScaleX = 1;
			mGifScaleY = 1;
			if (mGifMovie.width() > 0 && mGifMovie.height() > 0 && getWidth() > 0 && getHeight() > 0)
			{
				mGifScaleX = getWidth() / (float) mGifMovie.width();
				mGifScaleY = getHeight() / (float) mGifMovie.height();
			}
			ScaleType type = mScaleType != null ? mScaleType : ScaleType.FIT_XY;
			switch (type)
				{
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
						if (mGifScaleX > mGifScaleY)
							mGifScaleX = mGifScaleY;
						else
							mGifScaleY = mGifScaleX;
						break;
					case CENTER_CROP:
						// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
						// 这样图片完全覆盖甚至超出容器，容器中不留任何空白
						if (mGifScaleX < mGifScaleY)
							mGifScaleX = mGifScaleY;
						else
							mGifScaleY = mGifScaleX;
						break;
					case ORIGIN:
						mGifScaleX = mGifScaleY = 1;
						// 不拉伸，居左上
						break;
			}
			if (mScaleType != ScaleType.ORIGIN)
			{
				mGifStartX = (int) ((getWidth() / mGifScaleX - mGifMovie.width()) / 2f);
				mGifStartY = (int) ((getHeight() / mGifScaleY - mGifMovie.height()) / 2f);
			}
			mGifMatrixComputed = true;
		}
	}

	@Override
	protected void handleImageRequest(IDrawableTarget target, int sourceType, Object requestInfo)
	{
		if (target instanceof HippyDrawable && ((HippyDrawable) target).isAnimated())
		{
			mGifMovie = ((HippyDrawable) target).getGIF();
			setLayerType(View.LAYER_TYPE_SOFTWARE, null);
		}

		if (!TextUtils.isEmpty(mImageType) && mImageType.equals(IMAGE_TYPE_APNG) && sourceType == SOURCE_TYPE_SRC) {
      if (target != null) {
        Drawable drawable = target.getDrawable();
        if (drawable != null) {
          mSourceDrawable = null;
          mContentDrawable = drawable;
          mIsUrlFetchSucceed = true;
          setContent(sourceType);
          handleGetImageSuccess();
          return;
        }
      }

      mIsUrlFetchSucceed = false;
      handleGetImageFail(requestInfo instanceof Throwable ? (Throwable) requestInfo : null);
    } else {
      super.handleImageRequest(target, sourceType, requestInfo);
    }
	}

	/**
	 * 开始播放GIF动画，播放完成返回true，未完成返回false。
	 *
	 * @param canvas canvas of the image view
	 * @return 播放完成返回true，未完成返回false。
	 */
	protected boolean drawGIF(Canvas canvas) {
		if (mGifMovie == null)
			return false;

		int duration = mGifMovie.duration();
		if (duration == 0) {
			duration = 1000;
		}
		
		long now = System.currentTimeMillis();

		if (!isGifPaused)
		{

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
		}

		computeMatrixParams();
		mGifMovie.setTime(mGifProgress);
		canvas.save(); // 保存变换矩阵
		canvas.scale(mGifScaleX, mGifScaleY);
		mGifMovie.draw(canvas, mGifStartX, mGifStartY);
		canvas.restore(); // 恢复变换矩阵

		if (!isGifPaused)
		{
			postInvalidateDelayed(40);
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
	public void onDraw(Canvas canvas)
	{
		super.onDraw(canvas);
		// 图片自绘功能（方便自定义支持gif、webp、tpg等）尚未实现，暂时注释
//		if (mSourceDrawable instanceof HippyDrawable)
//		{
//			HippyDrawable drawable = (HippyDrawable) mSourceDrawable;
//			if (drawable.isSelfDraw())
//				drawSelf(canvas, drawable);
//		}
//		else
		if (mGifMovie != null)
		{
			// 如果是GIF，就调用drawGIF()方法播放GIF动画
			drawGIF(canvas);
		}
	}

	private boolean isGifPaused = false;
	
	public void startPlay()
	{
		isGifPaused = false;
		invalidate();
	}
	
	public void pause()
	{
		isGifPaused = true;
		mGifLastPlayTime = -1;
	}
	

	private OnLoadEvent getOnLoadEvent()
	{
		if (mOnLoadEvent == null)
		{
			mOnLoadEvent = new OnLoadEvent("onLoad");
		}
		return mOnLoadEvent;
	}

	private OnLoadEndEvent getOnLoadEndEvent()
	{
		if (mOnLoadEndEvent == null)
		{
			mOnLoadEndEvent = new OnLoadEndEvent("onLoadEnd");
		}
		return mOnLoadEndEvent;
	}

	private OnLoadStartEvent getOnLoadStartEvent()
	{
		if (mOnLoadStartEvent == null)
		{
			mOnLoadStartEvent = new OnLoadStartEvent("onLoadStart");
		}
		return mOnLoadStartEvent;
	}

	private OnErrorEvent getOnErrorEvent()
	{
		if (mOnErrorEvent == null)
		{
			mOnErrorEvent = new OnErrorEvent("onError");
		}
		return mOnErrorEvent;
	}

	/** event to js **/
	class OnLoadEvent extends HippyViewEvent
	{
		OnLoadEvent(String eventName)
		{
			super(eventName);
		}
	}

	class OnLoadEndEvent extends HippyViewEvent
	{
		OnLoadEndEvent(String eventName)
		{
			super(eventName);
		}
	}

	class OnLoadStartEvent extends HippyViewEvent
	{
		OnLoadStartEvent(String eventName)
		{
			super(eventName);
		}
	}

	class OnErrorEvent extends HippyViewEvent
	{
		OnErrorEvent(String eventName)
		{
			super(eventName);
		}
	}
}

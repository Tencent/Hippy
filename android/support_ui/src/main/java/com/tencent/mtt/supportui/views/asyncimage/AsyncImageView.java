/* 	Copyright (C) 2018 Tencent, Inc.
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

package com.tencent.mtt.supportui.views.asyncimage;

import com.tencent.mtt.supportui.adapters.image.IDrawableTarget;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;
import com.tencent.mtt.supportui.adapters.image.IImageRequestListener;
import com.tencent.mtt.supportui.views.IBorder;

import android.animation.Animator;
import android.animation.IntEvaluator;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.text.TextUtils;
import android.view.ViewGroup;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class AsyncImageView extends ViewGroup implements Animator.AnimatorListener, ValueAnimator.AnimatorUpdateListener, IBorder
{
	public static final int			FADE_DURATION			= 150;

	protected static int			SOURCE_TYPE_SRC			= 1;
	protected static int			SOURCE_TYPE_DEFAULT_SRC	= 2;
	protected IDrawableTarget		mSourceDrawable;
	private IDrawableTarget			mDefaultSourceDrawable;

	protected String				mUrl;
	protected String				mDefaultSourceUrl;

	// the 'mURL' is fetched succeed
	protected boolean               mIsUrlFetchSucceed;

	protected int					mTintColor;
	protected ScaleType				mScaleType;
	protected int                   mBoxShadowX;
	protected int                   mBoxShadowY;
	protected int                   mBoxShadowSpreadSize;
	protected Drawable				mContentDrawable;

	private boolean					mIsAttached;
	protected IImageLoaderAdapter	mImageAdapter;
	private boolean					mFadeEnable;
	private long					mFadeDuration;
	private ValueAnimator			mAlphaAnimator;

	protected BackgroundDrawable	mBGDrawable;

	private int						mImagePositionX;
	private int						mImagePositionY;

	public enum ScaleType
	{
		FIT_XY,
		CENTER,
		CENTER_INSIDE,
		CENTER_CROP,
		ORIGIN,
		REPEAT // Robinsli add for hippy
	}

	public AsyncImageView(Context context)
	{
		super(context);
		mUrl = null;
		mDefaultSourceUrl = null;
		setFadeEnabled(false);
		setFadeDuration(FADE_DURATION);
	}

	public void setImageAdapter(IImageLoaderAdapter imageAdapter)
	{
		mImageAdapter = imageAdapter;
	}

	public void setUrl(String url)
	{
		if (!TextUtils.equals(url, mUrl))
		{
			mUrl = url;
			mIsUrlFetchSucceed = false;
			if (isAttached())
			{
				onDrawableDetached();
				fetchImageByUrl(mUrl, SOURCE_TYPE_SRC);
			}
		}
	}

	public String getUrl()
	{
		return mUrl;
	}

	public void setFadeEnabled(boolean enable)
	{
		mFadeEnable = enable;
	}

	public boolean isFadeEnabled()
	{
		return mFadeEnable;
	}

	public void setFadeDuration(long duration)
	{
		mFadeDuration = duration;
	}

	protected void resetFadeAnimation()
	{
		if (mFadeEnable)
		{
			if (mAlphaAnimator != null && mAlphaAnimator.isRunning())
			{
				mAlphaAnimator.cancel();
			}
			mAlphaAnimator = null;
		}
	}

	protected void startFadeAnimation()
	{
		if (mFadeEnable)
		{
			if (this.mFadeDuration > 0 && this.mAlphaAnimator == null)
			{
				this.mAlphaAnimator = ValueAnimator.ofInt(new int[] { 0, 255 });
				this.mAlphaAnimator.setEvaluator(new IntEvaluator());
				this.mAlphaAnimator.addUpdateListener(this);
				this.mAlphaAnimator.addListener(this);
				this.mAlphaAnimator.setDuration((long) this.mFadeDuration);
			}
			if (this.mAlphaAnimator != null)
			{
				if (this.mAlphaAnimator.isRunning())
				{
					this.mAlphaAnimator.cancel();
				}

				this.mAlphaAnimator.setCurrentPlayTime(0L);
				this.mAlphaAnimator.start();
			}
		}
	}

	protected void performFetchImage()
	{
		fetchImageByUrl(mUrl, SOURCE_TYPE_SRC);
	}

	public void setDefaultSource(String defaultSource)
	{
		if (!TextUtils.equals(mDefaultSourceUrl, defaultSource))
		{
			mDefaultSourceUrl = defaultSource;
			fetchImageByUrl(mDefaultSourceUrl, SOURCE_TYPE_DEFAULT_SRC);
		}
	}

	public void setTintColor(int tintColor)
	{
		mTintColor = tintColor;
		applyTintColor(mTintColor);
	}

	public void setBoxShadowX(int boxShadowX)
	{
		mBoxShadowX = boxShadowX;

	}

	public void setBoxShadowY(int boxShadowY)
	{
		mBoxShadowY = boxShadowY;

	}

	public void setBoxShadowSpreadSize(int boxShadowSpreadSize)
	{
		mBoxShadowSpreadSize = boxShadowSpreadSize;

	}

	protected void applyTintColor(int tintColor)
	{
		if (mContentDrawable instanceof ContentDrawable)
		{
			((ContentDrawable) mContentDrawable).setTintColor(tintColor);
			invalidate();
		}
	}

	protected int getTintColor()
	{
		return mTintColor;
	}

	public void setScaleType(ScaleType scaleType)
	{
		mScaleType = scaleType;
	}

	public void setImagePositionX(int positionX)
	{
		mImagePositionX = positionX;
	}

	public void setImagePositionY(int positionY)
	{
		mImagePositionY = positionY;
	}

	protected void onFetchImage(String url)
	{

	}

	protected boolean shouldFetchImage()
	{
		return true;
	}

	protected boolean isAttached()
	{
		return mIsAttached;
	}

	private void fetchImageByUrl(String url, final int sourceType)
	{
		if (url == null)
		{
			return;
		}


		if (mImageAdapter != null)
		{
			// fetch or get image, depending on url type

			// http or https => async fetch
			// eg. <Image source={{uri: 'https://abc.png'}} />
			if (shouldUseFetchImageMode(url))
			{
				url = url.trim().replaceAll(" ", "%20");
				if (!shouldFetchImage())
				{
					return;
				}
				onFetchImage(url);
				handleGetImageStart();
				doFetchImage(getFetchParam(), sourceType);
			}
			else
			{
				// [file/resource/base64] => direct get
				// eg. <Image source={require('./abc.png')} />
				// eg. <Image source={{uri: 'icon'}} />
				// eg. <Image source={{uri: 'data:image/png;base64,iVBORTJRU5Erk=='}} />

				handleGetImageStart();
				handleImageRequest(mImageAdapter.getImage(url, null), sourceType, null);
			}
		}
	}

	protected boolean shouldUseFetchImageMode(String url)
	{
		return true;
	}

	protected Object getFetchParam()
	{
		return mSourceDrawable != null ? mSourceDrawable.getExtraData() : null;
	}

	protected void doFetchImage(Object param, final int sourceType)
	{
		if (mImageAdapter != null)
		{
			// 这里不判断下是取背景图片还是取当前图片怎么行？
			String url = sourceType == SOURCE_TYPE_SRC ? mUrl : mDefaultSourceUrl;
			mImageAdapter.fetchImage(url, new IImageRequestListener<IDrawableTarget>()
			{
				@Override
				public void onRequestStart(IDrawableTarget IDrawableTarget)
				{
					mSourceDrawable = IDrawableTarget;
				}

				@Override
				public void onRequestSuccess(IDrawableTarget IDrawableTarget)
				{
					handleImageRequest(IDrawableTarget, sourceType, null);
				}

				@Override
				public void onRequestFail(Throwable throwable, String source)
				{
					handleImageRequest(null, sourceType, throwable);
				}
			}, param);
		}
	}

	protected void handleImageRequest(IDrawableTarget resultDrawable, int sourceType, Object requestInfo)
	{
		if (resultDrawable == null)
		{
			mContentDrawable = null;
			if (sourceType == SOURCE_TYPE_SRC)
			{
				mSourceDrawable = null;
				mIsUrlFetchSucceed = false;
				handleGetImageFail(requestInfo instanceof Throwable ? (Throwable) requestInfo : null);
			}
			else if (sourceType == SOURCE_TYPE_DEFAULT_SRC)
			{
				mDefaultSourceDrawable = null;
			}
		}
		else
		{
			mContentDrawable = generateContentDrawable();
			if (sourceType == SOURCE_TYPE_SRC)
			{
				mSourceDrawable = resultDrawable;
				mIsUrlFetchSucceed = true;
				handleGetImageSuccess();
			}
			else if (sourceType == SOURCE_TYPE_DEFAULT_SRC)
			{
				mDefaultSourceDrawable = resultDrawable;
			}
			setContent(sourceType);
		}
	}

	protected ContentDrawable generateContentDrawable()
	{
		return new ContentDrawable();
	}

	protected BackgroundDrawable generateBackgroundDrawable()
	{
		return new BackgroundDrawable();
	}

	@Override
	protected void onDetachedFromWindow()
	{
		mIsAttached = false;
		if (mFadeEnable)
		{
			if (mAlphaAnimator != null)
			{
				mAlphaAnimator.cancel();
			}
		}
		super.onDetachedFromWindow();
		onDrawableDetached();
		if (mDefaultSourceDrawable != null)
		{
			mDefaultSourceDrawable.onDrawableDetached();
		}
	}

	@Override
	protected void onLayout(boolean changed, int l, int t, int r, int b)
	{

	}

	@Override
	protected void onAttachedToWindow()
	{
		mIsAttached = true;
		super.onAttachedToWindow();
		if (mDefaultSourceDrawable != null)
		{
			mDefaultSourceDrawable.onDrawableAttached();
			setContent(SOURCE_TYPE_DEFAULT_SRC);
			setUrl(mUrl);
		}
		// avoid duplicated fetching for same url
    // imageView inside listview item will be executed as detach->attach,
    // fetching same image again will cause flashing
		if (getBitmap() == null || !mIsUrlFetchSucceed) {
		  fetchImageByUrl(mUrl, SOURCE_TYPE_SRC);
		}
		onDrawableAttached();
	}

	protected void onDrawableAttached()
	{
		if (mSourceDrawable != null)
		{
			mSourceDrawable.onDrawableAttached();
		}
	}

	protected void onDrawableDetached()
	{
		if (mSourceDrawable != null)
		{
			mSourceDrawable.onDrawableDetached();
		}
	}

	protected void resetContent()
	{
		mContentDrawable = null;
		mBGDrawable = null;
		super.setBackgroundDrawable(null);
	}

	protected void onSetContent(String url)
	{

	}

	protected void afterSetContent(String url)
	{

	}

	protected void performSetContent()
	{
		setContent(SOURCE_TYPE_SRC);
	}

	protected boolean shouldSetContent()
	{
		return true;
	}

	protected Bitmap getBitmap()
	{
		if (mSourceDrawable != null)
		{
			return mSourceDrawable.getBitmap();
		}
		return null;
	}

	private void setContent(int sourceType)
	{
		if (mContentDrawable != null)
		{
			if (!shouldSetContent())
			{
				return;
			}
			onSetContent(mUrl);
			if (sourceType == SOURCE_TYPE_SRC && mSourceDrawable != null)
			{
				updateContentDrawableProperty();
			}
			else if (sourceType == SOURCE_TYPE_DEFAULT_SRC && mDefaultSourceDrawable != null)
			{
				((ContentDrawable) mContentDrawable).setBitmap(mDefaultSourceDrawable.getBitmap());
			}
			if (mBGDrawable != null)
			{
				((ContentDrawable) mContentDrawable).setBorder(mBGDrawable.getBorderRadiusArray(), mBGDrawable.getBorderWidthArray());
				setBackgroundDrawable(new LayerDrawable(new Drawable[] { mBGDrawable, mContentDrawable }));
			}
			else
			{
				setBackgroundDrawable(mContentDrawable);
			}
			afterSetContent(mUrl);
		}
	}

	protected void updateContentDrawableProperty()
	{
		((ContentDrawable) mContentDrawable).setBitmap(getBitmap());
		((ContentDrawable) mContentDrawable).setTintColor(getTintColor());
		((ContentDrawable) mContentDrawable).setScaleType(mScaleType);
		((ContentDrawable) mContentDrawable).setImagePositionX(mImagePositionX);
		((ContentDrawable) mContentDrawable).setImagePositionY(mImagePositionY);
	}

	protected void handleGetImageStart()
	{
	}

	protected void handleGetImageSuccess()
	{
	}

	protected void handleGetImageFail(Throwable throwable)
	{
	}

	@Override
	public void onAnimationStart(Animator animation)
	{

	}

	@Override
	public void onAnimationEnd(Animator animation)
	{
		if (mFadeEnable)
		{
			restoreBackgroundColorAfterSetContent();
		}
	}

	@Override
	public void onAnimationCancel(Animator animation)
	{
		if (mFadeEnable)
		{
			if (mContentDrawable != null)
			{
				mContentDrawable.setAlpha(255);
			}
			restoreBackgroundColorAfterSetContent();
		}
	}

	@Override
	public void onAnimationRepeat(Animator animation)
	{

	}

	@Override
	public void onAnimationUpdate(ValueAnimator animation)
	{
		if (mFadeEnable)
		{
			if (!isAttached() && mAlphaAnimator != null)
			{
				mAlphaAnimator.cancel();
			}
			if (mContentDrawable != null)
			{
				mContentDrawable.setAlpha(((Integer) animation.getAnimatedValue()).intValue());
			}
		}
	}

	protected void restoreBackgroundColorAfterSetContent()
	{
		setBackgroundColor(Color.TRANSPARENT);
	}

	protected void setCustomBackgroundDrawable(BackgroundDrawable commonBackgroundDrawable)
	{
		mBGDrawable = commonBackgroundDrawable;
		super.setBackgroundDrawable(mBGDrawable);
	}

	@Override
	public void setBorderRadius(float radius, int position)
	{
		getBackGround().setBorderRadius(radius, position);
		if (mContentDrawable instanceof ContentDrawable)
		{
			((ContentDrawable) mContentDrawable).setBorder(mBGDrawable.getBorderRadiusArray(), mBGDrawable.getBorderWidthArray());
			invalidate();
		}
	}

	@Override
	public void setBorderWidth(float width, int position)
	{
		getBackGround().setBorderWidth(width, position);
		if (mContentDrawable instanceof ContentDrawable)
		{
			((ContentDrawable) mContentDrawable).setBorder(mBGDrawable.getBorderRadiusArray(), mBGDrawable.getBorderWidthArray());
			invalidate();
		}
	}

	@Override
	public void setBorderColor(int color, int position)
	{
		getBackGround().setBorderColor(color, position);
	}


	@Override
	public void setBorderStyle(int borderStyle)
	{
		getBackGround().setBorderStyle(borderStyle);
	}
	@Override
	public void setBackgroundColor(int color)
	{
		getBackGround().setBackgroundColor(color);
	}

	private BackgroundDrawable getBackGround()
	{
		if (mBGDrawable == null)
		{
			mBGDrawable = generateBackgroundDrawable();
			Drawable currBGDrawable = getBackground();
			super.setBackgroundDrawable(null);
			if (currBGDrawable == null)
			{
				super.setBackgroundDrawable(mBGDrawable);
			}
			else
			{
				LayerDrawable layerDrawable = new LayerDrawable(new Drawable[] { mBGDrawable, currBGDrawable });
				super.setBackgroundDrawable(layerDrawable);
			}
		}
		return mBGDrawable;
	}
}

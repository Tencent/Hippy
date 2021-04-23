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

import static com.tencent.mtt.supportui.views.asyncimage.AsyncImageView.SOURCE_TYPE_SRC;

import com.tencent.mtt.supportui.utils.CommonTool;

import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.drawable.Drawable;
import android.os.Build;
import com.tencent.mtt.supportui.views.asyncimage.AsyncImageView.ScaleType;

/**
 * Created by leonardgong on 2017/12/5 0005.
 */

public class ContentDrawable extends BaseDrawable
{

	protected Bitmap					mContentBitmap;

	protected Paint						mPaint;

	protected int						mTintColor;
	protected int						mAlpha;
	protected AsyncImageView.ScaleType	mScaleType;

	private float[]						mBorderWidthArray;
	private float[]						mBorderRadiusArray;

	private boolean						mNeedUpdateBorderPath;
	private Path						mBorderPath;
	private RectF						mTempRectForBorderRadius;

	private int							mImagePositionX;
	private int							mImagePositionY;
	public Path						    mSelfClipPath =  null;//自定义裁剪路径,这里按理应该设置位private,通过接口修改.鉴于981的改动风险,直接位public
	private int                         sourceType = SOURCE_TYPE_SRC;

	public ContentDrawable()
	{
		mScaleType = AsyncImageView.ScaleType.FIT_XY;
		mAlpha = 255;
		mNeedUpdateBorderPath = true;
	}

	@Override
	public void setBounds(int left, int top, int right, int bottom) {
		super.setBounds(left, top, right, bottom);
		updateContentRegion();
	}

	public void setSourceType(int type) {
		sourceType = type;
	}

	public int getSourceType() {
		return sourceType;
	}

	public void setBitmap(Bitmap contentBitmap)
	{
		mContentBitmap = contentBitmap;
	}

	public void setTintColor(int tintColor)
	{
		mTintColor = tintColor;
	}

	public void setScaleType(AsyncImageView.ScaleType scaleType)
	{
		if (scaleType != null)
		{
			mScaleType = scaleType;
		}
	}

	public void setBorder(float[] radiusArray, float[] widthArray)
	{
		mBorderWidthArray = widthArray;
		mBorderRadiusArray = radiusArray;
		mNeedUpdateBorderPath = true;
	}

	public void setImagePositionX(int positionX)
	{
		mImagePositionX = positionX;
	}

	public void setImagePositionY(int positionY)
	{
		mImagePositionY = positionY;
	}

	private void updatePath()
	{
		if (mNeedUpdateBorderPath && mContentBitmap != null)
		{
			if (mBorderPath == null)
			{
				mBorderPath = new Path();
			}
			mNeedUpdateBorderPath = false;
			if (mTempRectForBorderRadius == null)
			{
				mTempRectForBorderRadius = new RectF();
			}
			mTempRectForBorderRadius.set(mRect);
			// calc scale here
			int bitmapWidth = mContentBitmap.getWidth();
			int bitmapHeight = mContentBitmap.getHeight();
			float boundWidth = mRect.width();
			float boundHeight = mRect.height();
			float xScale = boundWidth / bitmapWidth;
			float yScale = boundHeight / bitmapHeight;

			ScaleType scaleType = mScaleType;
			if (scaleType == ScaleType.CENTER && (bitmapWidth > boundWidth || bitmapHeight > boundHeight)) {
				scaleType = ScaleType.CENTER_INSIDE;
			}

			// border rect
			switch (scaleType)
			{
				case REPEAT:
					// DO Nothing
					break;
				case FIT_XY:
					// 拉伸图片且不维持宽高比，直到宽高都刚好填满容器（默认）
					break;
				case ORIGIN:
					// 不拉伸，居左上
					mTempRectForBorderRadius.top = 0;
					mTempRectForBorderRadius.bottom = bitmapHeight;
					mTempRectForBorderRadius.left = 0;
					mTempRectForBorderRadius.right = bitmapWidth;
					break;
				case CENTER:
					// 居中不拉伸
					mTempRectForBorderRadius.top = (boundHeight - bitmapHeight) / 2;
					mTempRectForBorderRadius.bottom = (boundHeight + bitmapHeight) / 2;
					mTempRectForBorderRadius.left = (boundWidth - bitmapWidth) / 2;
					mTempRectForBorderRadius.right = (boundWidth + bitmapWidth) / 2;
					break;
				case CENTER_INSIDE:
					// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
					// 这样图片完全被包裹在容器中，容器中可能留有空白
//					if (xScale >= 1 || yScale >= 1)
					{
						if (xScale > yScale)
						{ // y到顶
							mTempRectForBorderRadius.top = 0;
							mTempRectForBorderRadius.bottom = boundHeight;
							mTempRectForBorderRadius.left = (int) ((boundWidth - bitmapWidth * yScale) / 2);
							mTempRectForBorderRadius.right = (int) ((boundWidth + bitmapWidth * yScale) / 2);
						}
						else
						{ // x到顶
							mTempRectForBorderRadius.top = (int) ((boundHeight - bitmapHeight * xScale) / 2);
							mTempRectForBorderRadius.bottom = (int) ((boundHeight + bitmapHeight * xScale) / 2);
							mTempRectForBorderRadius.left = 0;
							mTempRectForBorderRadius.right = boundWidth;
						}
					}
					break;
				case CENTER_CROP:
					// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
					// 这样图片完全覆盖甚至超出容器，容器中不留任何空白
					break;
			}

			mTempRectForBorderRadius.top += mImagePositionY;
			mTempRectForBorderRadius.bottom += mImagePositionY;
			mTempRectForBorderRadius.left += mImagePositionX;
			mTempRectForBorderRadius.right += mImagePositionX;

			float fullBorderWidth = mBorderWidthArray == null ? 0 : mBorderWidthArray[0];
			if (fullBorderWidth > 1)
			{
				mTempRectForBorderRadius.inset(fullBorderWidth * 0.5f, fullBorderWidth * 0.5f);
			}

			if (CommonTool.hasPositiveItem(mBorderRadiusArray))
			{

				float topLeftRadius = mBorderRadiusArray[1];
				if (topLeftRadius == 0 && mBorderRadiusArray[0] > 0)
				{
					topLeftRadius = mBorderRadiusArray[0];
				}
				float topRightRadius = mBorderRadiusArray[2];
				if (topRightRadius == 0 && mBorderRadiusArray[0] > 0)
				{
					topRightRadius = mBorderRadiusArray[0];
				}
				float bottomRightRadius = mBorderRadiusArray[3];
				if (bottomRightRadius == 0 && mBorderRadiusArray[0] > 0)
				{
					bottomRightRadius = mBorderRadiusArray[0];
				}
				float bottomLeftRadius = mBorderRadiusArray[4];
				if (bottomLeftRadius == 0 && mBorderRadiusArray[0] > 0)
				{
					bottomLeftRadius = mBorderRadiusArray[0];
				}

				mBorderPath.addRoundRect(mTempRectForBorderRadius, new float[] { topLeftRadius, topLeftRadius, topRightRadius, topRightRadius,
						bottomRightRadius, bottomRightRadius, bottomLeftRadius, bottomLeftRadius }, Path.Direction.CW);
			}
			else
			{
				// no border radius
				mBorderPath.addRect(mTempRectForBorderRadius, Path.Direction.CW);
			}
		}
	}

	@Override
	protected void onBoundsChange(Rect bounds)
	{
		super.onBoundsChange(bounds);
		mNeedUpdateBorderPath = true;
	}

	@Override
	public void draw(Canvas canvas)
	{
		if (mContentBitmap == null || mContentBitmap.isRecycled())
		{
			return;
		}
		if (mPaint == null)
		{
			mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
		}

		updateContentRegion();
		updatePath();
    
		if (mContentBitmap != null)
		{
			Matrix matrix = new Matrix();
			matrix.reset();
			RectF scaleDst = new RectF(mRect);

			float fullBorderWidth = this.mBorderWidthArray == null ? 0.0F : this.mBorderWidthArray[0];
			if (fullBorderWidth > 1.0F)
			{
				scaleDst.inset(fullBorderWidth * 0.5F, fullBorderWidth * 0.5F);
			}
			// calc scale here
			int bitmapWidth = mContentBitmap.getWidth();
			int bitmapHeight = mContentBitmap.getHeight();
			float boundWidth = mRect.width();
			float boundHeight = mRect.height();
			float xScale = boundWidth / bitmapWidth;
			float yScale = boundHeight / bitmapHeight;

			ScaleType scaleType = mScaleType;
			if (scaleType == ScaleType.CENTER && (bitmapWidth > boundWidth || bitmapHeight > boundHeight)) {
				scaleType = ScaleType.CENTER_INSIDE;
			}

			// bitmap scale rect
			switch (scaleType)
			{
				case REPEAT:
					//DO Nothing 使用Sharder的Repeat来实现
					break;
				case FIT_XY:
					// 拉伸图片且不维持宽高比，直到宽高都刚好填满容器（默认）
					break;
				case ORIGIN:
					// 不拉伸，居左上
					scaleDst.top = 0;
					scaleDst.bottom = bitmapHeight;
					scaleDst.left = 0;
					scaleDst.right = bitmapWidth;
					break;
				case CENTER:
					// 居中不拉伸
					scaleDst.top = (boundHeight - bitmapHeight) / 2;
					scaleDst.bottom = (boundHeight + bitmapHeight) / 2;
					scaleDst.left = (boundWidth - bitmapWidth) / 2;
					scaleDst.right = (boundWidth + bitmapWidth) / 2;
					break;
				case CENTER_INSIDE:
					// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
					// 这样图片完全被包裹在容器中，容器中可能留有空白
//					if (xScale >= 1 || yScale >= 1)
					{
						if (xScale > yScale)
						{ // y到顶
							scaleDst.top = 0;
							scaleDst.bottom = boundHeight;
							scaleDst.left = (int) ((boundWidth - bitmapWidth * yScale) / 2);
							scaleDst.right = (int) ((boundWidth + bitmapWidth * yScale) / 2);
						}
						else
						{ // x到顶
							scaleDst.top = (int) ((boundHeight - bitmapHeight * xScale) / 2);
							scaleDst.bottom = (int) ((boundHeight + bitmapHeight * xScale) / 2);
							scaleDst.left = 0;
							scaleDst.right = boundWidth;
						}
					}
					break;
				case CENTER_CROP:
					float cropScale = xScale > yScale ? xScale : yScale;
					scaleDst.top = (int) ((boundHeight - bitmapHeight * cropScale) / 2);
					scaleDst.bottom = (int) ((boundHeight + bitmapHeight * cropScale) / 2);
					scaleDst.left = (int) ((boundWidth - bitmapWidth * cropScale) / 2);
					scaleDst.right = (int) ((boundWidth + bitmapWidth * cropScale) / 2);
					// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
					// 这样图片完全覆盖甚至超出容器，容器中不留任何空白
					break;
			}

			scaleDst.top += mImagePositionY;
			scaleDst.bottom += mImagePositionY;
			scaleDst.left += mImagePositionX;
			scaleDst.right += mImagePositionX;

			matrix.setRectToRect(new RectF(0, 0, mContentBitmap.getWidth(), mContentBitmap.getHeight()), scaleDst, Matrix.ScaleToFit.FILL);

			mPaint.reset();
			mPaint.setAlpha(mAlpha);
			if (mTintColor != Color.TRANSPARENT)
			{
				mPaint.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
			}

			drawBitmap(canvas, matrix);
		}
	}

	protected void drawBitmap(Canvas canvas, Matrix matrix)
	{
		//用户自定义了裁剪路径
		if (mSelfClipPath != null )
		{
			try
			{
				canvas.clipPath(mSelfClipPath);
			}
			catch (Throwable t)
			{
				//mSelfClipPath前端设置进来的,为了避免异常,保护一下
			}

		}
        if(mScaleType == AsyncImageView.ScaleType.REPEAT)
        {
            BitmapShader bitmapShader = new BitmapShader(mContentBitmap, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT);
            mPaint.setShader(bitmapShader);
            // 进行绘制
            if (mBorderPath != null)
            {
                mPaint.setAntiAlias(true);
                canvas.drawPath(mBorderPath, mPaint);
            }
            return;
        }
        if (CommonTool.hasPositiveItem(mBorderRadiusArray) || Build.VERSION.SDK_INT < Build.VERSION_CODES.M)
        {
            // 有圆角
            BitmapShader bitmapShader = new BitmapShader(mContentBitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);
            // 根据控件大小对纹理图进行拉伸缩放处理
            bitmapShader.setLocalMatrix(matrix);
            mPaint.setShader(bitmapShader);

            // 进行绘制
            if (mBorderPath != null)
            {
                mPaint.setAntiAlias(true);
                canvas.drawPath(mBorderPath, mPaint);
            }
        }
        else
        {
            mPaint.setFilterBitmap(true);
            canvas.drawBitmap(mContentBitmap, matrix, mPaint);
        }
	}

	@Override
	public void setAlpha(int alpha)
	{
		mAlpha = alpha;
		invalidateSelf();
	}

	public int getAlphaValue()
	{
		return mAlpha;
	}

	@Override
	public void setColorFilter(ColorFilter colorFilter)
	{

	}

	@Override
	public int getOpacity()
	{
		return PixelFormat.UNKNOWN;
	}
}

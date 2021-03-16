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
package com.tencent.mtt.supportui.views.asyncimage;

import com.tencent.mtt.supportui.utils.CommonTool;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.os.Build;

/**
 * Created by leonardgong on 2017/11/30 0030.
 */

public class BackgroundDrawable extends BaseDrawable
{

	private float[]	mBorderWidthArray;
	private float[]	mBorderRadiusArray;
	private int[]	mBorderColorArray;
	private int		mBorderStyle = 0;
	private DashPathEffect mDashPathEffect = null;
	private DashPathEffect mDotPathEffect = new DashPathEffect(new float[] { 2, 2}, 0);
	private Path	mPathWithBorder;
	private final Paint	mPaint;
	private int		mBackgroundColor;
	private RectF	mTempRectForBorderRadius;
	private Path	mPathForBorderRadius;
	private boolean	mNeedUpdateBorderPath	= false;

	private final Paint mShadowPaint;
	protected float mShadowOpacity = 0.8f;
	protected int mShadowColor = Color.GRAY;
	protected RectF mShadowRect;

	/**
	 * solve drawPath problem on 4.x android
	 **/
	private Bitmap	mCanvasBitmap			= null;
	private Canvas	mBitmapCanvas			= null;
	private Paint	mBitmapPaint			= null;

	public BackgroundDrawable()
	{
		mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
		mShadowPaint = new Paint();
	}
  
  @Override
  public void setBounds(int left, int top, int right, int bottom)
  {
	  super.setBounds(left, top, right, bottom);
	  mShadowRect = new RectF(left + mShadowRadius - mShadowOffsetX, top + mShadowRadius - mShadowOffsetY, right - mShadowRadius - mShadowOffsetX,
			  bottom - mShadowRadius - mShadowOffsetY);
	  updateContentRegion();
  }

	@Override
	public void draw(Canvas canvas)
	{
		if (canvas.getWidth() == 0 || canvas.getHeight() == 0)
			return;
		boolean hasBorderRadius = CommonTool.hasPositiveItem(mBorderRadiusArray);
		float dotBorderWidth = 2;
//		if(mBorderRadiusArray !=null && mBorderRadiusArray.length > 1)
//			dotBorderWidth = mBorderRadiusArray[0];
		if(mBorderStyle == 1 && dotBorderWidth >0)
		{
			if(mDashPathEffect == null)
			{
				mDashPathEffect = new DashPathEffect(new float[] { 4*dotBorderWidth, 2*dotBorderWidth}, 0);
			}
			mPaint.setPathEffect(mDashPathEffect);
		}
		else if(mBorderStyle == 2 && dotBorderWidth > 0)
		{
			if(mDotPathEffect == null)
			{
				mDotPathEffect = new DashPathEffect(new float[] { 2*dotBorderWidth, 2*dotBorderWidth}, 0);
			}
			mPaint.setPathEffect(mDotPathEffect);
		}
		else
		{
			mPaint.setPathEffect(null);
		}


		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP && // 只在有需要绘制border的时候，才使用bitmap
				CommonTool.hasPositiveItem(mBorderWidthArray))
		{
			int canvasWidth = canvas.getWidth();
			int canvasHeight = canvas.getHeight();
			if (mCanvasBitmap == null)
			/** generate bitmap for temp canvas **/
			{
				try
				{
					mCanvasBitmap = generateBitmap(canvas.getWidth(), canvas.getHeight());
					/** draw on temp canvas **/
					mBitmapCanvas = new Canvas(mCanvasBitmap);
					mBitmapPaint = new Paint();
				}
				catch (OutOfMemoryError e)
				{
					return;
				}
				catch (NullPointerException e)
				{
					return;
				}
			}
			// 当canvas或者view大小发生改变时，重新设置bitmap和临时canvas
			if (canvasWidth != mCanvasBitmap.getWidth() || canvasHeight != mCanvasBitmap.getHeight())
			{
				try
				{
					mCanvasBitmap = generateBitmap(canvas.getWidth(), canvas.getHeight());
					/** draw on temp canvas **/
					mBitmapCanvas = new Canvas(mCanvasBitmap);
				}
				catch (OutOfMemoryError error)
				{
					return;
				}
				catch (NullPointerException e)
				{
					return;
				}
			}

			/** clear canvas first **/
			mBitmapCanvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR);

			drawBGShadow(mBitmapCanvas);
      
			if (!hasBorderRadius)
			{
				drawBG(mBitmapCanvas);
			}
			else
			{
				drawBGWithRadius(mBitmapCanvas);
			}
			/** save canvasBitmap to real canvas **/
			canvas.drawBitmap(mCanvasBitmap, 0, 0, mBitmapPaint);
		}
		else
		{
			drawBGShadow(canvas);
		  
			if (!hasBorderRadius)
			{
				drawBG(canvas);
			}
			else
			{
				drawBGWithRadius(canvas);
			}
		}
	}

	private void drawBGShadow (Canvas canvas)
	{
	  if (mShadowRadius == 0 || mShadowOpacity <= 0)
	  {
	    return;
	  }

	  int opacity = (mShadowOpacity >= 1) ? 255 : Math.round(255 * mShadowOpacity);

	  float borderRadius = 0.0f;
	  if (mBorderRadiusArray != null && mBorderRadiusArray.length > 0) {
		  for (int i = 0; i < mBorderRadiusArray.length; i++) {
			  if (mBorderRadiusArray[i] > borderRadius) {
				  borderRadius = mBorderRadiusArray[i];
			  }
		  }
	  }

	  mShadowPaint.setColor(Color.TRANSPARENT);
	  mShadowPaint.setAntiAlias(true);
	  mShadowPaint.setAlpha(opacity);
	  mShadowPaint.setShadowLayer(mShadowRadius, mShadowOffsetX, mShadowOffsetY, mShadowColor);
	  mShadowPaint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.DST_ATOP));
	  canvas.drawRoundRect(mShadowRect, borderRadius, borderRadius, mShadowPaint);
  }
	
	private void drawBGWithRadius(Canvas canvas)
	{
		// updateStyle border with radius path
		updatePath();

		// draw bg color
		if (mBackgroundColor != 0)
		{ // color is not transparent
			mPaint.setColor(mBackgroundColor);
			mPaint.setStyle(Paint.Style.FILL);
			canvas.drawPath(mPathForBorderRadius, mPaint);
		}

		// draw border
		//话圆角矩形必须四条边的宽度是一样的.
		if (CommonTool.hasPositiveItem(mBorderWidthArray) && mBorderWidthArray[0] > 0 && mBorderColorArray != null )
		{
			//qb上一般都是走这个分支
			if( mBorderColorArray[0] != 0 ||  //如果指定了四边的颜色
					(mBorderColorArray[1]==mBorderColorArray[2] //或者单独指定的四条边的颜色一样
							&&mBorderColorArray[2]==mBorderColorArray[3]
							&&mBorderColorArray[3]==mBorderColorArray[4]
					))
			{
				int borderColor = mBorderColorArray[0] ;
				if(mBorderColorArray[0] ==0)
					borderColor = mBorderColorArray[1];
				if(borderColor == 0) //没有颜色退出
					return;
				mPaint.setColor(borderColor);
				mPaint.setStyle(Paint.Style.STROKE);
				mPaint.setStrokeWidth(mBorderWidthArray[0]);
				canvas.drawPath(mPathForBorderRadius, mPaint);
			}
			else
			{
				drawBGWithRadiusWithSingleColor(canvas);//四个颜色不一样,那么每边单独画
			}

		}
	}
	private void drawBGWithRadiusWithSingleColor(Canvas canvas)
	{
		// draw border
		if (CommonTool.hasPositiveItem(mBorderWidthArray))
		{
			RectF bounds = mRect;

			int border = Math.round( mBorderWidthArray[0]); //一定大于-0

			int colorLeft = mBorderColorArray == null ? 0 : mBorderColorArray[1];
			if (colorLeft == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorLeft = mBorderColorArray[0];
			}
			int colorTop = mBorderColorArray == null ? 0 : mBorderColorArray[2];
			if (colorTop == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorTop = mBorderColorArray[0];
			}
			int colorRight = mBorderColorArray == null ? 0 : mBorderColorArray[3];
			if (colorRight == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorRight = mBorderColorArray[0];
			}
			int colorBottom = mBorderColorArray == null ? 0 : mBorderColorArray[4];
			if (colorBottom == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorBottom = mBorderColorArray[0];
			}


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

			float top = bounds.top;
			float left = bounds.left;
			float bottom = bounds.bottom;
			float  right = bounds.right;
			float width = bounds.width();
			float height = bounds.height();

			mPaint.setAntiAlias(false);
			mPaint.setStrokeWidth(border);

			mPaint.setStyle(Paint.Style.STROKE);
			if (mPathWithBorder == null)
			{
				mPathWithBorder = new Path();
			}
			int scaleLength = border/2;

			if (colorLeft != Color.TRANSPARENT) {
				mPaint.setColor(colorLeft);
				mPathWithBorder.reset();

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    //直线
                    mPathWithBorder.moveTo(left+scaleLength, top + topLeftRadius);
                    mPathWithBorder.lineTo(left+scaleLength, bottom - bottomLeftRadius);
					//左上角圆圈
					mPathWithBorder.addArc(
							(float) left+scaleLength,
							(float) top+scaleLength,
							(float) left + 2 * topLeftRadius-scaleLength,
							(float) top + 2 * topLeftRadius-scaleLength,
							(float) -180,
							(float) 45);

					//右下圆圈
					mPathWithBorder.addArc(
							(float) left+scaleLength,
							(float) bottom - 2 * bottomLeftRadius+scaleLength,
							(float) left + 2 * bottomLeftRadius-scaleLength,
							(float) bottom-scaleLength,
							(float) 135,
							(float) 45);
				}
				else
                {
                    //直线
                    mPathWithBorder.moveTo(left+scaleLength, top );
                    mPathWithBorder.lineTo(left+scaleLength, bottom);
                }
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			if ( colorTop != Color.TRANSPARENT)
			{
				mPaint.setColor(colorTop);
				mPathWithBorder.reset();

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    //直线
                    mPathWithBorder.moveTo(left+topLeftRadius, top+ scaleLength);
                    mPathWithBorder.lineTo(right-topRightRadius, top +scaleLength );
					//左上角圆圈
					mPathWithBorder.addArc(
							(float) left+scaleLength,
							(float) top+scaleLength,
							(float) left + 2 * topLeftRadius-scaleLength,
							(float) top + 2 * topLeftRadius-scaleLength,
							(float) -135,
							(float) 45);

					//右上圆
					mPathWithBorder.addArc(
							(float) right-2*topRightRadius+scaleLength,
							(float) top  +scaleLength,
							(float) right - scaleLength,
							(float) top+2*topRightRadius-scaleLength,
							(float) -90,
							(float) 45);
				}
				else
                {
                    //直线
                    mPathWithBorder.moveTo(left, top+ scaleLength);
                    mPathWithBorder.lineTo(right, top +scaleLength );
                }
                canvas.drawPath(mPathWithBorder, mPaint);
			}

			if (colorRight != Color.TRANSPARENT)
			{
				mPaint.setColor(colorRight);
				mPathWithBorder.reset();

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    //直线
                    mPathWithBorder.moveTo(right-scaleLength, top +topRightRadius);
                    mPathWithBorder.lineTo(right-scaleLength, bottom-bottomRightRadius );
					//右下
					mPathWithBorder.addArc(
							(float) right - 2*bottomRightRadius +scaleLength,
							(float) bottom-2*bottomRightRadius +scaleLength,
							(float) right-scaleLength,
							(float) bottom -scaleLength,
							(float) -0,
							(float) 45);

					//右上圆
					mPathWithBorder.addArc(
							(float) right-2*topRightRadius+scaleLength,
							(float) top+scaleLength,
							(float) right-scaleLength,
							(float) top+2*topRightRadius-scaleLength,
							(float) -45,
							(float) 45);
				}
				else
                {
                    mPathWithBorder.moveTo(right-scaleLength, top );
                    mPathWithBorder.lineTo(right-scaleLength, bottom );
                }
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			if ( colorBottom != Color.TRANSPARENT) {
                mPaint.setColor(colorBottom);
                mPathWithBorder.reset();

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    //直线
                    mPathWithBorder.moveTo(left + bottomLeftRadius, bottom - scaleLength);
                    mPathWithBorder.lineTo(right - bottomRightRadius, bottom - scaleLength);
                    //右下
                    mPathWithBorder.addArc(
                            (float) right - 2 * bottomRightRadius + scaleLength,
                            (float) bottom - 2 * bottomRightRadius + scaleLength,
                            (float) right - scaleLength,
                            (float) bottom - scaleLength,
                            (float) 45,
                            (float) 45);
                    //左下
                    mPathWithBorder.addArc(
                            (float) left + scaleLength,
                            (float) bottom - 2 * bottomLeftRadius + scaleLength,
                            (float) left + 2 * bottomLeftRadius - scaleLength,
                            (float) bottom - scaleLength,
                            (float) 90,
                            (float) 45);

                } else
                {
                    //直线
                    mPathWithBorder.moveTo(left, bottom-scaleLength);
                    mPathWithBorder.lineTo(right, bottom -scaleLength);
                }
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			mPaint.setAntiAlias(true);
		}
	}
	private void drawBG(Canvas canvas)
	{
		// draw bg color first
		if (mBackgroundColor != 0)
		{ // color is not transparent
			mPaint.setColor(mBackgroundColor);
			mPaint.setStyle(Paint.Style.FILL);
			canvas.drawRect(mRect, mPaint);
		}

		// draw border
		if (CommonTool.hasPositiveItem(mBorderWidthArray))
		{
			RectF bounds = mRect;

			int borderLeft = Math.round(mBorderWidthArray[1]);
			if (borderLeft == 0 && mBorderWidthArray[0] > 0)
			{
				borderLeft = Math.round(mBorderWidthArray[0]);
			}
			int borderTop = Math.round(mBorderWidthArray[2]);
			if (borderTop == 0 && mBorderWidthArray[0] > 0)
			{
				borderTop = Math.round(mBorderWidthArray[0]);
			}
			int borderRight = Math.round(mBorderWidthArray[3]);
			if (borderRight == 0 && mBorderWidthArray[0] > 0)
			{
				borderRight = Math.round(mBorderWidthArray[0]);
			}
			int borderBottom = Math.round(mBorderWidthArray[4]);
			if (borderBottom == 0 && mBorderWidthArray[0] > 0)
			{
				borderBottom = Math.round(mBorderWidthArray[0]);
			}
			int colorLeft = mBorderColorArray == null ? 0 : mBorderColorArray[1];
			if (colorLeft == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorLeft = mBorderColorArray[0];
			}
			int colorTop = mBorderColorArray == null ? 0 : mBorderColorArray[2];
			if (colorTop == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorTop = mBorderColorArray[0];
			}
			int colorRight = mBorderColorArray == null ? 0 : mBorderColorArray[3];
			if (colorRight == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorRight = mBorderColorArray[0];
			}
			int colorBottom = mBorderColorArray == null ? 0 : mBorderColorArray[4];
			if (colorBottom == 0 && mBorderColorArray != null && mBorderColorArray[0] != 0)
			{
				colorBottom = mBorderColorArray[0];
			}

			float top = bounds.top;
			float left = bounds.left;
			float width = bounds.width();
			float height = bounds.height();

			mPaint.setAntiAlias(false);

			if (mPathWithBorder == null)
			{
				mPathWithBorder = new Path();
			}

			if (borderLeft > 0 && colorLeft != Color.TRANSPARENT)
			{
				mPaint.setColor(colorLeft);
				mPathWithBorder.reset();
				mPathWithBorder.moveTo(left, top);
				mPathWithBorder.lineTo(left + borderLeft, top + borderTop);
				mPathWithBorder.lineTo(left + borderLeft, top + height - borderBottom);
				mPathWithBorder.lineTo(left, top + height);
				mPathWithBorder.lineTo(left, top);
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			if (borderTop > 0 && colorTop != Color.TRANSPARENT)
			{
				mPaint.setColor(colorTop);
				mPathWithBorder.reset();
				mPathWithBorder.moveTo(left, top);
				mPathWithBorder.lineTo(left + borderLeft, top + borderTop);
				mPathWithBorder.lineTo(left + width - borderRight, top + borderTop);
				mPathWithBorder.lineTo(left + width, top);
				mPathWithBorder.lineTo(left, top);
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			if (borderRight > 0 && colorRight != Color.TRANSPARENT)
			{
				mPaint.setColor(colorRight);
				mPathWithBorder.reset();
				mPathWithBorder.moveTo(left + width, top);
				mPathWithBorder.lineTo(left + width, top + height);
				mPathWithBorder.lineTo(left + width - borderRight, top + height - borderBottom);
				mPathWithBorder.lineTo(left + width - borderRight, top + borderTop);
				mPathWithBorder.lineTo(left + width, top);
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			if (borderBottom > 0 && colorBottom != Color.TRANSPARENT)
			{
				mPaint.setColor(colorBottom);
				mPathWithBorder.reset();
				mPathWithBorder.moveTo(left, top + height);
				mPathWithBorder.lineTo(left + width, top + height);
				mPathWithBorder.lineTo(left + width - borderRight, top + height - borderBottom);
				mPathWithBorder.lineTo(left + borderLeft, top + height - borderBottom);
				mPathWithBorder.lineTo(left, top + height);
				canvas.drawPath(mPathWithBorder, mPaint);
			}

			mPaint.setAntiAlias(true);
		}
	}

	public Bitmap generateBitmap(int width, int height) {
		return Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
	}

	private void updatePath()
	{
		if (!mNeedUpdateBorderPath)
		{
			return;
		}
		mNeedUpdateBorderPath = false;
		if (mPathForBorderRadius == null)
		{
			mPathForBorderRadius = new Path();
			mTempRectForBorderRadius = new RectF();
		}

		mPathForBorderRadius.reset();

		mTempRectForBorderRadius.set(mRect);
		float fullBorderWidth = mBorderWidthArray == null ? 0 : mBorderWidthArray[0];
		if (fullBorderWidth > 1)
		{
			mTempRectForBorderRadius.inset(fullBorderWidth * 0.5f, fullBorderWidth * 0.5f);
		}

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

		mPathForBorderRadius.addRoundRect(mTempRectForBorderRadius, new float[] { topLeftRadius, topLeftRadius, topRightRadius, topRightRadius,
				bottomRightRadius, bottomRightRadius, bottomLeftRadius, bottomLeftRadius }, Path.Direction.CW);
	}

	@Override
	public void setAlpha(int alpha)
	{

	}

	@Override
	protected void onBoundsChange(Rect bounds)
	{
		super.onBoundsChange(bounds);
		mNeedUpdateBorderPath = true;
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

	public void setBorderRadius(float radius, int position)
	{
		if (mBorderRadiusArray == null)
		{
			mBorderRadiusArray = new float[5];
		}
		mBorderRadiusArray[position] = radius;

		mNeedUpdateBorderPath = true;
		invalidateSelf();
	}

	public void setBorderWidth(float width, int position)
	{
		if (mBorderWidthArray == null)
		{
			mBorderWidthArray = new float[5];
		}
		mBorderWidthArray[position] = width;

		mNeedUpdateBorderPath = true;
		invalidateSelf();
	}

	public void setBorderColor(int color, int position)
	{
		if (mBorderColorArray == null)
		{
			mBorderColorArray = new int[5];
		}
		mBorderColorArray[position] = color;

		invalidateSelf();
	}
	// 0 solid,1 dashed,2 dotted
	public void setBorderStyle(int borderStyle)
	{
		if(borderStyle < 0 || borderStyle > 2)
			mBorderStyle = 0;
		else
			mBorderStyle = borderStyle;

		invalidateSelf();
	}


	public void setBackgroundColor(int color)
	{
		mBackgroundColor = color;
		invalidateSelf();
	}

	public float[] getBorderWidthArray()
	{
		return mBorderWidthArray;
	}

	public float[] getBorderRadiusArray()
	{
		return mBorderRadiusArray;
	}
	public float getShadowOffsetX()
	{
	  return mShadowOffsetX;
	}

	public float getShadowOffsetY()
	{
		return mShadowOffsetY;
	}

	public float getShadowRadius()
	{
		return mShadowRadius;
	}

	public void setShadowOpacity(float opacity)
	{
		mShadowOpacity = opacity;
		invalidateSelf();
	}

	public void setShadowColor(int color)
	{
		mShadowColor = color;
		invalidateSelf();
	}
}

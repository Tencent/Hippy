package com.tencent.mtt.hippy.adapter.image;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.supportui.adapters.image.IDrawableTarget;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageDecoder;
import android.graphics.Movie;
import android.util.Base64;



/**
 * Created by harryguo.
 */

public class HippyDrawable implements IDrawableTarget
{
	// 原始数据的来源：base64 / assets / file
	protected String mSource;

	// GIF动画
	private Movie mGifMovie;

	// 静态图片
	private Bitmap mBitmap;

	/**
	 * 设置原始数据。预期这个原始数据是GIF，或Bitmap的原始数据
	 * @param rawData byte array raw data
	 */
	public void setData(byte[] rawData)
	{
		mGifMovie = Movie.decodeByteArray(rawData, 0, rawData.length);
		if (mGifMovie == null)
			mBitmap = BitmapFactory.decodeByteArray(rawData, 0, rawData.length);
		else
			mBitmap = null;
	}

	/**
	 * 设置原始数据。预期这个原始数据是GIF，或Bitmap的原始数据
	 * @param rawData ByteBuffer buffered array raw data
	 */
//	public void setData(ByteBuffer rawData)
//	{
//		setData(new ByteBufferInputStream(rawData));
//	}

	/**
	 * 设置原始数据的文件地址。预期这个原始数据是GIF，或Bitmap的原始数据
	 * @param path file path of the image
	 */
	public void setData(File path)
	{
		FileInputStream is = null;
		try {
			is = new FileInputStream(path);
			byte[] rawData = new byte[is.available()];
			is.read(rawData);
			setData(rawData);
		} catch (Exception e) {
			e.printStackTrace();
		}
		finally {
			if (is != null) {
				try {
					is.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

	public void setData(File path, boolean isGif)
	{
		FileInputStream is = null;
		try {
			is = new FileInputStream(path);
			if (isGif) {
				mGifMovie = Movie.decodeStream(is);
				mBitmap = null;
			} else {
				mBitmap = BitmapFactory.decodeStream(is);
				mGifMovie = null;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		finally {
			if (is != null) {
				try {
					is.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

	public void setDataForTarge28Assets(String assetsFile)
	{
		ImageDecoder.Source source = null;
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P)
		{
			try
			{
				source = ImageDecoder.createSource(ContextHolder.getAppContext().getAssets(), assetsFile.substring("assets://".length()));
				mBitmap = ImageDecoder.decodeBitmap(source);
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}
	}

	/**
	 * 设置图片数据。Bitmap
	 * @param bmp Bitmap
	 */
	public void setData(Bitmap bmp)
	{
		mBitmap = bmp;
		mGifMovie = null;
	}

	/**
	 * 设置原始数据来源。
	 * @param source 不是原始数据，而是原始数据的来源：base64 / assets / file
	 */
	public void setData(String source)
	{
		mSource = source;
		if (mSource.startsWith("data:"))
		{
			try {
			// base64 image
			int base64Index = mSource.indexOf(";base64,");
			if (base64Index >= 0)
			{
				base64Index += ";base64,".length();
				String base64String = mSource.substring(base64Index);
				byte[] decode = Base64.decode(base64String, Base64.DEFAULT);
				if (decode != null)
					setData(decode);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		else if (mSource.startsWith("file://"))
		{
			// local file image
			String filePath = mSource.substring("file://".length());
			setData(new File(filePath));
		}
		else if (mSource.startsWith("assets://"))
		{
			InputStream is = null;
			try {
				if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
					setDataForTarge28Assets(mSource);
				}
				else
				{
					is = ContextHolder.getAppContext().getAssets().open(mSource.substring("assets://".length()));
					byte[] rawData = new byte[is.available()];
					is.read(rawData);
					setData(rawData);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			finally {
				if (is != null) {
					try {
						is.close();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}
		}
	}

	/**
	 * 获取GIF数据
	 */
	public Movie getGIF()
	{
		return mGifMovie;
	}

	/**
	 * 是否是动画图片
	 */
	public boolean isAnimated()
	{
		return mGifMovie != null;
	}

	/**
	 * 获取Bitmap
	 */
	@Override
	public Bitmap getBitmap()
	{
		return mBitmap;
	}

//	public void draw(Canvas canvas)
//	{
//	}

//	public boolean isSelfDraw()
//	{
//		return false;
//	}

	/**
	 * 实现空的interface 获取数据源
	 */
	@Override
	public String getSource()
	{
		return mSource;
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

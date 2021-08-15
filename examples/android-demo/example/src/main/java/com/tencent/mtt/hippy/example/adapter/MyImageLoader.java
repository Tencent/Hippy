package com.tencent.mtt.hippy.example.adapter;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.GlideBitmapDrawable;
import com.bumptech.glide.load.resource.gif.GifDrawable;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.image.HippyImageView;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

@SuppressWarnings({"unused", "deprecation"})
public class MyImageLoader extends HippyImageLoader
{
	private Timer mTimer = new Timer("MyImageLoader", true);
	private Handler mHandler = new Handler(Looper.getMainLooper());
	private Context myContext;

	public MyImageLoader(Context context) {
		myContext = context;
	}

	@Override
	public void destroyIfNeed() {
		mHandler = null;
		mTimer = null;
		myContext = null;
	}

	@SuppressWarnings({"UnusedAssignment", "rawtypes"})
	private void runFetchImageOnMianThread(final String url, final Callback requestCallback, final Object paramsObj) {
		Object propsObj;
		if (paramsObj instanceof Map) {
			//noinspection rawtypes
			propsObj = ((Map)paramsObj).get(HippyImageView.IMAGE_PROPS);
		} else {
			propsObj = paramsObj;
		}

		HippyMap props = (propsObj instanceof HippyMap) ? (HippyMap)propsObj : new HippyMap();

		int width = 0;
		int height = 0;
		int repeatCount;
		boolean isGif;
		String resizeMode = "";
		String imageType = "";

		if (props.containsKey(NodeProps.STYLE)) {
			HippyMap styles = props.getMap(NodeProps.STYLE);
			if (styles != null) {
				width = Math.round(PixelUtil.dp2px(styles.getDouble(NodeProps.WIDTH)));
				height = Math.round(PixelUtil.dp2px(styles.getDouble(NodeProps.HEIGHT)));
				resizeMode = styles.getString(NodeProps.RESIZE_MODE);
			}
		}

		imageType = props.getString(NodeProps.CUSTOM_PROP_IMAGE_TYPE);
		repeatCount = props.getInt(NodeProps.REPEAT_COUNT);
		isGif = props.getBoolean(NodeProps.CUSTOM_PROP_ISGIF);

		//noinspection unchecked
		Glide.with(myContext).load(url).into(new SimpleTarget() {
			@Override
			public void onResourceReady(final Object object, GlideAnimation glideAnimation) {
				final HippyDrawable hippyTarget = new HippyDrawable();
				if (object instanceof GifDrawable)
				{
					mTimer.schedule(new TimerTask()
					{
						@Override
						public void run() {
							// 这里setData会解码，耗时，所以在子线程做
							hippyTarget.setData(((GifDrawable) object).getData());
							mHandler.post(new Runnable() {
								@Override
								public void run() {
									requestCallback.onRequestSuccess(hippyTarget);
								}
							});
						}
					}, 0);
				}
				else if (object instanceof GlideBitmapDrawable)
				{
					mTimer.schedule(new TimerTask()
					{
						@Override
						public void run() {
							// 这里setData会解码，耗时，所以在子线程做
							hippyTarget.setData(((GlideBitmapDrawable) object).getBitmap());
							mHandler.post(new Runnable() {
								@Override
								public void run() {
									requestCallback.onRequestSuccess(hippyTarget);
								}
							});
						}
					}, 0);
				}
			}

			@Override
			public void onLoadFailed(Exception e, Drawable errorDrawable) {
				requestCallback.onRequestFail(e, null);
			}
		});
	}

	// 网络图片加载，异步加载
	@Override
	public void fetchImage(final String url, final Callback requestCallback, final Object paramsObj) {
		Looper looper = Looper.myLooper();
		if (looper == Looper.getMainLooper()) {
			runFetchImageOnMianThread(url, requestCallback, paramsObj);
		} else {
			Handler mainHandler = new Handler(Looper.getMainLooper());
			Runnable task = new Runnable() {
				@Override
				public void run() {
					runFetchImageOnMianThread(url, requestCallback, paramsObj);
				}
			};
			mainHandler.post(task);
		}
	}
}

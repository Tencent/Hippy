package com.tencent.mtt.hippy.example.adapter;

import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;

//import com.bumptech.glide.Glide;
//import com.bumptech.glide.load.resource.bitmap.GlideBitmapDrawable;
//import com.bumptech.glide.load.resource.gif.GifDrawable;
//import com.bumptech.glide.request.animation.GlideAnimation;
//import com.bumptech.glide.request.target.SimpleTarget;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.utils.ContextHolder;

import java.util.Timer;
import java.util.TimerTask;

/**
 * Copyright (C) 2015-2025 TENCENT Inc.All Rights Reserved.
 * FileName: MyImageLoader
 * Description：
 * History：
 * 1.0 xiandongluo on 2017/12/5
 * 2.0 harryguo on 2019/4/26
 */
public class MyImageLoader extends HippyImageLoader
{
	private Timer mTimer = new Timer("MyImageLoader", true);
	private Handler mHandler = new Handler(Looper.getMainLooper());
  
  @Override
  public void destroyIfNeed(){
    mHandler = null;
    mTimer = null;
  }
	
	// 网络图片加载，异步加载
	@Override
	public void fetchImage(final String url, final Callback requestCallback, Object param)
	{
//		Glide.with(ContextHolder.getAppContext()).load(url).into(new SimpleTarget() {
//			@Override
//			public void onResourceReady(final Object object, GlideAnimation glideAnimation) {
//				final HippyDrawable hippyTarget = new HippyDrawable();
//				if (object instanceof GifDrawable)
//				{
//					mTimer.schedule(new TimerTask()
//					{
//						@Override
//						public void run() {
//							// 这里setData会解码，耗时，所以在子线程做
//							hippyTarget.setData(((GifDrawable) object).getData());
//							mHandler.post(new Runnable() {
//								@Override
//								public void run() {
//									requestCallback.onRequestSuccess(hippyTarget);
//								}
//							});
//						}
//					}, 0);
//				}
//				else if (object instanceof GlideBitmapDrawable)
//				{
//					mTimer.schedule(new TimerTask()
//					{
//						@Override
//						public void run() {
//							// 这里setData会解码，耗时，所以在子线程做
//							hippyTarget.setData(((GlideBitmapDrawable) object).getBitmap());
//							mHandler.post(new Runnable() {
//								@Override
//								public void run() {
//									requestCallback.onRequestSuccess(hippyTarget);
//								}
//							});
//						}
//					}, 0);
//				}
//			}
//
//			@Override
//			public void onLoadFailed(Exception e, Drawable errorDrawable) {
//				requestCallback.onRequestFail(e, null);
//			}
//		});
	}
}

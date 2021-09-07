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
package com.tencent.mtt.hippy.adapter.image;

import android.graphics.Bitmap;
import android.util.SparseArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;
import com.tencent.mtt.supportui.adapters.image.IImageRequestListener;

import java.lang.ref.WeakReference;
/**
 * Created by leonardgong on 2017/12/4 0004.
 * modified by harryguo 2019/3/27
 */

public abstract class HippyImageLoader implements IImageLoaderAdapter<HippyImageLoader.Callback>
{
	private SparseArray<WeakReference<HippyDrawable>> mWeakImageCache = new SparseArray<>();
	// 本地图片加载，同步获取
	@Override
	public HippyDrawable getImage(String source, Object param)
	{
        //base64图片和APK内置图片增加弱引用缓存，避免每次在主线程加载和解码图片
		boolean canCacheImage = source.startsWith("data:") || source.startsWith("assets://");
		int imageCacheCode = source.hashCode();
		if (canCacheImage)
		{
			WeakReference<HippyDrawable> weakReferenceHippyDrawable = mWeakImageCache.get(imageCacheCode);
			if (weakReferenceHippyDrawable != null)
			{
				HippyDrawable hippyDrawable = weakReferenceHippyDrawable.get();
				if (hippyDrawable == null)
					mWeakImageCache.delete(imageCacheCode);
				else
					return hippyDrawable;
			}
		}
		HippyDrawable drawable = new HippyDrawable();
		drawable.setData(source);
		if (canCacheImage)
		{
			mWeakImageCache.put(imageCacheCode, new WeakReference<>(drawable));
		}
		return drawable;
	}

    public void getSize(final String url, final Promise promise) {
        fetchImage(url, new HippyImageLoader.Callback() {
            @Override
            public void onRequestStart(HippyDrawable hippyDrawable) {
            }

            @Override
            public void onRequestSuccess(HippyDrawable hippyDrawable) {
                if (hippyDrawable != null) {
                    Bitmap bitmap = hippyDrawable.getBitmap();
                    HippyMap resultMap = new HippyMap();
                    resultMap.pushInt("width", bitmap != null ? bitmap.getWidth() : hippyDrawable.getWidth());
                    resultMap.pushInt("height", bitmap != null ? bitmap.getHeight() : hippyDrawable.getHeight());
                    promise.resolve(resultMap);
                    hippyDrawable.onDrawableDetached();
                } else {
                    promise.reject("fetch image fail " + url);
                }
            }

            @Override
            public void onRequestFail(Throwable throwable, String source) {
                promise.reject("fetch image fail " + source);
            }
        }, null);
    }

	public void destroyIfNeed(){
    }
	/**
	 * Created by leonardgong on 2017/12/4 0004.
	 */

	public static interface Callback extends IImageRequestListener<HippyDrawable>
	{
	}
}

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

package com.tencent.mtt.hippy.example.adapter;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.GlideBitmapDrawable;
import com.bumptech.glide.load.resource.gif.GifDrawable;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.image.HippyImageView;
import com.tencent.renderer.component.image.ImageDataHolder;
import com.tencent.renderer.component.image.ImageLoader;

import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings({"unused", "deprecation"})
public class MyImageLoader extends ImageLoader {

    private Timer mTimer = new Timer("MyImageLoader", true);
    private Handler mHandler = new Handler(Looper.getMainLooper());
    private Context myContext;
    private HashMap<String, Long> monitor = new HashMap<>();

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
    private void runFetchImageOnMianThread(final String url, final ImageRequestListener requestCallback,
            final Object paramsObj) {
        Object propsObj;
        if (paramsObj instanceof Map) {
            //noinspection rawtypes
            propsObj = ((Map) paramsObj).get("props");
        } else {
            propsObj = paramsObj;
        }

        HippyMap props = (propsObj instanceof HippyMap) ? (HippyMap) propsObj : new HippyMap();

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
                final ImageDataHolder supplier = new ImageDataHolder(url);
                if (object instanceof GifDrawable) {
                    mTimer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            // 这里setData会解码，耗时，所以在子线程做
							supplier.setData(((GifDrawable) object).getData());
                            mHandler.post(new Runnable() {
                                @Override
                                public void run() {
                                    requestCallback.onRequestSuccess(supplier);
                                }
                            });
                        }
                    }, 0);
                } else if (object instanceof GlideBitmapDrawable) {
                    supplier.setData(((GlideBitmapDrawable) object).getBitmap());
                    requestCallback.onRequestSuccess(supplier);
                }
            }

            @Override
            public void onLoadFailed(Exception e, Drawable errorDrawable) {
                requestCallback.onRequestFail(null);
            }
        });
    }

    // 网络图片加载，异步加载
    @Override
    public void fetchImage(@NonNull final String url, @NonNull final ImageRequestListener requestCallback,
            final Object paramsObj) {
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

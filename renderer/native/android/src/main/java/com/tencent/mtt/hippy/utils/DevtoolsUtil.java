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
package com.tencent.mtt.hippy.utils;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.view.PixelCopy;
import android.view.PixelCopy.OnPixelCopyFinishedListener;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.ViewTreeObserver.OnDrawListener;
import android.view.Window;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.MapUtils;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * devtools utils for screen shot
 */
public class DevtoolsUtil {

    public static final String GET_SCREEN_SHOT = "getScreenShot";
    public static final String ADD_FRAME_CALLBACK = "addFrameCallback";
    public static final String REMOVE_FRAME_CALLBACK = "removeFrameCallback";
    public static final String GET_LOCATION_IN_SCREEN = "getLocationOnScreen";
    private static final String TAG = "tdf_DevtoolsUtil";
    private static final String SCREEN_SHOT = "screenShot";
    private static final String SCREEN_WIDTH = "width";
    private static final String SCREEN_HEIGHT = "height";
    private static final String VIEW_WIDTH = "viewWidth";
    private static final String VIEW_HEIGHT = "viewHeight";
    private static final String SCREEN_SCALE = "screenScale";
    private static final String FRAME_CALLBACK_ID = "frameCallbackId";
    private static final String X_ON_SCREEN = "xOnScreen";
    private static final String Y_ON_SCREEN = "yOnScreen";
    private static final String MAX_WIDTH = "maxWidth";
    private static final String MAX_HEIGHT = "maxHeight";
    private static final float DEFAULT_SCALE = 0.4f;
    private static final int DEFAULT_QUALITY = 80;
    private final static HashMap<Integer, ViewTreeObserver.OnDrawListener> sDrawListeners = new HashMap<>();
    private static WeakReference<Bitmap> sCacheBitmapRef;

    public static void dispatchDevtoolsFunction(@NonNull View view, @NonNull String functionName, @NonNull HippyArray paramsMap,
            @NonNull Promise promise) {
        List params = paramsMap.getInternalArray();
        dispatchDevtoolsFunction(view, functionName, params, promise);
    }
    public static void dispatchDevtoolsFunction(@NonNull View view, @NonNull String functionName, @NonNull List params,
            @NonNull Promise promise) {
        switch (functionName) {
            case DevtoolsUtil.GET_SCREEN_SHOT:
                DevtoolsUtil.getScreenShot(params, view, promise);
                break;
            case DevtoolsUtil.ADD_FRAME_CALLBACK:
                DevtoolsUtil.addFrameCallback(params, view, promise);
                break;
            case DevtoolsUtil.REMOVE_FRAME_CALLBACK:
                DevtoolsUtil.removeFrameCallback(params, view, promise);
                break;
            case DevtoolsUtil.GET_LOCATION_IN_SCREEN:
                DevtoolsUtil.getLocationOnScreen(view, promise);
                break;
            default:
                break;
        }
    }

    private static void getLocationOnScreen(@NonNull View view, @NonNull Promise promise) {
        int[] viewLocation = new int[2];
        view.getLocationOnScreen(viewLocation);
        NativeRender renderer = NativeRendererManager.getNativeRenderer(view.getContext());
        View rootView = renderer == null ? null : renderer.getRootView(view);
        if (rootView != null) {
            int[] rootLocation = new int[2];
            rootView.getLocationOnScreen(rootLocation);
            viewLocation[0] -= rootLocation[0];
            viewLocation[1] -= rootLocation[1];
        }
        HippyMap resultMap = new HippyMap();
        resultMap.pushInt(X_ON_SCREEN, viewLocation[0]);
        resultMap.pushInt(Y_ON_SCREEN, viewLocation[1]);
        resultMap.pushInt(VIEW_WIDTH, view.getWidth());
        resultMap.pushInt(VIEW_HEIGHT, view.getHeight());
        promise.resolve(resultMap);
    }

    public static void addFrameCallback(@NonNull List params, @NonNull View view, @NonNull final Promise promise) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
        if (nativeRenderer == null) {
            return;
        }
        View rootView = nativeRenderer.getRootView(view);
        if (rootView == null) {
            return;
        }
        if (params.isEmpty()) {
            return;
        }
        Object paramMap = params.get(0);
        if (!(paramMap instanceof HashMap)) {  // instanceof can't check for (HashMap<String, Object>)
            return;
        }
        HashMap<String, Object> hashMap = (HashMap<String, Object>) paramMap;
        Object callbackId = hashMap.get(FRAME_CALLBACK_ID);
        if (!(callbackId instanceof Integer)) {
            return;
        }
        ViewTreeObserver.OnDrawListener drawListener = new OnDrawListener() {
            @Override
            public void onDraw() {
                promise.resolve(new HippyMap());
            }
        };
        sDrawListeners.put((Integer) callbackId, drawListener);
        rootView.getViewTreeObserver().addOnDrawListener(drawListener);
    }

    public static void removeFrameCallback(@NonNull List params, @NonNull View view, @NonNull Promise promise) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
        if (nativeRenderer == null) {
            return;
        }
        View rootView = nativeRenderer.getRootView(view);
        if (rootView == null) {
            return;
        }
        if (params.isEmpty()) {
            return;
        }
        Object paramMap = params.get(0);
        if (!(paramMap instanceof HashMap)) {  // instanceof can't check for (HashMap<String, Object>)
            return;
        }
        HashMap<String, Object> hashMap = (HashMap<String, Object>) paramMap;
        Object callbackId = hashMap.get(FRAME_CALLBACK_ID);
        if (!(callbackId instanceof Integer)) {
            return;
        }
        ViewTreeObserver.OnDrawListener drawListener = sDrawListeners.remove(callbackId);
        if (drawListener != null) {
            rootView.getViewTreeObserver().removeOnDrawListener(drawListener);
        }
        promise.resolve(new HippyMap());
    }

    public static void getScreenShot(@NonNull List params, @NonNull final View view, @NonNull final Promise promise) {
        if (params.isEmpty() || view.getWidth() <= 0 || view.getHeight() <= 0) {
            return;
        }
        NativeRender renderer = NativeRendererManager.getNativeRenderer(view.getContext());
        View rootView = renderer == null ? null : renderer.getRootView(view);
        if (rootView == null) {
            return;
        }
        final int viewWidth = rootView.getWidth();
        final int viewHeight = rootView.getHeight();
        Map<String, Object> param = ArrayUtils.getMapValue(params, 0);
        float scale = 1.0f;
        if (param != null) {
            int maxWidth = MapUtils.getIntValue(param, MAX_WIDTH, 0);
            int maxHeight = MapUtils.getIntValue(param, MAX_HEIGHT, 0);
            float scaleX = (float) maxWidth / (float) viewWidth;
            float scaleY = (float) maxHeight / (float) viewHeight;
            scale = Math.max(Math.min(scaleX, scaleY), DEFAULT_SCALE); // select the proper scale which not less than MINI_SCALE
        }
        Bitmap bitmap = sCacheBitmapRef != null ? sCacheBitmapRef.get() : null;
        if (bitmap == null) {
            bitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.ARGB_8888);
            sCacheBitmapRef = new WeakReference<>(bitmap);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Above Android O, use PixelCopy, because another way view.draw will cause Software rendering doesn't support hardware bitmaps
            int[] location = new int[2];
            view.getLocationInWindow(location);
            Context context = view.getContext();
            if (context instanceof ContextWrapper && ((ContextWrapper) context).getBaseContext() instanceof Activity) {
                Window window = ((Activity) ((ContextWrapper) context).getBaseContext()).getWindow();
                final Bitmap finalBitmap = bitmap;
                final float finalScale = scale;
                try {
                    PixelCopy.request(window,
                        new Rect(location[0], location[1], location[0] + view.getWidth(),
                            location[1] + view.getHeight()),
                        finalBitmap, new OnPixelCopyFinishedListener() {

                            @Override
                            public void onPixelCopyFinished(int copyResult) {
                                if (copyResult == PixelCopy.SUCCESS) {
                                    callbackScreenShot(view, finalBitmap, finalScale, viewWidth, viewHeight, promise);
                                } else {
                                    LogUtils.e(TAG, "getScreenShot copyResult:" + copyResult);
                                }
                            }
                        }, new Handler(Looper.getMainLooper()));
                } catch (IllegalArgumentException e) {
                    LogUtils.e(TAG, " PixelCopy.request error", e);
                }
            } else {
                LogUtils.e(TAG, "getScreenShot context.getBaseContext() is not activity");
            }
        } else {
            Canvas canvas = new Canvas(bitmap);
            canvas.drawColor(Color.WHITE);
            view.draw(canvas);
            callbackScreenShot(view, bitmap, scale, viewWidth, viewHeight, promise);
        }
    }

    private static void callbackScreenShot(View view, Bitmap bitmap, float scale, int viewWidth, int viewHeight, Promise promise) {
        DisplayMetrics windowDisplayMetrics = view.getContext().getResources()
                .getDisplayMetrics();
        String base64 = bitmapToBase64Str(bitmap, scale, viewWidth, viewHeight);
        HippyMap resultMap = new HippyMap();
        resultMap.pushString(SCREEN_SHOT, base64);
        resultMap.pushInt(SCREEN_WIDTH, windowDisplayMetrics.widthPixels);
        resultMap.pushInt(SCREEN_HEIGHT, windowDisplayMetrics.heightPixels);
        resultMap.pushDouble(SCREEN_SCALE, 1f);
        promise.resolve(resultMap);
    }

    private static String bitmapToBase64Str(Bitmap bitmap, float scale, int viewWidth, int viewHeight) {
        String result = "";
        ByteArrayOutputStream outputStream = null;
        try {
            if (bitmap != null) {
                Bitmap scaleBitmap = bitmap;
                if (scale != 1.0f) {
                    Matrix matrix = new Matrix();
                    matrix.postScale(scale, scale);
                    scaleBitmap = Bitmap
                            .createBitmap(bitmap, 0, 0, viewWidth, viewHeight, matrix, true);
                }
                outputStream = new ByteArrayOutputStream();
                scaleBitmap.compress(CompressFormat.JPEG, DEFAULT_QUALITY, outputStream);
                outputStream.flush();
                outputStream.close();
                byte[] bitmapBytes = outputStream.toByteArray();
                result = Base64.encodeToString(bitmapBytes, Base64.NO_WRAP);
            }
        } catch (IllegalArgumentException e) {
            sCacheBitmapRef.clear();
        } catch (IOException e) {
            LogUtils.e(TAG, "bitmapToBase64Str, scale exception:", e);
        } finally {
            try {
                if (outputStream != null) {
                    outputStream.close();
                }
            } catch (IOException e) {
                LogUtils.e(TAG, "bitmapToBase64Str, close exception:", e);
            }
        }
        return result;
    }

}

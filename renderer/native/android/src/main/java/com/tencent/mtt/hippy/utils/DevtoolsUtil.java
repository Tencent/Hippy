package com.tencent.mtt.hippy.utils;

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Canvas;
import android.graphics.Color;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.ViewTreeObserver.OnDrawListener;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.List;

/**
 * devtools utils for screen shot
 */
public class DevtoolsUtil {
    public static final String GET_SCREEN_SHOT = "getScreenShot";
    public static final String ADD_FRAME_CALLBACK = "addFrameCallback";
    public static final String REMOVE_FRAME_CALLBACK = "removeFrameCallback";
    private static final String TAG = "tdf_DevtoolsUtil";
    private static final String SCREEN_SHOT = "screenShot";
    private static final String SCREEN_WIDTH = "width";
    private static final String SCREEN_HEIGHT = "height";
    private static final String SCREEN_SCALE = "screenScale";
    private static final String FRAME_CALLBACK_ID = "frameCallbackId";
    private static final float DEFAULT_SCALE = 0.5f;
    private static final int DEFAULT_QUALITY = 80;
    private final static HashMap<Integer, ViewTreeObserver.OnDrawListener> sDrawListeners = new HashMap<>();
    private static WeakReference<Bitmap> sCacheBitmapRef;

    public static void addFrameCallback(@NonNull List params, @NonNull View view, @NonNull final Promise promise) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
        if (nativeRenderer == null) {
            return;
        }
        ViewGroup rootView = nativeRenderer.getRootView();
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
        ViewGroup rootView = nativeRenderer.getRootView();
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

    public static void getScreenShot(@NonNull View view, @NonNull Promise promise) {
        Bitmap bitmap = sCacheBitmapRef != null ? sCacheBitmapRef.get() : null;
        if (bitmap == null) {
            bitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.ARGB_8888);
            sCacheBitmapRef = new WeakReference<>(bitmap);
        }
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(Color.WHITE);
        view.draw(canvas);
        String base64 = bitmapToBase64Str(bitmap);
        HippyMap resultMap = new HippyMap();
        resultMap.pushString(SCREEN_SHOT, base64);
        resultMap.pushInt(SCREEN_WIDTH, (int) (view.getWidth() * DEFAULT_SCALE));
        resultMap.pushInt(SCREEN_HEIGHT, (int) (view.getHeight() * DEFAULT_SCALE));
        resultMap.pushDouble(SCREEN_SCALE, view.getResources().getDisplayMetrics().density * DEFAULT_SCALE);
        promise.resolve(resultMap);
    }

    private static String bitmapToBase64Str(Bitmap bitmap) {
        String result = null;
        ByteArrayOutputStream outputStream = null;
        try {
            if (bitmap != null) {
                Bitmap scaleBitmap = Bitmap
                        .createScaledBitmap(bitmap, (int) (bitmap.getWidth() * DEFAULT_SCALE),
                                (int) (bitmap.getHeight() * DEFAULT_SCALE), false);
                outputStream = new ByteArrayOutputStream();
                scaleBitmap.compress(CompressFormat.JPEG, DEFAULT_QUALITY, outputStream);
                outputStream.flush();
                outputStream.close();
                byte[] bitmapBytes = outputStream.toByteArray();
                result = Base64.encodeToString(bitmapBytes, Base64.NO_WRAP);
            }
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

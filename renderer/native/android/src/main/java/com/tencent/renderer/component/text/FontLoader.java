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

package com.tencent.renderer.component.text;

import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.ref.WeakReference;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

public class FontLoader {

    private final WeakReference<NativeRender> mNativeRenderRef;
    private final WeakReference<VfsManager> mVfsManager;
    private final File mFontDir;
    private final File mFontUrlDictPath;
    private Map<String, String> mConcurrentFontUrlDict;
    private final Set<String> mConcurrentFontsLoaded;
    private final Set<String> mConcurrentUrlsLoading;
    private static final String[] ALLOWED_EXTENSIONS = {"otf", "ttf"};
    private static final String FONT_DIR_NAME = "HippyFonts";
    private static final String FONT_URL_DICT_NAME = "fontUrlDict.ser";


    public FontLoader(VfsManager vfsManager, NativeRender nativeRender) {
        mNativeRenderRef = new WeakReference<>(nativeRender);
        mVfsManager = new WeakReference<>(vfsManager);
        mFontDir = new File(ContextHolder.getAppContext().getCacheDir(), FONT_DIR_NAME);
        mFontUrlDictPath = new File(mFontDir, FONT_URL_DICT_NAME);
        mConcurrentFontsLoaded = new CopyOnWriteArraySet<>();
        mConcurrentUrlsLoading = new CopyOnWriteArraySet<>();
    }

    private boolean saveFontFile(byte[] byteArray, String fileName, Promise promise) {
        if (!mFontDir.exists()) {
            if (!mFontDir.mkdirs()) {
                if (promise != null) {
                    promise.reject("Create font directory failed");
                }
                return false;
            }
        }
        File fontFile = new File(mFontDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(fontFile)) {
            fos.write(byteArray);
            if (promise != null) {
                promise.resolve(null);
            }
            return true;
        } catch (IOException e) {
            if (promise != null) {
                promise.reject("Write font file failed:" + e.getMessage());
            }
            return false;
        }
    }

    public boolean isFontLoaded(String fontFamily) {
        return mConcurrentFontsLoaded.contains(fontFamily);
    }

    private void saveFontUrlDictFile() {
        try (FileOutputStream fos = new FileOutputStream(mFontUrlDictPath);
             ObjectOutputStream oos = new ObjectOutputStream(fos)) {
            oos.writeObject(mConcurrentFontUrlDict);
            LogUtils.d("FontLoader", "Save fontUrlDict.ser success");
        } catch (IOException e) {
            LogUtils.d("FontLoader", "Save fontUrlDict.ser failed");
        }
    }

    public static String getFileExtension(String url) {
        int dotIndex = url.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < url.length() - 1) {
            String ext = url.substring(dotIndex + 1).toLowerCase();
            if (Arrays.asList(ALLOWED_EXTENSIONS).contains(ext)) {
                return "." + ext;
            }
        }
        return "";
    }

    public boolean loadIfNeeded(final String fontFamily, final String fontUrl, int rootId) {
        if (mConcurrentFontUrlDict == null) {
            Map<String, String> fontUrlDict;
            try (FileInputStream fis = new FileInputStream(mFontUrlDictPath);
                 ObjectInputStream ois = new ObjectInputStream(fis)) {
                fontUrlDict = (Map<String, String>) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                fontUrlDict = new HashMap<>();
            }
            mConcurrentFontUrlDict = new ConcurrentHashMap<>(fontUrlDict);
        }
        String fontFileName = mConcurrentFontUrlDict.get(fontUrl);
        if (fontFileName != null) {
            File fontFile = new File(mFontDir, fontFileName);
            if (fontFile.exists()) {
                return false;
            }
        }
        if (mConcurrentUrlsLoading.contains(fontUrl)) {
            return false;
        }
        loadAndRefresh(fontFamily, fontUrl, rootId, null);
        return true;
    }


    public void loadAndRefresh(final String fontFamily, final String fontUrl, int rootId,
                               Promise promise) {
        LogUtils.d("FontLoader", "Start load " + fontUrl);
        if (TextUtils.isEmpty(fontUrl)) {
            if (promise != null) {
                promise.reject("Url parameter is empty!");
            }
            return;
        }
        mConcurrentUrlsLoading.add(fontUrl);
        mVfsManager.get().fetchResourceAsync(fontUrl, null, null,
            new FetchResourceCallback() {
                @Override
                public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                    byte[] bytes = dataHolder.getBytes();
                    if (dataHolder.resultCode
                        != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null
                        || bytes.length <= 0) {
                        if (promise != null) {
                            promise.reject("Fetch font file failed, url=" + fontUrl);
                        }
                    } else {
                        String fileName = fontFamily + getFileExtension(fontUrl);
                        if (saveFontFile(bytes, fileName, promise)) {
                            LogUtils.d("FontLoader", "Fetch font file success");
                            mConcurrentFontsLoaded.add(fontFamily);
                            mConcurrentFontUrlDict.put(fontUrl, fileName);
                            saveFontUrlDictFile();
                            TypeFaceUtil.clearFontCache(fontFamily);
                            NativeRender nativeRender = mNativeRenderRef.get();
                            if (nativeRender != null) {
                                nativeRender.refreshTextWindow(rootId);
                            }
                        }
                    }
                    mConcurrentUrlsLoading.remove(fontUrl);
                    dataHolder.recycle();
                }

                @Override
                public void onFetchProgress(long total, long loaded) {
                    // Nothing need to do here.
                }
            });
    }
}

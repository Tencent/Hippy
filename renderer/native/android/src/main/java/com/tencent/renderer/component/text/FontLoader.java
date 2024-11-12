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

import static com.tencent.vfs.UrlUtils.PREFIX_ASSETS;
import static com.tencent.vfs.UrlUtils.PREFIX_FILE;

import android.content.res.AssetManager;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.UrlUtils;
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
import java.util.concurrent.ConcurrentHashMap;

public class FontLoader {

    private final WeakReference<NativeRender> mNativeRenderRef;
    private final WeakReference<VfsManager> mVfsManager;
    private final File mFontDir;
    private final File mUrlFontMapFile;
    private final File mLocalFontPathMapFile;
    private static Map<String, String> mConcurrentUrlFontMap;
    private static Map<String, String> mConcurrentLocalFontPathMap;
    private final Map<String, FontLoadState> mConcurrentFontLoadStateMap;
    private static final String[] ALLOWED_EXTENSIONS = {"otf", "ttf"};
    private static final String FONT_DIR_NAME = "fonts";
    private static final String URL_FONT_MAP_NAME = "urlFontMap.ser";
    private static final String LOCAL_FONT_PATH_MAP_NAME = "localFontPathMap.ser";

    public enum FontLoadState {
        FONT_UNLOAD,
        FONT_LOADING,
        FONT_LOADED,
    }


    public FontLoader(VfsManager vfsManager, NativeRender nativeRender) {
        mNativeRenderRef = new WeakReference<>(nativeRender);
        mVfsManager = new WeakReference<>(vfsManager);
        mFontDir = new File(ContextHolder.getAppContext().getCacheDir(), FONT_DIR_NAME);
        mUrlFontMapFile = new File(mFontDir, URL_FONT_MAP_NAME);
        mLocalFontPathMapFile = new File(mFontDir, LOCAL_FONT_PATH_MAP_NAME);
        mConcurrentFontLoadStateMap = new ConcurrentHashMap<>();
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
                promise.resolve(fileName + " download success!");
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
        return fontFamily != null &&
            mConcurrentFontLoadStateMap.get(fontFamily) == FontLoadState.FONT_LOADED;
    }

    private void saveMapFile(File outputFile, Map<String, String> map) {
        try (FileOutputStream fos = new FileOutputStream(outputFile);
             ObjectOutputStream oos = new ObjectOutputStream(fos)) {
            oos.writeObject(map);
            LogUtils.d("FontLoader", String.format("Save %s success!", outputFile.getName()));
        } catch (IOException e) {
            LogUtils.d("FontLoader", String.format("Save %s failed!", outputFile.getName()));
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

    public static String getFontPath(String fontFileName) {
        if (mConcurrentLocalFontPathMap != null && fontFileName != null) {
            return mConcurrentLocalFontPathMap.get(fontFileName);
        }
        return null;
    }

    // Convert "hpfile://" to "file://" or "assets://"
    private String convertToLocalPathIfNeeded(String fontUrl) {
        if (fontUrl != null && fontUrl.startsWith("hpfile://")) {
            final NativeRender nativeRender = mNativeRenderRef.get();
            String bundlePath = null;
            if (nativeRender != null) {
                bundlePath = mNativeRenderRef.get().getBundlePath();
            }
            String relativePath = fontUrl.replace("hpfile://./", "");
            fontUrl = bundlePath == null ? null
                : bundlePath.subSequence(0, bundlePath.lastIndexOf(File.separator) + 1)
                + relativePath;
        }
        return fontUrl;
    }

    private Map<String, String> readMapFromFile(File file) {
        Map<String, String> map;
        try (FileInputStream fis = new FileInputStream(file);
             ObjectInputStream ois = new ObjectInputStream(fis)) {
            map = (Map<String, String>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            map = new HashMap<>();
        }
        return map;
    }

    private boolean isAssetFileExists(String assetFilePath) {
        AssetManager assetManager = ContextHolder.getAppContext().getAssets();
        String directory = "";
        String fileName = assetFilePath;
        if (fileName.startsWith(PREFIX_ASSETS)) {
            fileName = fileName.substring(PREFIX_ASSETS.length());
        }
        int lastSlashIndex = assetFilePath.lastIndexOf(File.separator);
        if (lastSlashIndex != -1) {
            directory = assetFilePath.substring(0, lastSlashIndex);
            fileName = assetFilePath.substring(lastSlashIndex + 1);
        }
        try {
            String[] files = assetManager.list(directory);
            if (files != null) {
                for (String file : files) {
                    if (file.equals(fileName)) {
                        return true;
                    }
                }
            }
        } catch (IOException e) {
            LogUtils.d("FontLoader", String.format("Find directory %s failed", directory));
        }
        return false;
    }

    private void initMapIfNeeded() {
        if (mConcurrentUrlFontMap == null) {
            mConcurrentUrlFontMap = new ConcurrentHashMap<>(readMapFromFile(mUrlFontMapFile));
        }
        if (mConcurrentLocalFontPathMap == null) {
            mConcurrentLocalFontPathMap = new ConcurrentHashMap<>(readMapFromFile(mLocalFontPathMapFile));
        }
    }

    public boolean loadIfNeeded(final String fontFamily, final String fontUrl, int rootId) {
        initMapIfNeeded();
        if (TextUtils.isEmpty(fontFamily) || TextUtils.isEmpty(fontUrl)) {
            return false;
        }
        String fontFileName = mConcurrentUrlFontMap.get(fontUrl);
        if (fontFileName != null) {
            if (fontFileName.startsWith(PREFIX_ASSETS) && isAssetFileExists(fontFileName)) {
                return false;
            }
            if (fontFileName.startsWith(PREFIX_FILE)) {
                fontFileName = fontFileName.substring(PREFIX_FILE.length());
            }
            File fontFile = new File(fontFileName);
            if (fontFile.exists()) {
                return false;
            }
        }
        FontLoadState state = mConcurrentFontLoadStateMap.get(fontFamily);
        if (state == FontLoadState.FONT_LOADING || state == FontLoadState.FONT_LOADED) {
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
        mConcurrentFontLoadStateMap.put(fontFamily, FontLoadState.FONT_LOADING);
        String convertFontUrl = convertToLocalPathIfNeeded(fontUrl);
        final VfsManager vfsManager = mVfsManager.get();
        if (vfsManager == null) {
            if (promise != null) {
                promise.reject("Get vfsManager failed!");
            }
            return;
        }
        vfsManager.fetchResourceAsync(convertFontUrl, null, null,
            new FetchResourceCallback() {
                @Override
                public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                    byte[] bytes = dataHolder.getBytes();
                    if (dataHolder.resultCode
                        != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null
                        || bytes.length <= 0) {
                        mConcurrentFontLoadStateMap.put(fontFamily, FontLoadState.FONT_UNLOAD);
                        if (promise != null) {
                            promise.reject("Fetch font file failed, url=" + fontUrl);
                        }
                    } else {
                        initMapIfNeeded();
                        boolean needRefresh = true;
                        if (UrlUtils.isFileUrl(convertFontUrl) || UrlUtils.isAssetsUrl(convertFontUrl)) {
                            mConcurrentUrlFontMap.put(fontUrl, convertFontUrl);
                            String fileName = fontFamily + getFileExtension(fontUrl);
                            if (convertFontUrl.equals(mConcurrentLocalFontPathMap.get(fileName))) {
                                needRefresh = false;
                            } else {
                                mConcurrentLocalFontPathMap.put(fileName, convertFontUrl);
                            }
                            if (promise != null) {
                                promise.resolve(String.format("Load local font %s success", convertFontUrl));
                            }
                        } else {
                            String fileName = fontFamily + getFileExtension(fontUrl);
                            if (!saveFontFile(bytes, fileName, promise)) {
                                mConcurrentFontLoadStateMap.remove(fontFamily);
                                return;
                            } else {
                                File fontFile = new File(mFontDir, fileName);
                                mConcurrentUrlFontMap.put(fontUrl, fontFile.getAbsolutePath());
                                if (promise != null) {
                                    promise.resolve(String.format("Download font %s success", fileName));
                                }
                            }
                        }
                        mConcurrentFontLoadStateMap.put(fontFamily, FontLoadState.FONT_LOADED);
                        saveMapFile(mUrlFontMapFile, mConcurrentUrlFontMap);
                        saveMapFile(mLocalFontPathMapFile, mConcurrentLocalFontPathMap);
                        TypeFaceUtil.clearFontCache(fontFamily);
                        final NativeRender nativeRender = mNativeRenderRef.get();
                        if (nativeRender != null && needRefresh) {
                            nativeRender.onFontLoaded(rootId);
                        }
                    }
                    dataHolder.recycle();
                }

                @Override
                public void onFetchProgress(long total, long loaded) {
                    // Nothing need to do here.
                }
            });
    }
}

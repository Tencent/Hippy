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

package com.tencent.mtt.hippy.bridge.libraryloader;

import android.text.TextUtils;
import com.tencent.mtt.hippy.BuildConfig;
import com.tencent.mtt.hippy.adapter.soloader.HippySoLoaderAdapter;

public class LibraryLoader {

  private static boolean hasLoaded = false;
  private final static String[] SO_NAME_LIST = new String[]{
      "hippy", "flexbox"
  };

  public static void loadLibraryIfNeeded(HippySoLoaderAdapter soLoaderAdapter) {
    if (hasLoaded || BuildConfig.ENABLE_SO_DOWNLOAD) {
      return;
    }
    synchronized (LibraryLoader.class) {
      if (hasLoaded) {
        return;
      }
      try {
        for (String name : SO_NAME_LIST) {
          String tinkerSoPath = null;
          if (soLoaderAdapter != null) {
            tinkerSoPath = soLoaderAdapter.loadSoPath(name);
          }
          if (!TextUtils.isEmpty(tinkerSoPath)) {
            System.load(tinkerSoPath);
          } else {
            System.loadLibrary(name);
          }
        }
        hasLoaded = true;
      } catch (Throwable e) {
        e.printStackTrace();
      }
    }
  }
}

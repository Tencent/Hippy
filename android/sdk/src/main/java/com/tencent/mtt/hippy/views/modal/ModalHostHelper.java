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
package com.tencent.mtt.hippy.views.modal;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Point;
import android.os.Build;
import android.view.Display;
import android.view.WindowManager;

/*package*/ class ModalHostHelper {

  private static final Point MIN_POINT = new Point();
  private static final Point MAX_POINT = new Point();
  private static final Point SIZE_POINT = new Point();


  @TargetApi(16)
  public static Point getModalHostSize(Context context) {
    WindowManager wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    Display display = wm.getDefaultDisplay();
    if(Build.VERSION.SDK_INT>=16) {
      display.getCurrentSizeRange(MIN_POINT, MAX_POINT);
    }
    display.getSize(SIZE_POINT);
    if (SIZE_POINT.x < SIZE_POINT.y) {
      return new Point(MIN_POINT.x, MAX_POINT.y);
    } else {
      return new Point(MAX_POINT.x, MIN_POINT.y);
    }
  }
}

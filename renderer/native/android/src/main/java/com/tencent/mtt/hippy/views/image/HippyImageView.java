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

package com.tencent.mtt.hippy.views.image;

import android.content.Context;
import android.view.MotionEvent;

import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;

import com.tencent.renderer.component.FlatViewGroup;

public class HippyImageView extends FlatViewGroup implements HippyViewBase  {

    protected NativeGestureDispatcher mGestureDispatcher;

    public HippyImageView(Context context) {
        super(context);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (mGestureDispatcher != null) {
            result |= mGestureDispatcher.handleTouchEvent(event);
        }
        return result;
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }
}

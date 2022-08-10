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

package com.tencent.mtt.hippy.views.text;

import android.content.Context;
import android.text.Layout;
import android.text.Spannable;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.text.TextGestureSpan;
import com.tencent.renderer.component.text.TextRenderSupplier;

@HippyController(name = HippyTextViewController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyTextViewController extends HippyViewController<HippyTextView> {

    public static final String CLASS_NAME = "Text";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyTextView(context);
    }

    @Override
    public void onBatchComplete(@NonNull HippyTextView view) {
        super.onBatchComplete(view);
        Component component = view.getComponent(view);
        if (component == null) {
            return;
        }
        Layout layout = component.getTextLayout();
        if (layout != null) {
            CharSequence textSequence = layout.getText();
            if (textSequence instanceof Spannable) {
                Spannable spannable = (Spannable) textSequence;
                TextGestureSpan[] spans = spannable
                        .getSpans(0, spannable.length(), TextGestureSpan.class);
                view.setGestureEnable(spans != null && spans.length > 0);
            }
        }
    }

    @Override
    protected boolean handleGestureBySelf() {
        return true;
    }
}

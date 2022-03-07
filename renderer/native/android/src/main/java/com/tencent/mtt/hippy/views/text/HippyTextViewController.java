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

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.component.text.TextGestureSpan;
import com.tencent.renderer.component.text.TextRenderSupplier;

@HippyController(name = HippyTextViewController.CLASS_NAME)
public class HippyTextViewController extends HippyViewController<HippyTextView> {

    public static final String CLASS_NAME = "Text";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyTextView(context);
    }

    @Override
    protected void updateExtra(View view, @Nullable Object object) {
        TextRenderSupplier supplier = null;
        Layout layout;
        if (object instanceof TextRenderSupplier) {
            supplier = (TextRenderSupplier) object;
            layout = supplier.layout;
        } else if (object instanceof Layout) {
            layout = (Layout) object;
        } else {
            return;
        }
        if (layout != null && view instanceof HippyTextView) {
            HippyTextView textView = (HippyTextView) view;
            CharSequence textSequence = layout.getText();
            if (textSequence instanceof Spannable) {
                Spannable spannable = (Spannable) textSequence;
                TextGestureSpan[] spans = spannable
                        .getSpans(0, spannable.length(), TextGestureSpan.class);
                textView.setGestureEnable(spans != null && spans.length > 0);
            }
            if (supplier != null) {
                textView.setPadding((int) Math.floor(supplier.leftPadding),
                        (int) Math.floor(supplier.topPadding),
                        (int) Math.floor(supplier.rightPadding),
                        (int) Math.floor(supplier.bottomPadding));
            }
            textView.setLayout(layout);
            textView.postInvalidate();
        }
    }

    @Override
    protected boolean handleGestureBySelf() {
        return true;
    }
}

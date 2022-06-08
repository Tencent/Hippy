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
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.dom.node.HippyNativeGestureSpan;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.dom.node.TextExtra;
import com.tencent.mtt.hippy.dom.node.TextNode;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

@SuppressWarnings({"unused"})
@HippyController(name = HippyTextViewController.CLASS_NAME)
public class HippyTextViewController extends HippyViewController<HippyTextView> {

  public static final String CLASS_NAME = "Text";

  @Override
  protected View createViewImpl(Context context) {
    return new HippyTextView(context);
  }

  @Override
  protected void updateExtra(View view, Object object) {
    TextExtra textExtra = (TextExtra) object;
    if (textExtra != null && textExtra.mExtra instanceof Layout && view instanceof HippyTextView) {
      HippyTextView hippyTextView = (HippyTextView) view;
      Layout layout = (Layout) textExtra.mExtra;
      CharSequence textSequence = layout.getText();
      if (textSequence instanceof Spannable) {
        Spannable spannable = (Spannable) textSequence;
        HippyNativeGestureSpan[] spans = spannable
            .getSpans(0, spannable.length(), HippyNativeGestureSpan.class);
        hippyTextView.setNativeGestureEnable(spans != null && spans.length > 0);
      }
      hippyTextView.setPadding((int) Math.floor(textExtra.mLeftPadding),
          (int) Math.floor(textExtra.mTopPadding),
          (int) Math.floor(textExtra.mRightPadding), (int) Math.floor(textExtra.mBottomPadding));

      hippyTextView.setLayout(layout);
      hippyTextView.postInvalidate();
    }


  }

  @Override
  protected StyleNode createNode(boolean virtual) {
    return new TextNode(virtual);
  }

  @Override
  protected boolean handleGestureBySelf() {
    return true;
  }
}

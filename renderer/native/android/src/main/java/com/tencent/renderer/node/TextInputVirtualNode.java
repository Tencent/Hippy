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

package com.tencent.renderer.node;

import android.text.SpannableStringBuilder;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.FlexUtils;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;
import java.util.List;

public class TextInputVirtualNode extends VirtualNode {

    protected long mMeasureSize = 0;
    protected int mNumberOfLines = 0;
    protected int mFontSize = (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP));
    @NonNull
    private final EditText mEditText;

    public TextInputVirtualNode(int rootId, int id, int pid, int index) {
        super(rootId, id, pid, index);
        mEditText = new EditText(ContextHolder.getAppContext());
        mEditText.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
    }

    protected void createSpanOperation(List<SpanOperation> ops,
            SpannableStringBuilder builder, boolean useChild) {
        // Need do nothing by default
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.NUMBER_OF_LINES, defaultType = HippyControllerProps.NUMBER)
    public void setNumberOfLines(int numberOfLines) {
        mNumberOfLines = numberOfLines;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = NodeProps.FONT_SIZE_SP)
    public void setFontSize(float size) {
        mFontSize = (int) Math.ceil(PixelUtil.dp2px(size));
    }

    private int getMeasureSpec(float size, FlexMeasureMode mode) {
        switch (mode) {
            case EXACTLY:
                return View.MeasureSpec.makeMeasureSpec((int) size, View.MeasureSpec.EXACTLY);
            case AT_MOST:
                return View.MeasureSpec.makeMeasureSpec((int) size, View.MeasureSpec.AT_MOST);
            default:
                return View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
        }
    }

    public long measure(float width, FlexMeasureMode widthMode, float height, FlexMeasureMode heightMode) {
        mEditText.setTextSize(TypedValue.COMPLEX_UNIT_PX, mFontSize);
        if (mNumberOfLines > 0) {
            mEditText.setLines(mNumberOfLines);
        }
        mEditText.measure(getMeasureSpec(width, widthMode), getMeasureSpec(height, heightMode));
        return FlexUtils.makeSizeToLong(mEditText.getMeasuredWidth(), mEditText.getMeasuredHeight());
    }
}

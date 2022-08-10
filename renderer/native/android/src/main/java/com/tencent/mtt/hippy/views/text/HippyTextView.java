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

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.Layout;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.AbsoluteSizeSpan;
import android.view.MotionEvent;

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.FlatViewGroup;
import com.tencent.renderer.component.text.TextForegroundColorSpan;
import com.tencent.renderer.component.text.TextGestureSpan;

public class HippyTextView extends FlatViewGroup implements HippyViewBase {

    @Nullable
    private TextGestureSpan mGestureSpan;
    @Nullable
    private NativeGestureDispatcher mGestureDispatcher;
    private boolean mGestureEnable = false;

    public HippyTextView(Context context) {
        super(context);
    }

    protected void setTextColor(int textColor) {
        Layout layout = null;
        Component component = getComponent(this);
        if (component != null) {
            layout = component.getTextLayout();
        }
        if (layout == null || !(layout.getText() instanceof SpannableStringBuilder)) {
            return;
        }
        SpannableStringBuilder textSpan = (SpannableStringBuilder) layout.getText();
        TextForegroundColorSpan[] spans = textSpan
                .getSpans(0, layout.getText().length(), TextForegroundColorSpan.class);
        if (spans == null || spans.length == 0) {
            textSpan.setSpan(new TextForegroundColorSpan(textColor), 0,
                    textSpan.toString().length(), Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
        } else {
            for (TextForegroundColorSpan span : spans) {
                int start = textSpan.getSpanStart(span);
                int end = textSpan.getSpanEnd(span);
                textSpan.removeSpan(span);
                int spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
                if (start == 0) {
                    spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
                }
                textSpan.setSpan(new TextForegroundColorSpan(textColor), start, end, spanFlags);
            }
        }
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        if (!mGestureEnable) {
            return super.dispatchTouchEvent(event);
        }
        int action = event.getAction();
        if (action == MotionEvent.ACTION_DOWN) {
            Component component = getComponent(this);
            if (component != null) {
                mGestureSpan = findGestureSpan(event, component.getTextLayout());
            }
        }
        if (mGestureSpan != null) {
            boolean flag = mGestureSpan.handleDispatchTouchEvent(this, event);
            if (flag) {
                super.dispatchTouchEvent(event);
                return true;
            }
        }
        return super.dispatchTouchEvent(event);
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (mGestureSpan != null) {
            result |= mGestureSpan.handleTouchEvent(this, event);
        }
        return result;
    }

    public void setGestureEnable(boolean gestureEnable) {
        this.mGestureEnable = gestureEnable;
    }

    @Nullable
    private TextGestureSpan findGestureSpan(int x, int y, @Nullable Layout layout) {
        if (layout == null) {
            return null;
        }
        TextGestureSpan result = null;
        int line = layout.getLineForVertical(y);
        int lineStartX = (int) layout.getLineLeft(line);
        int lineEndX = (int) layout.getLineRight(line);
        CharSequence charSequence = layout.getText();
        if (charSequence instanceof Spanned && x >= lineStartX && x <= lineEndX) {
            Spanned spannedText = (Spanned) charSequence;
            int index = layout.getOffsetForHorizontal(line, x);
            TextGestureSpan[] spans = spannedText
                    .getSpans(index, index, TextGestureSpan.class);
            if (spans != null && spans.length > 0) {
                int targetSpanTextLength = charSequence.length();
                for (TextGestureSpan gestureSpan : spans) {
                    int spanStart = spannedText.getSpanStart(gestureSpan);
                    int spanEnd = spannedText.getSpanEnd(gestureSpan);
                    if (spanEnd > index && (spanEnd - spanStart) <= targetSpanTextLength) {
                        result = gestureSpan;
                        targetSpanTextLength = (spanEnd - spanStart);
                    }
                }
            }
        }
        // If there is no gesture span on the specify location text, try to get the first
        // gesture span in all spans.
        if (result == null && charSequence instanceof Spanned) {
            Spanned spanned = (Spanned) charSequence;
            TextGestureSpan[] spans = spanned
                    .getSpans(0, spanned.length(), TextGestureSpan.class);
            if (spans.length == 1) {
                AbsoluteSizeSpan[] absoluteSizeSpan = spanned
                        .getSpans(0, spanned.length(), AbsoluteSizeSpan.class);
                if (absoluteSizeSpan.length == 1) {
                    result = spans[0];
                }
            }
        }
        return result;
    }

    @Nullable
    private TextGestureSpan findGestureSpan(MotionEvent event, @Nullable Layout layout) {
        if (layout == null) {
            return null;
        }
        float x = event.getX();
        float y = event.getY();
        float dx;
        float dy;
        switch (layout.getAlignment()) {
            case ALIGN_CENTER:
                dy = (getHeight() - layout.getHeight()) / 2.0f;
                dx = (getWidth() - layout.getWidth()) / 2.0f;
                x -= dx;
                y -= dy;
                break;
            case ALIGN_OPPOSITE:
                dx = getWidth() - getPaddingRight() - layout.getWidth();
                x -= dx;
                break;
            default:
                // Just need to handle center and opposite alignment.
        }
        return findGestureSpan((int) x, (int) y, layout);
    }
}
